'use strict';

import type { ProspectusTemplate, ProspectusSection } from './prospectus-templates';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type DocumentType =
  | 'audited_financials'
  | 'tax_returns'
  | 'legal_agreements'
  | 'board_minutes'
  | 'cap_table'
  | 'business_plan'
  | 'market_analysis'
  | 'technical_docs';

export interface ExtractedSection {
  prospectusSection: string;
  extractedText: string;
  confidence: number;
  suggestedEdits?: string[];
}

export interface ExtractionMetadata {
  extractedAt: Date;
  extractionModel: 'heuristic' | 'claude_ai';
  pageRangesUsed: number[];
}

export interface ExtractedContent {
  documentType: DocumentType;
  sourceDocumentId: string;
  sections: ExtractedSection[];
  metadata: ExtractionMetadata;
}

// ============================================================
// DOCUMENT TYPE ROUTING RULES
// ============================================================

interface RoutingRule {
  prospectusSection: string;
  keywords: string[];
  confidence: number;
  minConfidence: number;
}

const ROUTING_RULES: Record<DocumentType, RoutingRule[]> = {
  audited_financials: [
    {
      prospectusSection: 'financial_statements',
      keywords: ['balance sheet', 'consolidated statement', 'assets', 'liabilities', 'equity'],
      confidence: 95,
      minConfidence: 90,
    },
    {
      prospectusSection: 'financial_highlights',
      keywords: ['revenue', 'net income', 'operating income', 'gross margin', 'ebitda'],
      confidence: 92,
      minConfidence: 85,
    },
    {
      prospectusSection: 'accounting_policies',
      keywords: ['accounting policies', 'significant accounting', 'basis of preparation', 'ifrs', 'gaap'],
      confidence: 88,
      minConfidence: 80,
    },
    {
      prospectusSection: 'selected_financial_data',
      keywords: ['five year', 'summary', 'historical', 'comparative', 'year-over-year'],
      confidence: 85,
      minConfidence: 75,
    },
  ],
  tax_returns: [
    {
      prospectusSection: 'tax_considerations',
      keywords: ['income tax', 'tax provision', 'deferred tax', 'effective tax rate', 'tax expense'],
      confidence: 90,
      minConfidence: 85,
    },
    {
      prospectusSection: 'business_operations',
      keywords: ['business income', 'operating expenses', 'revenue sources', 'deductions'],
      confidence: 80,
      minConfidence: 70,
    },
    {
      prospectusSection: 'risk_factors',
      keywords: ['audit', 'dispute', 'irs', 'tax authority', 'adjustment'],
      confidence: 75,
      minConfidence: 65,
    },
  ],
  legal_agreements: [
    {
      prospectusSection: 'material_contracts',
      keywords: ['agreement', 'contract', 'terms', 'parties', 'obligations', 'termination'],
      confidence: 85,
      minConfidence: 75,
    },
    {
      prospectusSection: 'intellectual_property',
      keywords: ['license', 'patent', 'trademark', 'copyright', 'ip', 'proprietary'],
      confidence: 80,
      minConfidence: 70,
    },
    {
      prospectusSection: 'litigation',
      keywords: ['lawsuit', 'litigation', 'dispute', 'claim', 'legal action', 'proceedings'],
      confidence: 85,
      minConfidence: 75,
    },
    {
      prospectusSection: 'business_relationships',
      keywords: ['supplier', 'customer', 'partner', 'distributor', 'exclusive', 'agreement'],
      confidence: 75,
      minConfidence: 65,
    },
  ],
  board_minutes: [
    {
      prospectusSection: 'corporate_governance',
      keywords: ['board', 'resolution', 'policy', 'approval', 'decision', 'committee'],
      confidence: 90,
      minConfidence: 85,
    },
    {
      prospectusSection: 'executive_compensation',
      keywords: ['salary', 'bonus', 'equity', 'option', 'grant', 'compensation'],
      confidence: 85,
      minConfidence: 80,
    },
    {
      prospectusSection: 'capital_structure',
      keywords: ['share', 'stock', 'issuance', 'equity', 'capitalization', 'warrant', 'dilution'],
      confidence: 88,
      minConfidence: 80,
    },
    {
      prospectusSection: 'strategic_initiatives',
      keywords: ['strategy', 'initiative', 'acquisition', 'investment', 'expansion', 'approved'],
      confidence: 80,
      minConfidence: 70,
    },
  ],
  cap_table: [
    {
      prospectusSection: 'principal_stockholders',
      keywords: ['shareholder', 'owner', 'ownership', 'percentage', 'shares outstanding', 'holding'],
      confidence: 95,
      minConfidence: 90,
    },
    {
      prospectusSection: 'capital_structure',
      keywords: ['capitalization', 'common stock', 'preferred', 'class', 'voting rights', 'series'],
      confidence: 95,
      minConfidence: 90,
    },
    {
      prospectusSection: 'executive_compensation',
      keywords: ['option', 'vest', 'grant', 'rsu', 'award', 'plan'],
      confidence: 92,
      minConfidence: 85,
    },
    {
      prospectusSection: 'dilution_analysis',
      keywords: ['dilution', 'fully diluted', 'on a fully diluted basis', 'percentage'],
      confidence: 90,
      minConfidence: 85,
    },
  ],
  business_plan: [
    {
      prospectusSection: 'business_description',
      keywords: ['business model', 'value proposition', 'products', 'services', 'customers', 'market'],
      confidence: 85,
      minConfidence: 70,
    },
    {
      prospectusSection: 'competitive_landscape',
      keywords: ['competitive', 'competition', 'competitor', 'market share', 'positioning', 'advantage'],
      confidence: 80,
      minConfidence: 65,
    },
    {
      prospectusSection: 'management_team',
      keywords: ['management', 'team', 'experience', 'expertise', 'background', 'leadership'],
      confidence: 75,
      minConfidence: 60,
    },
    {
      prospectusSection: 'growth_strategy',
      keywords: ['strategy', 'growth', 'plan', 'roadmap', 'expansion', 'target'],
      confidence: 75,
      minConfidence: 60,
    },
  ],
  market_analysis: [
    {
      prospectusSection: 'market_opportunity',
      keywords: ['market size', 'tam', 'addressable market', 'growth rate', 'opportunity'],
      confidence: 85,
      minConfidence: 75,
    },
    {
      prospectusSection: 'competitive_landscape',
      keywords: ['competitive', 'competition', 'market position', 'competitors', 'differentiation'],
      confidence: 80,
      minConfidence: 70,
    },
    {
      prospectusSection: 'risk_factors',
      keywords: ['risk', 'threat', 'market risk', 'disruption', 'dependency'],
      confidence: 75,
      minConfidence: 65,
    },
    {
      prospectusSection: 'industry_trends',
      keywords: ['trend', 'growth', 'outlook', 'forecast', 'industry', 'segment'],
      confidence: 75,
      minConfidence: 65,
    },
  ],
  technical_docs: [
    {
      prospectusSection: 'business_description',
      keywords: ['technology', 'product', 'platform', 'feature', 'capability', 'system'],
      confidence: 75,
      minConfidence: 60,
    },
    {
      prospectusSection: 'risk_factors',
      keywords: ['security', 'vulnerability', 'compliance', 'data', 'privacy', 'risk'],
      confidence: 70,
      minConfidence: 55,
    },
    {
      prospectusSection: 'intellectual_property',
      keywords: ['patent', 'proprietary', 'technology', 'algorithm', 'copyright', 'ip'],
      confidence: 80,
      minConfidence: 70,
    },
    {
      prospectusSection: 'operations',
      keywords: ['infrastructure', 'scalability', 'architecture', 'performance', 'deployment'],
      confidence: 65,
      minConfidence: 50,
    },
  ],
};

// ============================================================
// HEURISTIC EXTRACTORS BY DOCUMENT TYPE
// ============================================================

class DocumentExtractor {
  /**
   * Extract from audited financial statements
   * Confidence: 90%+
   */
  async extractAuditedFinancials(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Extract consolidated financial statements
    const balanceSheetMatch = fileContent.match(
      /(?:consolidated\s+)?balance sheet[^\n]*(?:\n[^\n]*){0,200}/i,
    );
    if (balanceSheetMatch) {
      sections.push({
        prospectusSection: 'financial_statements',
        extractedText: balanceSheetMatch[0],
        confidence: 95,
      });
    }

    // Extract income statement
    const incomeMatch = fileContent.match(
      /(?:consolidated\s+)?(?:statement of\s+)?(?:operations|earnings|income)[^\n]*(?:\n[^\n]*){0,200}/i,
    );
    if (incomeMatch) {
      sections.push({
        prospectusSection: 'financial_highlights',
        extractedText: incomeMatch[0],
        confidence: 92,
      });
    }

    // Extract cash flow statement
    const cashFlowMatch = fileContent.match(/(?:statement of\s+)?cash flows[^\n]*(?:\n[^\n]*){0,150}/i);
    if (cashFlowMatch) {
      sections.push({
        prospectusSection: 'financial_statements',
        extractedText: cashFlowMatch[0],
        confidence: 92,
      });
    }

    // Extract accounting policies notes
    const policiesMatch = fileContent.match(/(?:note|basis of\s+).*accounting policies[^\n]*(?:\n[^\n]*){0,100}/i);
    if (policiesMatch) {
      sections.push({
        prospectusSection: 'accounting_policies',
        extractedText: policiesMatch[0],
        confidence: 88,
        suggestedEdits: ['Expand on revenue recognition policy', 'Detail significant judgments and estimates'],
      });
    }

    return sections;
  }

  /**
   * Extract from tax returns
   * Confidence: 85%+
   */
  async extractTaxReturns(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Extract tax provision and rates
    const taxMatch = fileContent.match(/(?:income tax|tax provision|effective rate)[^\n]*(?:\n[^\n]*){0,50}/i);
    if (taxMatch) {
      sections.push({
        prospectusSection: 'tax_considerations',
        extractedText: taxMatch[0],
        confidence: 90,
      });
    }

    // Extract business income details
    const businessIncomeMatch = fileContent.match(
      /(?:business income|gross income|revenue)[^\n]*\$[\d,\.]+[^\n]*(?:\n[^\n]*){0,30}/i,
    );
    if (businessIncomeMatch) {
      sections.push({
        prospectusSection: 'business_operations',
        extractedText: businessIncomeMatch[0],
        confidence: 80,
      });
    }

    // Extract deductions summary
    const deductionsMatch = fileContent.match(
      /(?:total deductions|business deductions|deductible)[^\n]*(?:\n[^\n]*){0,40}/i,
    );
    if (deductionsMatch) {
      sections.push({
        prospectusSection: 'business_operations',
        extractedText: deductionsMatch[0],
        confidence: 78,
      });
    }

    // Flag any audits or disputes
    const auditMatch = fileContent.match(/(?:audit|irs|examination|dispute)[^\n]*(?:\n[^\n]*){0,50}/i);
    if (auditMatch) {
      sections.push({
        prospectusSection: 'risk_factors',
        extractedText: auditMatch[0],
        confidence: 75,
        suggestedEdits: ['Quantify exposure if material', 'Describe resolution timeline'],
      });
    }

    return sections;
  }

  /**
   * Extract from legal agreements and contracts
   * Confidence: 75%+
   */
  async extractLegalAgreements(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Extract agreement type and parties
    const headerMatch = fileContent.match(/^[A-Z\s]+(?:AGREEMENT|AGREEMENT|CONTRACT)[^\n]*\n(?:[^\n]*){0,10}/m);
    if (headerMatch) {
      const parties = fileContent.match(/(?:between|among)([^\.]+)/i);
      const contractText = headerMatch[0] + (parties ? '\n' + parties[0] : '');

      // Classify by agreement type
      const isIPAgreement = /license|patent|trademark|copyright|proprietary/i.test(fileContent);
      const isLitigation = /lawsuit|litigation|dispute|claim|plaintiff|defendant/i.test(fileContent);
      const isEmployment = /employment|employee|service agreement|officer/i.test(fileContent);
      const isSupplier = /supplier|vendor|purchase|supply agreement|distributor/i.test(fileContent);

      if (isIPAgreement) {
        sections.push({
          prospectusSection: 'intellectual_property',
          extractedText: contractText,
          confidence: 80,
          suggestedEdits: ['Extract key IP restrictions', 'Identify termination triggers'],
        });
      } else if (isLitigation) {
        sections.push({
          prospectusSection: 'litigation',
          extractedText: contractText,
          confidence: 85,
          suggestedEdits: ['Quantify exposure', 'Note insurance coverage'],
        });
      } else if (isSupplier || isEmployment) {
        sections.push({
          prospectusSection: 'material_contracts',
          extractedText: contractText,
          confidence: 85,
          suggestedEdits: ['Extract key commercial terms', 'Identify concentration risks'],
        });
      } else {
        sections.push({
          prospectusSection: 'material_contracts',
          extractedText: contractText,
          confidence: 82,
        });
      }
    }

    // Extract key terms and obligations
    const termsMatch = fileContent.match(/(?:term|duration|period)[^\n]*\n(?:[^\n]*){0,5}/i);
    const obligationsMatch = fileContent.match(/(?:obligations?|shall|must|required)[^\n]*(?:\n[^\n]*){0,3}/i);

    if (termsMatch || obligationsMatch) {
      sections.push({
        prospectusSection: 'material_contracts',
        extractedText: [termsMatch?.[0], obligationsMatch?.[0]].filter(Boolean).join('\n'),
        confidence: 78,
      });
    }

    return sections;
  }

  /**
   * Extract from board minutes
   * Confidence: 80%+
   */
  async extractBoardMinutes(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Extract board resolutions (structured)
    const resolutionMatches = fileContent.matchAll(/(?:RESOLVED|RESOLUTION)[^\.]*\./gi);
    const resolutions: string[] = [];
    for (const match of resolutionMatches) {
      resolutions.push(match[0]);
    }

    if (resolutions.length > 0) {
      sections.push({
        prospectusSection: 'corporate_governance',
        extractedText: resolutions.join('\n\n'),
        confidence: 90,
        suggestedEdits: ['Identify resolutions requiring disclosure'],
      });
    }

    // Extract equity/compensation decisions
    const equityMatch = fileContent.match(/(?:option|grant|vest|equity|compensation)[^\n]*(?:\n[^\n]*){0,50}/i);
    if (equityMatch) {
      sections.push({
        prospectusSection: 'executive_compensation',
        extractedText: equityMatch[0],
        confidence: 85,
      });
    }

    // Extract capital structure changes
    const capitalMatch = fileContent.match(
      /(?:share|stock|issuance|warrant|convertible|capitalization)[^\n]*(?:\n[^\n]*){0,50}/i,
    );
    if (capitalMatch) {
      sections.push({
        prospectusSection: 'capital_structure',
        extractedText: capitalMatch[0],
        confidence: 88,
      });
    }

    // Extract strategic decisions
    const strategyMatch = fileContent.match(/(?:approved|authorized).*(?:acquisition|investment|expansion)[^\n]*(?:\n[^\n]*){0,40}/i);
    if (strategyMatch) {
      sections.push({
        prospectusSection: 'strategic_initiatives',
        extractedText: strategyMatch[0],
        confidence: 80,
        suggestedEdits: ['Quantify investment/acquisition size'],
      });
    }

    return sections;
  }

  /**
   * Extract from cap table (highly structured)
   * Confidence: 95%+
   */
  async extractCapTable(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Parse cap table structure (usually tabular)
    const tableMatch = fileContent.match(/(?:shareholder|holder|class|series)[^\n]*(?:\n[^\n]*){0,200}/i);

    if (tableMatch) {
      sections.push({
        prospectusSection: 'principal_stockholders',
        extractedText: tableMatch[0],
        confidence: 95,
        suggestedEdits: ['Verify fully diluted calculations', 'Identify beneficial owners'],
      });

      sections.push({
        prospectusSection: 'capital_structure',
        extractedText: tableMatch[0],
        confidence: 95,
      });
    }

    // Extract equity grants and vesting
    const equityMatch = fileContent.match(/(?:option|vest|grant|rsu|award)[^\n]*(?:\n[^\n]*){0,100}/i);
    if (equityMatch) {
      sections.push({
        prospectusSection: 'executive_compensation',
        extractedText: equityMatch[0],
        confidence: 92,
      });
    }

    // Calculate and extract dilution analysis
    const shareCountMatch = fileContent.match(/(?:total.*shares|shares outstanding)[^\n]*[\d,]+[^\n]*(?:\n[^\n]*){0,50}/i);
    if (shareCountMatch) {
      sections.push({
        prospectusSection: 'dilution_analysis',
        extractedText: shareCountMatch[0],
        confidence: 90,
      });
    }

    return sections;
  }

  /**
   * Extract from business plan
   * Confidence: 70%+
   */
  async extractBusinessPlan(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Extract business model description (narrative)
    const businessMatch = fileContent.match(/(?:business model|overview|summary)[^\n]*(?:\n[^\n]*){0,100}/i);
    if (businessMatch) {
      sections.push({
        prospectusSection: 'business_description',
        extractedText: businessMatch[0],
        confidence: 85,
        suggestedEdits: ['Emphasize revenue streams', 'Clarify customer acquisition strategy'],
      });
    }

    // Extract competitive positioning
    const competitiveMatch = fileContent.match(
      /(?:competitive|competition|competitor|market position|advantage)[^\n]*(?:\n[^\n]*){0,80}/i,
    );
    if (competitiveMatch) {
      sections.push({
        prospectusSection: 'competitive_landscape',
        extractedText: competitiveMatch[0],
        confidence: 80,
        suggestedEdits: ['Name specific competitors', 'Quantify market share if known'],
      });
    }

    // Extract management and team
    const teamMatch = fileContent.match(/(?:management|team|leadership|founder)[^\n]*(?:\n[^\n]*){0,100}/i);
    if (teamMatch) {
      sections.push({
        prospectusSection: 'management_team',
        extractedText: teamMatch[0],
        confidence: 75,
        suggestedEdits: ['Add relevant experience details', 'Identify key skill gaps'],
      });
    }

    // Extract growth strategy
    const strategyMatch = fileContent.match(/(?:strategy|growth|roadmap|plan)[^\n]*(?:\n[^\n]*){0,100}/i);
    if (strategyMatch) {
      sections.push({
        prospectusSection: 'growth_strategy',
        extractedText: strategyMatch[0],
        confidence: 75,
        suggestedEdits: ['Make targets quantifiable and time-bound', 'Link to use of proceeds'],
      });
    }

    return sections;
  }

  /**
   * Extract from market analysis reports
   * Confidence: 75%+
   */
  async extractMarketAnalysis(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Extract market size and opportunity
    const marketMatch = fileContent.match(/(?:market size|tam|addressable|opportunity|market value)[^\n]*\$?[\d\.,]+[^\n]*(?:\n[^\n]*){0,50}/i);
    if (marketMatch) {
      sections.push({
        prospectusSection: 'market_opportunity',
        extractedText: marketMatch[0],
        confidence: 85,
        suggestedEdits: ['Verify TAM methodology', 'Include growth rate projections'],
      });
    }

    // Extract competitive landscape
    const compMatch = fileContent.match(/(?:competitive|market.*landscape|players|participant)[^\n]*(?:\n[^\n]*){0,100}/i);
    if (compMatch) {
      sections.push({
        prospectusSection: 'competitive_landscape',
        extractedText: compMatch[0],
        confidence: 80,
        suggestedEdits: ['Quantify competitor market shares', 'Identify emerging threats'],
      });
    }

    // Extract risk factors
    const riskMatch = fileContent.match(/(?:risk|threat|disruption|uncertainty)[^\n]*(?:\n[^\n]*){0,80}/i);
    if (riskMatch) {
      sections.push({
        prospectusSection: 'risk_factors',
        extractedText: riskMatch[0],
        confidence: 75,
        suggestedEdits: ['Quantify impact if possible', 'Note mitigation strategies'],
      });
    }

    // Extract industry trends
    const trendMatch = fileContent.match(/(?:trend|growth|forecast|outlook|segment)[^\n]*(?:\n[^\n]*){0,100}/i);
    if (trendMatch) {
      sections.push({
        prospectusSection: 'industry_trends',
        extractedText: trendMatch[0],
        confidence: 75,
      });
    }

    return sections;
  }

  /**
   * Extract from technical documentation
   * Confidence: 65%+
   */
  async extractTechnicalDocs(
    fileContent: string,
    pageRanges: number[],
  ): Promise<ExtractedSection[]> {
    const sections: ExtractedSection[] = [];

    // Extract product/technology overview
    const techMatch = fileContent.match(/(?:technology|product|platform|system)[^\n]*(?:\n[^\n]*){0,100}/i);
    if (techMatch) {
      sections.push({
        prospectusSection: 'business_description',
        extractedText: techMatch[0],
        confidence: 75,
        suggestedEdits: ['Simplify technical language for prospectus audience'],
      });
    }

    // Extract IP/proprietary aspects
    const ipMatch = fileContent.match(/(?:patent|proprietary|algorithm|copyright|trade secret)[^\n]*(?:\n[^\n]*){0,80}/i);
    if (ipMatch) {
      sections.push({
        prospectusSection: 'intellectual_property',
        extractedText: ipMatch[0],
        confidence: 80,
        suggestedEdits: ['Enumerate key patents', 'Note pending patent applications'],
      });
    }

    // Extract security/compliance
    const securityMatch = fileContent.match(/(?:security|compliance|data|privacy|encryption|vulnerable)[^\n]*(?:\n[^\n]*){0,80}/i);
    if (securityMatch) {
      sections.push({
        prospectusSection: 'risk_factors',
        extractedText: securityMatch[0],
        confidence: 70,
        suggestedEdits: ['Include certifications (SOC 2, ISO 27001)', 'Assess data breach risk'],
      });
    }

    // Extract infrastructure/scalability
    const infraMatch = fileContent.match(/(?:infrastructure|scalable|performance|architecture|deployment)[^\n]*(?:\n[^\n]*){0,80}/i);
    if (infraMatch) {
      sections.push({
        prospectusSection: 'operations',
        extractedText: infraMatch[0],
        confidence: 65,
        suggestedEdits: ['Quantify uptime/SLA metrics', 'Describe redundancy measures'],
      });
    }

    return sections;
  }
}

// ============================================================
// MAIN EXTRACTION INTERFACE
// ============================================================

export async function extractFromDocument(
  documentId: string,
  documentType: DocumentType,
  fileContent: Buffer | string,
  prospectusTemplate: ProspectusTemplate,
): Promise<ExtractedContent> {
  // Convert buffer to string if needed
  const content = typeof fileContent === 'string' ? fileContent : fileContent.toString('utf-8');

  // Initialize extractor
  const extractor = new DocumentExtractor();

  // Route to appropriate extractor by document type
  let extractedSections: ExtractedSection[] = [];
  const pageRanges: number[] = []; // Track which pages had extractable content

  switch (documentType) {
    case 'audited_financials':
      extractedSections = await extractor.extractAuditedFinancials(content, pageRanges);
      break;
    case 'tax_returns':
      extractedSections = await extractor.extractTaxReturns(content, pageRanges);
      break;
    case 'legal_agreements':
      extractedSections = await extractor.extractLegalAgreements(content, pageRanges);
      break;
    case 'board_minutes':
      extractedSections = await extractor.extractBoardMinutes(content, pageRanges);
      break;
    case 'cap_table':
      extractedSections = await extractor.extractCapTable(content, pageRanges);
      break;
    case 'business_plan':
      extractedSections = await extractor.extractBusinessPlan(content, pageRanges);
      break;
    case 'market_analysis':
      extractedSections = await extractor.extractMarketAnalysis(content, pageRanges);
      break;
    case 'technical_docs':
      extractedSections = await extractor.extractTechnicalDocs(content, pageRanges);
      break;
  }

  return {
    documentType,
    sourceDocumentId: documentId,
    sections: extractedSections,
    metadata: {
      extractedAt: new Date(),
      extractionModel: 'heuristic',
      pageRangesUsed: pageRanges.length > 0 ? pageRanges : [1],
    },
  };
}

// ============================================================
// DOCUMENT TYPE DETECTION
// ============================================================

export function getDocumentTypeHint(filename: string): DocumentType {
  const lowerFilename = filename.toLowerCase();

  // Check for audited financials
  if (
    /(?:audited|audit|fy\d{4}|financial|statements?|10-k|10-q|consolidated)/i.test(lowerFilename) &&
    !lowerFilename.includes('tax')
  ) {
    return 'audited_financials';
  }

  // Check for tax returns
  if (
    /(?:tax|1040|1120|return|itin|irs|cra|canada revenue|form)/i.test(lowerFilename)
  ) {
    return 'tax_returns';
  }

  // Check for legal agreements
  if (
    /(?:agreement|contract|license|nda|employment|service|shareholders?|legal|terms|conditions)/i.test(
      lowerFilename,
    )
  ) {
    return 'legal_agreements';
  }

  // Check for board minutes
  if (
    /(?:board|minutes|resolution|proceedings?|meeting|director|governance)/i.test(lowerFilename)
  ) {
    return 'board_minutes';
  }

  // Check for cap table
  if (
    /(?:cap\s*table|capitalization|ownership|shareholders?|equity|shares|stock)/i.test(lowerFilename) &&
    !lowerFilename.includes('agreement')
  ) {
    return 'cap_table';
  }

  // Check for business plan
  if (
    /(?:business\s*plan|pitch|deck|plan|strategy|roadmap|go-to-market)/i.test(lowerFilename)
  ) {
    return 'business_plan';
  }

  // Check for market analysis
  if (
    /(?:market|analysis|research|comps|landscape|industry|report|tam|addressable)/i.test(lowerFilename)
  ) {
    return 'market_analysis';
  }

  // Default to technical docs
  return 'technical_docs';
}

// ============================================================
// EXTRACTION PRIORITIZATION
// ============================================================

interface PrioritizedExtraction extends ExtractedContent {
  priority: number;
  coverage: number;
  totalConfidence: number;
}

export async function prioritizeExtractions(
  extractedContents: ExtractedContent[],
): Promise<ExtractedContent[]> {
  const prioritized: PrioritizedExtraction[] = extractedContents.map((content) => {
    // Calculate average confidence
    const totalConfidence =
      content.sections.reduce((sum, section) => sum + section.confidence, 0) / Math.max(content.sections.length, 1);

    // Calculate coverage: how many unique prospectus sections can this doc fill?
    const uniqueSections = new Set(content.sections.map((s) => s.prospectusSection)).size;
    const coverage = uniqueSections;

    // Priority score: confidence * coverage (weighted)
    const priority = totalConfidence * 0.7 + coverage * 10 * 0.3;

    return {
      ...content,
      priority,
      coverage,
      totalConfidence,
    };
  });

  // Sort by priority descending, then by confidence
  return prioritized
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.totalConfidence - a.totalConfidence;
    })
    .map(({ priority, coverage, totalConfidence, ...rest }) => rest);
}

// ============================================================
// SQL STORAGE HELPERS
// ============================================================

export function buildInsertExtractedContentSQL(
  sectionId: string,
  sourceDocumentId: string,
  content: ExtractedContent,
): string {
  const dataExtracted = JSON.stringify(
    content.sections.reduce(
      (acc, section) => {
        acc[section.prospectusSection] = {
          text: section.extractedText,
          confidence: section.confidence,
          edits: section.suggestedEdits || [],
        };
        return acc;
      },
      {} as Record<string, object>,
    ),
  );

  const query = `
    INSERT INTO prospectus_source_mapping
      (section_id, source_document_id, document_type, data_extracted, extraction_method, extraction_confidence_pct, created_at)
    VALUES
      ($1, $2, $3, $4, 'heuristic', $5, NOW())
    ON CONFLICT DO NOTHING
  `;

  return query;
}

export function getRoutingRulesForSection(prospectusSection: string): RoutingRule[] {
  const rules: RoutingRule[] = [];

  Object.values(ROUTING_RULES).forEach((docTypeRules) => {
    docTypeRules.forEach((rule) => {
      if (rule.prospectusSection === prospectusSection) {
        rules.push(rule);
      }
    });
  });

  return rules;
}

// ============================================================
// EXTRACTION VALIDATION
// ============================================================

export function validateExtraction(content: ExtractedContent): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!content.documentType) {
    errors.push('Document type is required');
  }

  if (!content.sourceDocumentId) {
    errors.push('Source document ID is required');
  }

  if (!Array.isArray(content.sections)) {
    errors.push('Sections must be an array');
  }

  if (content.sections.length === 0) {
    warnings.push('No sections extracted from document');
  }

  // Validate each section
  content.sections.forEach((section, idx) => {
    if (!section.prospectusSection) {
      errors.push(`Section ${idx}: prospectusSection is required`);
    }

    if (!section.extractedText) {
      errors.push(`Section ${idx}: extractedText cannot be empty`);
    }

    if (section.confidence < 0 || section.confidence > 100) {
      errors.push(`Section ${idx}: confidence must be between 0 and 100`);
    }

    if (section.confidence < 60) {
      warnings.push(`Section ${idx}: Low confidence (${section.confidence}%) - manual review recommended`);
    }
  });

  // Validate metadata
  if (!content.metadata.extractedAt) {
    errors.push('Extraction timestamp is required');
  }

  if (!['heuristic', 'claude_ai'].includes(content.metadata.extractionModel)) {
    errors.push('Invalid extraction model');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
