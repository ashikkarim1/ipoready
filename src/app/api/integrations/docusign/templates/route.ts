/**
 * GET /api/integrations/docusign/templates
 * List available DocuSign templates for the account
 *
 * Query params: { searchText?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  refreshDocuSignAccountTokens,
  getDocuSignErrorMessage,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const searchText = searchParams.get('searchText') || ''

  try {
    const account = await refreshDocuSignAccountTokens(user.companyId)

    const response = await fetch(
      `${account.baseUri}/v2.1/accounts/${account.docusignAccountId}/templates?searchText=${encodeURIComponent(searchText)}&includeMetadata=true`,
      {
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch templates: ${response.status} - ${error}`)
    }

    const data = (await response.json()) as any

    return NextResponse.json({
      templates: (data.envelopeTemplates || []).map((template: any) => ({
        templateId: template.templateId,
        name: template.name,
        uri: template.uri,
        created: template.created,
        modified: template.modified,
      })),
    })
  } catch (error) {
    const msg = getDocuSignErrorMessage(error)
    console.error('Failed to fetch templates:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
