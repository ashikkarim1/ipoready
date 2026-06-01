/**
 * Use of Proceeds Section Template
 * Extracted from PACE funding goals and strategic initiatives
 */

export const useOfProceedsTemplate = {
  sectionName: 'use_of_proceeds',
  sectionOrder: 5,
  title: 'Use of Proceeds',
  description: 'How the company plans to use the proceeds from the offering',
  template: `
# Use of Proceeds

## Overview

The Company anticipates that the gross proceeds from this offering will be approximately {gross_proceeds}. After deducting estimated underwriting discounts and commissions and offering expenses, the estimated net proceeds to the Company will be approximately {net_proceeds}.

The following table sets forth our estimated use of the net proceeds from this offering:

| Use of Proceeds | Amount | Percentage |
|---|---|---|
| {use_category_1} | {amount_1} | {percentage_1}% |
| {use_category_2} | {amount_2} | {percentage_2}% |
| {use_category_3} | {amount_3} | {percentage_3}% |
| {use_category_4} | {amount_4} | {percentage_4}% |
| Working Capital and General Corporate Purposes | {working_capital_amount} | {working_capital_percent}% |
| **Total** | **{net_proceeds}** | **100%** |

## Detailed Use of Proceeds

### Product Development and Innovation

{product_development_detail}

The Company intends to allocate approximately {product_dev_allocation} of the net proceeds to {product_initiatives}.

### Sales and Marketing

{sales_marketing_detail}

The Company intends to allocate approximately {sales_marketing_allocation} of the net proceeds to expand sales and marketing efforts, including {marketing_initiatives}.

### Geographic Expansion

{geographic_expansion_detail}

The Company intends to allocate approximately {geographic_expansion_allocation} of the net proceeds toward geographic expansion in {target_markets}.

### Infrastructure and Operations

{infrastructure_detail}

The Company intends to allocate approximately {infrastructure_allocation} of the net proceeds to strengthen operational infrastructure, including {operational_initiatives}.

### Strategic Acquisitions

{acquisitions_detail}

The Company may allocate up to {acquisitions_allocation} of the net proceeds toward strategic acquisitions or investments that complement the Company's core business.

### Debt Repayment

{debt_detail}

The Company intends to use approximately {debt_allocation} of the net proceeds to repay outstanding debt or credit facilities.

### Working Capital and Contingencies

The remaining proceeds will be retained for working capital and general corporate purposes, including {working_capital_uses}.

## Allocation Flexibility

The allocation of proceeds among the categories described above is management's current expectation based on the Company's current business plans and market conditions. However, the Company retains the flexibility to reallocate the proceeds based on {reallocation_factors}.

The specific timing and amount allocated to each category will depend upon {timing_factors}.

## Investment by Affiliates

{affiliate_investment_disclosure}

The Company's principal shareholders and members of management {affiliate_participation}.
`,
  placeholders: [
    'gross_proceeds',
    'net_proceeds',
    'use_category_1',
    'amount_1',
    'percentage_1',
    'use_category_2',
    'amount_2',
    'percentage_2',
    'use_category_3',
    'amount_3',
    'percentage_3',
    'use_category_4',
    'amount_4',
    'percentage_4',
    'working_capital_amount',
    'working_capital_percent',
    'product_development_detail',
    'product_dev_allocation',
    'product_initiatives',
    'sales_marketing_detail',
    'sales_marketing_allocation',
    'marketing_initiatives',
    'geographic_expansion_detail',
    'geographic_expansion_allocation',
    'target_markets',
    'infrastructure_detail',
    'infrastructure_allocation',
    'operational_initiatives',
    'acquisitions_detail',
    'acquisitions_allocation',
    'debt_detail',
    'debt_allocation',
    'working_capital_uses',
    'reallocation_factors',
    'timing_factors',
    'affiliate_investment_disclosure',
    'affiliate_participation',
  ],
}
