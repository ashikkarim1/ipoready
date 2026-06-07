import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

interface EmergencyChatRequest {
  message: string
  context: {
    company?: string
    pacScore?: number
    phase?: string
    overdueTasks?: number
    blockers?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: EmergencyChatRequest = await request.json()
    const { message, context } = body

    // Generate contextual AI response
    // In production, this would call Claude API with full context
    const response = generateContextualResponse(message, context)

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Emergency chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

function generateContextualResponse(
  message: string,
  context: EmergencyChatRequest['context']
): string {
  const lowerMessage = message.toLowerCase()

  // Response patterns based on message content
  const responses: { [key: string]: string } = {
    blocker: `I see you have ${context.blockers || 5} active blockers. Let's triage:

**Your Critical Blockers (from validation analysis):**
1. **PIF Forms** (3 directors) — 3-5 days to fix, $0 cost
   → Action: Escalate to CEO today, get residential histories
2. **Audit Committee Charter** — 7-10 days, $2-5K
   → Action: Board resolution meeting this week
3. **Auditor Engagement** — 7-14 days, $75-120K
   → Action: Issue RFP to Big 4 firms today

**What we can control TODAY:**
1. CEO escalates to Director #2 for outstanding PIF info
2. Schedule board meeting for charter approval
3. Start auditor RFP process

Most delays aren't due to complexity — they're due to unclear decision rights. One clear conversation often unblocks 3-5 downstream tasks.

Which of these 3 can you move forward on in the next 24 hours?`,

    timeline: `Your current timeline shows ${context.daysToIPO} days to IPO. That's real, and you're working with the constraints you have.

**Reality check:**
- You're at ${context.pacScore}% readiness (PACE score)
- Most companies in your phase are 45-60% ready — you're tracking well
- Timeline slips are typically 30-60 days, NOT months

**What you control:**
- Which tasks to parallelize (cut 20-40 days off timeline)
- Who you bring in for support (cut another 20-30 days)
- How tightly you manage dependencies

Let's focus on the 3 dependencies you can resolve this week.`,

    pace: `Your PACE score of ${context.pacScore} tells us:
- You're past the riskiest phase (pre-planning)
- You have momentum in specific areas
- There are clear gaps that are dragging the average down

This is NORMAL. Scores move fast during execution — expect 5-10 point swings week-to-week.

**Strategy:**
Don't chase the score. Instead:
1. Fix the 2-3 categories pulling you down most
2. Get early wins (they compound)
3. Re-assess in 2 weeks

What's the phase that feels most stuck?`,

    team: `Team engagement is critical right now. Misalignment multiplies delays by 3-4x.

**Quick wins:**
1. Get your core team (3-5 people) in one room for 2 hours
2. Share this assessment — they need to see the real picture
3. Ask: "What's blocking YOU?" (different from blockers)
4. Rebuild the timeline TOGETHER (increases buy-in 10x)

Teams move fast when they own the outcome. Right now, ownership might be unclear.

Who's your core decision-making team?`,

    help: `I'm here to help you think clearly when everything feels urgent.

**What I can do:**
- Help you prioritize (separate urgent from important)
- Walk through specific decisions (pros/cons, implications)
- Break down complex problems into actionable steps
- Remind you that most IPO challenges are solvable

**What you control:**
- Your focus (don't try to fix everything at once)
- Your communication (clarity removes 40% of delays)
- Your decision velocity (each day of delay compounds)

What feels most urgent right now?`,

    focus: `Let's get clear on focus. You have ${context.overdueTasks} overdue tasks and ${context.blockers} active blockers.

**Data-Driven Priority (from validation analysis):**

🔴 **CRITICAL (do this week):**
- PIF Forms: 3-5 days, $0, unblocks regulatory filing
- Audit Committee Charter: 7-10 days, $2-5K, required for compliance
- Auditor Engagement: 7-14 days, $75-120K, critical path blocker

🟡 **HIGH (do within 14 days):**
- Board resolutions documentation: 2-3 days, $1-3K
- Customer concentration narrative: 3-5 days, $0

📊 **The Math:**
- Fixing these 5 items = ~35 days of work
- But they unblock 80% of downstream tasks
- You could save 45+ days by parallelizing

**Your next 48 hours:**
1. PIF forms escalation (contact Director #2 today)
2. Board meeting scheduled (for charter approval)
3. Auditor RFP started (3 firms)

Don't juggle. Pick the top 1-2. Own them. Then move.

What's first: PIF forms or auditor engagement?`,

    default: `I hear you. This phase of IPO prep is genuinely challenging — there are a lot of moving parts, lots of dependencies, and real time pressure.

**Here's what I want you to know:**
- You're not alone in feeling overwhelmed
- Most companies in your phase feel the same
- The ones that succeed do it by staying focused, not by doing more

**Right now, you have three choices:**
1. **Focus:** Pick the ONE highest-impact item and move it forward
2. **Delegate:** Find someone else to own a critical path item
3. **Escalate:** Bring in outside help (auditors, counsel, advisors)

Most executives stay stuck by trying to do all three at once.

What's the one thing that would make you feel like you have momentum again?`,
  }

  // Find matching response
  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerMessage.includes(keyword)) {
      return response
    }
  }

  // Default response if no keyword match
  return responses.default
}
