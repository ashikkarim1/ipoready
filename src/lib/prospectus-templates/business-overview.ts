/**
 * Business Overview Section Template
 * Extracted from PACE business description and company profile
 */

export const businessOverviewTemplate = {
  sectionName: 'business_overview',
  sectionOrder: 1,
  title: 'Business Overview',
  description: 'Company background, products/services, and market positioning',
  template: `
# Business Overview

## Company Background and History

{company_name} (the "Company") was incorporated on {incorporation_date} under the laws of {incorporation_jurisdiction}. The Company is registered as a {business_structure} with headquarters located at {headquarters_address}.

## Business Description

{company_name} is engaged in the business of {primary_business_description}. The Company's primary focus is on {business_focus_areas}.

### Products and Services

The Company offers the following products and services:

{products_and_services_list}

### Market Opportunity

The Company operates in the {industry_sector} industry. Based on market research, the addressable market for the Company's products and services is valued at approximately {market_size_estimate}, with projected growth of {market_growth_rate} annually over the next {forecast_period_years} years.

### Competitive Position

The Company competes with established players and emerging companies in the {competitive_landscape}. The Company's competitive advantages include:

{competitive_advantages}

## Business Model and Revenue Streams

The Company operates on a {revenue_model} basis. Primary revenue streams include:

{revenue_streams_detail}

## Growth Strategy

The Company's near-term growth strategy focuses on:

{growth_initiatives}

The Company plans to expand {expansion_plans} to drive revenue growth and market share.

## Key Milestones

The Company has achieved the following milestones:

{key_achievements}
`,
  placeholders: [
    'company_name',
    'incorporation_date',
    'incorporation_jurisdiction',
    'business_structure',
    'headquarters_address',
    'primary_business_description',
    'business_focus_areas',
    'products_and_services_list',
    'industry_sector',
    'market_size_estimate',
    'market_growth_rate',
    'forecast_period_years',
    'competitive_landscape',
    'competitive_advantages',
    'revenue_model',
    'revenue_streams_detail',
    'growth_initiatives',
    'expansion_plans',
    'key_achievements',
  ],
}
