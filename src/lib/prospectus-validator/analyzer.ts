/**
 * Prospectus Content Analyzer
 * ---------------------------
 * Pure, dependency-free analysis logic that runs the configuration-driven
 * rules from `rules.ts` against actual section content and produces the
 * `ProspectusSection[]` shape consumed by the validator dashboard.
 *
 * No DB or network access lives here — it is intentionally pure so it can be
 * unit-tested and reused on the server (API route) or client (preview).
 */

import {
  VALIDATION_RULESET,
  resolveSectionConfig,
  SEVERITY_PENALTY,
  type SectionRuleConfig,
  type ValidationRule,
  type RuleEvaluation,
  type SectionRuleResult,
  type RuleSeverity,
} from './rules'

import type { ProspectusSection, Issue, Gap } from '@/components/prospectus/ProspectusValidatorDashboard'

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

/** Strip simple HTML tags so word counts reflect prose, not markup. */
function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ')
}

export function countWords(text: string): number {
  const clean = stripHtml(text).trim()
  if (!clean) return 0
  return clean.split(/\s+/).filter(Boolean).length
}

function splitSentences(text: string): string[] {
  return stripHtml(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Regex that captures quantified statements: $, %, ranges, units. */
const QUANTIFIED_PATTERN =
  /(\$\s?\d[\d.,]*\s?(?:b|m|bn|mm|billion|million|trillion|k)?\b)|(\d[\d.,]*\s?%)|(\b\d[\d.,]*\s?(?:billion|million|thousand|customers|employees|years|months|x)\b)/i

function isQuantified(sentence: string): boolean {
  return QUANTIFIED_PATTERN.test(sentence)
}

function matchesAnyPattern(text: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    try {
      return new RegExp(p, 'i').test(text)
    } catch {
      return text.toLowerCase().includes(p.toLowerCase())
    }
  })
}

// ---------------------------------------------------------------------------
// Extracted key metrics (surfaced for transparency / future use)
// ---------------------------------------------------------------------------

export interface ExtractedMetrics {
  wordCount: number
  quantifiedStatementCount: number
  hasRevenueFigure: boolean
  hasTAM: boolean
  hasMargin: boolean
  dollarFigures: string[]
  percentages: string[]
}

export function extractMetrics(text: string): ExtractedMetrics {
  const clean = stripHtml(text)
  const dollarFigures = (clean.match(/\$\s?\d[\d.,]*\s?(?:b|m|bn|mm|billion|million|trillion|k)?/gi) || []).slice(0, 20)
  const percentages = (clean.match(/\d[\d.,]*\s?%/g) || []).slice(0, 20)
  const sentences = splitSentences(clean)

  return {
    wordCount: countWords(text),
    quantifiedStatementCount: sentences.filter(isQuantified).length,
    hasRevenueFigure: /revenue[^.]{0,40}\$\s?\d/i.test(clean) || /\$\s?\d[\d.,]*\s?(m|b|million|billion)[^.]{0,30}revenue/i.test(clean),
    hasTAM: /tam|total addressable|addressable market/i.test(clean),
    hasMargin: /(gross|operating|net|ebitda)\s+margin|margin\s+of\s+\d/i.test(clean),
    dollarFigures,
    percentages,
  }
}

// ---------------------------------------------------------------------------
// Rule evaluation
// ---------------------------------------------------------------------------

function evaluateRule(rule: ValidationRule, text: string, metrics: ExtractedMetrics): RuleEvaluation {
  const clean = stripHtml(text)
  let passed = true
  let detail = rule.label

  switch (rule.type) {
    case 'word_count': {
      const wc = metrics.wordCount
      const tooFew = rule.min !== undefined && wc < rule.min
      const tooMany = rule.max !== undefined && wc > rule.max
      passed = !tooFew && !tooMany
      if (tooFew) {
        detail = `Section has ${wc} words; minimum is ${rule.min}. Add ~${rule.min! - wc} more words of substance.`
      } else if (tooMany) {
        detail = `Section has ${wc} words; maximum is ${rule.max}. Trim ~${wc - rule.max!} words for focus.`
      } else {
        detail = `Word count ${wc} is within the ${rule.min ?? 0}-${rule.max ?? '∞'} range.`
      }
      break
    }
    case 'required_keywords': {
      const minGroups = rule.minGroups ?? rule.keywordGroups.length
      const satisfied = rule.keywordGroups.filter((group) =>
        group.some((kw) => clean.toLowerCase().includes(kw.toLowerCase()))
      )
      passed = satisfied.length >= minGroups
      const missing = rule.keywordGroups
        .filter((group) => !group.some((kw) => clean.toLowerCase().includes(kw.toLowerCase())))
        .map((g) => g[0])
      detail = passed
        ? `Found ${satisfied.length}/${rule.keywordGroups.length} required topic groups.`
        : `Only ${satisfied.length}/${minGroups} required topic groups present. Missing coverage of: ${missing.join(', ')}.`
      break
    }
    case 'required_data_points': {
      const minPresent = rule.minPresent ?? rule.dataPoints.length
      const present = rule.dataPoints.filter((dp) => matchesAnyPattern(clean, dp.patterns))
      const missing = rule.dataPoints.filter((dp) => !matchesAnyPattern(clean, dp.patterns))
      passed = present.length >= minPresent
      detail = passed
        ? `Found required data: ${present.map((d) => d.label).join(', ')}.`
        : `Missing data point(s): ${missing.map((d) => d.label).join(', ')}.`
      break
    }
    case 'quantified_items': {
      let sentences = splitSentences(clean)
      if (rule.contextKeywords?.length) {
        sentences = sentences.filter((s) =>
          rule.contextKeywords!.some((kw) => s.toLowerCase().includes(kw.toLowerCase()))
        )
      }
      const count = sentences.filter(isQuantified).length
      passed = count >= rule.minCount
      detail = passed
        ? `Found ${count} quantified statement(s) (need ${rule.minCount}).`
        : `Only ${count} quantified statement(s) found; need at least ${rule.minCount}. Add specific figures (%, $, counts).`
      break
    }
  }

  return {
    ruleId: rule.id,
    ruleType: rule.type,
    passed,
    severity: rule.severity,
    detail,
    penalty: passed ? 0 : SEVERITY_PENALTY[rule.severity],
  }
}

export function evaluateSectionRules(
  config: SectionRuleConfig,
  text: string
): { result: SectionRuleResult; metrics: ExtractedMetrics } {
  const metrics = extractMetrics(text)
  const evaluations = config.rules.map((rule) => evaluateRule(rule, text, metrics))
  const totalPenalty = evaluations.reduce((sum, e) => sum + e.penalty, 0)
  const score = Math.max(0, Math.min(100, 100 - totalPenalty))
  return {
    metrics,
    result: {
      passed: evaluations.every((e) => e.passed),
      score,
      evaluations,
    },
  }
}

// ---------------------------------------------------------------------------
// Mapping rule results -> dashboard ProspectusSection
// ---------------------------------------------------------------------------

function scoreToStrength(score: number): number {
  // Map 0-100 score to a 1.0-5.0 strength rating, rounded to one decimal.
  const strength = 1 + (score / 100) * 4
  return Math.round(strength * 10) / 10
}

function strengthToStatus(strength: number): ProspectusSection['status'] {
  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'passable'
  if (strength <= 4) return 'defendable'
  return 'strong'
}

/** Build human fix options from a rule's guidance / data points. */
function buildFixOptions(rule: ValidationRule, evalResult: RuleEvaluation): Issue['fixOptions'] {
  const opts: Issue['fixOptions'] = []
  if (rule.type === 'required_data_points') {
    rule.dataPoints.forEach((dp, i) => {
      opts.push({ id: `${rule.id}-fix-${i}`, label: `Add ${dp.label}`, checked: false })
    })
  } else if (rule.type === 'required_keywords') {
    rule.keywordGroups.forEach((group, i) => {
      opts.push({ id: `${rule.id}-fix-${i}`, label: `Address: ${group[0]}`, checked: false })
    })
  } else if (rule.type === 'word_count') {
    opts.push({ id: `${rule.id}-fix-0`, label: 'Expand the section with substantive content', checked: false })
  } else if (rule.type === 'quantified_items') {
    opts.push({ id: `${rule.id}-fix-0`, label: `Add at least ${rule.minCount} quantified statements`, checked: false })
  }
  // Always include the guidance as an explicit actionable option.
  opts.push({ id: `${rule.id}-fix-guidance`, label: rule.guidance, checked: false })
  return opts
}

export interface AnalyzedSection extends ProspectusSection {
  /** Raw rule evaluations for transparency / debugging. */
  ruleEvaluations: RuleEvaluation[]
  metrics: ExtractedMetrics
  /** True when no content was supplied and the section could not be scored. */
  empty: boolean
}

/**
 * Analyze a single section's content against its rule config.
 */
export function analyzeSection(config: SectionRuleConfig, content: string): AnalyzedSection {
  const text = (content || '').trim()
  const empty = countWords(text) === 0

  const { result, metrics } = evaluateSectionRules(config, text)

  const issues: Issue[] = []
  const gaps: Gap[] = []

  result.evaluations.forEach((ev) => {
    if (ev.passed) return
    const rule = config.rules.find((r) => r.id === ev.ruleId)!

    if (rule.reportAsGap) {
      gaps.push({
        id: `${config.id}-${rule.id}`,
        category: rule.gapCategory || rule.label,
        description: ev.detail,
        required: rule.severity !== 'minor',
        status: 'open',
      })
    } else {
      issues.push({
        id: `${config.id}-${rule.id}`,
        severity: rule.severity,
        description: rule.label,
        rootCause: ev.detail,
        fixOptions: buildFixOptions(rule, ev),
        guidance: rule.guidance,
        exampleLink: rule.exampleLink,
      })
    }
  })

  // An empty section is treated as fully incomplete with a single critical gap.
  const completeness = empty ? 0 : result.score
  const strength = empty ? 1 : scoreToStrength(result.score)

  if (empty) {
    gaps.unshift({
      id: `${config.id}-empty`,
      category: 'Missing Section',
      description: `${config.name} has no content yet. Draft this section in the Prospectus Builder.`,
      required: true,
      status: 'open',
    })
  }

  return {
    id: config.id,
    name: config.name,
    strength,
    status: strengthToStatus(strength),
    issueCount: issues.length,
    gapCount: gaps.length,
    completeness,
    issues,
    gaps,
    ruleEvaluations: result.evaluations,
    metrics,
    empty,
  }
}

/**
 * Analyze a full set of sections.
 *
 * @param sectionContents map of either rule-config section id OR raw DB
 *   section name -> content string.
 * @returns one AnalyzedSection per configured section (in ruleset order). If
 *   no content is supplied for a configured section it is still returned (as
 *   an empty section) so the dashboard always shows the full structure.
 */
export function analyzeProspectus(sectionContents: Record<string, string>): AnalyzedSection[] {
  // Build a lookup from rule-config id -> resolved content.
  const resolved: Record<string, string> = {}

  for (const [rawKey, content] of Object.entries(sectionContents)) {
    if (content == null) continue
    const config = resolveSectionConfig(rawKey)
    if (!config) continue
    // If multiple inputs map to the same config, concatenate them.
    resolved[config.id] = resolved[config.id] ? `${resolved[config.id]}\n\n${content}` : content
  }

  return VALIDATION_RULESET.map((config) => analyzeSection(config, resolved[config.id] || ''))
}

/** Overall prospectus score (0-100) = average of section scores. */
export function computeOverallScore(sections: AnalyzedSection[]): number {
  if (!sections.length) return 0
  const total = sections.reduce((sum, s) => sum + s.completeness, 0)
  return Math.round(total / sections.length)
}

/**
 * Strip analyzer-only fields, returning the plain ProspectusSection[] the
 * dashboard component expects.
 */
export function toDashboardSections(sections: AnalyzedSection[]): ProspectusSection[] {
  return sections.map(({ ruleEvaluations: _re, metrics: _m, empty: _e, ...rest }) => rest)
}
