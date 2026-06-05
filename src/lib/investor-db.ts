/**
 * Investor Database Utilities
 * Common queries for investor platform
 */

// These are template queries to be used with your database client
// Replace with actual Neon/PostgreSQL client implementation

/**
 * Create a new investor profile
 */
export function createInvestorQuery(investorData: {
  email: string
  name: string
  firmName: string
  role: string
  minCheckSize: number
  maxCheckSize: number
}) {
  return `
    INSERT INTO investor_profiles (email, name, firm_name, role, min_check_size, max_check_size)
    VALUES ('${investorData.email}', '${investorData.name}', '${investorData.firmName}', '${investorData.role}', ${investorData.minCheckSize}, ${investorData.maxCheckSize})
    RETURNING id, email, name, created_at;
  `
}

/**
 * Update investor criteria (investment preferences)
 */
export function updateInvestorCriteriaQuery(investorId: string, criteria: {
  preferredStages: string[]
  preferredSectors: string[]
  preferredGeographies: string[]
  fundingTypes: string[]
}) {
  return `
    INSERT INTO investor_criteria (investor_id, preferred_stages, preferred_sectors, preferred_geographies, funding_types)
    VALUES ('${investorId}', ARRAY[${criteria.preferredStages.map(s => `'${s}'`).join(',')}], ARRAY[${criteria.preferredSectors.map(s => `'${s}'`).join(',')}], ARRAY[${criteria.preferredGeographies.map(s => `'${s}'`).join(',')}], ARRAY[${criteria.fundingTypes.map(t => `'${t}'`).join(',')}])
    ON CONFLICT (investor_id) DO UPDATE SET
      preferred_stages = EXCLUDED.preferred_stages,
      preferred_sectors = EXCLUDED.preferred_sectors,
      preferred_geographies = EXCLUDED.preferred_geographies,
      funding_types = EXCLUDED.funding_types
    RETURNING *;
  `
}

/**
 * Find investors matching a company's profile
 */
export function findMatchingInvestorsQuery(companyData: {
  stage: string
  sectors: string[]
  location: string
  fundingAmount: number
}) {
  return `
    SELECT DISTINCT
      ip.id,
      ip.email,
      ip.name,
      ip.firm_name,
      ic.preferred_stages,
      ic.preferred_sectors,
      ic.preferred_geographies,
      inp.email_notifications_enabled,
      inp.real_time_alerts_enabled
    FROM investor_profiles ip
    JOIN investor_criteria ic ON ip.id = ic.investor_id
    JOIN investor_notification_preferences inp ON ip.id = inp.investor_id
    WHERE
      '${companyData.stage}' = ANY(ic.preferred_stages)
      AND (${companyData.sectors.map(s => `'${s}' = ANY(ic.preferred_sectors)`).join(' OR ')})
      AND '${companyData.location}' = ANY(ic.preferred_geographies)
      AND ip.min_check_size <= ${companyData.fundingAmount}
      AND ip.max_check_size >= ${companyData.fundingAmount}
      AND inp.email_notifications_enabled = true
      AND inp.real_time_alerts_enabled = true
    ORDER BY ip.created_at DESC;
  `
}

/**
 * Get investor's recent alerts
 */
export function getInvestorAlertsQuery(investorId: string, limit = 50) {
  return `
    SELECT
      id,
      company_name,
      alert_type,
      severity,
      title,
      description,
      match_score,
      funding_amount,
      email_sent,
      email_opened,
      email_clicked,
      created_at
    FROM investor_alerts
    WHERE investor_id = '${investorId}'
    ORDER BY created_at DESC
    LIMIT ${limit};
  `
}

/**
 * Get unread alerts for an investor
 */
export function getUnreadAlertsQuery(investorId: string) {
  return `
    SELECT COUNT(*) as unread_count
    FROM investor_alerts
    WHERE investor_id = '${investorId}'
      AND email_opened = false;
  `
}

/**
 * Log investor activity
 */
export function logActivityQuery(investorId: string, action: string, resourceType?: string, resourceId?: string) {
  return `
    INSERT INTO investor_activity_log (investor_id, action, resource_type, resource_id, created_at)
    VALUES ('${investorId}', '${action}', ${resourceType ? `'${resourceType}'` : 'NULL'}, ${resourceId ? `'${resourceId}'` : 'NULL'}, NOW())
    RETURNING id, created_at;
  `
}

/**
 * Save a company to investor's watchlist
 */
export function saveCompanyQuery(investorId: string, companyId: string, companyName: string, priority = 'NORMAL') {
  return `
    INSERT INTO investor_saved_companies (investor_id, company_id, company_name, priority)
    VALUES ('${investorId}', '${companyId}', '${companyName}', '${priority}')
    ON CONFLICT (investor_id, company_id) DO UPDATE SET
      priority = EXCLUDED.priority,
      saved_at = NOW()
    RETURNING *;
  `
}

/**
 * Get investor's saved companies
 */
export function getSavedCompaniesQuery(investorId: string) {
  return `
    SELECT
      id,
      company_id,
      company_name,
      priority,
      notes,
      saved_at
    FROM investor_saved_companies
    WHERE investor_id = '${investorId}'
    ORDER BY priority DESC, saved_at DESC;
  `
}

/**
 * Record email delivery in logs
 */
export function logEmailDeliveryQuery(emailData: {
  investorId: string
  emailType: 'company_alert' | 'weekly_digest' | 'outreach_template'
  recipientEmail: string
  subject: string
  resendMessageId?: string
  companyId?: string
  companyName?: string
}) {
  const companyIdVal = emailData.companyId ? `'${emailData.companyId}'` : 'NULL'
  const companyNameVal = emailData.companyName ? `'${emailData.companyName}'` : 'NULL'

  return `
    INSERT INTO investor_email_logs (
      investor_id,
      email_type,
      recipient_email,
      subject,
      resend_message_id,
      company_id,
      company_name,
      sent_at
    ) VALUES (
      '${emailData.investorId}',
      '${emailData.emailType}',
      '${emailData.recipientEmail}',
      '${emailData.subject}',
      ${emailData.resendMessageId ? `'${emailData.resendMessageId}'` : 'NULL'},
      ${companyIdVal},
      ${companyNameVal},
      NOW()
    )
    RETURNING id, sent_at;
  `
}

/**
 * Get investor portfolio (invested companies)
 */
export function getInvestorPortfolioQuery(investorId: string) {
  return `
    SELECT
      id,
      company_id,
      investment_amount,
      round_type,
      ownership_percentage,
      investment_date,
      status,
      exit_value
    FROM investor_portfolio
    WHERE investor_id = '${investorId}'
      AND status = 'ACTIVE'
    ORDER BY investment_date DESC;
  `
}

/**
 * Update notification preferences
 */
export function updateNotificationPreferencesQuery(investorId: string, preferences: {
  emailNotificationsEnabled?: boolean
  realTimeAlertsEnabled?: boolean
  weeklyDigestEnabled?: boolean
  weeklyDigestDay?: string
}) {
  const updates = []
  if (preferences.emailNotificationsEnabled !== undefined) {
    updates.push(`email_notifications_enabled = ${preferences.emailNotificationsEnabled}`)
  }
  if (preferences.realTimeAlertsEnabled !== undefined) {
    updates.push(`real_time_alerts_enabled = ${preferences.realTimeAlertsEnabled}`)
  }
  if (preferences.weeklyDigestEnabled !== undefined) {
    updates.push(`weekly_digest_enabled = ${preferences.weeklyDigestEnabled}`)
  }
  if (preferences.weeklyDigestDay !== undefined) {
    updates.push(`weekly_digest_day = '${preferences.weeklyDigestDay}'`)
  }

  return `
    UPDATE investor_notification_preferences
    SET ${updates.join(', ')}
    WHERE investor_id = '${investorId}'
    RETURNING *;
  `
}

/**
 * Get email statistics for an investor
 */
export function getEmailStatsQuery(investorId: string, daysBack = 30) {
  return `
    SELECT
      email_type,
      COUNT(*) as total_sent,
      COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered,
      COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
      COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked,
      ROUND(
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END)::numeric /
        COUNT(*)::numeric * 100,
        2
      ) as open_rate
    FROM investor_email_logs
    WHERE investor_id = '${investorId}'
      AND sent_at >= NOW() - INTERVAL '${daysBack} days'
    GROUP BY email_type;
  `
}

/**
 * Find top investors by activity
 */
export function getTopInvestorsQuery(limit = 10) {
  return `
    SELECT
      ip.id,
      ip.email,
      ip.name,
      ip.firm_name,
      COUNT(DISTINCT ial.id) as alerts_received,
      COUNT(DISTINCT isc.id) as companies_saved,
      COUNT(DISTINCT iel.id) as emails_sent,
      COUNT(CASE WHEN iel.opened_at IS NOT NULL THEN 1 END) as emails_opened
    FROM investor_profiles ip
    LEFT JOIN investor_alerts ial ON ip.id = ial.investor_id
    LEFT JOIN investor_saved_companies isc ON ip.id = isc.investor_id
    LEFT JOIN investor_email_logs iel ON ip.id = iel.investor_id
    GROUP BY ip.id, ip.email, ip.name, ip.firm_name
    ORDER BY alerts_received DESC
    LIMIT ${limit};
  `
}

/**
 * Delete investor profile (cascades to all related data)
 */
export function deleteInvestorQuery(investorId: string) {
  return `
    DELETE FROM investor_profiles
    WHERE id = '${investorId}'
    RETURNING id, email;
  `
}

/**
 * Get investor preferences for a given filter
 */
export function getInvestorPreferencesQuery(investorId: string) {
  return `
    SELECT
      ip.id,
      ip.email,
      ip.name,
      ip.firm_name,
      ip.min_check_size,
      ip.max_check_size,
      ic.preferred_stages,
      ic.preferred_sectors,
      ic.preferred_geographies,
      ic.funding_types,
      inp.email_notifications_enabled,
      inp.real_time_alerts_enabled,
      inp.weekly_digest_enabled,
      inp.weekly_digest_day
    FROM investor_profiles ip
    LEFT JOIN investor_criteria ic ON ip.id = ic.investor_id
    LEFT JOIN investor_notification_preferences inp ON ip.id = inp.investor_id
    WHERE ip.id = '${investorId}';
  `
}

/**
 * SQL INJECTION WARNING
 *
 * These query templates are for reference only.
 * In production, use parameterized queries with your database client:
 *
 * ✅ CORRECT (with Neon/pg client):
 * db.query('SELECT * FROM investor_profiles WHERE id = $1', [investorId])
 *
 * ❌ WRONG (string interpolation):
 * db.query(`SELECT * FROM investor_profiles WHERE id = '${investorId}'`)
 *
 * Always use parameterized queries with $1, $2, etc. placeholders
 * and pass values as a separate array argument.
 */
