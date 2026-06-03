import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'

export const dynamic = 'force-dynamic'

// Template content generators
const templateContent = {
  'template-001': {
    filename: 'Lead-Underwriter-Agreement.docx',
    title: 'Lead Underwriter Agreement',
    content: `LEAD UNDERWRITER AGREEMENT

THIS AGREEMENT made as of [DATE], between [ISSUER NAME], a corporation organized under the laws of [JURISDICTION] ("Company"), and [LEAD UNDERWRITER NAME], a corporation organized under the laws of [JURISDICTION] ("Lead Underwriter").

WHEREAS the Company proposes to conduct an initial public offering of [NUMBER] shares of its common stock at an estimated public offering price of $[PRICE] per share (the "Offering"), and

WHEREAS the Company wishes to retain the Lead Underwriter to manage and coordinate the underwriting syndicate for the Offering.

NOW THEREFORE in consideration of the mutual covenants and agreements herein contained:

1. COMMITMENT

1.1 The Lead Underwriter commits to purchase, or to find purchasers for, all shares offered in the Offering.

1.2 The Lead Underwriter shall exercise reasonable efforts to sell the shares at the offering price and shall not sell shares below the offering price without prior written consent of the Company.

2. COMPENSATION

2.1 The Company shall pay the Lead Underwriter an underwriting discount of [_]% of the gross proceeds from the Offering.

2.2 The Lead Underwriter shall reimburse the Company for all reasonable out-of-pocket expenses incurred in connection with the Offering, including legal, accounting, printing, and roadshow expenses, up to a maximum of $[AMOUNT].

3. DUE DILIGENCE

3.1 The Lead Underwriter shall conduct due diligence investigation of the Company's business, financial condition, and operations.

3.2 The Company shall provide reasonable access to its senior management, advisors, and records as necessary for the Lead Underwriter to complete due diligence.

4. STABILIZATION

4.1 The Lead Underwriter may stabilize the stock price following the Offering for a period not to exceed 30 calendar days following the closing date.

4.2 Any stabilization activities shall be conducted in compliance with applicable securities laws and regulations.

5. LOCK-UP AGREEMENT

5.1 Company directors, officers, employees owning greater than 1% of shares, and underwriters agree to lock-up their shares for 180 days following closing.

5.2 Limited exceptions include estate planning, hardship sales, and Rule 10b5-1 trading plans.

6. REPRESENTATIONS AND WARRANTIES

The Company represents and warrants that:

6.1 It is duly organized and validly existing under applicable law.

6.2 The financial statements included in the prospectus have been prepared in accordance with GAAP and fairly present the Company's financial condition.

6.3 It has full power and authority to execute this Agreement.

6.4 All information provided to the Lead Underwriter is true, accurate, and complete.

7. INDEMNIFICATION

7.1 The Company shall indemnify the Lead Underwriter against any losses arising from material misstatements or omissions in the prospectus or other offering documents.

7.2 The Lead Underwriter shall indemnify the Company against losses arising from its breach of this Agreement.

8. TERMINATION

This Agreement may be terminated:

8.1 By mutual written consent of both parties.

8.2 By either party if the Offering has not occurred by [DATE].

8.3 By the Lead Underwriter if material adverse changes occur in the Company's financial condition.

9. GOVERNING LAW

This Agreement shall be governed by the laws of [JURISDICTION], without regard to conflicts of law principles.

IN WITNESS WHEREOF the parties have executed this Agreement as of the date first written above.

[COMPANY NAME]

By: ___________________________
Name: _________________________
Title: __________________________

[LEAD UNDERWRITER NAME]

By: ___________________________
Name: _________________________
Title: __________________________`,
  },
  'template-002': {
    filename: 'Co-Underwriter-Agreement.docx',
    title: 'Co-Underwriter Agreement',
    content: `CO-UNDERWRITER AGREEMENT

THIS AGREEMENT made as of [DATE], between [ISSUER NAME], a corporation organized under the laws of [JURISDICTION] ("Company"), [LEAD UNDERWRITER NAME] ("Lead Underwriter"), and [CO-UNDERWRITER NAME], a corporation organized under the laws of [JURISDICTION] ("Co-Underwriter").

WHEREAS the Company is conducting an initial public offering of [NUMBER] shares of its common stock (the "Offering"), and

WHEREAS the Lead Underwriter and Co-Underwriter wish to establish the terms and conditions governing the Co-Underwriter's participation in the Offering.

NOW THEREFORE in consideration of the mutual covenants and agreements herein contained:

1. SYNDICATE PARTICIPATION

1.1 The Co-Underwriter commits to purchase [NUMBER] shares from the Company at a price of $[PRICE] per share.

1.2 The Co-Underwriter shall use reasonable efforts to sell its allocated shares at the public offering price.

1.3 The Co-Underwriter authorizes the Lead Underwriter to take all necessary actions on behalf of the syndicate.

2. COMPENSATION STRUCTURE

2.1 The Co-Underwriter shall receive the following:
   (a) Underwriting discount: [_]% of sales proceeds
   (b) Selling concession: [_]% of sales proceeds
   (c) Expense reimbursement: Pro rata share based on syndicate position

2.2 All compensation shall be paid within [NUMBER] business days of closing.

3. SALES OBLIGATIONS

3.1 The Co-Underwriter commits to make a good-faith effort to sell its allocated shares.

3.2 Unsold shares shall be purchased by the syndicate or reallocated to other members.

3.3 The Co-Underwriter shall submit daily sales confirmations to the Lead Underwriter.

4. LOCK-UP AND STANDSTILL

4.1 The Co-Underwriter agrees to a [180/270]-day lock-up on allocated shares.

4.2 The Co-Underwriter shall not:
   (a) Sell or transfer allocated shares during the lock-up period
   (b) Short sell Company shares
   (c) Engage in stabilization activities outside of Lead Underwriter direction

5. INDEMNIFICATION

5.1 Each party indemnifies the others against losses arising from:
   (a) Material misrepresentations in offering documents
   (b) Breach of representations and warranties
   (c) Violation of securities laws

5.2 Indemnification claims must be asserted within [180] days of closing.

6. LIABILITY ALLOCATION

6.1 Joint and several liability applies to underwriter misstatements.

6.2 Proportionate liability applies based on:
   (a) Reasonable investigation conducted
   (b) Knowledge of material facts
   (c) Portion of offering underwritten

7. EXPENSES

7.1 The Company shall pay all reasonable out-of-pocket syndicate expenses.

7.2 Each Co-Underwriter is responsible for its own internal costs.

8. REPRESENTATIONS AND WARRANTIES

Each party represents and warrants that:

8.1 It is duly organized and validly existing.

8.2 It has authority to execute this Agreement.

8.3 This Agreement is its binding obligation.

8.4 It shall comply with all applicable securities laws.

9. TERMINATION

9.1 This Agreement terminates upon:
   (a) Completion of the Offering
   (b) Expiration of lock-up period
   (c) Mutual written consent

10. GOVERNING LAW

This Agreement shall be governed by the laws of [JURISDICTION].

IN WITNESS WHEREOF the parties have executed this Agreement as of the date first written above.

[COMPANY NAME]

By: ___________________________

[LEAD UNDERWRITER NAME]

By: ___________________________

[CO-UNDERWRITER NAME]

By: ___________________________`,
  },
  'template-003': {
    filename: 'Standstill-Agreement.docx',
    title: 'Standstill Agreement',
    content: `STANDSTILL AGREEMENT

THIS AGREEMENT made as of [DATE], between [ISSUER NAME], a corporation organized under the laws of [JURISDICTION] ("Company"), and [SHAREHOLDER/UNDERWRITER NAME] ("Restricted Person").

WHEREAS the Company is conducting an initial public offering of its common stock, and

WHEREAS the Restricted Person holds or will acquire shares in connection with the Offering, and

WHEREAS the parties wish to establish restrictions on trading and transfers of such shares.

NOW THEREFORE in consideration of the mutual covenants and agreements herein contained:

1. RESTRICTED PERIOD

1.1 The Restricted Person agrees to restrict all sales, transfers, and pledges of Company shares for a period of 180 calendar days following the closing date of the Offering (the "Lock-up Period").

1.2 The Lock-up Period may be extended to 270 calendar days if:
   (a) The Company fails to achieve specified earnings targets, or
   (b) Market conditions warrant extension as determined by the Lead Underwriter

1.3 Any extension must be publicly announced at least 10 business days before expiration.

2. SCOPE OF RESTRICTIONS

2.1 During the Lock-up Period, the Restricted Person shall not:
   (a) Sell, transfer, pledge, or otherwise dispose of shares
   (b) Engage in short sales of Company shares
   (c) Grant options or warrants to acquire Company shares
   (d) Hedge positions in Company shares
   (e) Enter into derivative transactions involving Company shares

2.2 These restrictions apply to:
   (a) All shares owned as of the Offering date
   (b) All shares acquired as founder, executive, or director compensation
   (c) All shares received through equity plans or awards

3. PERMITTED TRANSACTIONS

3.1 Notwithstanding Section 2, the Restricted Person may:

   (a) Estate Planning: Transfers by will or laws of descent for estate planning purposes (with notice to Company)

   (b) Death Exception: Upon death of Restricted Person, estate representatives may sell shares for liquidity purposes

   (c) Hardship: Sales up to 25% of holdings if:
       i. Restricted Person demonstrates material financial hardship
       ii. Company approves in writing
       iii. Sales occur at fair market value
       iv. Restricted Person provides 10 days' notice

   (d) Rule 10b5-1 Plans: Pre-established trading plans executed after expiration of Lock-up Period

   (e) Pledges to Lenders: Pledges to financial institutions for loan collateral (without sale)

4. RULE 10b5-1 TRADING PLANS

4.1 Restricted Person may establish Rule 10b5-1 plans during the Lock-up Period.

4.2 Such plans may commence sales only after the Lock-up Period expires.

4.3 Restricted Person shall provide written notice of any 10b5-1 plan to the Company.

5. ENFORCEMENT AND PENALTIES

5.1 Material breach of this Agreement shall result in:
   (a) Automatic return of all shares sold during Lock-up to the Company
   (b) Disgorgement of profits from such sales
   (c) Payment of liquidated damages of 5% of sale proceeds
   (d) Injunctive relief to prevent further sales

5.2 Breaches must be discovered and claimed within 2 years of closing.

6. REPRESENTATIONS AND WARRANTIES

The Restricted Person represents and warrants that:

6.1 It has full authority to enter into this Agreement.

6.2 It understands the restrictions imposed by this Agreement.

6.3 It has reviewed this Agreement with legal counsel (if desired).

6.4 It acknowledges the potential market value restriction on shares.

7. PUBLIC ANNOUNCEMENT

7.1 Any extension of the Lock-up Period shall be publicly announced.

7.2 The Company shall provide notice to all restricted shareholders simultaneously.

7.3 Announcements shall comply with all applicable securities laws.

8. TERMINATION

8.1 This Agreement terminates automatically upon expiration of the Lock-up Period.

8.2 All restrictions cease immediately upon scheduled expiration.

8.3 Early termination may occur only by mutual written consent.

9. GOVERNING LAW

This Agreement shall be governed by the laws of [JURISDICTION].

IN WITNESS WHEREOF the parties have executed this Agreement as of the date first written above.

[COMPANY NAME]

By: ___________________________
Name: _________________________
Title: __________________________

[RESTRICTED PERSON NAME]

By/Signature: ____________________
Date: _____________________________`,
  },
}

type TemplateId = 'template-001' | 'template-002' | 'template-003'

function createDocumentFromContent(title: string, content: string): Document {
  const lines = content.split('\n')
  const paragraphs: Paragraph[] = []

  for (const line of lines) {
    if (!line.trim()) {
      paragraphs.push(new Paragraph({ text: '' }))
      continue
    }

    if (line.match(/^[A-Z][A-Z\s]+AGREEMENT$/)) {
      paragraphs.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_1,
          spacing: { line: 360, after: 240 },
        })
      )
    } else if (line.match(/^\d+\.\s+[A-Z]/)) {
      paragraphs.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 120 },
        })
      )
    } else if (line.match(/^\d+\.\d+\s+/)) {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: { line: 240, after: 120 },
          indent: { left: 720 },
        })
      )
    } else if (line.match(/^   \([a-z]\)\s+/)) {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: { line: 240, after: 60 },
          indent: { left: 1440 },
        })
      )
    } else if (line.includes('IN WITNESS WHEREOF')) {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: { before: 240, after: 240 },
        })
      )
    } else {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: { line: 240, after: 60 },
        })
      )
    }
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const templateId = searchParams.get('id') as TemplateId | null

  if (!templateId || !(templateId in templateContent)) {
    return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
  }

  try {
    const template = templateContent[templateId]
    const doc = createDocumentFromContent(template.title, template.content)
    const buffer = await Packer.toBuffer(doc)
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${template.filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[GET /api/compliance/templates/download] Error:', error)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}
