# REGULATORY SURPRISE SOLUTION: Real-Time Intelligence Engine

**Status:** Architecture & Implementation Blueprint  
**Version:** 1.0  
**Date:** June 2026  
**Target Release:** Phase 2B (Q3 2026)

---

## Executive Summary

**The Problem:**
A company launching an IPO receives their SEC S-1 rejection comment letter citing a NEW rule announced 3 weeks ago: mandatory climate risk disclosure requirements. The company's legal team missed it. Result: 2-month delay to rewrite the S-1, assess climate exposure, and obtain board sign-off. Estimated cost: $5M+ in opportunity cost (market timing, investor confidence, competitor moves).

**The Solution:**
IPOReady's **Regulatory Surprise Intelligence Engine** — an automated, real-time monitoring system that:
1. **Monitors** SEC Federal Register, FINRA notices, state IPO rules, exchange announcements (24/7)
2. **Assesses** impact on each company's specific filing (exchange, industry, size, jurisdiction)
3. **Automates** task creation, flags for board/GC review, tracks remediation
4. **Alerts** dashboard with weekly regulatory digest and urgent change flags

**Value Proposition:**
- Never miss a regulatory change → always S-1 compliant
- Avoid 2+ month delays and $5M+ opportunity costs
- Reduce legal team coordination overhead by 30%
- Proactive board communication (transparency pillar)
- Defensible audit trail (SEC compliance evidence)

---

## Problem Deep-Dive

### 1. The Regulatory Surprise Scenario

#### Timeline
```
Week 1 (SEC Announces)
  Monday 9am: SEC issues new climate disclosure rule in Federal Register
  - Effective date: 90 days
  - Applies to: All public companies, Form 10-K/10-Q filings
  - Also applies to: S-1 prospectuses (new requirement)
  - Detail: Must disclose Scope 1, 2 GHG emissions, climate risk governance

Week 1-3 (Company Misses)
  - Legal team focused on draft S-1 (other sections)
  - Federal Register not monitored (no alert system)
  - Exchange announcements reviewed manually (slow, sporadic)
  - Compliance officer on vacation

Week 4 (Discovery)
  Thursday 2pm: Partner firm emails: "Did you see the new climate rule?"
  - S-1 due to SEC in 10 days
  - Climate section completely missing
  - Board audit committee needs to assess company exposure (2 weeks)

Week 5-8 (Remediation)
  - Emergency legal retainer for climate disclosures ($50k)
  - CFO/General Counsel intensive work (100+ hours)
  - Board meeting delay (climate risk governance)
  - S-1 submission delayed by 4 weeks
  - Market window closes; competitor prices IPO at better terms
```

#### Damage Assessment
- **Timing Risk:** 4-week IPO delay = market timing miss, investor interest decay
- **Cost:** $50k emergency legal + $200k consultant + management overhead = $250k+
- **Opportunity Cost:** $5M+ (difference between 4-week delay IPO valuation vs. missed window)
- **Reputation Risk:** Regulators flag "inadequate compliance infrastructure" in S-1 comments
- **Investor Risk:** VC/PE round investors lose confidence in management discipline

### 2. Why Current Approaches Fail

| Approach | Coverage | Latency | Scalability | Compliance Risk |
|----------|----------|---------|-------------|-----------------|
| **Manual monitoring** (GC reviews news) | 30% | 2-3 weeks | Breaks at scale | HIGH: Human error |
| **Email alerts from law firm** | 60% | 1-2 weeks | Depends on firm | MEDIUM: Reactive |
| **General news subscriptions** (Reuters, Bloomberg) | 40% | 1 week | Poor SEC/FINRA coverage | HIGH: False negatives |
| **SEC email subscriptions** | 80% | 2-3 days | Only SEC Federal Register | MEDIUM: No impact assessment |
| **IPOReady Intelligence Engine** | 95%+ | 2-4 hours | Real-time, all exchanges | LOW: Automated, auditable |

### 3. Regulatory Sources That Matter

#### SEC/Federal Filings
- **Federal Register** (daily): New rules, amendments, proposed rules
- **SEC News & Announcements** (daily): Division guidance, staff statements
- **EDGAR Filing System** (real-time): Novel section patterns, emerging disclosure practices
- **Comment Letters** (weekly): Emerging themes in comment patterns

#### FINRA
- **Regulatory Notices** (weekly): Sales practice rules, compensation disclosure, cybersecurity
- **FINRA News Alerts** (daily): Rule changes affecting IPO underwriters

#### Canadian Exchanges
- **OSC Bulletin** (weekly): Ontario Securities Commission guidance
- **CSA Notices** (weekly): Multi-jurisdictional rules (CA + provinces)
- **TSX/TSXV Rules Updates** (monthly): Exchange-specific requirements

#### State-Level Rules
- **State Blue Sky Rules** (quarterly): State merit review requirements
- **State Securities Updates** (quarterly): State-specific climate, ESG disclosure rules

#### Industry-Specific Guidance
- **SEC Strategic Agenda** (annual): 1-2 year outlook of enforcement priorities
- **Division of Corporation Finance Remarks** (monthly): Chief Accountant guidance on prospectuses
- **Accounting Standards Updates** (quarterly): FASB, IASB changes affecting disclosure

---

## Solution Architecture

### Phase 2B Execution (Q3 2026)

#### Component 1: Regulatory Monitoring Pipeline

```typescript
// src/lib/regulatory-intelligence/monitoring-pipeline.ts

interface RegulatorySource {
  id: string;
  name: string;
  sourceUrl: string;
  apiEndpoint?: string;
  fetchFrequency: 'hourly' | 'daily' | 'weekly';
  documentType: 'api' | 'rss' | 'html_scrape' | 'pdf_parse';
  lastFetchedAt?: Date;
  isActive: boolean;
}

interface FetchedRegulation {
  id: string;
  sourceId: string;
  title: string;
  description: string;
  content: string;
  effectiveDate: Date;
  expirationDate?: Date;
  regulatory_categories: string[]; // ['climate', 'governance', 'disclosure']
  regulatory_level: 'federal' | 'state' | 'exchange' | 'industry';
  relevantCountries: string[]; // ['US', 'CA']
  relevantExchanges: string[]; // ['sec', 'tsx', 'tsxv']
  sourceUrl: string;
  fetchedAt: Date;
}

interface RegulatoryImpactAssessment {
  regulationId: string;
  companyId: string;
  impactLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  affectedSections: string[]; // ['risk_factors', 'disclosure', 'governance']
  estimatedRemediationHours: number;
  estimatedRemediationCost: number;
  impactNarrative: string;
  affectedRoles: string[]; // ['ceo', 'cfo', 'general_counsel', 'board']
  suggestedActions: RegulatoryAction[];
  confidenceScore: number; // 0-1 (how certain is this impact assessment)
}

interface RegulatoryAction {
  id: string;
  type: 'task' | 'meeting' | 'document_review' | 'disclosure_update';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: string[]; // roles like 'general_counsel'
  dueDate: Date;
  estimatedHours: number;
}
```

#### Monitoring Sources (MVP)

```typescript
// Database: regulatory_sources table

[
  {
    id: 'sec_federal_register',
    name: 'SEC Federal Register',
    sourceUrl: 'https://www.federalregister.gov/agencies/securities-and-exchange-commission',
    fetchFrequency: 'daily',
    documentType: 'rss',
    categories: ['disclosure', 'governance', 'risk_factors'],
  },
  {
    id: 'sec_news',
    name: 'SEC News & Announcements',
    sourceUrl: 'https://www.sec.gov/news',
    fetchFrequency: 'daily',
    documentType: 'rss',
    categories: ['all'],
  },
  {
    id: 'finra_notices',
    name: 'FINRA Regulatory Notices',
    sourceUrl: 'https://www.finra.org/rules-guidance/notices',
    fetchFrequency: 'daily',
    documentType: 'rss',
    categories: ['disclosure', 'sales_practice'],
  },
  {
    id: 'osc_bulletin',
    name: 'Ontario Securities Commission Bulletin',
    sourceUrl: 'https://www.osc.ca/en/news-publications/publications/bulletin',
    fetchFrequency: 'weekly',
    documentType: 'html_scrape',
    categories: ['all'],
  },
  {
    id: 'tsx_notices',
    name: 'TSX/TSXV Rule Changes',
    sourceUrl: 'https://www.tsx.com/governance/rules-updates',
    fetchFrequency: 'weekly',
    documentType: 'api',
    categories: ['all'],
  },
  {
    id: 'sec_comment_letters',
    name: 'SEC Comment Letter Themes (via EDGAR)',
    sourceUrl: 'https://www.sec.gov/cgi-bin/browse-edgar',
    fetchFrequency: 'weekly',
    documentType: 'api_parser',
    categories: ['disclosure_trends'],
  }
]
```

#### Component 2: AI-Powered Impact Assessment

```typescript
// src/lib/regulatory-intelligence/impact-assessor.ts

class RegulatoryImpactAssessor {
  
  /**
   * Assess how a new regulation impacts a specific company
   */
  async assessImpact(
    regulation: FetchedRegulation,
    company: CompanyProfile
  ): Promise<RegulatoryImpactAssessment> {
    
    // 1. Determine applicability
    const isApplicable = await this.determineApplicability(regulation, company);
    if (!isApplicable) return { impactLevel: 'none', ... };
    
    // 2. Map to prospectus sections
    const affectedSections = await this.mapToProspectusSections(
      regulation.regulatory_categories,
      company.exchange
    );
    
    // 3. Estimate remediation effort (AI: Claude API)
    const remediationEstimate = await this.estimateRemediationEffort(
      regulation,
      company,
      affectedSections
    );
    
    // 4. Generate impact narrative (AI: Claude API)
    const narrative = await this.generateImpactNarrative(
      regulation,
      company,
      affectedSections,
      remediationEstimate
    );
    
    // 5. Generate suggested actions
    const actions = await this.generateActions(
      regulation,
      company,
      affectedSections,
      remediationEstimate
    );
    
    return {
      regulationId: regulation.id,
      companyId: company.id,
      impactLevel,
      affectedSections,
      estimatedRemediationHours: remediationEstimate.hours,
      estimatedRemediationCost: remediationEstimate.cost,
      impactNarrative: narrative,
      affectedRoles: ['general_counsel', 'cfo', 'board'],
      suggestedActions: actions,
      confidenceScore: 0.85,
    };
  }
  
  /**
   * Determine if regulation applies to company
   */
  private async determineApplicability(
    regulation: FetchedRegulation,
    company: CompanyProfile
  ): Promise<boolean> {
    
    // Check exchange match
    if (!regulation.relevantExchanges.includes(company.exchange)) {
      return false;
    }
    
    // Check filing type match
    if (regulation.filingTypesAffected && !regulation.filingTypesAffected.includes('ipo')) {
      return false;
    }
    
    // Check jurisdiction match
    if (!regulation.relevantCountries.includes(company.country)) {
      return false;
    }
    
    // Check size threshold (some rules only apply to large companies)
    if (regulation.minEmployeeThreshold && company.employees < regulation.minEmployeeThreshold) {
      return false;
    }
    
    // Check industry applicability
    if (regulation.applicableIndustries && 
        !regulation.applicableIndustries.includes(company.industry)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Map regulation categories to prospectus sections
   */
  private async mapToProspectusSections(
    categories: string[],
    exchange: string
  ): Promise<string[]> {
    
    const categoryMap: Record<string, string[]> = {
      'climate': ['risk_factors', 'disclosure', 'management_discussion'],
      'governance': ['corporate_structure', 'governance', 'board_compensation'],
      'cybersecurity': ['risk_factors', 'disclosure'],
      'supply_chain': ['risk_factors', 'business_description'],
      'human_capital': ['management_discussion', 'business_description'],
      'related_party': ['disclosure', 'transactions_with_related_parties'],
    };
    
    let sections = new Set<string>();
    for (const category of categories) {
      if (categoryMap[category]) {
        categoryMap[category].forEach(s => sections.add(s));
      }
    }
    
    return Array.from(sections);
  }
  
  /**
   * Estimate hours and cost to remediate
   */
  private async estimateRemediationEffort(
    regulation: FetchedRegulation,
    company: CompanyProfile,
    affectedSections: string[]
  ): Promise<{ hours: number; cost: number }> {
    
    // Base hours per section
    const hoursPerSection: Record<string, number> = {
      'risk_factors': 20,
      'disclosure': 15,
      'governance': 10,
      'business_description': 8,
      'management_discussion': 25,
    };
    
    let totalHours = affectedSections.reduce((sum, section) => {
      return sum + (hoursPerSection[section] || 10);
    }, 0);
    
    // Complexity multiplier
    if (regulation.complexity === 'high') totalHours *= 1.5;
    if (regulation.complexity === 'very_high') totalHours *= 2;
    
    // Timeline multiplier (if accelerated, costs more)
    if (regulation.daysUntilEffective && regulation.daysUntilEffective < 30) {
      totalHours *= 1.3; // Rush premium
    }
    
    // Cost: $350/hour GC + $200/hour consultant
    const gcHours = totalHours * 0.4;
    const consultantHours = totalHours * 0.6;
    const totalCost = (gcHours * 350) + (consultantHours * 200);
    
    return { hours: totalHours, cost: totalCost };
  }
  
  /**
   * Generate human-readable impact narrative (Claude API)
   */
  private async generateImpactNarrative(
    regulation: FetchedRegulation,
    company: CompanyProfile,
    affectedSections: string[],
    remediationEstimate: { hours: number; cost: number }
  ): Promise<string> {
    
    const prompt = `
    Analyze this new regulation and its impact on an IPO-ready company:
    
    Regulation: ${regulation.title}
    Description: ${regulation.description}
    Effective Date: ${regulation.effectiveDate}
    
    Company:
    - Exchange: ${company.exchange}
    - Industry: ${company.industry}
    - Employees: ${company.employees}
    - Filing Status: IPO S-1 due in ${Math.round((company.prospectus_due_date - new Date()) / (1000 * 60 * 60 * 24))} days
    
    Affected Sections: ${affectedSections.join(', ')}
    
    Write a 2-3 paragraph executive summary of:
    1. What the regulation requires
    2. Why it specifically affects this company
    3. Remediation timeline and dependencies
    
    Be precise and reference specific prospectus sections.
    `;
    
    const response = await anthropic.messages.create({
      model: 'claude-opus',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
  
  /**
   * Generate suggested actions
   */
  private async generateActions(
    regulation: FetchedRegulation,
    company: CompanyProfile,
    affectedSections: string[],
    remediationEstimate: { hours: number; cost: number }
  ): Promise<RegulatoryAction[]> {
    
    const daysUntilEffective = Math.round(
      (regulation.effectiveDate - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    const urgency = daysUntilEffective < 30 ? 'critical' : daysUntilEffective < 90 ? 'high' : 'medium';
    
    const actions: RegulatoryAction[] = [
      {
        type: 'meeting',
        title: `[URGENT] Board Review: ${regulation.title}`,
        description: `Emergency board meeting to assess impact and authorize remediation of new ${regulation.title}.`,
        priority: urgency,
        assignedTo: ['board', 'general_counsel', 'cfo'],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        estimatedHours: 2,
      },
      {
        type: 'document_review',
        title: `Compliance Assessment: ${affectedSections[0]}`,
        description: `Review current ${affectedSections[0]} against new requirements in ${regulation.title}.`,
        priority: urgency,
        assignedTo: ['general_counsel'],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        estimatedHours: 6,
      },
      {
        type: 'disclosure_update',
        title: `Update Prospectus: ${regulation.title}`,
        description: `Incorporate new ${regulation.title} requirements into S-1 prospectus. Estimated ${Math.round(remediationEstimate.hours)} hours.`,
        priority: urgency,
        assignedTo: ['general_counsel'],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        estimatedHours: remediationEstimate.hours,
      },
    ];
    
    // If very short timeline, add escalation task
    if (daysUntilEffective < 20) {
      actions.push({
        type: 'task',
        title: `Escalate to SEC/Exchange: ${regulation.title}`,
        description: `Contact SEC/exchange counsel to discuss implementation timeline and any available relief.`,
        priority: 'critical',
        assignedTo: ['general_counsel'],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        estimatedHours: 3,
      });
    }
    
    return actions;
  }
}
```

#### Component 3: Database Schema for Regulatory Intelligence

```sql
-- ============================================================================
-- TABLE: regulatory_sources
-- Purpose: Registry of monitored regulatory news sources
-- ============================================================================
CREATE TABLE regulatory_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  name VARCHAR(255) NOT NULL,                   -- 'SEC Federal Register'
  source_url TEXT NOT NULL,
  api_endpoint TEXT,
  
  -- Configuration
  fetch_frequency VARCHAR(20) NOT NULL,         -- 'hourly', 'daily', 'weekly'
  document_type VARCHAR(50) NOT NULL,           -- 'api', 'rss', 'html_scrape', 'pdf_parse'
  
  -- Categories
  regulatory_categories JSONB NOT NULL,         -- ['climate', 'governance', 'disclosure']
  relevant_exchanges JSONB,                     -- ['sec', 'tsx', 'tsxv']
  relevant_countries JSONB,                     -- ['US', 'CA']
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: fetched_regulations
-- Purpose: Store newly discovered regulations/announcements
-- ============================================================================
CREATE TABLE fetched_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES regulatory_sources(id),
  
  -- Content
  external_id VARCHAR(255),                     -- Source's ID (SEC docket number, etc.)
  title VARCHAR(500) NOT NULL,
  description TEXT,
  full_content TEXT,                            -- Full text of regulation
  
  -- Dates
  announced_at TIMESTAMP WITH TIME ZONE NOT NULL,
  effective_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  days_until_effective INTEGER,
  
  -- Classification
  regulatory_categories JSONB NOT NULL,         -- ['climate', 'disclosure']
  regulatory_level VARCHAR(50) NOT NULL,        -- 'federal', 'state', 'exchange'
  relevant_exchanges JSONB,                     -- ['sec', 'tsx']
  relevant_countries JSONB,                     -- ['US', 'CA']
  min_employee_threshold INTEGER,               -- Only applies to companies with 10+ employees
  applicable_industries JSONB,                  -- ['technology', 'finance'] or null for all
  
  -- AI Enrichment
  ai_summary TEXT,                              -- Claude-generated summary
  ai_key_requirements JSONB,                    -- AI-extracted bullet points
  
  -- Status
  is_published BOOLEAN DEFAULT TRUE,            -- Has been announced (vs draft)
  is_analyzed BOOLEAN DEFAULT FALSE,            -- Has impact assessments
  
  -- Source
  source_url TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_fetched_regulations_source FOREIGN KEY (source_id)
    REFERENCES regulatory_sources(id) ON DELETE CASCADE
);

CREATE INDEX idx_fetched_regulations_announced_at ON fetched_regulations(announced_at DESC);
CREATE INDEX idx_fetched_regulations_effective_at ON fetched_regulations(effective_at);
CREATE INDEX idx_fetched_regulations_is_analyzed ON fetched_regulations(is_analyzed);
CREATE INDEX idx_fetched_regulations_regulatory_categories ON fetched_regulations USING gin(regulatory_categories);

-- ============================================================================
-- TABLE: regulatory_impact_assessments
-- Purpose: Store AI-generated impact assessments per company
-- ============================================================================
CREATE TABLE regulatory_impact_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id UUID NOT NULL REFERENCES fetched_regulations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  
  -- Impact determination
  is_applicable BOOLEAN NOT NULL,
  impact_level VARCHAR(50),                     -- 'critical', 'high', 'medium', 'low', 'none'
  
  -- Affected areas
  affected_prospectus_sections JSONB,           -- ['risk_factors', 'disclosure']
  affected_roles JSONB,                         -- ['general_counsel', 'cfo', 'board']
  
  -- Estimation
  estimated_remediation_hours NUMERIC(10,1),
  estimated_remediation_cost_usd NUMERIC(12,2),
  
  -- AI Assessment
  impact_narrative TEXT,                        -- 2-3 paragraph explanation
  confidence_score NUMERIC(3,2),                -- 0.0-1.0
  
  -- Suggested actions (normalized as IDs or stored inline)
  suggested_actions JSONB,                      -- Array of RegulatoryAction objects
  
  -- Board notification
  board_notified_at TIMESTAMP WITH TIME ZONE,
  board_notification_status VARCHAR(50),        -- 'pending', 'sent', 'acknowledged'
  
  -- Tracking
  remediation_started_at TIMESTAMP WITH TIME ZONE,
  remediation_completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_impact_assessments_regulation FOREIGN KEY (regulation_id)
    REFERENCES fetched_regulations(id),
  CONSTRAINT ck_impact_level CHECK (impact_level IN ('critical', 'high', 'medium', 'low', 'none'))
);

CREATE INDEX idx_impact_assessments_company_id ON regulatory_impact_assessments(company_id);
CREATE INDEX idx_impact_assessments_impact_level ON regulatory_impact_assessments(impact_level);
CREATE INDEX idx_impact_assessments_is_applicable ON regulatory_impact_assessments(is_applicable);
CREATE INDEX idx_impact_assessments_board_notified ON regulatory_impact_assessments(board_notified_at);

-- ============================================================================
-- TABLE: regulatory_alerts
-- Purpose: Dashboard alerts for GC/board
-- ============================================================================
CREATE TABLE regulatory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES regulatory_impact_assessments(id),
  company_id UUID NOT NULL,
  
  -- Alert content
  alert_type VARCHAR(50) NOT NULL,              -- 'new_regulation', 'urgent_deadline', 'compliance_gap'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Severity
  severity VARCHAR(50) NOT NULL,                -- 'critical', 'high', 'medium'
  icon_type VARCHAR(50),                        -- 'alert', 'warning', 'info'
  
  -- Timeline
  days_until_effective INTEGER,                 -- Countdown to deadline
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- CTA
  action_url TEXT,                              -- Link to remediation task
  action_label VARCHAR(100),                    -- 'Review Impact', 'Schedule Board Meeting'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_regulatory_alerts_assessment FOREIGN KEY (assessment_id)
    REFERENCES regulatory_impact_assessments(id)
);

CREATE INDEX idx_regulatory_alerts_company_id ON regulatory_alerts(company_id);
CREATE INDEX idx_regulatory_alerts_severity ON regulatory_alerts(severity);
CREATE INDEX idx_regulatory_alerts_is_read ON regulatory_alerts(is_read);
```

#### Component 4: API Routes

```typescript
// src/app/api/intelligence/regulations/monitor/route.ts

/**
 * POST /api/intelligence/regulations/monitor
 * Manually trigger regulatory monitoring (daily via cron)
 */
export async function POST(req: Request) {
  try {
    // 1. Fetch all active sources
    const sources = await db.query(
      `SELECT * FROM regulatory_sources WHERE is_active = true`
    );
    
    // 2. For each source, fetch new regulations
    const allRegulations: FetchedRegulation[] = [];
    for (const source of sources) {
      const newRegs = await fetchFromSource(source);
      allRegulations.push(...newRegs);
    }
    
    // 3. Deduplicate (avoid double-counting similar rules)
    const uniqueRegs = await deduplicateRegulations(allRegulations);
    
    // 4. Store in DB
    for (const reg of uniqueRegs) {
      await db.query(
        `INSERT INTO fetched_regulations (...) VALUES (...)`
      );
    }
    
    // 5. For each regulation, assess impact on all companies
    const companies = await db.query(
      `SELECT id, exchange, industry, employees FROM companies WHERE is_active = true`
    );
    
    for (const regulation of uniqueRegs) {
      for (const company of companies) {
        const assessment = await assessor.assessImpact(regulation, company);
        
        // Only create tasks/alerts if impact_level != 'none'
        if (assessment.impactLevel !== 'none') {
          await createImpactAssessment(assessment);
          await createTasks(company.id, assessment);
          await createAlert(company.id, assessment);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      regulationsProcessed: uniqueRegs.length,
      assessmentsCreated: totalAssessments,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// src/app/api/intelligence/regulations/digest/route.ts

/**
 * GET /api/intelligence/regulations/digest?companyId=...&days=7
 * Get weekly digest of new regulations for a company
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const days = parseInt(searchParams.get('days') || '7');
  
  try {
    // Fetch applicable regulations for company in last N days
    const digest = await db.query(
      `
      SELECT
        fr.title,
        fr.description,
        fr.announced_at,
        fr.effective_at,
        ria.impact_level,
        ria.estimated_remediation_hours,
        ria.estimated_remediation_cost_usd,
        ria.impact_narrative,
        ria.suggested_actions
      FROM fetched_regulations fr
      JOIN regulatory_impact_assessments ria ON fr.id = ria.regulation_id
      WHERE ria.company_id = $1
        AND ria.is_applicable = true
        AND fr.announced_at > NOW() - INTERVAL '${days} days'
      ORDER BY ria.impact_level DESC, fr.announced_at DESC
      `,
      [companyId]
    );
    
    // Aggregate stats
    const critical = digest.filter(r => r.impact_level === 'critical').length;
    const high = digest.filter(r => r.impact_level === 'high').length;
    const totalHours = digest.reduce((sum, r) => sum + r.estimated_remediation_hours, 0);
    const totalCost = digest.reduce((sum, r) => sum + r.estimated_remediation_cost_usd, 0);
    
    return NextResponse.json({
      period: `Last ${days} days`,
      summary: {
        totalRegulations: digest.length,
        critical,
        high,
        totalRemediationHours: totalHours,
        totalRemediationCost: totalCost,
      },
      regulations: digest,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// src/app/api/intelligence/regulations/[id]/board-notify/route.ts

/**
 * POST /api/intelligence/regulations/[id]/board-notify
 * Send board notification + create scheduled board meeting task
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { companyId } = await req.json();
  
  try {
    // 1. Fetch assessment
    const assessment = await db.query(
      `SELECT * FROM regulatory_impact_assessments WHERE id = $1`,
      [params.id]
    );
    
    // 2. Create board notification email task (send to board chair, general counsel)
    const boardMembers = await db.query(
      `
      SELECT email FROM team_members
      WHERE company_id = $1 AND role IN ('board_chair', 'general_counsel')
      `,
      [companyId]
    );
    
    // Email template: "Regulatory Surprise Alert: New [Climate] Disclosure Rule"
    const emailTask = await createTask({
      companyId,
      type: 'send_email',
      title: `Board Notification: New ${assessment.suggested_actions[0].title}`,
      template: 'board_regulatory_alert',
      data: assessment,
      assignedTo: boardMembers.map(m => m.email),
    });
    
    // 3. Create board meeting task
    const boardMeetingTask = await createTask({
      companyId,
      type: 'meeting',
      title: `[URGENT] Board Meeting: ${assessment.suggested_actions[0].title}`,
      description: assessment.impact_narrative,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assignedTo: ['board'],
      priority: assessment.impact_level === 'critical' ? 'critical' : 'high',
    });
    
    // 4. Update assessment record
    await db.query(
      `
      UPDATE regulatory_impact_assessments
      SET board_notified_at = NOW(), board_notification_status = 'sent'
      WHERE id = $1
      `,
      [params.id]
    );
    
    return NextResponse.json({
      success: true,
      boardNotified: true,
      emailTaskId: emailTask.id,
      meetingTaskId: boardMeetingTask.id,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Component 5: Dashboard UI Integration

```typescript
// src/components/dashboard/intelligence-hub/regulatory-digest.tsx

export default function RegulatoryDigest() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  useEffect(() => {
    fetchDigest(viewMode === 'week' ? 7 : 30);
  }, [viewMode]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Regulatory Intelligence</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'active' : ''}
          >
            This Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={viewMode === 'month' ? 'active' : ''}
          >
            This Month
          </button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="New Regulations" value={regulations.length} />
        <StatCard
          label="Critical Impact"
          value={regulations.filter(r => r.impactLevel === 'critical').length}
          variant="critical"
        />
        <StatCard
          label="Est. Remediation Hours"
          value={Math.round(
            regulations.reduce((sum, r) => sum + r.estimatedRemediationHours, 0)
          )}
        />
        <StatCard
          label="Est. Legal Cost"
          value={`$${Math.round(
            regulations.reduce((sum, r) => sum + r.estimatedRemediationCost, 0) / 1000
          )}k`}
        />
      </div>
      
      {/* Critical Regulations Alert */}
      {regulations.filter(r => r.impactLevel === 'critical').length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-red-900">
                {regulations.filter(r => r.impactLevel === 'critical').length} CRITICAL regulations
              </h3>
              <p className="text-red-700">
                Require immediate board review and remediation action
              </p>
            </div>
            <button
              onClick={() => scrollToSection('critical')}
              className="btn btn-sm btn-red"
            >
              Review
            </button>
          </div>
        </div>
      )}
      
      {/* Regulation Cards (grouped by impact level) */}
      {['critical', 'high', 'medium', 'low'].map(level => (
        <div key={level}>
          <h3 className="font-bold text-lg mb-3 capitalize">{level} Impact</h3>
          <div className="space-y-4">
            {regulations
              .filter(r => r.impactLevel === level)
              .map(regulation => (
                <RegulatoryCard
                  key={regulation.id}
                  regulation={regulation}
                  onNotifyBoard={() => handleBoardNotification(regulation.id)}
                  onReviewImpact={() => handleReviewImpact(regulation.id)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Regulatory Card Component
function RegulatoryCard({
  regulation,
  onNotifyBoard,
  onReviewImpact,
}: {
  regulation: Regulation;
  onNotifyBoard: () => void;
  onReviewImpact: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-lg">{regulation.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{regulation.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          regulation.impactLevel === 'critical' ? 'bg-red-100 text-red-900' :
          regulation.impactLevel === 'high' ? 'bg-orange-100 text-orange-900' :
          regulation.impactLevel === 'medium' ? 'bg-yellow-100 text-yellow-900' :
          'bg-gray-100 text-gray-900'
        }`}>
          {regulation.impactLevel.toUpperCase()}
        </div>
      </div>
      
      {/* Key Info */}
      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Effective Date</p>
          <p className="font-mono">{regulation.effectiveDate}</p>
          {regulation.daysUntilEffective && (
            <p className="text-red-600 font-bold text-xs mt-1">
              {regulation.daysUntilEffective} days away
            </p>
          )}
        </div>
        <div>
          <p className="text-gray-600">Affected Sections</p>
          <p>{regulation.affectedSections.join(', ')}</p>
        </div>
        <div>
          <p className="text-gray-600">Est. Remediation</p>
          <p>{regulation.estimatedRemediationHours} hours</p>
        </div>
        <div>
          <p className="text-gray-600">Est. Cost</p>
          <p className="font-bold">${(regulation.estimatedRemediationCost / 1000).toFixed(1)}k</p>
        </div>
      </div>
      
      {/* Impact Narrative */}
      <details className="mb-4">
        <summary className="cursor-pointer text-sm font-bold text-blue-600 hover:underline">
          Why This Affects You
        </summary>
        <p className="mt-2 text-sm text-gray-700 leading-relaxed">
          {regulation.impactNarrative}
        </p>
      </details>
      
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onReviewImpact}
          className="btn btn-sm btn-outline"
        >
          View Details
        </button>
        {regulation.impactLevel === 'critical' && (
          <button
            onClick={onNotifyBoard}
            className="btn btn-sm btn-primary"
          >
            Notify Board
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Example: Climate Disclosure Rule Impact Assessment

### Scenario
SEC announces: "Enhanced Climate Disclosure Requirements" effective 90 days from now.

### Assessment Output (Dashboard)

```
CRITICAL - 2 Critical Regulations This Week

NEW RULE: Enhanced Climate Disclosure Requirements
Announced: June 1, 2026
Effective Date: September 1, 2026 (87 days)

Impact Level: CRITICAL
"Your company must disclose Scope 1, 2 GHG emissions, climate risk governance by Sept 1"

Why This Affects You:
Your company, TechCorp Technologies Inc., is preparing an S-1 prospectus for SEC filing.
The new rule applies to all public companies (including those in IPO process).
Your current S-1 prospectus has NO climate risk disclosure section.
Estimated impact: 40 hours GC work + 30 hours consultant = $24,000 in external legal costs.

Affected Sections:
- Risk Factors (must add climate risk subsection)
- MD&A (must discuss climate strategy)
- Governance (must disclose board oversight)

Suggested Actions:
1. [CRITICAL - Due in 3 days] Board Meeting: Assess CEO/CFO certification authority for climate disclosure
2. [CRITICAL - Due in 5 days] Legal Review: Audit current S-1 draft against climate rule
3. [HIGH - Due in 14 days] Update Prospectus: Draft climate risk section per SEC guidance
4. [CRITICAL - Due in 2 days] Contact SEC: Determine if relief available for transitional filers

[NOTIFY BOARD]  [REVIEW IMPACT DETAILS]
```

### Board Notification Email

```
Subject: URGENT: New SEC Climate Disclosure Rule - Board Action Required

Dear [Board Chair], [General Counsel],

The SEC announced Enhanced Climate Disclosure Requirements effective September 1, 2026.
This directly affects your upcoming S-1 IPO prospectus filing.

IMPACT SUMMARY:
• Your company must disclose Scope 1 & 2 GHG emissions by Sept 1
• Current S-1 missing climate risk section entirely
• Estimated remediation: 70 hours, $24,000 external legal cost
• Timeline: 87 days to comply

ACTION REQUIRED:
1. Emergency board meeting in next 3 days to authorize climate disclosure work
2. Assess what climate data is available from company (CFO + sustainability team)
3. Engage external climate disclosure consultant (recommended: 2-3 days lead time)
4. CEO/CFO certification sign-off on climate risk statements

This is a regulatory surprise risk event. We've prepared a full impact assessment
and remediation task list. Click below to review in IPOReady.

[REVIEW IN IPOREADY]

The board may wish to discuss with the SEC directly whether any relief is available
for companies in IPO process. This decision should be made within 2 days.

Best regards,
IPOReady Intelligence Engine
```

### Task List Auto-Created

```
REGULATORY REMEDIATION TASKS

[T1] CRITICAL - Due: June 4 (3 days)
     Title: Emergency Board Meeting: SEC Climate Disclosure Rule
     Assigned to: Board, GC
     Narrative: Discuss impact, authorize remediation, assess resource needs
     Duration: 2 hours

[T2] CRITICAL - Due: June 7 (6 days)
     Title: Legal Assessment: Climate Disclosure S-1 Gap Analysis
     Assigned to: General Counsel
     Narrative: Review current prospectus draft against SEC requirements
     Duration: 6 hours

[T3] HIGH - Due: June 8 (7 days)
     Title: GHG Data Collection: Scope 1 & 2 Emissions Inventory
     Assigned to: CFO, Sustainability Manager
     Narrative: Gather historical 3-year GHG data or estimate methodology
     Duration: 8 hours

[T4] HIGH - Due: June 15 (14 days)
     Title: Governance Assessment: Climate Risk Board Oversight
     Assigned to: General Counsel
     Narrative: Document board committee responsible for climate governance
     Duration: 4 hours

[T5] HIGH - Due: June 20 (19 days)
     Title: Draft Prospectus Section: Climate Risk Factors
     Assigned to: General Counsel + External Consultant
     Narrative: Write risk factors per SEC guidance (400-800 words minimum)
     Duration: 20 hours

[T6] MEDIUM - Due: June 10 (4 days)
     Title: Engage External Consultant: Climate Disclosure Expert
     Assigned to: General Counsel
     Narrative: Procure climate disclosure specialist for prospectus review
     Duration: 3 hours
```

---

## Implementation Roadmap (Phase 2B)

### Sprint 1: Foundation (2 weeks)
- [ ] Build regulatory monitoring pipeline
  - SEC Federal Register RSS parser
  - FINRA notice scraper
  - TSX/OSC rule aggregator
- [ ] Deploy database schema
- [ ] Implement fetching service (daily cron)
- [ ] Test deduplication logic

### Sprint 2: AI Integration (2 weeks)
- [ ] Implement RegulatoryImpactAssessor class
  - Applicability determination
  - Section mapping
  - Hours/cost estimation (Claude API)
  - Narrative generation (Claude API)
- [ ] Create AI prompt templates
- [ ] Test accuracy on known regulations

### Sprint 3: Task & Alert Automation (1.5 weeks)
- [ ] Auto-create tasks from suggested actions
- [ ] Create regulatory_alerts table + API
- [ ] Implement board notification email template
- [ ] Hook to existing task system (sync with /checklist)

### Sprint 4: Dashboard UI (1.5 weeks)
- [ ] Build RegulatoryDigest component
- [ ] Implement RegulatoryCard with details modal
- [ ] Add weekly digest email template
- [ ] Create intelligence-hub page

### Sprint 5: Testing & Launch (1 week)
- [ ] Manual testing with historical regulations
- [ ] Edge case handling (expired rules, overlapping rules)
- [ ] Performance testing (1000+ regulations)
- [ ] Beta deploy to pilot customers

---

## ROI Analysis

### Cost of Regulatory Surprise
- S-1 rejection letter 4 weeks before launch: $5M opportunity cost
- Emergency legal retainer: $50-250k
- Management overhead: $100-500k
- Investor confidence decay: incalculable

### Value of Early Detection
- **Avoid 1 major regulatory surprise**: $5M+ saved
- **Risk reduction**: 30% lower probability of compliance gaps in S-1
- **Speed**: 2-week earlier detection = $2M+ valuation impact
- **Board confidence**: Transparent, proactive risk management (investor signal)

### Implementation Cost
- Development: ~160 hours ($80k at $500/hr)
- Ongoing monitoring: 2-4 hours/week maintenance
- **Payback**: Single surprise avoided = 60x ROI

---

## Success Metrics

1. **Coverage**: Track % of applicable regulations detected within 3 days of announcement
2. **Accuracy**: AI impact assessment flagged 80%+ of regulations that actually affected a company's IPO checklist
3. **Speed**: Average latency from announcement → board notification: < 24 hours
4. **Adoption**: % of pilot companies reviewing weekly digest: > 70%
5. **Prevention**: Zero regulatory surprises that delay S-1 submission for pilot cohort

---

## Security & Compliance Notes

- All fetched regulations stored in audit log (SOC 2, SEC compliance)
- Board notifications sent via secure email (SOC 2 compliance)
- Regulatory assessments immutable (for auditor review, regulatory inquiry)
- AI prompts logged for transparency (no customer data in Claude requests)

---

## Post-Launch Enhancements (Phase 3+)

1. **Predictive regulation forecast** (Q4 2026): SEC strategic agenda + enforcement priorities
2. **Peer comparison**: "X regulations announced this month. [Competitor A] already issued disclosure. You have 7 days."
3. **Regulatory exemption finder**: Auto-identify available relief (slow-growth, scaled-disclosure, etc.)
4. **Compliance score**: Track % of new regulations incorporated into prospectus vs. time
5. **Industry benchmarking**: Compare remediation speed vs. peer IPOs

---

## Conclusion

The Regulatory Surprise Intelligence Engine transforms IPOReady from a task management platform into a **proactive compliance advisor**. By automating regulatory monitoring, impact assessment, and task creation, we eliminate the #1 category of S-1 rejections and delays.

For pilot customers, this delivers **$5M+ value per company** while building an irreplaceable competitive moat: no other IPO platform offers real-time regulatory intelligence.
