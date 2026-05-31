import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { resend, FROM_ADDRESS } from '@/lib/resend'
import Anthropic from '@anthropic-ai/sdk'

type Period = '7d' | '30d' | '90d' | 'all'

// ─── HTML email template ──────────────────────────────────────────────────────

function buildEmailHtml(params: {
  companyName:  string
  period:       Period
  paceScore:    number
  currentPhase: string
  estimatedDays: number
  listingType:  string
  exchange:     string
  taskTotal:    number
  taskCompleted: number
  taskInProgress: number
  taskBlocked:  number
  taskOverdue:  number
  assessment:   string
}): string {
  const {
    companyName, period, paceScore, currentPhase, estimatedDays,
    listingType, exchange, taskTotal, taskCompleted, taskInProgress,
    taskBlocked, taskOverdue, assessment,
  } = params

  const periodLabel: Record<Period, string> = {
    '7d':  'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    'all': 'Since Inception',
  }

  const phaseLabel = currentPhase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const paceColor  = paceScore >= 80 ? '#16a34a' : paceScore >= 50 ? '#d97706' : '#dc2626'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${companyName} — IPO Readiness Board Report</title>
</head>
<body style="margin:0;padding:0;background:#F4F3F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1A1A1A;padding:32px 40px;">
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">IPOReady Board Report</p>
            <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;">${companyName}</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">${periodLabel[period]} &nbsp;·&nbsp; ${exchange.toUpperCase()} ${listingType.replace(/_/g,' ')}</p>
          </td>
        </tr>

        <!-- PACE score -->
        <tr>
          <td style="padding:32px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#F7F6F4;border-radius:12px;padding:20px 24px;">
                  <p style="margin:0 0 6px;font-size:12px;color:#9A9A9A;text-transform:uppercase;letter-spacing:0.08em;">PACE™ Score</p>
                  <p style="margin:0;font-size:40px;font-weight:800;color:${paceColor};">${paceScore}<span style="font-size:20px;color:#9A9A9A;">/100</span></p>
                  <p style="margin:6px 0 0;font-size:13px;color:#6A6A6A;">Current phase: <strong style="color:#1A1A1A;">${phaseLabel}</strong> &nbsp;·&nbsp; ${estimatedDays} days to listing window</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Task stats -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.06em;">Task Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${[
                  { label: 'Total',       value: taskTotal,      color: '#1A1A1A' },
                  { label: 'Completed',   value: taskCompleted,  color: '#16a34a' },
                  { label: 'In Progress', value: taskInProgress, color: '#2563eb' },
                  { label: 'Blocked',     value: taskBlocked,    color: '#dc2626' },
                  { label: 'Overdue',     value: taskOverdue,    color: '#d97706' },
                ].map(s => `
                <td align="center" style="padding:0 6px 0 0;">
                  <div style="background:#F7F6F4;border-radius:10px;padding:14px 10px;text-align:center;">
                    <p style="margin:0;font-size:22px;font-weight:800;color:${s.color};">${s.value}</p>
                    <p style="margin:4px 0 0;font-size:10px;color:#9A9A9A;text-transform:uppercase;letter-spacing:0.05em;">${s.label}</p>
                  </div>
                </td>`).join('')}
              </tr>
            </table>
          </td>
        </tr>

        <!-- AI Assessment -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.06em;">Board Assessment</p>
            <div style="background:#F7F6F4;border-left:3px solid #1A1A1A;border-radius:0 10px 10px 0;padding:20px 24px;">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#3A3A3A;">${assessment.replace(/\n/g, '<br/>')}</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 40px;border-top:1px solid #F0EFEc;margin-top:24px;">
            <p style="margin:0;font-size:12px;color:#9A9A9A;">Generated by <strong style="color:#1A1A1A;">IPOReady</strong> — the world's first central hub for IPO readiness workflow management.</p>
            <p style="margin:8px 0 0;font-size:11px;color:#BABAB8;">This report is confidential and intended solely for the named recipients.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Fallback template assessment ────────────────────────────────────────────

function templateAssessment(params: {
  companyName:    string
  period:         Period
  paceScore:      number
  currentPhase:   string
  taskTotal:      number
  taskCompleted:  number
  taskBlocked:    number
  estimatedDays:  number
}): string {
  const { companyName, period, paceScore, currentPhase, taskTotal, taskCompleted, taskBlocked, estimatedDays } = params
  const phaseLabel  = currentPhase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const completePct = taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0
  const periodLabel: Record<Period, string> = { '7d': 'this week', '30d': 'this month', '90d': 'this quarter', 'all': 'to date' }
  const trend       = paceScore >= 70 ? 'on track' : paceScore >= 50 ? 'progressing steadily' : 'facing headwinds'

  return `${companyName} is ${trend} toward its listing target with a PACE™ score of ${paceScore}/100. The company is currently in the ${phaseLabel} phase with ${estimatedDays} days remaining to its listing window. ${periodLabel[period].charAt(0).toUpperCase() + periodLabel[period].slice(1)}, ${taskCompleted} of ${taskTotal} tasks (${completePct}%) have been completed.${taskBlocked > 0 ? ` There are currently ${taskBlocked} blocked item${taskBlocked > 1 ? 's' : ''} requiring board attention.` : ' No tasks are currently blocked.'} Management continues to execute against the IPO roadmap and will provide an updated forecast at the next board meeting.`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId    = (session.user as any).id as string
  const companyId = (session.user as any).companyId as string | null

  if (!companyId) {
    return NextResponse.json({ error: 'No company linked to this account' }, { status: 400 })
  }

  let body: { recipients?: string; period?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { recipients = '', period = '30d' } = body
  const validPeriods: Period[] = ['7d', '30d', '90d', 'all']
  const safePeriod = (validPeriods.includes(period as Period) ? period : '30d') as Period

  const recipientList = recipients
    .split(',')
    .map((e: string) => e.trim())
    .filter((e: string) => e.includes('@'))

  if (recipientList.length === 0) {
    return NextResponse.json({ error: 'At least one valid recipient email is required' }, { status: 400 })
  }

  // ── Load company data ─────────────────────────────────────────────────────
  const companyRows = await sql`
    SELECT c.name, c.pace_score, c.current_phase, c.estimated_days_to_ipo,
           c.listing_type, c.target_exchange
    FROM companies c
    WHERE c.id = ${companyId}
    LIMIT 1
  `
  if (!companyRows.length) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }
  const co = companyRows[0] as any

  // ── Load task stats ───────────────────────────────────────────────────────
  const taskRows = await sql`
    SELECT
      COUNT(*)                                                       AS total,
      COUNT(*) FILTER (WHERE status = 'completed')                   AS completed,
      COUNT(*) FILTER (WHERE status = 'in_progress')                 AS in_progress,
      COUNT(*) FILTER (WHERE status = 'blocked')                     AS blocked,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'completed') AS overdue
    FROM tasks
    WHERE company_id = ${companyId}
  `
  const ts = taskRows[0] as any

  const stats = {
    taskTotal:      Number(ts.total      ?? 0),
    taskCompleted:  Number(ts.completed  ?? 0),
    taskInProgress: Number(ts.in_progress ?? 0),
    taskBlocked:    Number(ts.blocked    ?? 0),
    taskOverdue:    Number(ts.overdue    ?? 0),
  }

  // ── Generate assessment ───────────────────────────────────────────────────
  let assessment: string

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const aiRes = await anthropic.messages.create({
        model:      'claude-haiku-4-5',
        max_tokens: 300,
        messages: [{
          role:    'user',
          content: `Write a concise 150-word board assessment for the IPO readiness report.

Company: ${co.name}
Exchange: ${co.target_exchange?.toUpperCase() ?? 'TSX-V'} ${(co.listing_type ?? '').replace(/_/g, ' ')}
PACE™ Score: ${co.pace_score ?? 0}/100
Current Phase: ${(co.current_phase ?? '').replace(/_/g, ' ')}
Days to Listing Window: ${co.estimated_days_to_ipo ?? 'N/A'}
Report Period: ${{ '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', 'all': 'Since inception' }[safePeriod]}
Tasks: ${stats.taskTotal} total, ${stats.taskCompleted} completed, ${stats.taskInProgress} in progress, ${stats.taskBlocked} blocked, ${stats.taskOverdue} overdue

Write in a formal board-memo tone. Be specific to the numbers. Highlight risks if blocked/overdue tasks are elevated. No bullet points — flowing prose only. Exactly ~150 words.`,
        }],
      })
      const textBlock = aiRes.content.find(b => b.type === 'text')
      assessment = textBlock ? textBlock.text : templateAssessment({ companyName: co.name, period: safePeriod, paceScore: co.pace_score ?? 0, currentPhase: co.current_phase ?? '', ...stats, estimatedDays: co.estimated_days_to_ipo ?? 180 })
    } catch {
      assessment = templateAssessment({ companyName: co.name, period: safePeriod, paceScore: co.pace_score ?? 0, currentPhase: co.current_phase ?? '', ...stats, estimatedDays: co.estimated_days_to_ipo ?? 180 })
    }
  } else {
    assessment = templateAssessment({ companyName: co.name, period: safePeriod, paceScore: co.pace_score ?? 0, currentPhase: co.current_phase ?? '', ...stats, estimatedDays: co.estimated_days_to_ipo ?? 180 })
  }

  // ── Send emails ───────────────────────────────────────────────────────────
  const subject = `${co.name} — IPO Readiness Board Report (${safePeriod})`
  const html    = buildEmailHtml({
    companyName:    co.name,
    period:         safePeriod,
    paceScore:      co.pace_score ?? 0,
    currentPhase:   co.current_phase ?? '',
    estimatedDays:  co.estimated_days_to_ipo ?? 180,
    listingType:    co.listing_type ?? '',
    exchange:       co.target_exchange ?? '',
    assessment,
    ...stats,
  })

  let sent = 0
  const errors: string[] = []

  try {
    const result = await resend.emails.send({
      from:    FROM_ADDRESS,
      to:      recipientList,
      subject,
      html,
    })
    if ((result as any).error) {
      errors.push((result as any).error.message ?? 'Resend error')
    } else {
      sent = recipientList.length
    }
  } catch (err: any) {
    errors.push(err.message ?? 'Email send failed')
  }

  if (errors.length > 0 && sent === 0) {
    return NextResponse.json({ sent: 0, error: errors[0] }, { status: 500 })
  }

  return NextResponse.json({ sent, ...(errors.length ? { error: errors[0] } : {}) })
}
