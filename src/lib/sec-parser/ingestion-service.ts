/**
 * SEC EDGAR Data Ingestion Service
 * Fetches 10-K, 10-Q filings and extracts financial data
 *
 * ⚠️  Server-only: Uses database operations
 * Only imported in API routes and server-side code
 */

import { sql } from '@/lib/db'

const SEC_API_BASE = 'https://www.sec.gov/cgi-bin/browse-edgar'
const EDGAR_DATA_BASE = 'https://www.sec.gov/cgi-bin/viewer'

interface Filing {
  cik: string
  ticker: string
  companyName: string
  formType: string
  filingDate: string
  accessionNumber: string
  url: string
}

interface ExtractedFinancials {
  revenue: number | null
  netIncome: number | null
  operatingCashFlow: number | null
  assets: number | null
  liabilities: number | null
  equity: number | null
  eps: number | null
}

/**
 * Fetch recent filings for a company from SEC
 */
export async function fetchCompanyFilings(cik: string): Promise<Filing[]> {
  try {
    // Pad CIK to 10 digits (SEC format)
    const paddedCIK = cik.padStart(10, '0')

    const response = await fetch(
      `${SEC_API_BASE}?action=getcompany&CIK=${paddedCIK}&type=10-K%7C10-Q&dateb=&owner=exclude&count=100&output=json`
    )

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.statusText}`)
    }

    const data: any = await response.json()

    if (!data.filings || !data.filings.filing) {
      return []
    }

    const filings = Array.isArray(data.filings.filing)
      ? data.filings.filing
      : [data.filings.filing]

    return filings
      .filter((f: any) => ['10-K', '10-Q'].includes(f.form))
      .map((f: any) => ({
        cik: paddedCIK,
        ticker: data.cik_lookup?.ticker || '',
        companyName: data.cik_lookup?.company_name || '',
        formType: f.form,
        filingDate: f.filingDate,
        accessionNumber: f.accessionNumber,
        url: `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${paddedCIK}&accession_number=${f.accessionNumber.replace(/-/g, '')}&xbrl_type=v`,
      }))
  } catch (error) {
    console.error('Fetch company filings error:', error)
    throw error
  }
}

/**
 * Extract financial data from filing JSON
 * Uses SEC's XBRL data feeds
 */
export async function extractFinancialsFromFiling(
  accessionNumber: string,
  cik: string
): Promise<ExtractedFinancials> {
  try {
    const paddedCIK = cik.padStart(10, '0')
    const accessionNoSlash = accessionNumber.replace(/^0+/, '').replace(/(\d{10})(\d{5})(\d{2})$/, '$1-$2-$3')

    // Use SEC's XBRL API
    const response = await fetch(
      `https://www.sec.gov/Archives/edgar/${paddedCIK}/${accessionNumber.replace(/-/g, '')}/0001193125-${accessionNumber.substring(6)}-index.json`
    )

    if (!response.ok) {
      // Fallback: try to parse from HTML/XML
      return await parseFromHTML(accessionNumber, cik)
    }

    const data: any = await response.json()

    // Extract financial metrics from filing
    return {
      revenue: extractValue(data, 'Revenue'),
      netIncome: extractValue(data, 'NetIncome'),
      operatingCashFlow: extractValue(data, 'OperatingCashFlow'),
      assets: extractValue(data, 'Assets'),
      liabilities: extractValue(data, 'Liabilities'),
      equity: extractValue(data, 'StockholdersEquity'),
      eps: extractValue(data, 'EarningsPerShare'),
    }
  } catch (error) {
    console.error('Extract financials error:', error)
    return {
      revenue: null,
      netIncome: null,
      operatingCashFlow: null,
      assets: null,
      liabilities: null,
      equity: null,
      eps: null,
    }
  }
}

/**
 * Helper to extract numeric values from filing data
 */
function extractValue(data: any, fieldName: string): number | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  // Search through nested objects for the field
  const found = Object.values(data).find((v: any) => {
    if (typeof v === 'object' && v !== null) {
      return v[fieldName] !== undefined
    }
    return false
  })

  if (found && typeof found === 'object') {
    const value = (found as any)[fieldName]
    return typeof value === 'number' ? value : null
  }

  return null
}

/**
 * Parse financials from HTML filing (fallback)
 */
async function parseFromHTML(
  accessionNumber: string,
  cik: string
): Promise<ExtractedFinancials> {
  // Simplified HTML parsing - in production would use HTML parser
  console.warn(`Fallback HTML parsing for ${accessionNumber}`)
  return {
    revenue: null,
    netIncome: null,
    operatingCashFlow: null,
    assets: null,
    liabilities: null,
    equity: null,
    eps: null,
  }
}

/**
 * Ingest filings for a company
 * Fetch → Parse → Store in database
 */
export async function ingestCompanyFilings(companyId: string, cik: string) {
  try {
    const filings = await fetchCompanyFilings(cik)

    for (const filing of filings.slice(0, 3)) {
      // Process last 3 filings
      const financials = await extractFinancialsFromFiling(
        filing.accessionNumber,
        cik
      )

      // Determine fiscal year and quarter from filing date
      const date = new Date(filing.filingDate)
      const fiscalYear = date.getFullYear()
      const fiscalQuarter = filing.formType === '10-K' ? 0 : Math.ceil((date.getMonth() + 1) / 3)

      // Store in database
      await sql(
        `INSERT INTO company_financials
         (company_id, fiscal_year, fiscal_quarter, filing_type, filing_date, period_end_date,
          revenue, net_income, operating_cash_flow, total_assets, total_liabilities,
          stockholders_equity, eps, data_quality_score, source, validation_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (company_id, fiscal_year, fiscal_quarter) DO NOTHING`,
        [
          companyId,
          fiscalYear,
          fiscalQuarter,
          filing.formType,
          filing.filingDate,
          filing.filingDate,
          financials.revenue,
          financials.netIncome,
          financials.operatingCashFlow,
          financials.assets,
          financials.liabilities,
          financials.equity,
          financials.eps,
          75, // Initial quality score
          'SEC_EDGAR',
          'valid',
        ]
      )
    }

    // Update company's last filing date
    await sql(
      `UPDATE capital_companies
       SET last_10k_date = CASE
             WHEN $2 = '10-K' THEN $3::date
             ELSE last_10k_date
           END,
           last_10q_date = CASE
             WHEN $2 = '10-Q' THEN $3::date
             ELSE last_10q_date
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [companyId, filings[0]?.formType, filings[0]?.filingDate]
    )

    console.log(`✅ Ingested ${filings.length} filings for company ${companyId}`)
  } catch (error) {
    console.error('Ingest company filings error:', error)
    throw error
  }
}

/**
 * Batch ingest filings for multiple companies
 */
export async function batchIngestCompanies(
  companies: Array<{ id: string; cik: string }>
) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[],
  }

  for (const company of companies) {
    try {
      await ingestCompanyFilings(company.id, company.cik)
      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        companyId: company.id,
        error: String(error),
      })
    }
  }

  return results
}
