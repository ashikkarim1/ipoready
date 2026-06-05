import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

const TEMPLATES: Record<string, { name: string; content: string; type: string }> = {
  prospectus: {
    name: 'Prospectus Template',
    content: `PROSPECTUS TEMPLATE\n\nCompany Information:\n- Legal Name:\n- Incorporation Date:\n- Jurisdiction:`,
    type: 'text/plain',
  },
  'financial-statements': {
    name: 'Financial Statements Template',
    content: `AUDITED FINANCIAL STATEMENTS\n\nBalance Sheet`,
    type: 'text/plain',
  },
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const docType = searchParams.get('type')

    if (!docType || !TEMPLATES[docType]) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const template = TEMPLATES[docType]
    return new NextResponse(template.content, {
      headers: {
        'Content-Type': template.type,
        'Content-Disposition': `attachment; filename="${template.name}.txt"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
