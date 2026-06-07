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
    blocker: `I understand the blockers feel overwhelming right now. Let's break them down:

**What we can control TODAY:**
1. Identify the single highest-impact blocker
2. Schedule 1:1 with the person who can unblock it
3. Set a 24-hour decision point

**Why this matters:**
Most delays aren't due to complexity — they're due to unclear decision rights. One clear conversation often unblocks 3-5 downstream tasks.

What's the top blocker you're facing?`,

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

That's a lot, but here's what matters:

**The Pareto Principle applies HARD in IPO prep:**
- 20% of tasks will unblock 80% of downstream work
- Fix those first, don't scatter

**Your next 48 hours:**
1. List all overdue tasks (15 min)
2. Identify which task unblocks the most others (30 min)
3. Get that ONE task to "done" or "escalate" status (rest of time)

Don't juggle. Pick one. Finish it. Then move.

What's the task that would unblock the most?`,

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
