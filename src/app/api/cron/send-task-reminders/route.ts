import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendTaskReminderEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

/**
 * Cron endpoint to send task reminder emails
 * Triggers daily to notify users of tasks due in the next 24 hours
 *
 * Usage: POST /api/cron/send-task-reminders
 * Should be called by Vercel Cron or external scheduler
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if provided
    const cronSecret = request.headers.get('authorization')
    if (cronSecret && process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[task-reminders-cron] Starting task reminder job...')

    // Query for tasks due in next 24 hours (not yet completed)
    const upcomingTasks = await sql`
      SELECT
        t.id,
        t.title,
        t.description,
        t.due_date,
        t.company_id,
        u.id as user_id,
        u.email,
        u.name,
        c.name as company_name,
        COUNT(*) OVER (PARTITION BY u.id) as user_task_count
      FROM tasks t
      JOIN companies c ON t.company_id = c.id
      JOIN users u ON c.owner_id = u.id
      WHERE t.due_date > NOW()
        AND t.due_date <= NOW() + INTERVAL '24 hours'
        AND t.status != 'completed'
        AND t.status != 'archived'
      ORDER BY u.id, t.due_date
    ` as Array<{
      id: string
      title: string
      description: string
      due_date: string
      company_id: string
      user_id: string
      email: string
      name: string
      company_name: string
      user_task_count: number
    }>

    if (upcomingTasks.length === 0) {
      console.log('[task-reminders-cron] No upcoming tasks found')
      return NextResponse.json({
        success: true,
        message: 'No tasks due in next 24 hours',
        tasksProcessed: 0,
        emailsSent: 0
      })
    }

    console.log(`[task-reminders-cron] Found ${upcomingTasks.length} upcoming tasks`)

    // Group tasks by user for more efficient processing
    const tasksByUser = new Map<string, typeof upcomingTasks>()
    for (const task of upcomingTasks) {
      if (!tasksByUser.has(task.user_id)) {
        tasksByUser.set(task.user_id, [])
      }
      tasksByUser.get(task.user_id)!.push(task)
    }

    let emailsSent = 0
    const failedEmails: string[] = []

    // Send reminder email to each user with upcoming tasks
    for (const [userId, userTasks] of tasksByUser) {
      const firstTask = userTasks[0]

      try {
        const result = await sendTaskReminderEmail(userId, {
          name: firstTask.name,
          email: firstTask.email,
          companyName: firstTask.company_name,
          taskTitle: firstTask.title,
          taskDescription: firstTask.description || 'No description provided',
          dueDate: new Date(firstTask.due_date).toLocaleDateString(),
          dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/tasks`,
        })

        if (result.success) {
          emailsSent++
          console.log(`[task-reminders-cron] Email sent to ${firstTask.email} for ${userTasks.length} task(s)`)
        } else {
          failedEmails.push(firstTask.email)
          console.error(`[task-reminders-cron] Failed to send email to ${firstTask.email}:`, result.error)
        }
      } catch (err) {
        failedEmails.push(firstTask.email)
        console.error(`[task-reminders-cron] Error sending email to ${firstTask.email}:`, err)
      }
    }

    const result = {
      success: true,
      message: `Task reminder job completed`,
      tasksProcessed: upcomingTasks.length,
      usersNotified: tasksByUser.size,
      emailsSent,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      timestamp: new Date().toISOString()
    }

    console.log('[task-reminders-cron] Job complete:', result)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[task-reminders-cron] Error:', errorMessage, err)
    return NextResponse.json(
      {
        success: false,
        error: 'Task reminder job failed',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
