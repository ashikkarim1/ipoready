// ═══════════════════════════════════════════════════════════════════════
// Guidance Library Data
// ═══════════════════════════════════════════════════════════════════════

import type {
  GuidanceArticle,
  GuidanceDetail,
  GuidanceTemplate,
  ProspectusExample,
  GuidanceCategory,
} from './types/guidance.types'

// ── Guidance Articles ────────────────────────────────────────────────────

export const GUIDANCE_ARTICLES: GuidanceArticle[] = [
  {
    id: 'risk-factors-comprehensive',
    title: 'How to Write Comprehensive Risk Factors',
    category: 'risk-factors',
    difficulty: 'intermediate',
    readingTimeMinutes: 5,
    description: 'Learn how to articulate business risks in a way that satisfies regulatory requirements while being specific to your company.',
    rating: 4.8,
    helpfulCount: 324,
    totalRatings: 378,
    views: 2847,
    createdDate: '2025-03-01',
    updatedDate: '2025-05-15',
  },
  {
    id: 'executive-summary-concise',
    title: 'Writing a Compelling Executive Summary',
    category: 'executive-summary',
    difficulty: 'beginner',
    readingTimeMinutes: 4,
    description: 'The executive summary is investors first impression. Learn how to distill your company story into compelling narrative.',
    rating: 4.7,
    helpfulCount: 451,
    totalRatings: 512,
    views: 3124,
    createdDate: '2025-02-15',
    updatedDate: '2025-05-10',
  },
  {
    id: 'md-a-structure',
    title: 'MD&A: Structure and Best Practices',
    category: 'financial-da',
    difficulty: 'intermediate',
    readingTimeMinutes: 7,
    description: 'Management Discussion & Analysis is critical for investor understanding. Discover the winning structure and what to emphasize.',
    rating: 4.6,
    helpfulCount: 298,
    totalRatings: 342,
    views: 2156,
    createdDate: '2025-03-10',
    updatedDate: '2025-05-12',
  },
  {
    id: 'management-bios-professional',
    title: 'Presenting Management Bios Effectively',
    category: 'management',
    difficulty: 'beginner',
    readingTimeMinutes: 3,
    description: 'Show investor confidence through professional, impactful bios that highlight relevant experience and achievements.',
    rating: 4.5,
    helpfulCount: 187,
    totalRatings: 221,
    views: 1654,
    createdDate: '2025-02-28',
    updatedDate: '2025-05-08',
  },
  {
    id: 'use-of-proceeds-clarity',
    title: 'Detailing Use of Proceeds with Clarity',
    category: 'use-of-proceeds',
    difficulty: 'intermediate',
    readingTimeMinutes: 4,
    description: 'Investors want to know exactly how you will deploy capital. Learn how to present use of proceeds clearly and credibly.',
    rating: 4.9,
    helpfulCount: 412,
    totalRatings: 458,
    views: 3421,
    createdDate: '2025-03-05',
    updatedDate: '2025-05-18',
  },
  {
    id: 'market-opportunity-sizing',
    title: 'Sizing Your Total Addressable Market',
    category: 'market',
    difficulty: 'advanced',
    readingTimeMinutes: 8,
    description: 'TAM sizing is both art and science. Learn how successful companies articulate and defend their market opportunity.',
    rating: 4.7,
    helpfulCount: 356,
    totalRatings: 412,
    views: 2934,
    createdDate: '2025-03-15',
    updatedDate: '2025-05-14',
  },
  {
    id: 'capitalization-clarity',
    title: 'Clear Capitalization Structure Explanation',
    category: 'capitalization',
    difficulty: 'intermediate',
    readingTimeMinutes: 6,
    description: 'Your cap table matters. Learn how to present shares, options, and warrants in ways that instill investor confidence.',
    rating: 4.6,
    helpfulCount: 267,
    totalRatings: 312,
    views: 1876,
    createdDate: '2025-03-20',
    updatedDate: '2025-05-16',
  },
]

// ── Detailed Guidance Content ────────────────────────────────────────────

export const RISK_FACTORS_DETAIL: GuidanceDetail = {
  id: 'risk-factors-comprehensive',
  articleId: 'risk-factors-comprehensive',
  article: GUIDANCE_ARTICLES[0],
  summary:
    'Risk Factors are required disclosures that articulate material business, market, and operational risks. Strong risk factors are specific to your company, quantified, and explain the potential financial impact.',
  whatMakesItStrong: [
    'Specific to your business model and competitive position',
    'Quantified with concrete numbers or percentages',
    'Explains the financial or operational impact',
    'Addresses both the risk and why investors should care',
    'Mirrors risks identified in other regulatory filings',
  ],
  whyItMatters:
    'Investors and regulators scrutinize risk factors heavily. Strong risk disclosures demonstrate management sophistication and reduce litigation risk post-IPO. Weak risk factors suggest the company hasnt deeply thought through challenges.',
  industryBenchmarks: [
    {
      metric: 'Average Risk Factors Section Length',
      average: 1200,
      yourScore: 450,
      unit: 'words',
      explanation: 'Your section is significantly shorter than industry average. Consider expanding to cover more comprehensive risks.',
    },
    {
      metric: 'Number of Risk Categories',
      average: 12,
      yourScore: 5,
      unit: 'categories',
      explanation: 'Most companies address 10-15 risk categories. You may want to add risks around regulations, technology, and personnel.',
    },
  ],
  examples: [
    {
      id: 'weak-risk-example',
      quality: 'weak',
      companyName: 'Example Company',
      industry: 'SaaS',
      text: 'We face competition from other companies in our market. Our competitors may have more resources than we do.',
      highlights: [],
      reasoning: 'This example is too vague and generic. It could apply to almost any company.',
      strengths: [],
      weaknesses: ['No specific competitors mentioned', 'No quantification', 'No financial impact articulated', 'Lacks specificity'],
      benchmarks: [
        {
          label: 'Specificity Score',
          value: '1/5',
          comparison: 'Far below industry standard',
        },
      ],
    },
    {
      id: 'passable-risk-example',
      quality: 'passable',
      companyName: 'Example Company',
      industry: 'SaaS',
      text: 'We compete with Salesforce, Microsoft, and other large software vendors. These companies have greater resources and market presence. If we fail to compete effectively, our revenue could be negatively impacted.',
      highlights: [],
      reasoning: 'This identifies real competitors and acknowledges the disadvantage, but still lacks depth and quantification.',
      strengths: [
        'Specific competitors named',
        'Acknowledges relative disadvantage',
        'Mentions business impact',
      ],
      weaknesses: ['No quantified scale of competition', 'No explanation of differentiation strategy', 'Vague impact statement'],
      benchmarks: [
        {
          label: 'Specificity Score',
          value: '3/5',
          comparison: 'Meets minimum requirements',
        },
      ],
    },
    {
      id: 'defendable-risk-example',
      quality: 'defendable',
      companyName: 'Example Company',
      industry: 'SaaS',
      text: 'We operate in the customer relationship management (CRM) market, which is dominated by established competitors including Salesforce, Microsoft Dynamics, and Oracle, each with $10+ billion in annual revenue. These competitors have advantages in brand recognition, customer relationships, and resources for R&D. If we fail to maintain our competitive advantages in ease-of-use and vertical-specific features, we could experience customer churn exceeding 5-10% annually, which would materially impact revenue.',
      highlights: [],
      reasoning: 'This clearly identifies the competitive landscape with scale, explains the threat, and quantifies potential business impact.',
      strengths: [
        'Market size and competitor scale quantified',
        'Specific competitive advantages articulated',
        'Quantified business impact (5-10% churn)',
        'Explains what could trigger the risk',
      ],
      weaknesses: [],
      benchmarks: [
        {
          label: 'Specificity Score',
          value: '4.5/5',
          comparison: 'Strong regulatory standard',
        },
      ],
    },
    {
      id: 'strong-risk-example',
      quality: 'strong',
      companyName: 'Example Company',
      industry: 'SaaS',
      text: 'We operate in the enterprise CRM market, which is dominated by established competitors. Salesforce, Microsoft, and Oracle control approximately 65% of the $190 billion market and each has annual R&D budgets exceeding $10 billion—approximately 5x our projected revenue. These competitors have significant advantages in: (1) brand recognition and enterprise relationships built over 20+ years; (2) scale enabling them to invest heavily in innovation; and (3) the ability to integrate CRM with complementary solutions. Our competitive position depends on our ability to: (i) maintain differentiation through superior ease-of-use and vertical-specific functionality; (ii) build switching costs through customer success and customization; and (iii) expand our customer base in our target verticals. If we fail to maintain these competitive advantages, we could experience annual customer churn in excess of 10%, which given our gross margin profile would reduce EBITDA by more than $50 million annually and materially impair our financial results. Additionally, our larger competitors could imitate our key features or acquire similar competitors, further pressuring our market position.',
      highlights: [],
      reasoning:
        'This is a comprehensive risk disclosure that would satisfy experienced investors and regulatory reviewers. It quantifies the threat, explains the dynamic, and articulates cascading impacts.',
      strengths: [
        'Specific market data (65% concentration, $190B market)',
        'Competitor scale quantified ($10B R&D vs. our revenue)',
        'Competitive advantages explicitly stated and enumerated',
        'Competitive risks clearly articulated with scenarios',
        'Financial impact quantified ($50M+ EBITDA reduction, >10% churn)',
        'Explains strategic responses and potential failure modes',
      ],
      benchmarks: [
        {
          label: 'Specificity Score',
          value: '5/5',
          comparison: 'Exceeds industry standard',
        },
      ],
    },
  ],
  templates: [
    {
      id: 'risk-template-competitive',
      name: 'Competitive Risk Template',
      category: 'risk-factors',
      description: 'Use this template to articulate competitive risks with proper quantification and impact.',
      placeholders: [
        {
          key: 'MARKET_NAME',
          label: 'Market Name',
          hint: 'e.g., Enterprise CRM, Cloud Infrastructure, Digital Marketing',
        },
        {
          key: 'MARKET_SIZE',
          label: 'Total Addressable Market',
          hint: 'e.g., $190 billion',
        },
        {
          key: 'TOP_COMPETITORS',
          label: 'Top Competitors',
          hint: 'Name 2-4 largest competitors',
        },
        {
          key: 'THEIR_SCALE',
          label: 'Competitor Scale Metric',
          hint: 'e.g., Each has $10B+ annual R&D',
        },
        {
          key: 'OUR_ADVANTAGES',
          label: 'Our Competitive Advantages',
          hint: 'List 2-3 key differentiators (ease-of-use, vertical focus, etc)',
        },
        {
          key: 'FAILURE_SCENARIO',
          label: 'Failure Scenario Impact',
          hint: 'e.g., Customer churn exceeding 10% or $50M EBITDA impact',
        },
      ],
      templateText: `We operate in the [MARKET_NAME] market, which is dominated by established competitors. [TOP_COMPETITORS] control a significant portion of the [MARKET_SIZE] market. These competitors have significant advantages in: (1) brand recognition and relationships; (2) scale enabling investment in innovation; and (3) resources to integrate with complementary solutions.

Our competitive position depends on our ability to: (i) [OUR_ADVANTAGES_ITEM_1]; (ii) [OUR_ADVANTAGES_ITEM_2]; and (iii) [OUR_ADVANTAGES_ITEM_3].

If we fail to maintain these competitive advantages, we could experience [FAILURE_SCENARIO], which would materially harm our financial results.`,
      exampleOutput: `We operate in the enterprise CRM market, which is dominated by established competitors. Salesforce, Microsoft, and Oracle control a significant portion of the $190 billion market. These competitors have significant advantages in: (1) brand recognition and relationships built over decades; (2) scale enabling investment in innovation; and (3) resources to integrate with complementary solutions.

Our competitive position depends on our ability to: (i) maintain superior ease-of-use compared to legacy competitors; (ii) provide deep vertical-specific functionality; and (iii) build high switching costs through exceptional customer success.

If we fail to maintain these competitive advantages, we could experience annual customer churn exceeding 10%, which would reduce EBITDA by more than $50 million annually and materially harm our financial results.`,
      difficulty: 'intermediate',
    },
  ],
  relatedTopics: ['market-opportunity-sizing', 'management-strategy', 'financial-impact-analysis'],
}

export const EXECUTIVE_SUMMARY_DETAIL: GuidanceDetail = {
  id: 'executive-summary-concise',
  articleId: 'executive-summary-concise',
  article: GUIDANCE_ARTICLES[1],
  summary:
    'The Executive Summary is the most-read section of a prospectus. It must succinctly convey why your company matters, what problem you solve, your competitive advantage, and why now is the time to go public.',
  whatMakesItStrong: [
    'Opens with a compelling hook about the market opportunity',
    'Clearly articulates the problem you solve and for whom',
    'Explains your differentiation concisely (not just product features)',
    'Includes key metrics that demonstrate traction (growth, customer base, revenue)',
    'Explains why you are going public and what you will do with proceeds',
    'Maintains narrative flow that draws readers into the full prospectus',
  ],
  whyItMatters:
    'Busy investors and analysts may only read your Executive Summary. Make it count. A strong Executive Summary gets them engaged enough to dive into the details. A weak one means they may skip your company entirely.',
  industryBenchmarks: [
    {
      metric: 'Executive Summary Length',
      average: 800,
      yourScore: 250,
      unit: 'words',
      explanation: 'Executive summaries typically range from 600-1200 words. Your summary could benefit from more detail.',
    },
    {
      metric: 'Key Metrics Disclosed',
      average: 8,
      yourScore: 3,
      unit: 'metrics',
      explanation: 'Strong summaries include customer growth, revenue growth, and market share metrics. Consider adding more.',
    },
  ],
  examples: [
    {
      id: 'weak-exec-example',
      quality: 'weak',
      companyName: 'Example Company',
      industry: 'SaaS',
      text: 'We are a software company that helps businesses manage their customers. We have a great product and a talented team. We are going public to raise capital for growth.',
      highlights: [],
      reasoning: 'This reads like a first draft. It gives no sense of why the company matters or what makes it special.',
      strengths: [],
      weaknesses: [
        'No market context or opportunity size',
        'No specific problem statement',
        'Vague product description',
        'No traction metrics',
        'No differentiation',
      ],
      benchmarks: [
        {
          label: 'Compelling Narrative Score',
          value: '1/5',
          comparison: 'Significantly below market standard',
        },
      ],
    },
    {
      id: 'strong-exec-example',
      quality: 'strong',
      companyName: 'Example Company',
      industry: 'SaaS',
      text: `The global enterprise customer relationship management (CRM) market is a $190 billion opportunity growing at 12% annually. Today, enterprises struggle with fragmented systems that fail to deliver a unified view of the customer. Legacy systems were built for a different era—they are complex, require armies of consultants to deploy, and fail to deliver the insights needed for modern marketing.

We created a different kind of CRM. Built on modern architecture and powered by AI, our platform delivers a unified customer view in days, not months. It learns from every customer interaction and automatically surfaces the next best action. Our customers love it: we have achieved 96% net revenue retention, a 3-year annual growth rate of 62%, and our customers span 72 countries across 45+ industries.

Today, we serve 1,200+ enterprises generating $340 million in annual recurring revenue. Our customers include household names like Acme Corp and Global Industries, as well as rapidly growing companies like NextGen Tech. Since our Series D in 2024, we have grown customers by 34%, expanded ARR by 41%, and improved gross margins to 72%.

We are going public now because: (1) we have achieved scale and profitability; (2) the AI-driven CRM category we pioneered is accelerating, with no slowdown in sight; and (3) the market is ready to bet on a new standard for CRM.

We are raising $500 million to accelerate product innovation, expand internationally, and fund strategic acquisitions in complementary categories.`,
      highlights: [],
      reasoning:
        'This executive summary immediately establishes market context, describes the problem, shows traction with concrete metrics, and explains the IPO rationale.',
      strengths: [
        'Opens with market size and growth',
        'Clear problem statement',
        'Specific, quantified differentiation (96% NRR, 62% growth)',
        'Customer validation with specific examples',
        'Financial metrics (ARR, gross margins)',
        'Clear IPO rationale',
        'Specific use of proceeds',
      ],
      benchmarks: [
        {
          label: 'Compelling Narrative Score',
          value: '5/5',
          comparison: 'Exceeds market standard',
        },
      ],
    },
  ],
  templates: [
    {
      id: 'exec-summary-template',
      name: 'Executive Summary Framework',
      category: 'executive-summary',
      description: 'A proven structure for executive summaries that captures investor attention.',
      placeholders: [
        {
          key: 'MARKET_SIZE',
          label: 'Total Addressable Market',
          hint: 'e.g., $190 billion',
        },
        {
          key: 'MARKET_GROWTH',
          label: 'Market Growth Rate',
          hint: 'e.g., 12% annually',
        },
        {
          key: 'MARKET_PROBLEM',
          label: 'The Problem in the Market',
          hint: 'What is broken or unmet?',
        },
        {
          key: 'YOUR_SOLUTION',
          label: 'Your Solution',
          hint: 'How do you solve it differently?',
        },
        {
          key: 'KEY_METRICS',
          label: 'Key Traction Metrics',
          hint: 'e.g., NRR 96%, ARR $340M, 62% growth',
        },
        {
          key: 'IPO_RATIONALE',
          label: 'Why Go Public Now',
          hint: 'List 2-3 reasons',
        },
      ],
      templateText: `The [MARKET_SIZE] [MARKET_NAME] market is growing at [MARKET_GROWTH] annually. [MARKET_PROBLEM].

We created a different approach. [YOUR_SOLUTION]. Our customers love it: [KEY_METRICS].

Today, we serve [CUSTOMER_COUNT] customers generating [ARR]. Our customers include [CUSTOMER_EXAMPLES].

We are going public because: [IPO_RATIONALE].

We are raising [CAPITAL_AMOUNT] to [USE_OF_PROCEEDS].`,
      exampleOutput: `The $190 billion enterprise CRM market is growing at 12% annually. Today, enterprises struggle with fragmented legacy systems that fail to deliver unified customer insights.

We created a different approach: AI-powered, modern CRM that delivers unified views in days, not months. Our customers love it: 96% NRR, 62% annual growth, customers in 72 countries.

Today, we serve 1,200+ customers generating $340M ARR. Our customers include Acme Corp, Global Industries, and NextGen Tech.

We are going public because: (1) we have achieved scale and profitability; (2) the market is accelerating; (3) customers are ready for a new standard.

We are raising $500 million to accelerate innovation, expand internationally, and fund acquisitions.`,
      difficulty: 'beginner',
    },
  ],
  relatedTopics: ['market-opportunity-sizing', 'competitive-landscape', 'business-strategy'],
}

// ── All Templates ────────────────────────────────────────────────────────

export const ALL_TEMPLATES: GuidanceTemplate[] = [
  RISK_FACTORS_DETAIL.templates[0],
  EXECUTIVE_SUMMARY_DETAIL.templates[0],
]

// ── Category Info ────────────────────────────────────────────────────────

export const CATEGORY_INFO: Record<
  GuidanceCategory,
  {
    name: string
    description: string
    icon: string
  }
> = {
  'executive-summary': {
    name: 'Executive Summary',
    description: 'The hook that gets investors reading',
    icon: '📄',
  },
  'risk-factors': {
    name: 'Risk Factors',
    description: 'Articulating material business risks',
    icon: '⚠️',
  },
  'financial-da': {
    name: 'Financial D&A',
    description: 'Management Discussion & Analysis',
    icon: '📊',
  },
  management: {
    name: 'Management',
    description: 'Team bios and organizational structure',
    icon: '👥',
  },
  'use-of-proceeds': {
    name: 'Use of Proceeds',
    description: 'How capital will be deployed',
    icon: '💰',
  },
  market: {
    name: 'Market Opportunity',
    description: 'Total addressable market and sizing',
    icon: '🌍',
  },
  capitalization: {
    name: 'Capitalization Structure',
    description: 'Cap table, shares, and equity clarity',
    icon: '📈',
  },
}

// ── Utility Functions ────────────────────────────────────────────────────

export function getGuidanceByCategory(category: GuidanceCategory): GuidanceArticle[] {
  return GUIDANCE_ARTICLES.filter((article) => article.category === category)
}

export function getDetailedGuidance(articleId: string): GuidanceDetail | null {
  if (articleId === 'risk-factors-comprehensive') return RISK_FACTORS_DETAIL
  if (articleId === 'executive-summary-concise') return EXECUTIVE_SUMMARY_DETAIL
  return null
}

export function searchGuidance(query: string): GuidanceArticle[] {
  const lowerQuery = query.toLowerCase()
  return GUIDANCE_ARTICLES.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.category.toLowerCase().includes(lowerQuery)
  )
}
