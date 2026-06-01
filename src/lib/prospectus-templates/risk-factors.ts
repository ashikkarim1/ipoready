/**
 * Risk Factors Section Template
 * Extracted from PACE risk tracking and compliance data
 */

export const riskFactorsTemplate = {
  sectionName: 'risk_factors',
  sectionOrder: 2,
  title: 'Risk Factors',
  description: 'Material risks to the company and its business',
  template: `
# Risk Factors

Investors should consider the following risk factors in addition to other information presented in this prospectus. If any of these risks occur, the Company's business, results of operations, and financial condition could be materially adversely affected.

## Business and Operational Risks

### Market and Competitive Risks

{market_competition_risks}

The Company faces significant competition from {competitive_threats}. While the Company believes it has competitive advantages in {competitive_advantages}, there can be no assurance that it will maintain or increase its market share.

### Technology and Product Risks

{technology_risks}

The Company's success depends upon its ability to continue developing and enhancing its products and services. Failure to do so could adversely affect the Company's competitive position.

### Key Personnel and Dependency Risks

{key_personnel_risks}

The Company depends on the continued service of its executive officers and key technical personnel. Loss of any such person could adversely affect the Company's business.

### Customer Concentration Risks

{customer_concentration_risks}

If the Company loses any significant customer, or if a significant customer reduces its orders, the Company's revenue and profitability could be materially affected.

## Financial and Capital Risks

### Liquidity and Capital Resources

{liquidity_risks}

The Company may need to raise additional capital in the future. There can be no assurance that such capital will be available on favorable terms.

### Revenue and Profitability Risks

{profitability_risks}

The Company's profitability may fluctuate based on {operating_factors}. The Company may not be able to achieve or maintain profitability.

## Regulatory and Compliance Risks

### Regulatory Compliance

{regulatory_risks}

The Company's operations are subject to various federal, provincial, and local regulations. Non-compliance could result in penalties or operational disruptions.

### Intellectual Property

{ip_risks}

The Company's success depends on its intellectual property. There can be no assurance that the Company will be able to maintain or protect its intellectual property rights.

## Capital Market and Stock Risks

### Market Price Volatility

The market price of the Company's securities may be subject to significant fluctuations due to various factors, including {market_volatility_factors}.

### Liquidity of Securities

{securities_liquidity_risks}

There can be no assurance that an active market for the Company's securities will develop or be sustained.

## Forward-Looking Information

Certain information in this prospectus is forward-looking and involves risks and uncertainties. Actual results may differ materially from those anticipated.
`,
  placeholders: [
    'market_competition_risks',
    'competitive_threats',
    'competitive_advantages',
    'technology_risks',
    'key_personnel_risks',
    'customer_concentration_risks',
    'liquidity_risks',
    'profitability_risks',
    'operating_factors',
    'regulatory_risks',
    'ip_risks',
    'market_volatility_factors',
    'securities_liquidity_risks',
  ],
}
