/**
 * Management & Board Section Template
 * Extracted from PACE team readiness data
 */

export const managementTemplate = {
  sectionName: 'management',
  sectionOrder: 4,
  title: 'Management, Directors and Officers',
  description: 'Information about executive officers, directors, and their experience',
  template: `
# Management, Directors, and Executive Officers

## Board of Directors

The Board of Directors provides strategic oversight of the Company's business. The following individuals serve as directors:

### Independent Directors

{independent_directors_list}

### Management Directors

{management_directors_list}

## Executive Officers

The following individuals serve as executive officers of the Company:

### Chief Executive Officer

**{ceo_name}**, age {ceo_age}, has served as Chief Executive Officer since {ceo_start_date}. {ceo_biography}

### Chief Financial Officer

**{cfo_name}**, age {cfo_age}, has served as Chief Financial Officer since {cfo_start_date}. {cfo_biography}

### Chief Operating Officer

**{coo_name}**, age {coo_age}, has served as Chief Operating Officer since {coo_start_date}. {coo_biography}

### Other Executive Officers

{other_executives_list}

## Board Committees

### Audit Committee

The Audit Committee is responsible for overseeing the Company's financial reporting, internal controls, and audit functions. Members: {audit_committee_members}

### Compensation Committee

The Compensation Committee oversees compensation policies, executive compensation, and incentive programs. Members: {compensation_committee_members}

### Governance and Nominating Committee

The Governance and Nominating Committee oversees board composition, corporate governance, and management succession planning. Members: {governance_committee_members}

## Compensation Summary

### Named Executive Officers

The following table presents the compensation for the Company's Named Executive Officers:

| Executive | Base Salary | Bonus | Stock Options | Other | Total |
|-----------|---|---|---|---|---|
| {neo_1_name} | {neo_1_salary} | {neo_1_bonus} | {neo_1_options} | {neo_1_other} | {neo_1_total} |
| {neo_2_name} | {neo_2_salary} | {neo_2_bonus} | {neo_2_options} | {neo_2_other} | {neo_2_total} |
| {neo_3_name} | {neo_3_salary} | {neo_3_bonus} | {neo_3_options} | {neo_3_other} | {neo_3_total} |

### Compensation Philosophy

{compensation_philosophy}

The Company's compensation program is designed to:

{compensation_objectives}

### Stock Option Plan

{stock_option_plan_description}

## Board Independence and Diversity

### Independence

{independence_statement}

### Diversity

{diversity_statement}

The Board recognizes the importance of diversity in backgrounds, experiences, and perspectives.

## Indebtedness of Directors and Executive Officers

{indebtedness_disclosure}

## Conflicts of Interest

{conflicts_disclosure}

Directors and executive officers are required to disclose any potential conflicts of interest and recuse themselves from voting or deliberation on matters where such conflicts exist.

## Management's Expertise and Experience

The Board and management team collectively have significant experience in {industry_expertise}, including experience in {key_competencies}.
`,
  placeholders: [
    'independent_directors_list',
    'management_directors_list',
    'ceo_name',
    'ceo_age',
    'ceo_start_date',
    'ceo_biography',
    'cfo_name',
    'cfo_age',
    'cfo_start_date',
    'cfo_biography',
    'coo_name',
    'coo_age',
    'coo_start_date',
    'coo_biography',
    'other_executives_list',
    'audit_committee_members',
    'compensation_committee_members',
    'governance_committee_members',
    'neo_1_name',
    'neo_1_salary',
    'neo_1_bonus',
    'neo_1_options',
    'neo_1_other',
    'neo_1_total',
    'neo_2_name',
    'neo_2_salary',
    'neo_2_bonus',
    'neo_2_options',
    'neo_2_other',
    'neo_2_total',
    'neo_3_name',
    'neo_3_salary',
    'neo_3_bonus',
    'neo_3_options',
    'neo_3_other',
    'neo_3_total',
    'compensation_philosophy',
    'compensation_objectives',
    'stock_option_plan_description',
    'independence_statement',
    'diversity_statement',
    'indebtedness_disclosure',
    'conflicts_disclosure',
    'industry_expertise',
    'key_competencies',
  ],
}
