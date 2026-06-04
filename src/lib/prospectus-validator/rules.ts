/**
 * Prospectus Validation Rules Engine
 * ----------------------------------
 * Configuration-driven validation rules for prospectus sections.
 *
 * Rules are declared as plain data (see `VALIDATION_RULESET` below) so they can
 * be tuned WITHOUT touching analysis code. Each rule describes WHAT to check
 * (word count, required keywords, required data points, quantified items) and
 * carries the metadata needed to generate a transparent, actionable issue when
 * it fails.
 *
 * The analyzer (`analyzer.ts`) consumes these rules and produces the
 * `ProspectusSection[]` shape consumed by the validator dashboard UI.
 */

// ---------------------------------------------------------------------------
// Severity / scoring constants
// ---------------------------------------------------------------------------

export type RuleSeverity = 'critical' | 'moderate' | 'minor'

/**
 * Score penalty (out of 100) applied per failed rule, by severity.
 * Centralised here so scoring stays transparent and easy to retune.
 */
export const SEVERITY_PENALTY: Record<RuleSeverity, number> = {
  critical: 30,
  moderate: 15,
  minor: 7,
}

/** Weight each rule type contributes when no rule-specific weight is set. */
export const RULE_TYPE_DEFAULT_SEVERITY: Record<RuleType, RuleSeverity> = {
  word_count: 'moderate',
  required_keywords: 'moderate',
  required_data_points: 'moderate',
  quantified_items: 'moderate',
}

// ---------------------------------------------------------------------------
// Rule type definitions
// ---------------------------------------------------------------------------

export type RuleType =
  | 'word_count'
  | 'required_keywords'
  | 'required_data_points'
  | 'quantified_items'

interface BaseRule {
  /** Stable id, used to make deterministic issue ids. */
  id: string
  type: RuleType
  /** Human readable label shown in the issue ("what was checked"). */
  label: string
  severity: RuleSeverity
  /** Guidance shown to the user describing how to fix the issue. */
  guidance: string
  /** Optional reference / example link for the issue. */
  exampleLink?: string
  /**
   * If true a failure is reported as a "gap" (missing data) rather than an
   * "issue" (quality problem). Gaps still affect the score.
   */
  reportAsGap?: boolean
  /** Category label used when reported as a gap. */
  gapCategory?: string
}

/** Minimum / maximum word count for the section body. */
export interface WordCountRule extends BaseRule {
  type: 'word_count'
  min?: number
  max?: number
}

/** Keywords/phrases that must appear (case-insensitive, any match per group). */
export interface RequiredKeywordsRule extends BaseRule {
  type: 'required_keywords'
  /**
   * Each entry is a synonym group — the rule passes for that group if ANY of
   * its phrases is present. The rule fails if fewer than `minGroups` groups
   * are satisfied.
   */
  keywordGroups: string[][]
  /** How many groups must be present for the rule to pass. Default: all. */
  minGroups?: number
}

/**
 * Named data points that must be present. Each data point is matched by one or
 * more regex patterns; the rule lists what is missing for full transparency.
 */
export interface RequiredDataPointsRule extends BaseRule {
  type: 'required_data_points'
  dataPoints: Array<{
    key: string
    label: string
    /** Regex source strings (matched case-insensitive). Any match = present. */
    patterns: string[]
  }>
  /** Minimum number of data points that must be present. Default: all. */
  minPresent?: number
}

/**
 * Counts quantified statements (numbers with units / $ / % / ranges). Useful
 * for "at least N quantified risks" style rules.
 */
export interface QuantifiedItemsRule extends BaseRule {
  type: 'quantified_items'
  minCount: number
  /**
   * Optional context keywords — only quantified statements appearing within
   * the same sentence as one of these keywords are counted. Omit to count all.
   */
  contextKeywords?: string[]
}

export type ValidationRule =
  | WordCountRule
  | RequiredKeywordsRule
  | RequiredDataPointsRule
  | QuantifiedItemsRule

// ---------------------------------------------------------------------------
// Section configuration
// ---------------------------------------------------------------------------

export interface SectionRuleConfig {
  /** Stable section id used in the dashboard (matches MOCK_SECTIONS ids). */
  id: string
  /** Display name. */
  name: string
  /**
   * Section name aliases as they may appear in `prospectus_sections.section_name`
   * (DB) — used to map stored content to this rule config (case-insensitive,
   * snake/space/punctuation insensitive).
   */
  aliases: string[]
  rules: ValidationRule[]
}

// ---------------------------------------------------------------------------
// Result types (returned by the analyzer per section)
// ---------------------------------------------------------------------------

export interface RuleEvaluation {
  ruleId: string
  ruleType: RuleType
  passed: boolean
  severity: RuleSeverity
  /** Transparent explanation of what triggered the result. */
  detail: string
  /** Score penalty applied (0 when passed). */
  penalty: number
}

export interface SectionRuleResult {
  passed: boolean
  /** 0-100 section score after penalties. */
  score: number
  evaluations: RuleEvaluation[]
}

// ---------------------------------------------------------------------------
// THE RULESET  (configuration-driven — edit freely without touching logic)
// ---------------------------------------------------------------------------

export const VALIDATION_RULESET: SectionRuleConfig[] = [
  {
    id: 'exec-summary',
    name: 'Executive Summary',
    aliases: ['executive summary', 'exec summary', 'business overview', 'summary', 'overview'],
    rules: [
      {
        id: 'exec-wordcount',
        type: 'word_count',
        label: 'Executive Summary must be 200-400 words',
        severity: 'moderate',
        min: 200,
        max: 400,
        guidance:
          'Keep the executive summary concise but complete. Aim for 200-400 words covering the business, market, traction and the offering. Too short signals lack of substance; too long buries the thesis.',
      },
      {
        id: 'exec-keywords',
        type: 'required_keywords',
        label: 'Executive Summary must describe business, market and offering',
        severity: 'moderate',
        keywordGroups: [
          ['business', 'company', 'we are', 'our platform', 'our product'],
          ['market', 'industry', 'tam', 'addressable'],
          ['offering', 'ipo', 'public offering', 'proceeds', 'shares offered'],
        ],
        minGroups: 3,
        guidance:
          'A strong summary covers three pillars: what the business does, the market it serves, and the terms of the offering. Add a sentence for any missing pillar.',
      },
      {
        id: 'exec-tam',
        type: 'required_data_points',
        label: 'Executive Summary must quantify the market opportunity (TAM)',
        severity: 'moderate',
        reportAsGap: true,
        gapCategory: 'Financial Highlights',
        dataPoints: [
          {
            key: 'tam',
            label: 'Total Addressable Market figure',
            patterns: ['\\$\\s?\\d[\\d.,]*\\s?(b|m|bn|mm|billion|million|trillion)', 'tam[^.]{0,40}\\$', 'addressable market[^.]{0,40}\\$'],
          },
        ],
        guidance:
          'NASDAQ/NYSE expect a sized market opportunity in the summary. Add a TAM figure (e.g. "$5.2B TAM") backed by a third-party source such as Gartner or IDC.',
        exampleLink: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany',
      },
    ],
  },
  {
    id: 'risk-factors',
    name: 'Risk Factors',
    aliases: ['risk factors', 'risks', 'risk'],
    rules: [
      {
        id: 'risk-wordcount',
        type: 'word_count',
        label: 'Risk Factors must be substantive (300+ words)',
        severity: 'moderate',
        min: 300,
        guidance:
          'Risk Factors is one of the most scrutinised sections. Provide thorough coverage — most prospectuses run well over 300 words across multiple risk categories.',
      },
      {
        id: 'risk-quantified',
        type: 'quantified_items',
        label: 'Risk Factors must have at least 3 quantified risks',
        severity: 'critical',
        minCount: 3,
        guidance:
          'Generic risk language is insufficient. Quantify at least three risks (e.g. "our top 3 customers represent 42% of revenue", "a 10% FX move reduces revenue by $1.8M"). Quantification demonstrates rigor to regulators.',
      },
      {
        id: 'risk-categories',
        type: 'required_keywords',
        label: 'Risk Factors must cover key risk categories',
        severity: 'moderate',
        keywordGroups: [
          ['customer concentration', 'customer', 'concentration', 'top customers'],
          ['competition', 'competitive', 'competitors'],
          ['regulatory', 'regulation', 'compliance', 'gdpr', 'ccpa'],
          ['intellectual property', 'patent', 'ip litigation', 'trademark'],
        ],
        minGroups: 3,
        guidance:
          'Cover the standard risk taxonomy: customer concentration, competition, regulatory/compliance, and intellectual property. Add a subsection for any category not addressed.',
      },
      {
        id: 'risk-keyperson',
        type: 'required_data_points',
        label: 'Risk Factors should disclose key-person dependency',
        severity: 'minor',
        reportAsGap: true,
        gapCategory: 'Key Personnel Risk',
        dataPoints: [
          {
            key: 'key_person',
            label: 'Key-person / key-personnel risk disclosure',
            patterns: ['key person', 'key personnel', 'key employee', 'loss of.{0,20}(executive|founder|ceo)'],
          },
        ],
        guidance:
          'Disclose dependency on key executives and whether key-person insurance is held. Investors expect this for founder-led companies.',
      },
    ],
  },
  {
    id: 'use-of-proceeds',
    name: 'Use of Proceeds',
    aliases: ['use of proceeds', 'proceeds', 'use of net proceeds'],
    rules: [
      {
        id: 'proceeds-wordcount',
        type: 'word_count',
        label: 'Use of Proceeds must be 120+ words',
        severity: 'minor',
        min: 120,
        guidance:
          'Explain in prose how proceeds will be allocated and why. A short bullet list alone is rarely sufficient for regulators.',
      },
      {
        id: 'proceeds-allocation',
        type: 'quantified_items',
        label: 'Use of Proceeds must quantify allocation (percentages or amounts)',
        severity: 'moderate',
        minCount: 2,
        guidance:
          'Break down proceeds into at least two quantified buckets (e.g. "40% to R&D, 30% to sales & marketing"). Use percentages or dollar amounts.',
      },
      {
        id: 'proceeds-timeline',
        type: 'required_data_points',
        label: 'Use of Proceeds should include a deployment timeline',
        severity: 'moderate',
        reportAsGap: true,
        gapCategory: 'Deployment Timeline',
        dataPoints: [
          {
            key: 'timeline',
            label: 'Deployment timeline or milestones',
            patterns: ['year 1', 'year one', 'over the next', 'within \\d+ (months|years)', 'milestone', 'fiscal \\d{4}'],
          },
        ],
        guidance:
          'Provide a deployment timeline (Year 1 / Year 2 / Year 3) tied to operational milestones so investors understand when capital converts to growth.',
      },
    ],
  },
  {
    id: 'management',
    name: 'Management',
    aliases: ['management', 'directors and officers', 'leadership', 'board', 'executive compensation', 'management team'],
    rules: [
      {
        id: 'mgmt-wordcount',
        type: 'word_count',
        label: 'Management section must be substantive (250+ words)',
        severity: 'minor',
        min: 250,
        guidance: 'Provide meaningful bios and governance detail. Aim for 250+ words.',
      },
      {
        id: 'mgmt-board',
        type: 'quantified_items',
        label: 'Management section must list 5+ board members with bios',
        severity: 'moderate',
        minCount: 5,
        contextKeywords: ['director', 'board', 'officer', 'chair', 'ceo', 'cfo', 'coo', 'cto', 'president', 'years'],
        guidance:
          'List at least five named directors/officers, each with a bio covering tenure and relevant experience. Boards smaller than five often draw governance scrutiny at IPO.',
      },
      {
        id: 'mgmt-comp',
        type: 'required_keywords',
        label: 'Management section must address executive compensation',
        severity: 'minor',
        keywordGroups: [['compensation', 'salary', 'equity award', 'stock option', 'vesting']],
        minGroups: 1,
        guidance:
          'Include a summary compensation table and equity/option vesting schedules for named executive officers per Reg S-K Item 402.',
      },
    ],
  },
  {
    id: 'financial-da',
    name: 'Financial D&A',
    aliases: ['financial d&a', 'financial da', "management's discussion and analysis", 'md&a', 'mda', 'financial discussion and analysis', 'financial statements'],
    rules: [
      {
        id: 'finda-wordcount',
        type: 'word_count',
        label: 'Financial D&A must be substantive (300+ words)',
        severity: 'moderate',
        min: 300,
        guidance: 'MD&A should thoroughly discuss results of operations, liquidity and capital resources. Aim for 300+ words.',
      },
      {
        id: 'finda-3yr-revenue',
        type: 'required_data_points',
        label: 'Financial D&A must include 3-year historical revenue',
        severity: 'critical',
        dataPoints: [
          {
            key: 'three_year_revenue',
            label: 'Three distinct years of revenue figures',
            patterns: [
              '(20\\d{2}|fiscal \\d{4}|fy\\s?\\d{2,4})[^.]{0,60}\\$\\s?\\d',
              'revenue[^.]{0,40}\\$\\s?\\d[\\d.,]*\\s?(m|b|mm|bn|million|billion)',
            ],
          },
        ],
        minPresent: 1,
        guidance:
          'SEC requires audited financials. The MD&A must discuss at least three years of historical revenue with year-over-year growth rates. Add revenue figures for each of the last three fiscal years.',
      },
      {
        id: 'finda-metrics',
        type: 'required_keywords',
        label: 'Financial D&A should discuss margins and profitability',
        severity: 'moderate',
        keywordGroups: [
          ['gross margin', 'operating margin', 'ebitda', 'net income', 'net loss'],
          ['liquidity', 'cash flow', 'working capital', 'cash runway', 'burn rate'],
        ],
        minGroups: 2,
        guidance:
          'Discuss profitability metrics (gross/operating margin, EBITDA) and liquidity (cash flow, runway, working capital). Both are mandatory MD&A topics.',
      },
      {
        id: 'finda-revrec',
        type: 'required_data_points',
        label: 'Financial D&A should state the revenue recognition policy',
        severity: 'minor',
        reportAsGap: true,
        gapCategory: 'Accounting Policy',
        dataPoints: [
          {
            key: 'rev_rec',
            label: 'Revenue recognition policy (ASC 606)',
            patterns: ['revenue recognition', 'asc\\s?606', 'recognize revenue', 'recognized when'],
          },
        ],
        guidance:
          'State the revenue recognition policy (ASC 606) with examples of recognition timing for each material product/service line.',
      },
    ],
  },
  {
    id: 'market-opp',
    name: 'Market Opportunity',
    aliases: ['market opportunity', 'market', 'industry overview', 'market and industry', 'industry'],
    rules: [
      {
        id: 'market-wordcount',
        type: 'word_count',
        label: 'Market Opportunity must be 150+ words',
        severity: 'minor',
        min: 150,
        guidance: 'Describe the market, its growth drivers and your position within it. Aim for 150+ words.',
      },
      {
        id: 'market-sizing',
        type: 'required_data_points',
        label: 'Market Opportunity must quantify TAM / SAM / SOM',
        severity: 'moderate',
        dataPoints: [
          {
            key: 'tam',
            label: 'Total Addressable Market (TAM)',
            patterns: ['tam', 'total addressable', '\\$\\s?\\d[\\d.,]*\\s?(b|bn|billion)'],
          },
          {
            key: 'growth',
            label: 'Market growth rate (CAGR)',
            patterns: ['cagr', 'growing at', 'annual growth', '\\d+%\\s+(cagr|growth|annually)'],
          },
        ],
        minPresent: 1,
        guidance:
          'Quantify the opportunity with a TAM figure and a growth rate (CAGR). Layer in SAM/SOM to show a credible, capturable slice.',
      },
      {
        id: 'market-source',
        type: 'required_keywords',
        label: 'Market Opportunity should cite third-party research',
        severity: 'minor',
        keywordGroups: [['gartner', 'idc', 'forrester', 'mckinsey', 'statista', 'according to', 'research firm', 'industry report']],
        minGroups: 1,
        guidance:
          'Attribute market figures to a credible third-party source (Gartner, IDC, Forrester, etc.) to withstand underwriter and regulator scrutiny.',
      },
    ],
  },
  {
    id: 'capitalization',
    name: 'Capitalization',
    aliases: ['capitalization', 'capital structure', 'capitalisation', 'dilution'],
    rules: [
      {
        id: 'cap-wordcount',
        type: 'word_count',
        label: 'Capitalization must be 100+ words',
        severity: 'minor',
        min: 100,
        guidance: 'Explain the pre- and post-offering capital structure in prose, not just a table.',
      },
      {
        id: 'cap-shares',
        type: 'required_data_points',
        label: 'Capitalization must disclose share counts (basic & diluted)',
        severity: 'moderate',
        dataPoints: [
          {
            key: 'shares_outstanding',
            label: 'Shares outstanding',
            patterns: ['shares outstanding', 'common shares', 'outstanding shares', '\\d[\\d,]*\\s+shares'],
          },
          {
            key: 'fully_diluted',
            label: 'Fully diluted share count',
            patterns: ['fully diluted', 'diluted shares', 'on a diluted basis', 'treasury (stock )?method'],
          },
        ],
        minPresent: 2,
        guidance:
          'Disclose both basic shares outstanding and the fully-diluted count. Use the treasury stock method (ASC 260) for in-the-money options/warrants.',
      },
      {
        id: 'cap-dilution',
        type: 'required_keywords',
        label: 'Capitalization should explain dilution to new investors',
        severity: 'minor',
        reportAsGap: true,
        gapCategory: 'Dilution',
        keywordGroups: [['dilution', 'dilutive', 'net tangible book value', 'pro forma']],
        minGroups: 1,
        guidance:
          'Explain the dilution new investors will experience, including pro forma net tangible book value per share before and after the offering.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Normalise a section name for alias matching. */
export function normalizeSectionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9& ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Resolve a raw section name (from DB or builder) to its rule config.
 * Returns undefined when no config matches.
 */
export function resolveSectionConfig(rawName: string): SectionRuleConfig | undefined {
  const target = normalizeSectionName(rawName)
  return VALIDATION_RULESET.find((cfg) => {
    if (cfg.id === rawName) return true
    if (normalizeSectionName(cfg.name) === target) return true
    return cfg.aliases.some((a) => {
      const alias = normalizeSectionName(a)
      return target === alias || target.includes(alias) || alias.includes(target)
    })
  })
}

export function getSectionConfigById(id: string): SectionRuleConfig | undefined {
  return VALIDATION_RULESET.find((c) => c.id === id)
}
