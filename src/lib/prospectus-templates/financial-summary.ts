/**
 * Financial Summary Section Template
 * Extracted from PACE financial milestones and audit data
 */

export const financialSummaryTemplate = {
  sectionName: 'financial_summary',
  sectionOrder: 3,
  title: 'Financial Summary',
  description: 'Selected financial data and highlights',
  template: `
# Selected Financial Information and MD&A

## Summary

The following selected consolidated financial data has been derived from the Company's audited consolidated financial statements for the periods presented.

## Selected Consolidated Financial Data

### Revenue and Operating Results

| Metric | {year_current} | {year_prior_1} | {year_prior_2} |
|--------|---|---|---|
| Total Revenue | {revenue_current} | {revenue_prior_1} | {revenue_prior_2} |
| Cost of Revenue | {cogs_current} | {cogs_prior_1} | {cogs_prior_2} |
| Gross Profit | {gross_profit_current} | {gross_profit_prior_1} | {gross_profit_prior_2} |
| Operating Expenses | {opex_current} | {opex_prior_1} | {opex_prior_2} |
| Operating Income (Loss) | {operating_income_current} | {operating_income_prior_1} | {operating_income_prior_2} |
| Net Income (Loss) | {net_income_current} | {net_income_prior_1} | {net_income_prior_2} |

### Balance Sheet Data

| Metric | {as_of_date_current} | {as_of_date_prior} |
|--------|---|---|
| Total Assets | {total_assets_current} | {total_assets_prior} |
| Current Assets | {current_assets_current} | {current_assets_prior} |
| Total Liabilities | {total_liabilities_current} | {total_liabilities_prior} |
| Current Liabilities | {current_liabilities_current} | {current_liabilities_prior} |
| Shareholders' Equity | {shareholders_equity_current} | {shareholders_equity_prior} |

### Key Metrics

| Metric | {period_current} | {period_prior} |
|--------|---|---|
| Gross Margin | {gross_margin_current}% | {gross_margin_prior}% |
| Operating Margin | {operating_margin_current}% | {operating_margin_prior}% |
| Return on Assets | {roa_current}% | {roa_prior}% |
| Working Capital | {working_capital_current} | {working_capital_prior} |
| Cash Position | {cash_current} | {cash_prior} |

## Management's Discussion & Analysis

### Financial Performance

During the {period} ended {period_end_date}, the Company's financial performance {performance_summary}.

{revenue_analysis}

{profitability_analysis}

{cash_flow_analysis}

### Liquidity and Capital Resources

{liquidity_summary}

The Company's primary sources of liquidity are {liquidity_sources}. The Company has {liquidity_position}.

### Capital Expenditures

The Company has invested {capex_amount} in capital expenditures during the {capex_period}. These investments were directed toward {capex_purposes}.

### Key Financial Drivers

The Company's financial performance is driven by:

{financial_drivers}

### Outlook

Based on current market conditions and the Company's strategic initiatives, management expects {financial_outlook}.
`,
  placeholders: [
    'year_current',
    'year_prior_1',
    'year_prior_2',
    'revenue_current',
    'revenue_prior_1',
    'revenue_prior_2',
    'cogs_current',
    'cogs_prior_1',
    'cogs_prior_2',
    'gross_profit_current',
    'gross_profit_prior_1',
    'gross_profit_prior_2',
    'opex_current',
    'opex_prior_1',
    'opex_prior_2',
    'operating_income_current',
    'operating_income_prior_1',
    'operating_income_prior_2',
    'net_income_current',
    'net_income_prior_1',
    'net_income_prior_2',
    'as_of_date_current',
    'as_of_date_prior',
    'total_assets_current',
    'total_assets_prior',
    'current_assets_current',
    'current_assets_prior',
    'total_liabilities_current',
    'total_liabilities_prior',
    'current_liabilities_current',
    'current_liabilities_prior',
    'shareholders_equity_current',
    'shareholders_equity_prior',
    'period_current',
    'period_prior',
    'gross_margin_current',
    'gross_margin_prior',
    'operating_margin_current',
    'operating_margin_prior',
    'roa_current',
    'roa_prior',
    'working_capital_current',
    'working_capital_prior',
    'cash_current',
    'cash_prior',
    'period',
    'period_end_date',
    'performance_summary',
    'revenue_analysis',
    'profitability_analysis',
    'cash_flow_analysis',
    'liquidity_summary',
    'liquidity_sources',
    'liquidity_position',
    'capex_amount',
    'capex_period',
    'capex_purposes',
    'financial_drivers',
    'financial_outlook',
  ],
}
