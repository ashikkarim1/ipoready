/**
 * GET /api/integrations/docusign/account
 * Fetch connected DocuSign account details
 *
 * DELETE /api/integrations/docusign/account
 * Disconnect/revoke DocuSign integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getDocuSignAccount,
  revokeDocuSignAccount,
} from '@/lib/integrations/docusign'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const account = await getDocuSignAccount(user.companyId)

    if (!account) {
      return NextResponse.json(
        { connected: false, account: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      connected: true,
      account: {
        id: account.id,
        companyId: account.companyId,
        docusignAccountId: account.docusignAccountId,
        accountName: account.accountName,
        organizationName: account.organizationName,
        environment: account.environment,
        isActive: account.isActive,
        oauthStatus: account.oauthStatus,
        authenticatedAt: account.authenticatedAt.toISOString(),
        lastRefreshedAt: account.lastRefreshedAt?.toISOString(),
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Failed to fetch DocuSign account:', msg)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await revokeDocuSignAccount(user.companyId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Failed to revoke DocuSign account:', msg)
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    )
  }
}
