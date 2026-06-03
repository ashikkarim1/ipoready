import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(connectionString)

// Test company and user IDs
const COMPANY_ID = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
const USER_EMAIL = 'test@ipoready.com'

async function seedPhase2Data() {
  try {
    console.log('\n🌱 Starting Phase 2 Seed for test@ipoready.com...\n')

    // Get user ID
    const users = await sql`
      SELECT id FROM users WHERE email = ${USER_EMAIL} LIMIT 1
    `
    if (!users || users.length === 0) {
      throw new Error(`User ${USER_EMAIL} not found`)
    }
    const userId = users[0].id

    // ====================================================================
    // PART 1: COST_ITEMS (50M+ IPO costs by category)
    // ====================================================================
    console.log('📝 Seeding cost_items...')

    const costItems = [
      // Legal costs ($5.2M)
      {
        category: 'legal',
        type: 'capex',
        nature: 'external_vendor',
        description: 'External counsel - S1 preparation and SEC review',
        vendor: 'Simpson Thacher & Bartlett LLP',
        amount: 1200000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'estimated',
      },
      {
        category: 'legal',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Corporate counsel - Articles, bylaws, board resolutions',
        vendor: 'Fenwick & West',
        amount: 800000,
        phase: 2,
        phase_name: 'Corporate Restructuring',
        status: 'estimated',
      },
      {
        category: 'legal',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Transfer agent and registrar legal review',
        vendor: 'Computershare Legal',
        amount: 250000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'committed',
      },
      {
        category: 'legal',
        type: 'opex',
        nature: 'external_vendor',
        description: 'IP counsel - Patent portfolio review for S1',
        vendor: 'Cooley LLP',
        amount: 350000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'estimated',
      },
      {
        category: 'legal',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Environmental and regulatory compliance review',
        vendor: 'Latham & Watkins',
        amount: 400000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'estimated',
      },
      {
        category: 'legal',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Related party transaction review and approval',
        vendor: 'Sullivan & Cromwell',
        amount: 200000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'estimated',
      },

      // Audit and Accounting costs ($4.8M)
      {
        category: 'audit',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Big Four audit firm - Two years audited financials',
        vendor: 'Deloitte & Touche LLP',
        amount: 1800000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'committed',
      },
      {
        category: 'audit',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Internal controls assessment and SOX 404 readiness',
        vendor: 'EY (Ernst & Young)',
        amount: 1200000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'estimated',
      },
      {
        category: 'accounting',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Accounting restatement and GAAP conversion',
        vendor: 'KPMG',
        amount: 600000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'estimated',
      },
      {
        category: 'accounting',
        type: 'opex',
        nature: 'external_vendor',
        description: 'Accounting consulting - Revenue recognition analysis',
        vendor: 'PwC Advisory',
        amount: 200000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'estimated',
      },

      // Investment Banking costs ($8.5M)
      {
        category: 'ib',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Investment bank underwriting - Gross spread (2.5% of offering)',
        vendor: 'Goldman Sachs',
        amount: 5000000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'ib',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Co-underwriter syndicate - Secondary underwriting',
        vendor: 'Morgan Stanley & JPMorgan Chase',
        amount: 2500000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'ib',
        type: 'opex',
        nature: 'external_vendor',
        description: 'Financial advisor - Valuation and transaction support',
        vendor: 'Lazard Freres',
        amount: 750000,
        phase: 5,
        phase_name: 'Regulatory Filing',
        status: 'estimated',
      },
      {
        category: 'ib',
        type: 'capex',
        nature: 'external_vendor',
        description: 'Syndicate documentation and underwriting agreement prep',
        vendor: 'Paul, Hastings, Janofsky & Walker',
        amount: 250000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },

      // Consulting and Advisory ($3.2M)
      {
        category: 'consulting',
        type: 'opex',
        nature: 'external_vendor',
        description: 'IPO readiness consulting and PACE optimization',
        vendor: 'Boston Consulting Group',
        amount: 800000,
        phase: 2,
        phase_name: 'Corporate Restructuring',
        status: 'committed',
      },
      {
        category: 'consulting',
        type: 'opex',
        nature: 'external_vendor',
        description: 'Corporate governance and board composition advisory',
        vendor: 'Spencer Stuart (Executive Search)',
        amount: 450000,
        phase: 2,
        phase_name: 'Corporate Restructuring',
        status: 'estimated',
      },
      {
        category: 'consulting',
        type: 'opex',
        nature: 'external_vendor',
        description: 'CFO and key executive recruiting',
        vendor: 'Korn Ferry',
        amount: 350000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'committed',
      },
      {
        category: 'consulting',
        type: 'opex',
        nature: 'external_vendor',
        description: 'Investor relations and roadshow preparation',
        vendor: 'ICR Westwicke',
        amount: 400000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'consulting',
        type: 'opex',
        nature: 'external_vendor',
        description: 'Tax planning and efficiency optimization',
        vendor: 'Alvarez & Marsal Tax Services',
        amount: 200000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'estimated',
      },

      // Printing and Delivery costs ($1.8M)
      {
        category: 'printing',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'Prospectus printing (100,000 copies)',
        vendor: 'RR Donnelley',
        amount: 400000,
        phase: 7,
        phase_name: 'Listing Application',
        status: 'estimated',
      },
      {
        category: 'printing',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'Road show materials and investor presentations',
        vendor: 'Printing.com Global',
        amount: 300000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'printing',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'Stock certificates and transfer agent setup',
        vendor: 'American Stock Transfer',
        amount: 150000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'estimated',
      },
      {
        category: 'printing',
        type: 'opex',
        nature: 'direct_cost',
        description: 'Mailing, distribution, and fulfillment services',
        vendor: 'Pitney Bowes',
        amount: 250000,
        phase: 7,
        phase_name: 'Listing Application',
        status: 'estimated',
      },
      {
        category: 'printing',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'Digital prospectus platform and SEC EDGAR filing',
        vendor: 'Donnelley Financial Solutions',
        amount: 100000,
        phase: 5,
        phase_name: 'Regulatory Filing',
        status: 'estimated',
      },
      {
        category: 'printing',
        type: 'opex',
        nature: 'direct_cost',
        description: 'Translation services (French/English)',
        vendor: 'SDL Language Services',
        amount: 100000,
        phase: 5,
        phase_name: 'Regulatory Filing',
        status: 'estimated',
      },
      {
        category: 'printing',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'Shareholder meeting and proxy statement printing',
        vendor: 'Broadridge Financial Solutions',
        amount: 200000,
        phase: 5,
        phase_name: 'Regulatory Filing',
        status: 'estimated',
      },

      // Roadshow and Marketing ($2.1M)
      {
        category: 'roadshow',
        type: 'opex',
        nature: 'direct_cost',
        description: 'Management roadshow (15 cities, 30 days)',
        vendor: 'Gilt Edge Events',
        amount: 1200000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'roadshow',
        type: 'opex',
        nature: 'direct_cost',
        description: 'Travel, accommodation, and logistics',
        vendor: 'American Express Travel',
        amount: 400000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'roadshow',
        type: 'opex',
        nature: 'external_vendor',
        description: 'Analyst and media relations PR campaign',
        vendor: 'FGS Global',
        amount: 250000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'roadshow',
        type: 'opex',
        nature: 'direct_cost',
        description: 'Virtual roadshow platform and streaming',
        vendor: 'Virtual One Events Platform',
        amount: 250000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },

      // Listing Fees ($3.2M)
      {
        category: 'listing_fees',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'NASDAQ listing fee',
        vendor: 'NASDAQ OMX',
        amount: 1500000,
        phase: 7,
        phase_name: 'Listing Application',
        status: 'estimated',
      },
      {
        category: 'listing_fees',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'SEC S-1 filing fee',
        vendor: 'Securities and Exchange Commission',
        amount: 500000,
        phase: 5,
        phase_name: 'Regulatory Filing',
        status: 'estimated',
      },
      {
        category: 'listing_fees',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'FINRA Rule 2710 filing and review',
        vendor: 'FINRA',
        amount: 250000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },
      {
        category: 'listing_fees',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'State securities and blue sky coordination',
        vendor: 'Multi-State Filing Services',
        amount: 150000,
        phase: 7,
        phase_name: 'Listing Application',
        status: 'estimated',
      },
      {
        category: 'listing_fees',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'Audit committee financial expert retention',
        vendor: 'CFO Services LLC',
        amount: 200000,
        phase: 3,
        phase_name: 'Financial Audit',
        status: 'estimated',
      },
      {
        category: 'listing_fees',
        type: 'one_time_fee',
        nature: 'direct_cost',
        description: 'D&O insurance premium (IPO directors)',
        vendor: 'Chubb Executive Risk Services',
        amount: 600000,
        phase: 7,
        phase_name: 'Listing Application',
        status: 'estimated',
      },

      // Employee-Related Costs ($2.3M)
      {
        category: 'employee_related',
        type: 'capex',
        nature: 'internal_labor',
        description: 'Internal IPO project management (8 FTE, 18 months)',
        vendor_name: 'IPOReady Inc. (Internal)',
        labor_hours: 12000,
        hourly_rate: 150,
        amount: 1800000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'committed',
      },
      {
        category: 'employee_related',
        type: 'opex',
        nature: 'internal_labor',
        description: 'Employee training and IPO readiness workshops',
        vendor_name: 'HR Department (Internal)',
        labor_hours: 2000,
        hourly_rate: 75,
        amount: 150000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'estimated',
      },
      {
        category: 'employee_related',
        type: 'opex',
        nature: 'direct_cost',
        description: 'Employee retention bonuses (key personnel)',
        vendor_name: 'Payroll (Internal)',
        amount: 350000,
        phase: 6,
        phase_name: 'Marketing & Roadshow',
        status: 'estimated',
      },

      // Miscellaneous and Contingency ($1.5M)
      {
        category: 'other',
        type: 'capex',
        nature: 'estimated_contingency',
        description: 'Contingency fund (10% of total estimated costs)',
        vendor_name: 'Reserved',
        amount: 1000000,
        phase: 4,
        phase_name: 'Legal Documentation',
        status: 'estimated',
      },
      {
        category: 'other',
        type: 'opex',
        nature: 'direct_cost',
        description: 'Miscellaneous professional services and fees',
        vendor_name: 'Various',
        amount: 500000,
        phase: 5,
        phase_name: 'Regulatory Filing',
        status: 'estimated',
      },
    ]

    for (const item of costItems) {
      await sql`
        INSERT INTO cost_items (
          company_id, cost_category, cost_type, cost_nature,
          description, vendor_name, amount_usd, currency,
          labor_hours, hourly_rate_usd, phase_number, phase_name,
          status, approval_status, created_by_user_id, created_at
        ) VALUES (
          ${COMPANY_ID}, ${item.category}, ${item.type}, ${item.nature},
          ${item.description}, ${item.vendor || item.vendor_name}, ${item.amount}, 'USD',
          ${item.labor_hours || null}, ${item.hourly_rate || null},
          ${item.phase}, ${item.phase_name},
          ${item.status}, 'pending', ${userId}, NOW()
        )
      `
    }

    console.log(`✅ Created ${costItems.length} cost items (Total: $50.2M)`)

    // ====================================================================
    // PART 2: FINANCIAL_METRICS (24 months of monthly metrics)
    // ====================================================================
    console.log('📊 Seeding financial_metrics...')

    const startDate = new Date('2024-01-01')
    const metricsInserted = []

    for (let month = 0; month < 24; month++) {
      const metricDate = new Date(startDate)
      metricDate.setMonth(metricDate.getMonth() + month)

      const monthStr = metricDate.toISOString().split('T')[0]
      const monthProgress = Math.min(100, (month / 24) * 100)
      const totalCosts = 50200000
      const spentToDate = (totalCosts * monthProgress) / 100

      await sql`
        INSERT INTO financial_metrics (
          company_id, metric_date, metric_type,
          total_ipo_costs_usd, estimated_remaining_usd, estimated_total_ipo_cost_usd,
          legal_costs_usd, audit_costs_usd, accounting_costs_usd, ib_costs_usd,
          consulting_costs_usd, other_costs_usd,
          total_budget_usd, budget_remaining_usd, budget_variance_pct, budget_status,
          days_since_phase_1_start, estimated_days_to_listing, phase_completion_pct,
          cash_outflow_this_month_usd, monthly_burn_rate_usd,
          team_hours_invested, team_utilization_pct,
          created_at, updated_at
        ) VALUES (
          ${COMPANY_ID}, ${monthStr}::date, 'monthly_summary',
          ${Math.round(spentToDate)}, ${Math.round(totalCosts - spentToDate)}, ${totalCosts},
          ${Math.round((5200000 * monthProgress) / 100)},
          ${Math.round((4800000 * monthProgress) / 100)},
          ${Math.round((1200000 * monthProgress) / 100)},
          ${Math.round((8500000 * monthProgress) / 100)},
          ${Math.round((3200000 * monthProgress) / 100)},
          ${Math.round((26100000 * monthProgress) / 100)},
          ${totalCosts}, ${Math.round(totalCosts - spentToDate)}, ${Math.round((spentToDate / totalCosts - 1) * 100)}, 'on_track',
          ${month * 30}, ${Math.max(120 - month * 5, 30)}, ${Math.round(monthProgress)},
          ${Math.round(spentToDate / (month + 1))}, ${Math.round(spentToDate / (month + 1))},
          ${2000 + month * 100}, ${85 - month * 2},
          NOW(), NOW()
        )
      `
      metricsInserted.push(monthStr)
    }

    console.log(`✅ Created ${metricsInserted.length} monthly financial metrics`)

    // ====================================================================
    // PART 3: DILUTION_SCENARIOS (3 scenarios)
    // ====================================================================
    console.log('🔄 Seeding dilution_scenarios...')

    const scenarios = [
      {
        name: 'Series C @ $20/share (Conservative)',
        type: 'new_financing',
        description: 'Hypothetical Series C funding round at $20/share valuation',
        shares_issued: 10000000,
        price_per_share: 20.0,
        total_raise: 200000000,
        pre_shares: 100000000,
        pre_valuation: 2000000000,
        post_shares: 110000000,
        post_valuation: 2200000000,
        founder_dilution: -9.1,
        status: 'draft',
      },
      {
        name: 'Series C @ $25/share (Base Case)',
        type: 'new_financing',
        description: 'Planned Series C round at $25/share - most likely scenario',
        shares_issued: 12000000,
        price_per_share: 25.0,
        total_raise: 300000000,
        pre_shares: 100000000,
        pre_valuation: 2500000000,
        post_shares: 112000000,
        post_valuation: 2800000000,
        founder_dilution: -10.7,
        status: 'reviewed',
      },
      {
        name: 'Warrant Exercise @ $2/warrant (Best Case)',
        type: 'warrant_exercise',
        description: 'Series B warrant conversion and new financing',
        shares_issued: 5000000,
        price_per_share: 22.5,
        total_raise: 112500000,
        pre_shares: 100000000,
        pre_valuation: 2250000000,
        post_shares: 105000000,
        post_valuation: 2362500000,
        founder_dilution: -4.8,
        status: 'draft',
      },
    ]

    for (const scenario of scenarios) {
      await sql`
        INSERT INTO dilution_scenarios (
          company_id, scenario_name, scenario_type, description,
          new_shares_issued, issue_price_per_share_usd, total_raise_usd,
          pre_fully_diluted_shares, pre_post_money_valuation_usd,
          post_fully_diluted_shares, post_post_money_valuation_usd,
          founder_dilution_pct, employee_dilution_pct, series_a_holder_dilution_pct,
          status, created_at, updated_at
        ) VALUES (
          ${COMPANY_ID}, ${scenario.name}, ${scenario.type}, ${scenario.description},
          ${scenario.shares_issued}, ${scenario.price_per_share}, ${scenario.total_raise},
          ${scenario.pre_shares}, ${scenario.pre_valuation},
          ${scenario.post_shares}, ${scenario.post_valuation},
          ${scenario.founder_dilution}, ${scenario.founder_dilution * 0.5}, ${scenario.founder_dilution * 0.3},
          ${scenario.status}, NOW(), NOW()
        )
      `
    }

    // Add shareholder rows for base case scenario
    const shareholders = [
      { name: 'Founder Pool (3 founders)', type: 'founder', class: 'Common', pre: 42000000, post: 37400000 },
      { name: 'Employee Stock Option Pool', type: 'employee_pool', class: 'Common', pre: 12000000, post: 10700000 },
      { name: 'Series A Investor (Lead)', type: 'investor', class: 'Series A', pre: 25000000, post: 22300000 },
      { name: 'Series B Investors', type: 'investor', class: 'Series B', pre: 21000000, post: 18800000 },
      { name: 'Series C (New)', type: 'investor', class: 'Series C', pre: 0, post: 12000000 },
    ]

    // Get the base case scenario ID
    const scenarioResult = await sql`
      SELECT id FROM dilution_scenarios 
      WHERE company_id = ${COMPANY_ID} AND scenario_name = 'Series C @ $25/share (Base Case)' LIMIT 1
    `
    if (scenarioResult && scenarioResult.length > 0) {
      for (const sh of shareholders) {
        await sql`
          INSERT INTO dilution_scenario_shareholders (
            scenario_id, shareholder_name, shareholder_type, share_class,
            shares_pre, ownership_pct_pre,
            shares_post, ownership_pct_post,
            dilution_pct, created_at
          ) VALUES (
            ${scenarioResult[0].id}, ${sh.name}, ${sh.type}, ${sh.class},
            ${sh.pre}, ${sh.pre / 100000000 * 100},
            ${sh.post}, ${sh.post / 112000000 * 100},
            ${((sh.post / 112000000 - sh.pre / 100000000) / (sh.pre / 100000000)) * 100},
            NOW()
          )
        `
      }
    }

    console.log(`✅ Created 3 dilution scenarios with shareholder details`)

    // ====================================================================
    // PART 4: CONSENT_REQUESTS (8-10 consent items)
    // ====================================================================
    console.log('✍️ Seeding consent_requests...')

    const consentRequests = [
      {
        type: 'director_consent',
        subject: 'IPO Participation and Share Lock-up Agreement',
        description: 'Director acknowledgment of IPO participation and 180-day lock-up',
        recipient: 'Jane Smith',
        email: 'jane.smith@example.com',
        status: 'signed',
        deadline: '2025-03-15',
        signed_date: '2025-02-20',
      },
      {
        type: 'director_consent',
        subject: 'Related Party Transaction Disclosure',
        description: 'Disclosure of conflicts of interest and related party transactions',
        recipient: 'Michael Wong',
        email: 'michael.wong@example.com',
        status: 'approved',
        deadline: '2025-03-15',
        signed_date: '2025-03-01',
      },
      {
        type: 'shareholder_consent',
        subject: 'Share Split Authorization',
        description: 'Shareholder consent for 5:1 stock split pre-IPO',
        recipient: 'Series A Investors',
        email: 'investors@series-a.com',
        status: 'signed',
        deadline: '2025-03-20',
        signed_date: '2025-03-10',
      },
      {
        type: 'founder_lock_up',
        subject: 'Founder Lock-up Agreement (180 days)',
        description: 'Binding agreement to hold shares for 180 days post-listing',
        recipient: 'Alex Johnson (Founder/CEO)',
        email: 'alex.johnson@ipoready.com',
        status: 'pending',
        deadline: '2025-04-01',
        signed_date: null,
      },
      {
        type: 'founder_lock_up',
        subject: 'Founder Lock-up Agreement (180 days)',
        description: 'Binding agreement to hold shares for 180 days post-listing',
        recipient: 'Emily Chen (Founder/CTO)',
        email: 'emily.chen@ipoready.com',
        status: 'signed',
        deadline: '2025-04-01',
        signed_date: '2025-03-05',
      },
      {
        type: 'lender_consent',
        subject: 'Debt Prepayment and Lender Consent',
        description: 'Bank consent for IPO proceeds allocation and debt repayment',
        recipient: 'JP Morgan Chase (Lead Lender)',
        email: 'corporate-lending@jpmorgan.com',
        status: 'pending',
        deadline: '2025-04-15',
        signed_date: null,
      },
      {
        type: 'officer_consent',
        subject: 'Officer Certification and 10b5-1 Trading Plan',
        description: 'Officer acknowledgment of insider trading restrictions',
        recipient: 'Robert Martinez (CFO)',
        email: 'robert.martinez@ipoready.com',
        status: 'approved',
        deadline: '2025-03-25',
        signed_date: '2025-03-15',
      },
      {
        type: 'vendor_consent',
        subject: 'Key Vendor Acknowledgment of Ownership',
        description: 'Major customer consent letter affirming business continuity',
        recipient: 'Acme Corp (Key Customer)',
        email: 'contracts@acmecorp.com',
        status: 'viewed',
        deadline: '2025-04-10',
        signed_date: null,
      },
      {
        type: 'shareholder_consent',
        subject: 'Convertible Note Conversion Authorization',
        description: 'Shareholder approval for automatic conversion of convertible debt',
        recipient: 'Series B Investors',
        email: 'investors@series-b.fund',
        status: 'pending',
        deadline: '2025-04-20',
        signed_date: null,
      },
      {
        type: 'director_consent',
        subject: 'Audit Committee Financial Expert Waiver',
        description: 'Director confirmation of audit committee financial expertise',
        recipient: 'Patricia Lee',
        email: 'patricia.lee@advisoryboard.com',
        status: 'rejected',
        deadline: '2025-03-10',
        signed_date: '2025-03-09',
        rejection_reason: 'Audit committee role conflicts with other directorates',
      },
    ]

    for (const consent of consentRequests) {
      await sql`
        INSERT INTO consent_requests (
          company_id, request_type, subject_matter, description,
          recipient_name, recipient_email, recipient_type,
          status, sent_date, signed_date, signed_by_name, signature_method,
          deadline_date, rejection_reason, can_resubmit,
          created_by_user_id, created_at, updated_at
        ) VALUES (
          ${COMPANY_ID}, ${consent.type}, ${consent.subject}, ${consent.description},
          ${consent.recipient}, ${consent.email}, 'individual',
          ${consent.status}, CURRENT_TIMESTAMP, ${consent.signed_date ? `${consent.signed_date}::timestamp` : null},
          ${consent.signed_date ? consent.recipient : null}, 'esign',
          ${consent.deadline}::date, ${consent.rejection_reason || null}, true,
          ${userId}, NOW(), NOW()
        )
      `
    }

    console.log(`✅ Created ${consentRequests.length} consent requests`)

    // ====================================================================
    // PART 5: CORPORATE_RESOLUTIONS (10+ resolutions)
    // ====================================================================
    console.log('⚖️ Seeding corporate_resolutions...')

    const resolutions = [
      {
        type: 'board_authorization',
        title: 'Board Authorization to Pursue IPO',
        desc: 'Authorization for management to pursue IPO on appropriate terms',
        board_required: true,
        shareholder_required: false,
        status: 'approved',
        approved_date: '2025-01-15',
      },
      {
        type: 'share_split',
        title: 'Authorization of 5:1 Stock Split',
        desc: 'Board approval for stock split to adjust share price ahead of IPO',
        board_required: true,
        shareholder_required: true,
        status: 'approved',
        approved_date: '2025-02-01',
      },
      {
        type: 'stock_option_plan',
        title: 'Equity Incentive Plan Expansion (10M shares)',
        desc: 'Authorization to expand stock option pool by 10 million shares',
        board_required: true,
        shareholder_required: true,
        status: 'pending_approval',
      },
      {
        type: 'director_appointment',
        title: 'Appointment of Independent Directors',
        desc: 'Election of 2 independent directors for audit and compensation committees',
        board_required: true,
        shareholder_required: false,
        status: 'approved',
        approved_date: '2025-02-10',
      },
      {
        type: 'director_appointment',
        title: 'Appointment of Lead Independent Director',
        desc: 'Appointment of independent director as lead independent director',
        board_required: true,
        shareholder_required: false,
        status: 'approved',
        approved_date: '2025-02-10',
      },
      {
        type: 'dividend_policy',
        title: 'Adoption of Dividend Policy',
        desc: 'Board adoption of dividend policy in advance of IPO',
        board_required: true,
        shareholder_required: false,
        status: 'approved',
        approved_date: '2025-01-20',
      },
      {
        type: 'related_party',
        title: 'Related Party Transaction Approval',
        desc: 'Board approval of related party transaction with founder',
        board_required: true,
        shareholder_required: false,
        status: 'approved',
        approved_date: '2025-03-01',
      },
      {
        type: 'board_authorization',
        title: 'Authorization of Underwriting Syndicate',
        desc: 'Board authorization to enter into underwriting agreements',
        board_required: true,
        shareholder_required: false,
        status: 'pending_approval',
      },
      {
        type: 'shareholder_approval',
        title: 'Shareholder Approval of IPO Terms',
        desc: 'Shareholder approval of IPO structure, syndicate terms, and pricing',
        board_required: false,
        shareholder_required: true,
        status: 'pending_approval',
      },
      {
        type: 'share_split',
        title: 'Reverse Stock Split (if needed)',
        desc: 'Authorization for potential reverse stock split to meet listing standards',
        board_required: true,
        shareholder_required: true,
        status: 'draft',
      },
      {
        type: 'other',
        title: 'Adoption of Code of Conduct',
        desc: 'Board adoption of ethics and business conduct policy',
        board_required: true,
        shareholder_required: false,
        status: 'approved',
        approved_date: '2024-12-15',
      },
      {
        type: 'other',
        title: 'Adoption of Related Party Transaction Policy',
        desc: 'Board adoption of related party transaction review and approval process',
        board_required: true,
        shareholder_required: false,
        status: 'approved',
        approved_date: '2024-12-20',
      },
    ]

    for (const res of resolutions) {
      await sql`
        INSERT INTO corporate_resolutions (
          company_id, resolution_type, title, description,
          board_approval_required, shareholder_approval_required,
          approval_status, board_approved_at, board_vote_in_favor, board_vote_count,
          status, prepared_by_user_id, created_at, updated_at
        ) VALUES (
          ${COMPANY_ID}, ${res.type}, ${res.title}, ${res.desc},
          ${res.board_required}, ${res.shareholder_required},
          ${res.status === 'approved' ? 'approved' : 'pending'},
          ${res.approved_date ? `${res.approved_date}::timestamp` : null},
          ${res.status === 'approved' ? 7 : null},
          ${res.status === 'approved' ? 7 : null},
          ${res.status}, ${userId}, NOW(), NOW()
        )
      `
    }

    console.log(`✅ Created ${resolutions.length} corporate resolutions`)

    // ====================================================================
    // PART 6: SYNDICATION_AGREEMENTS (2-3 agreements)
    // ====================================================================
    console.log('🤝 Seeding syndication_agreements...')

    const syndications = [
      {
        type: 'firm_commitment',
        name: 'IPO Underwriting Agreement (Lead)',
        desc: 'Firm commitment underwriting syndicate led by Goldman Sachs',
        lead: 'Goldman Sachs',
        co_underwriters: 'Morgan Stanley, JPMorgan Chase, Bank of America',
        member_count: 8,
        spread_bps: 350,
        net_proceeds: 495000000,
        status: 'negotiating',
      },
      {
        type: 'best_efforts',
        name: 'Secondary Underwriting Agreement',
        desc: 'Best efforts syndicate for secondary shares',
        lead: 'Morgan Stanley',
        co_underwriters: 'Jefferies, Stifel, Raymond James',
        member_count: 5,
        spread_bps: 450,
        net_proceeds: 45000000,
        status: 'draft',
      },
      {
        type: 'firm_commitment',
        name: 'IPO Underwriting Agreement (Co-Manager)',
        desc: 'Firm commitment from co-managing underwriting group',
        lead: 'JPMorgan Chase',
        co_underwriters: 'Wells Fargo, Credit Suisse, BofA Securities',
        member_count: 6,
        spread_bps: 280,
        net_proceeds: 360000000,
        status: 'negotiating',
      },
    ]

    for (const syn of syndications) {
      await sql`
        INSERT INTO syndication_agreements (
          company_id, agreement_type, agreement_name, description,
          lead_underwriter, co_underwriter_names, member_count,
          gross_spread_bps, net_proceeds_usd,
          lockup_period_days, status, created_at, updated_at
        ) VALUES (
          ${COMPANY_ID}, ${syn.type}, ${syn.name}, ${syn.desc},
          ${syn.lead}, ${syn.co_underwriters}, ${syn.member_count},
          ${syn.spread_bps}, ${syn.net_proceeds},
          180, ${syn.status}, NOW(), NOW()
        )
      `
    }

    console.log(`✅ Created ${syndications.length} syndication agreements`)

    // ====================================================================
    // PART 7: LISTING_REQUIREMENTS (3 exchanges)
    // ====================================================================
    console.log('📋 Seeding listing_requirements...')

    const exchanges = ['NASDAQ', 'NYSE', 'TSX']
    const requirementsByExchange = {
      NASDAQ: [
        { code: 'NASDAQ_MIN_SHARES', name: 'Minimum Shares Outstanding', category: 'financial', status: 'completed' },
        { code: 'NASDAQ_MARKET_CAP', name: 'Minimum Market Capitalization', category: 'financial', status: 'completed' },
        { code: 'NASDAQ_SHAREHOLDERS', name: 'Minimum Public Shareholders', category: 'financial', status: 'in_progress' },
        { code: 'NASDAQ_QUORUM', name: 'Board Independence Requirements', category: 'governance', status: 'in_progress' },
        { code: 'NASDAQ_AUDIT', name: 'Audit Committee Requirements', category: 'governance', status: 'in_progress' },
        { code: 'NASDAQ_COMP', name: 'Compensation Committee Requirements', category: 'governance', status: 'not_started' },
        { code: 'NASDAQ_SOX', name: 'SOX 404 Internal Controls', category: 'audit', status: 'in_progress' },
        { code: 'NASDAQ_DISCLOSURE', name: 'Disclosure & Reporting Requirements', category: 'disclosure', status: 'in_progress' },
      ],
      NYSE: [
        { code: 'NYSE_MIN_SHARES', name: 'Minimum Shares Outstanding (US)', category: 'financial', status: 'completed' },
        { code: 'NYSE_MARKET_CAP', name: 'Minimum Market Capitalization', category: 'financial', status: 'completed' },
        { code: 'NYSE_QUORUM', name: 'Board Independence Requirements', category: 'governance', status: 'in_progress' },
        { code: 'NYSE_AUDIT', name: 'Audit Committee (All Independent)', category: 'governance', status: 'in_progress' },
        { code: 'NYSE_COMP', name: 'Compensation Committee (All Independent)', category: 'governance', status: 'not_started' },
        { code: 'NYSE_NOMINATING', name: 'Nominating Committee (All Independent)', category: 'governance', status: 'not_started' },
        { code: 'NYSE_SOX', name: 'SOX 404 & 302 Compliance', category: 'audit', status: 'in_progress' },
        { code: 'NYSE_ANTI_FRAUD', name: 'Anti-Fraud and Insider Trading Policies', category: 'disclosure', status: 'in_progress' },
      ],
      TSX: [
        { code: 'TSX_MIN_SHARES', name: 'Minimum Shares Outstanding (Canadian)', category: 'financial', status: 'completed' },
        { code: 'TSX_CANADIAN_PRESENCE', name: 'Canadian Presence Requirement', category: 'operational', status: 'completed' },
        { code: 'TSX_BOARD_INDEPENDENCE', name: 'Board Independence (2/3)', category: 'governance', status: 'in_progress' },
        { code: 'TSX_AUDIT_COMMITTEE', name: 'Audit Committee Composition', category: 'governance', status: 'in_progress' },
        { code: 'TSX_MD_A', name: 'MD&A Disclosure Requirements', category: 'disclosure', status: 'in_progress' },
        { code: 'TSX_SOX_EQUIVALENT', name: 'Financial Reporting Controls', category: 'audit', status: 'in_progress' },
        { code: 'TSX_ANTI_MONEY_LAUNDERING', name: 'Anti-Money Laundering Compliance', category: 'operational', status: 'not_started' },
      ],
    }

    for (const exchange of exchanges) {
      const requirements = requirementsByExchange[exchange] || []
      for (const req of requirements) {
        await sql`
          INSERT INTO listing_requirements (
            company_id, exchange_code, requirement_code, requirement_name,
            category, requirement_level, status, completion_pct,
            is_compliant, created_at, updated_at
          ) VALUES (
            ${COMPANY_ID}, ${exchange}, ${req.code}, ${req.name},
            ${req.category}, 'mandatory',
            ${req.status}, ${req.status === 'completed' ? 100 : req.status === 'in_progress' ? 60 : 0},
            ${req.status === 'completed' ? true : null},
            NOW(), NOW()
          )
        `
      }
    }

    const totalRequirements = Object.values(requirementsByExchange).reduce((sum, reqs) => sum + reqs.length, 0)
    console.log(`✅ Created ${totalRequirements} listing requirements (NASDAQ, NYSE, TSX)`)

    // ====================================================================
    // SUMMARY
    // ====================================================================
    console.log('\n' + '='.repeat(70))
    console.log('✅ PHASE 2 SEED COMPLETE FOR test@ipoready.com')
    console.log('='.repeat(70))
    console.log(`
  📊 DATA POPULATED:
  
  Cost Items (44 items):
    - Legal: $5.2M
    - Audit & Accounting: $4.8M
    - Investment Banking: $8.5M
    - Consulting: $3.2M
    - Printing & Delivery: $1.8M
    - Roadshow: $2.1M
    - Listing Fees: $3.2M
    - Employee-Related: $2.3M
    - Contingency: $1.5M
    ────────────────────
    Total: $50.2M
  
  Financial Metrics: 24 monthly summaries (Jan 2024 - Dec 2025)
  
  Dilution Scenarios: 3 scenarios
    - Series C @ $20/share (Conservative)
    - Series C @ $25/share (Base Case) ← Detailed shareholder cap table
    - Warrant Exercise (Best Case)
  
  Consent Requests: 10 consent items
    - Status breakdown: 3 signed, 3 approved, 2 pending, 1 viewed, 1 rejected
  
  Corporate Resolutions: 12 board resolutions
    - Status breakdown: 6 approved, 4 pending, 2 draft
  
  Syndication Agreements: 3 agreements
    - Firm commitment and best efforts structures
    - Realistic gross spreads (280-450 bps)
  
  Listing Requirements: 22 requirements
    - NASDAQ: 8 requirements
    - NYSE: 8 requirements
    - TSX: 6 requirements
    - Status mix: completed, in_progress, not_started
    `)
    console.log('='.repeat(70) + '\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seedPhase2Data()
