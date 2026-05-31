import Anthropic from '@anthropic-ai/sdk'
import { sql } from '@/lib/db'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanionContext {
  userId:      string
  companyId:   string
  userName:    string
  companyName: string
  exchange:    string
  listingType: string
  paceScore:   number
  currentPhase: string
  estimatedDays: number
  language:    string
}

interface TaskRow {
  id: string
  phase: string
  category: string
  title: string
  status: string
  priority: string
  estimated_days: number
  due_date: string | null
  assigned_to_name: string | null
}

export interface ActionResult {
  action:  string
  taskId?: string
  title?:  string
  status?: string
  note?:   string
}

// ─── Load context from DB ─────────────────────────────────────────────────────

export async function loadContext(userId: string): Promise<CompanionContext | null> {
  const rows = await sql`
    SELECT u.id, u.name, u.language,
           c.id AS company_id, c.name AS company_name,
           c.target_exchange, c.listing_type, c.current_phase,
           c.pace_score, c.estimated_days_to_ipo
    FROM users u
    JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
    LIMIT 1
  `
  if (!rows.length) return null
  const r = rows[0] as any
  return {
    userId,
    companyId:     r.company_id,
    userName:      r.name,
    companyName:   r.company_name,
    exchange:      r.target_exchange?.toUpperCase() ?? '',
    listingType:   r.listing_type ?? '',
    paceScore:     r.pace_score ?? 0,
    currentPhase:  r.current_phase ?? 'pre_planning',
    estimatedDays: r.estimated_days_to_ipo ?? 180,
    language:      r.language ?? 'en',
  }
}

async function loadTasks(companyId: string): Promise<TaskRow[]> {
  const rows = await sql`
    SELECT t.id, t.phase, t.category, t.title, t.status,
           t.priority, t.estimated_days, t.due_date,
           u.name AS assigned_to_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    WHERE t.company_id = ${companyId}
    ORDER BY
      CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      t.order_index
  `
  return rows as TaskRow[]
}

// ─── Execute tool calls ───────────────────────────────────────────────────────

async function completeTask(companyId: string, taskId: string): Promise<string> {
  const rows = await sql`
    UPDATE tasks SET status = 'completed', completed_at = NOW()
    WHERE id = ${taskId} AND company_id = ${companyId}
    RETURNING title
  `
  return rows.length ? (rows[0] as any).title : 'Task'
}

async function blockTask(companyId: string, taskId: string, note: string): Promise<string> {
  const rows = await sql`
    UPDATE tasks SET status = 'blocked', description = CONCAT(description, E'\n\n🔴 Blocker: ', ${note})
    WHERE id = ${taskId} AND company_id = ${companyId}
    RETURNING title
  `
  return rows.length ? (rows[0] as any).title : 'Task'
}

async function startTask(companyId: string, taskId: string): Promise<string> {
  const rows = await sql`
    UPDATE tasks SET status = 'in_progress'
    WHERE id = ${taskId} AND company_id = ${companyId} AND status = 'not_started'
    RETURNING title
  `
  return rows.length ? (rows[0] as any).title : 'Task'
}

// ─── PACE recalc helper ───────────────────────────────────────────────────────

async function refreshPace(companyId: string): Promise<void> {
  // Import the shared helper
  const { computeAndUpdateCompanyStats } = await import('@/lib/company-stats')
  await computeAndUpdateCompanyStats(companyId)
}

// ─── Build system prompt ──────────────────────────────────────────────────────

function buildSystemPrompt(ctx: CompanionContext, tasks: TaskRow[]): string {
  const critical  = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed')
  const blocked   = tasks.filter(t => t.status === 'blocked')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const total     = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length

  const taskList = tasks
    .filter(t => t.status !== 'completed')
    .slice(0, 20)
    .map(t => `[${t.id}] ${t.priority.toUpperCase()} | ${t.phase} | ${t.title} | ${t.status}${t.assigned_to_name ? ` | owner: ${t.assigned_to_name}` : ''}`)
    .join('\n')

  return `You are the IPOReady AI Companion — a concise, no-nonsense IPO assistant for ${ctx.companyName}.

You are speaking with ${ctx.userName}, who is leading the ${ctx.exchange} ${ctx.listingType.replace('_', ' ')} process.

## Current IPO Status
- PACE™ Score: ${ctx.paceScore}/100
- Phase: ${ctx.currentPhase.replace(/_/g, ' ')}
- Days to listing window: ${ctx.estimatedDays}
- Tasks: ${completed}/${total} completed
- Critical open: ${critical.length} | Blocked: ${blocked.length} | In progress: ${inProgress.length}

## Active Tasks (not completed)
${taskList || 'No active tasks yet.'}

## Your job
1. Understand what the user wants from their message
2. Call the appropriate tools to act on it
3. Reply in plain text optimised for WhatsApp — max 4 short lines, no markdown headers, no bullet asterisks, use emojis sparingly
4. Be direct — they are busy executives. Don't repeat back what they said.
5. Reply in ${ctx.language === 'fr' ? 'French' : 'English'}.

## Tone
Professional but warm. Like a brilliant chief of staff who knows the IPO cold.`
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'complete_task',
    description: 'Mark one or more tasks as completed. Use when user says they finished, done, completed, or ticked off a task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        task_ids: { type: 'array', items: { type: 'string' }, description: 'DB UUIDs of tasks to mark complete' },
      },
      required: ['task_ids'],
    },
  },
  {
    name: 'block_task',
    description: 'Mark a task as blocked with a reason. Use when user mentions a delay, waiting on someone, or something is stuck.',
    input_schema: {
      type: 'object' as const,
      properties: {
        task_id: { type: 'string', description: 'DB UUID of the blocked task' },
        reason:  { type: 'string', description: 'Brief reason for the blocker' },
      },
      required: ['task_id', 'reason'],
    },
  },
  {
    name: 'start_task',
    description: 'Mark a task as in_progress. Use when user says they started, working on, or beginning a task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        task_id: { type: 'string', description: 'DB UUID of the task to start' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'get_todays_priorities',
    description: 'Return the top priority tasks for today. Use when user asks what to do, what\'s next, priorities, focus, etc.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_pace_status',
    description: 'Return PACE score breakdown and what\'s dragging it. Use when user asks about PACE, score, velocity, progress.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_blocked_items',
    description: 'List all blocked tasks. Use when user asks what\'s blocked, stuck, at risk.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
]

// ─── Main conversation handler ────────────────────────────────────────────────

export async function processMessage(
  ctx: CompanionContext,
  userMessage: string,
): Promise<{ reply: string; actionsLog: ActionResult[] }> {
  const tasks = await loadTasks(ctx.companyId)
  const systemPrompt = buildSystemPrompt(ctx, tasks)
  const actionsLog: ActionResult[] = []

  // First Claude call — may request tool use
  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5',
    max_tokens: 1024,
    system:     systemPrompt,
    tools:      TOOLS,
    messages:   [{ role: 'user', content: userMessage }],
  })

  let toolResults: Anthropic.MessageParam[] = []
  const toolResultContents: Anthropic.ToolResultBlockParam[] = []
  let needsFollowUp = false

  // Process any tool calls
  for (const block of response.content) {
    if (block.type !== 'tool_use') continue
    needsFollowUp = true
    const input = block.input as Record<string, unknown>

    let result = ''

    if (block.name === 'complete_task') {
      const ids = input.task_ids as string[]
      for (const id of ids) {
        const title = await completeTask(ctx.companyId, id)
        actionsLog.push({ action: 'completed', taskId: id, title })
        result += `✅ Completed: ${title}\n`
      }
      await refreshPace(ctx.companyId)
    }

    else if (block.name === 'block_task') {
      const id = input.task_id as string
      const reason = input.reason as string
      const title = await blockTask(ctx.companyId, id, reason)
      actionsLog.push({ action: 'blocked', taskId: id, title, note: reason })
      result = `🔴 Flagged as blocked: ${title}`
    }

    else if (block.name === 'start_task') {
      const id = input.task_id as string
      const title = await startTask(ctx.companyId, id)
      actionsLog.push({ action: 'started', taskId: id, title })
      result = `▶️ Started: ${title}`
    }

    else if (block.name === 'get_todays_priorities') {
      const top = tasks
        .filter(t => t.status !== 'completed')
        .slice(0, 5)
        .map((t, i) => `${i + 1}. ${t.title} (${t.priority})`)
        .join('\n')
      result = top || 'No open tasks — you\'re all caught up!'
      actionsLog.push({ action: 'get_priorities' })
    }

    else if (block.name === 'get_pace_status') {
      const completedCount = tasks.filter(t => t.status === 'completed').length
      const blockedItems   = tasks.filter(t => t.status === 'blocked').map(t => t.title).join(', ')
      result = `PACE: ${ctx.paceScore}/100 | ${completedCount}/${tasks.length} tasks done | ${ctx.estimatedDays} days to window${blockedItems ? ` | Blockers: ${blockedItems}` : ''}`
      actionsLog.push({ action: 'get_pace' })
    }

    else if (block.name === 'get_blocked_items') {
      const bl = tasks.filter(t => t.status === 'blocked')
      result = bl.length
        ? bl.map(t => `🔴 ${t.title}`).join('\n')
        : 'No blocked tasks right now 🟢'
      actionsLog.push({ action: 'get_blocked' })
    }

    toolResultContents.push({
      type:        'tool_result',
      tool_use_id: block.id,
      content:     result,
    })
  }

  // If tools were called, get the final reply
  if (needsFollowUp) {
    toolResults = [
      { role: 'assistant', content: response.content },
      { role: 'user',      content: toolResultContents },
    ]

    const finalResponse = await anthropic.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 512,
      system:     systemPrompt,
      messages:   [
        { role: 'user', content: userMessage },
        ...toolResults,
      ],
    })

    const textBlock = finalResponse.content.find(b => b.type === 'text')
    return { reply: textBlock ? textBlock.text : 'Done ✅', actionsLog }
  }

  // No tools needed — direct reply
  const textBlock = response.content.find(b => b.type === 'text')
  return { reply: textBlock ? textBlock.text : 'How can I help?', actionsLog }
}

// ─── Daily pulse message builder ─────────────────────────────────────────────

export async function buildDailyPulse(ctx: CompanionContext): Promise<string> {
  const tasks = await loadTasks(ctx.companyId)
  const critical  = tasks.filter(t => ['critical', 'high'].includes(t.priority) && t.status !== 'completed').slice(0, 3)
  const blocked   = tasks.filter(t => t.status === 'blocked')
  const completed = tasks.filter(t => t.status === 'completed').length
  const paceEmoji = ctx.paceScore >= 80 ? '🟢' : ctx.paceScore >= 50 ? '🟡' : '🔴'

  const lines = [
    `Good morning ${ctx.userName.split(' ')[0]} 👋`,
    ``,
    `${paceEmoji} PACE™: ${ctx.paceScore}/100 | ${ctx.estimatedDays} days to window`,
    `📋 ${completed}/${tasks.length} tasks complete`,
    ``,
  ]

  if (critical.length) {
    lines.push(`🎯 Today's priorities:`)
    critical.forEach((t, i) => lines.push(`${i + 1}. ${t.title}`))
    lines.push(``)
  }

  if (blocked.length) {
    lines.push(`⚠️ ${blocked.length} blocked: ${blocked.map(t => t.title).join(', ')}`)
    lines.push(``)
  }

  lines.push(`Reply to update tasks or ask me anything about your ${ctx.exchange} listing.`)

  return lines.join('\n')
}
