/**
 * IPOReady Phase 2A-2D TypeScript Type Definitions
 * Auto-generated from database schema
 * Use with: /migrations/018_phase2a_2d_comprehensive_schema.sql
 */

// ====================================================================
// COST ITEMS (Phase 2A)
// ====================================================================

export type CostCategory = 'legal' | 'audit' | 'accounting' | 'ib' | 'consulting' | 'printing' | 'roadshow' | 'listing_fees' | 'employee_related' | 'other';
export type CostType = 'capex' | 'opex' | 'one_time_fee';
export type CostNature = 'internal_labor' | 'external_vendor' | 'direct_cost' | 'estimated_contingency';
export type CostStatus = 'estimated' | 'committed' | 'incurred' | 'invoiced' | 'paid' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface CostItem {
  id: string;
  company_id: string;
  cost_category: CostCategory;
  cost_type: CostType;
  cost_nature: CostNature;
  description?: string;
  vendor_id?: string;
  vendor_name?: string;
  amount_usd: number;
  currency?: string;
  labor_hours?: number;
  hourly_rate_usd?: number;
  resource_name?: string;
  phase_number?: number;
  phase_name?: string;
  milestone_id?: string;
  planned_date?: Date;
  actual_date?: Date;
  due_date?: Date;
  status: CostStatus;
  approval_status: ApprovalStatus;
  approved_by_user_id?: string;
  approved_at?: Date;
  invoice_number?: string;
  invoice_url?: string;
  notes?: string;
  tags?: string[];
  created_by_user_id?: string;
  created_at: Date;
  updated_at: Date;
}

// ====================================================================
// DILUTION SCENARIOS (Phase 2B)
// ====================================================================

export type DilutionScenarioType = 'new_financing' | 'warrant_exercise' | 'option_vesting' | 'convertible_conversion' | 'custom_transaction';
export type DilutionScenarioStatus = 'draft' | 'reviewed' | 'approved' | 'executed' | 'archived';

export interface DilutionScenario {
  id: string;
  company_id: string;
  scenario_name: string;
  scenario_type: DilutionScenarioType;
  description?: string;
  new_shares_issued?: number;
  issue_price_per_share_usd?: number;
  total_raise_usd?: number;
  warrant_conversion_rate?: number;
  warrant_exercise_pct?: number;
  option_pool_increase_pct?: number;
  convertible_note_details?: Record<string, any>;
  pre_fully_diluted_shares?: number;
  pre_post_money_valuation_usd?: number;
  post_fully_diluted_shares?: number;
  post_post_money_valuation_usd?: number;
  founder_dilution_pct?: number;
  employee_dilution_pct?: number;
  series_a_holder_dilution_pct?: number;
  status: DilutionScenarioStatus;
  approved_at?: Date;
  executed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type ShareholderType = 'founder' | 'employee' | 'investor' | 'employee_pool' | 'other';
export type ShareClass = 'Common' | 'Preferred' | 'Series A' | 'Series B' | 'Series C' | 'Options' | 'Warrants' | 'Other';

export interface DilutionScenarioShareholder {
  id: string;
  scenario_id: string;
  shareholder_name: string;
  shareholder_type?: ShareholderType;
  share_class: ShareClass;
  shares_pre?: number;
  ownership_pct_pre?: number;
  shares_post?: number;
  ownership_pct_post?: number;
  dilution_pct?: number;
  created_at: Date;
}

// ====================================================================
// CONSENT REQUESTS (Phase 2D)
// ====================================================================

export type ConsentRequestType = 'director_consent' | 'shareholder_consent' | 'officer_consent' | 'lender_consent' | 'vendor_consent' | 'founder_lock_up' | 'other';
export type ConsentStatus = 'pending' | 'sent' | 'viewed' | 'signed' | 'approved' | 'rejected' | 'expired';
export type RecipientType = 'individual' | 'entity' | 'group';
export type SignatureMethod = 'esign' | 'email' | 'in_person' | 'other';

export interface ConsentRequest {
  id: string;
  company_id: string;
  request_type: ConsentRequestType;
  subject_matter: string;
  description?: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_type?: RecipientType;
  status: ConsentStatus;
  sent_date?: Date;
  signed_date?: Date;
  signed_by_name?: string;
  signature_method?: SignatureMethod;
  deadline_date?: Date;
  reminder_sent_count: number;
  last_reminder_date?: Date;
  expiry_date?: Date;
  template_id?: string;
  document_url?: string;
  rejected_at?: Date;
  rejection_reason?: string;
  can_resubmit: boolean;
  notes?: string;
  created_by_user_id?: string;
  created_at: Date;
  updated_at: Date;
}

// ====================================================================
// CORPORATE RESOLUTIONS (Phase 2D)
// ====================================================================

export type ResolutionType = 'board_authorization' | 'share_split' | 'stock_option_plan' | 'director_appointment' | 'dividend_policy' | 'related_party' | 'shareholder_approval' | 'other';
export type ResolutionStatus = 'draft' | 'pending_approval' | 'approved' | 'executed' | 'archived';

export interface CorporateResolution {
  id: string;
  company_id: string;
  resolution_type: ResolutionType;
  title: string;
  description?: string;
  board_approval_required: boolean;
  shareholder_approval_required: boolean;
  approval_status: ApprovalStatus;
  board_approved_at?: Date;
  board_vote_count?: number;
  board_vote_in_favor?: number;
  shareholder_approved_at?: Date;
  shareholder_vote_pct?: number;
  phase_required?: number;
  deadline_date?: Date;
  resolution_passed_date?: Date;
  resolution_text_url?: string;
  board_minutes_url?: string;
  shareholder_vote_record_url?: string;
  status: ResolutionStatus;
  prepared_by_user_id?: string;
  reviewed_by_user_id?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ====================================================================
// SYNDICATION AGREEMENTS (Phase 2C)
// ====================================================================

export type AgreementType = 'firm_commitment' | 'best_efforts' | 'standby' | 'all_or_none';
export type SyndicationStatus = 'draft' | 'negotiating' | 'signed' | 'executed' | 'closed';

export interface SyndicationAgreement {
  id: string;
  company_id: string;
  agreement_type: AgreementType;
  agreement_name?: string;
  description?: string;
  lead_underwriter: string;
  co_underwriter_names?: string;
  member_count?: number;
  gross_spread_bps?: number;
  net_proceeds_usd?: number;
  allocation_structure?: Record<string, number>;
  execution_date?: Date;
  closing_date?: Date;
  lockup_period_days?: number;
  status: SyndicationStatus;
  signed_at?: Date;
  executed_at?: Date;
  agreement_url?: string;
  prospectus_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ====================================================================
// LISTING REQUIREMENTS (Phase 2D)
// ====================================================================

export type ExchangeCode = 'TSX' | 'NASDAQ' | 'NYSE' | 'TSXV' | 'CSE' | 'OTC' | 'JSE';
export type RequirementCategory = 'governance' | 'financial' | 'disclosure' | 'operational' | 'audit';
export type RequirementLevel = 'mandatory' | 'best_practice' | 'conditional';
export type ListingRequirementStatus = 'not_started' | 'in_progress' | 'completed' | 'n_a' | 'exemption_approved';

export interface ListingRequirement {
  id: string;
  company_id: string;
  exchange_code: ExchangeCode;
  requirement_code: string;
  requirement_name: string;
  description?: string;
  category?: RequirementCategory;
  requirement_level: RequirementLevel;
  status: ListingRequirementStatus;
  completion_pct: number;
  is_compliant?: boolean;
  exemption_requested: boolean;
  exemption_approved: boolean;
  exemption_reason?: string;
  validation_method?: string;
  validation_date?: Date;
  validator_user_id?: string;
  deadline_date?: Date;
  supporting_doc_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ListingRequirementChecklist {
  id: string;
  company_id: string;
  requirement_id: string;
  status: ListingRequirementStatus;
  completion_pct: number;
  assigned_to_user_id?: string;
  target_completion_date?: Date;
  actual_completion_date?: Date;
  evidence_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ====================================================================
// FINANCIAL METRICS & KPIs
// ====================================================================

export type MetricType = 'monthly_summary' | 'ytd_summary' | 'daily_snapshot' | 'forecast';
export type BudgetStatus = 'on_track' | 'over_budget' | 'under_budget';

export interface FinancialMetrics {
  id: string;
  company_id: string;
  metric_date: Date;
  metric_type: MetricType;
  total_ipo_costs_usd: number;
  estimated_remaining_usd?: number;
  estimated_total_ipo_cost_usd?: number;
  legal_costs_usd?: number;
  audit_costs_usd?: number;
  accounting_costs_usd?: number;
  ib_costs_usd?: number;
  consulting_costs_usd?: number;
  other_costs_usd?: number;
  total_budget_usd?: number;
  budget_remaining_usd?: number;
  budget_variance_pct?: number;
  budget_status?: BudgetStatus;
  days_since_phase_1_start?: number;
  estimated_days_to_listing?: number;
  phase_completion_pct?: number;
  cash_outflow_this_month_usd?: number;
  monthly_burn_rate_usd?: number;
  team_hours_invested?: number;
  team_utilization_pct?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FinancialKPIDashboard {
  id: string;
  company_id: string;
  snapshot_date: Date;
  total_ipo_costs_to_date_usd: number;
  estimated_total_ipo_costs_usd?: number;
  remaining_budget_usd?: number;
  budget_burn_rate_usd_per_month?: number;
  current_phase?: number;
  current_phase_completion_pct?: number;
  estimated_days_to_listing?: number;
  runway_months?: number;
  cash_required_for_ipo_usd?: number;
  fully_diluted_shares_millions?: number;
  latest_valuation_usd?: number;
  estimated_ipo_share_price_usd?: number;
  estimated_ipo_proceeds_usd?: number;
  board_size?: number;
  independent_directors_pct?: number;
  open_litigation_count?: number;
  outstanding_consents_count?: number;
  missing_resolutions_count?: number;
  created_at: Date;
  updated_at: Date;
}

// ====================================================================
// HELPER TYPES
// ====================================================================

export interface Vendor {
  id: string;
  vendor_name: string;
  vendor_type?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  website_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConsentTemplate {
  id: string;
  organization_id?: string;
  template_name: string;
  template_type?: string;
  description?: string;
  template_body: string;
  placeholders?: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

export interface Milestone {
  id: string;
  company_id: string;
  milestone_name: string;
  milestone_date?: Date;
  description?: string;
  created_at: Date;
}

// ====================================================================
// QUERY RESULT TYPES
// ====================================================================

export interface CostSummaryByCategory {
  cost_category: CostCategory;
  total_cost: number;
  item_count: number;
  avg_cost: number;
}

export interface DilutionAnalysis {
  shareholder_name: string;
  share_class: ShareClass;
  shares_pre: number;
  ownership_pct_pre: number;
  shares_post: number;
  ownership_pct_post: number;
  dilution_pct?: number;
}

export interface OutstandingAction {
  item_type: 'Consent Request' | 'Resolution' | 'Listing Requirement';
  responsible_party: string;
  description: string;
  deadline_date?: Date;
  status: string;
}

export interface ComplianceReport {
  exchange_code: ExchangeCode;
  total_requirements: number;
  completed: number;
  in_progress: number;
  not_started: number;
  compliance_pct: number;
}
