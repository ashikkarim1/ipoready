/**
 * Xero Integration Service
 * OAuth2 auth, financial data sync (accounts, invoices, bills, transactions)
 * Balance sheet aggregation and PACE™ input mapping
 */

import { sql } from '../db'
import {
  AccountingIntegration,
  AccountingSync,
  RawAccountingData,
  AccountingAccount,
  AccountingInvoice,
  AccountingBill,
  AccountingTransaction,
  BalanceSheetData,
  ProfitAndLossData,
  PACEFinancialMapping,
  OAuthTokens,
  ErrorCode,
  AccountingError,
} from '../types/accounting-integration'

export interface XeroConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

// Xero OAuth endpoints
const XERO_OAUTH_BASE_URL = 'https://login.xero.com/identity/connect'
const XERO_API_BASE_URL = 'https://api.xero.com/api.xro/2.0'

/**
 * Xero Integration Service
 * Handles OAuth, token management, data sync, and PACE mapping
 */
export class XeroIntegrationService {
  private config: XeroConfig

  constructor(config: XeroConfig) {
    this.config = config
  }

  /**
   * Generate Xero OAuth authorization URL
   */
  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: [
        'accounting',
        'email',
        'profile',
      ].join(' '),
      state,
    })

    return `${XERO_OAUTH_BASE_URL}/authorize?${params.toString()}`
  }

  /**
   * Exchange OAuth code for access tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokens & { tenantId: string }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    })

    const response = await fetch(`${XERO_OAUTH_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw this.createError('AUTH_FAILED', response.status, false, 'Failed to exchange OAuth code')
    }

    const data = await response.json()

    // Get tenant ID from connections endpoint
    const tenantId = await this.getTenantId(data.access_token)

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type || 'Bearer',
      tenantId,
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    })

    const response = await fetch(`${XERO_OAUTH_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw this.createError('TOKEN_EXPIRED', response.status, true, 'Failed to refresh token')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type || 'Bearer',
    }
  }

  /**
   * Handle OAuth callback and store integration
   */
  async handleOAuthCallback(
    code: string,
    companyId: string
  ): Promise<AccountingIntegration> {
    try {
      const tokens = await this.exchangeCodeForTokens(code)

      const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000)

      // Fetch organization name
      const orgInfo = await this.fetchOrganisationInfo(tokens.accessToken, tokens.tenantId)

      const result = await sql`
        INSERT INTO accounting_integrations (
          company_id,
          platform,
          access_token_encrypted,
          refresh_token_encrypted,
          token_expires_at,
          realm_id,
          organization_name,
          sync_frequency,
          is_active,
          metadata
        )
        VALUES (
          ${companyId},
          'xero',
          ${tokens.accessToken},
          ${tokens.refreshToken},
          ${tokenExpiresAt.toISOString()},
          ${tokens.tenantId},
          ${orgInfo.name},
          'daily',
          true,
          ${{ oauth_token_type: tokens.tokenType, tenant_id: tokens.tenantId }}
        )
        ON CONFLICT (company_id, platform)
        DO UPDATE SET
          access_token_encrypted = ${tokens.accessToken},
          refresh_token_encrypted = ${tokens.refreshToken},
          token_expires_at = ${tokenExpiresAt.toISOString()},
          realm_id = ${tokens.tenantId},
          organization_name = ${orgInfo.name},
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      ` as any[]

      if (!result.length) {
        throw this.createError('AUTH_FAILED', 500, false, 'Failed to store OAuth tokens')
      }

      return result[0]
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error
      }
      throw this.createError('AUTH_FAILED', 500, false, error as Error)
    }
  }

  /**
   * Start a financial data sync
   */
  async startSync(
    integrationId: string,
    syncType: 'full' | 'incremental' | 'balance_sheet_only' | 'invoices_only' = 'incremental'
  ): Promise<AccountingSync> {
    try {
      const integrations = await sql`
        SELECT * FROM accounting_integrations WHERE id = ${integrationId}
      ` as any[]

      if (!integrations.length) {
        throw this.createError('ACCOUNT_NOT_FOUND', 404, false, 'Integration not found')
      }

      // Check for in-progress syncs
      const inProgressSyncs = await sql`
        SELECT * FROM accounting_syncs
        WHERE integration_id = ${integrationId}
        AND status = 'in_progress'
      ` as any[]

      if (inProgressSyncs.length) {
        throw this.createError('SYNC_IN_PROGRESS', 409, false, 'Sync already in progress')
      }

      const syncRecords = await sql`
        INSERT INTO accounting_syncs (
          integration_id,
          status,
          sync_type,
          data_period_start,
          data_period_end,
          records_synced
        )
        VALUES (
          ${integrationId},
          'in_progress',
          ${syncType},
          CURRENT_DATE - INTERVAL '90 days',
          CURRENT_DATE,
          0
        )
        RETURNING *
      ` as any[]

      if (!syncRecords.length) {
        throw this.createError('SYNC_FAILED', 500, false, 'Failed to create sync record')
      }

      return syncRecords[0]
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error
      }
      throw this.createError('SYNC_FAILED', 500, true, error as Error)
    }
  }

  /**
   * Fetch financial data from Xero
   */
  async fetchFinancialData(
    integrationId: string,
    accessToken: string,
    tenantId: string,
    syncType: 'full' | 'incremental' | 'balance_sheet_only' | 'invoices_only'
  ): Promise<RawAccountingData> {
    try {
      const data: RawAccountingData = {
        accounts: [],
        invoices: [],
        bills: [],
        transactions: [],
      }

      // Fetch based on sync type
      if (syncType === 'full' || syncType === 'balance_sheet_only') {
        data.accounts = await this.fetchAccounts(accessToken, tenantId)
        data.balanceSheet = await this.fetchBalanceSheet(accessToken, tenantId)
        data.profitAndLoss = await this.fetchProfitAndLoss(accessToken, tenantId)
        data.bankAccounts = await this.fetchBankAccounts(accessToken, tenantId)
      }

      if (syncType === 'full' || syncType === 'invoices_only') {
        data.invoices = await this.fetchInvoices(accessToken, tenantId)
        data.bills = await this.fetchBills(accessToken, tenantId)
      }

      if (syncType === 'full' || syncType === 'incremental') {
        data.transactions = await this.fetchJournalEntries(accessToken, tenantId)
      }

      return data
    } catch (error) {
      throw this.createError('SYNC_FAILED', 500, true, error as Error)
    }
  }

  /**
   * Map financial data to PACE™ inputs
   */
  mapToPACEInputs(data: RawAccountingData): PACEFinancialMapping {
    const balanceSheet = data.balanceSheet
    const pl = data.profitAndLoss

    // Calculate revenue and profitability
    const revenue = pl?.revenue || 0
    const costOfRevenue = pl?.costOfRevenue || 0
    const operatingExpenses = pl?.operatingExpenses || 0
    const netIncome = pl?.netIncome || 0

    // Calculate financial health score (0-100)
    const profitMargin = revenue > 0 ? netIncome / revenue : 0
    const profitabilityScore = Math.min(100, Math.max(0, (profitMargin + 0.2) * 250)) // Normalize to 0-100

    // Financial health based on ratios
    const assets = balanceSheet?.assets || 0
    const liabilities = balanceSheet?.liabilities || 0
    const equity = balanceSheet?.equity || assets - liabilities

    const debtToEquity = equity > 0 ? liabilities / equity : 0
    const currentRatio = assets > 0 ? assets / liabilities : 0

    // Health score: debt ratio + liquidity
    const healthScore = Math.min(100, Math.max(0, (1 - Math.min(debtToEquity, 1)) * 60 + currentRatio * 40))

    // Estimate market size from revenue (SaaS multiple: 3-5x)
    const marketSizeEstimate = revenue * 4

    // Calculate cash runway if we have bank account data
    const cashBalance = data.bankAccounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0
    let runway_months: number | undefined

    if (operatingExpenses > 0 && cashBalance > 0) {
      const monthlyExpenses = operatingExpenses / 12
      runway_months = monthlyExpenses > 0 ? cashBalance / monthlyExpenses : undefined
    }

    return {
      revenue,
      costOfRevenue,
      operatingExpenses,
      netIncome,
      totalAssets: assets,
      totalLiabilities: liabilities,
      equity,
      cashBalance,
      runway_months,
      profitabilityScore,
      marketSizeEstimate,
      financialHealthScore: healthScore,
      currency: balanceSheet?.currency || 'USD',
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(syncId: string): Promise<AccountingSync | null> {
    try {
      const results = await sql`
        SELECT * FROM accounting_syncs WHERE id = ${syncId}
      ` as any[]

      return results.length ? results[0] : null
    } catch (error) {
      console.error('Failed to get sync status:', error)
      return null
    }
  }

  /**
   * Disconnect integration
   */
  async disconnect(integrationId: string): Promise<void> {
    try {
      await sql`
        UPDATE accounting_integrations
        SET
          is_active = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${integrationId}
      `
    } catch (error) {
      throw this.createError('SYNC_FAILED', 500, false, error as Error)
    }
  }

  // ============================================================
  // Private Methods - Xero API Calls
  // ============================================================

  private async getTenantId(accessToken: string): Promise<string> {
    const response = await fetch('https://api.xero.com/connections', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch tenant ID')
    }

    const connections = await response.json()
    if (!connections.length) {
      throw new Error('No Xero connections found')
    }

    return connections[0].tenantId
  }

  private async fetchOrganisationInfo(
    accessToken: string,
    tenantId: string
  ): Promise<{ name: string }> {
    const response = await fetch(`${XERO_API_BASE_URL}/Organisations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch organization info')
    }

    const data = await response.json()
    const org = data.Organisations?.[0]

    return { name: org?.Name || 'Xero Organization' }
  }

  private async fetchAccounts(
    accessToken: string,
    tenantId: string
  ): Promise<AccountingAccount[]> {
    const response = await fetch(`${XERO_API_BASE_URL}/Accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch accounts')
    }

    const data = await response.json()

    return (data.Accounts || []).map((acc: any) => ({
      id: acc.AccountID,
      name: acc.Name,
      accountType: (acc.Type || 'asset').toLowerCase(),
      balance: parseFloat(acc.UpdatedUTCDate) ? 0 : parseFloat(acc.Balance || 0),
      currency: acc.CurrencyCode || 'USD',
      status: acc.Status === 'ACTIVE' ? 'active' : 'inactive',
      metadata: { xeroType: acc.Type, taxType: acc.TaxType },
    }))
  }

  private async fetchInvoices(
    accessToken: string,
    tenantId: string
  ): Promise<AccountingInvoice[]> {
    const response = await fetch(`${XERO_API_BASE_URL}/Invoices`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch invoices')
    }

    const data = await response.json()

    return (data.Invoices || []).map((inv: any) => ({
      id: inv.InvoiceID,
      invoiceNumber: inv.InvoiceNumber,
      vendorId: inv.ContactID,
      vendorName: inv.Contact?.Name || 'Unknown',
      issueDate: inv.DateString,
      dueDate: inv.DueDateString || inv.DateString,
      amount: parseFloat(inv.Total || 0),
      currency: inv.CurrencyCode || 'USD',
      status: inv.Status?.toLowerCase() || 'draft',
      metadata: { xeroId: inv.InvoiceID },
    }))
  }

  private async fetchBills(
    accessToken: string,
    tenantId: string
  ): Promise<AccountingBill[]> {
    // Xero uses Invoices for bills, but with Type = 'ACCRECPAY'
    const response = await fetch(
      `${XERO_API_BASE_URL}/Invoices?where=Type=="ACCRECPAY"`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Xero-tenant-id': tenantId,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch bills')
    }

    const data = await response.json()

    return (data.Invoices || []).map((bill: any) => ({
      id: bill.InvoiceID,
      billNumber: bill.InvoiceNumber,
      vendorId: bill.ContactID,
      vendorName: bill.Contact?.Name || 'Unknown',
      issueDate: bill.DateString,
      dueDate: bill.DueDateString || bill.DateString,
      amount: parseFloat(bill.Total || 0),
      currency: bill.CurrencyCode || 'USD',
      status: bill.Status?.toLowerCase() || 'draft',
      metadata: { xeroId: bill.InvoiceID },
    }))
  }

  private async fetchJournalEntries(
    accessToken: string,
    tenantId: string
  ): Promise<AccountingTransaction[]> {
    const response = await fetch(`${XERO_API_BASE_URL}/JournalEntries`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-tenant-id': tenantId,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch journal entries')
    }

    const data = await response.json()

    return (data.JournalEntries || []).flatMap((entry: any) =>
      (entry.JournalLines || []).map((line: any) => ({
        id: `${entry.JournalEntryID}-${line.LineItemID}`,
        date: entry.JournalDate,
        description: entry.Reference || 'Journal Entry',
        amount: parseFloat(line.LineAmount || 0),
        currency: entry.Currency?.Code || 'USD',
        accountId: line.AccountID,
        accountName: line.AccountCode || 'Unknown',
        type: 'journal',
        referenceId: entry.JournalEntryID,
        metadata: { xeroId: entry.JournalEntryID },
      }))
    )
  }

  private async fetchBalanceSheet(
    accessToken: string,
    tenantId: string
  ): Promise<BalanceSheetData> {
    const accounts = await this.fetchAccounts(accessToken, tenantId)

    let assets = 0
    let liabilities = 0
    let equity = 0

    accounts.forEach((acc) => {
      const balance = acc.balance
      const type = acc.accountType.toUpperCase()

      if (type.includes('ASSET')) assets += balance
      else if (type.includes('LIABILITY')) liabilities += balance
      else if (type.includes('EQUITY')) equity += balance
    })

    return {
      date: new Date().toISOString().split('T')[0],
      assets,
      liabilities,
      equity,
      currency: 'USD',
      accounts,
    }
  }

  private async fetchProfitAndLoss(
    accessToken: string,
    tenantId: string
  ): Promise<ProfitAndLossData> {
    const accounts = await this.fetchAccounts(accessToken, tenantId)

    let revenue = 0
    let costOfRevenue = 0
    let operatingExpenses = 0
    let netIncome = 0

    accounts.forEach((acc) => {
      const balance = acc.balance
      const type = acc.accountType.toUpperCase()

      if (type.includes('REVENUE')) revenue -= balance
      else if (type.includes('COGS') || type.includes('COST')) costOfRevenue += balance
      else if (type.includes('EXPENSE') && !type.includes('OTHER')) operatingExpenses += balance
    })

    const grossProfit = revenue - costOfRevenue
    const operatingIncome = grossProfit - operatingExpenses
    netIncome = operatingIncome

    const today = new Date()
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)

    return {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: today.toISOString().split('T')[0],
      revenue: Math.abs(revenue),
      costOfRevenue,
      grossProfit,
      operatingExpenses,
      operatingIncome,
      netIncome,
      currency: 'USD',
    }
  }

  private async fetchBankAccounts(
    accessToken: string,
    tenantId: string
  ): Promise<any[]> {
    const accounts = await this.fetchAccounts(accessToken, tenantId)

    return accounts
      .filter((acc) => acc.accountType.toUpperCase().includes('BANK'))
      .map((acc) => ({
        id: acc.id,
        name: acc.name,
        accountNumber: '',
        balance: acc.balance,
        currency: acc.currency,
        asOfDate: new Date().toISOString().split('T')[0],
      }))
  }

  private createError(
    code: ErrorCode,
    statusCode?: number,
    retryable: boolean = false,
    originalError?: Error | string
  ): AccountingError {
    const message =
      typeof originalError === 'string'
        ? originalError
        : originalError instanceof Error
          ? originalError.message
          : 'Unknown error'

    const error = new Error(`Xero error: ${code}. ${message}`) as AccountingError

    error.code = code
    error.statusCode = statusCode
    error.retryable = retryable
    error.timestamp = new Date()

    return error
  }
}
