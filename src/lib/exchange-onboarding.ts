/**
 * Exchange Onboarding Utility
 *
 * When you say "add Dubai" or "add London Exchange":
 * 1. I check the exchange config
 * 2. Enable it in the registry
 * 3. Add it to the menu system
 * 4. Update Listed Services modules for that exchange's requirements
 * 5. Deploy in <2 minutes
 *
 * This is the TEMPLATE for onboarding any exchange globally
 */

import { getExchange, EXCHANGES, ExchangeCode } from '@/config/exchanges'

export interface OnboardingChecklist {
  step: number
  task: string
  status: 'pending' | 'done' | 'skipped'
  command?: string
}

/**
 * QUICK ONBOARDING FLOW: 5 steps, ~2 minutes
 *
 * User: "Add Dubai"
 * Me: Execute this function with code='DFM'
 * System: Automatically enables Dubai listing in 5 steps
 */

export async function onboardExchange(exchangeCode: ExchangeCode): Promise<OnboardingChecklist[]> {
  const exchange = getExchange(exchangeCode)

  const checklist: OnboardingChecklist[] = [
    {
      step: 1,
      task: `✅ Exchange exists: ${exchange.name} (${exchange.code})`,
      status: 'done'
    },
    {
      step: 2,
      task: `Add ${exchange.country} to dashboard company settings`,
      status: 'pending',
      command: `Add ${exchange.country} to company_profile.country selector`
    },
    {
      step: 3,
      task: `Enable ${exchange.code} in menu system based on company location`,
      status: 'pending',
      command: `Update getNavGroups() to show ${exchange.code}-specific modules`
    },
    {
      step: 4,
      task: `Configure Listed Services modules for ${exchange.code}`,
      status: 'pending',
      command: `Set enabledModules: ${exchange.enabledModules.join(', ')}`
    },
    {
      step: 5,
      task: `Add regulatory documents checklist for ${exchange.code}`,
      status: 'pending',
      command: `Create pre-IPO checklist with: ${exchange.requiredDocuments.join(', ')}`
    },
    {
      step: 6,
      task: `Deploy and test`,
      status: 'pending',
      command: `npm run build && git push origin main`
    }
  ]

  return checklist
}

/**
 * EXCHANGE DETAILS FOR MENU SYSTEM
 *
 * When user selects "Dubai" as their exchange:
 * 1. Show only modules enabled for DFM
 * 2. Hide modules not available yet (e.g., M&A if not enabled)
 * 3. Update regulatory requirements based on DFSA rules
 * 4. Show correct filing deadlines and thresholds
 */

export function getExchangeMenuConfig(exchangeCode: ExchangeCode) {
  const exchange = getExchange(exchangeCode)

  return {
    // Navigation
    exchangeName: exchange.name,
    country: exchange.country,
    regulator: exchange.regulatoryBody,
    regulatoryCode: exchange.regulator,

    // Enabled modules for this exchange
    enabledModules: exchange.enabledModules,
    disabledModules: [
      'disclosure',
      'ir',
      'cfo',
      'executive',
      'mna',
      'compliance'
    ].filter(m => !exchange.enabledModules.includes(m)),

    // Key thresholds
    listing: {
      minPublicFloat: exchange.minPublicFloat,
      minMarketCap: exchange.minMarketCap,
      minProfitability: exchange.minYearsProfitability,
      minShareholders: exchange.minShareholderCount
    },

    // Filing deadlines (for Filing Calendar module)
    deadlines: {
      firstQuarterlyReport: exchange.filingDeadlines.firstQuarterlyReport,
      firstAnnualReport: exchange.filingDeadlines.firstAnnualReport,
      continuousDisclosure: exchange.filingDeadlines.continuousDisclosure
    },

    // Pre-IPO checklist
    requiredDocuments: exchange.requiredDocuments,

    // Contact/support
    filingSystem: exchange.filingSystem,
    supportEmail: exchange.supportEmail,
    apiEndpoint: exchange.apiEndpoint
  }
}

/**
 * WHAT CHANGES WHEN YOU SAY "ADD DUBAI"
 *
 * Before: Users from UAE only see "COMING SOON" for all exchanges
 * After: Dubai residents see:
 *   - DFM selected in country/exchange picker
 *   - All 4 enabled modules (disclosure, ir, cfo, compliance)
 *   - M&A greyed out (not available for DFM yet)
 *   - Correct filing deadlines (45 days for first quarterly report)
 *   - Required documents: Prospectus, Financial Statements, Risk Factors, etc.
 *   - Regulatory requirements from DFSA
 */

export const EXCHANGE_ONBOARDING_TEMPLATE = `
# Onboarding {EXCHANGE_NAME} ({CODE})

## Step 1: Verify Exchange Config
- ✅ Exchange exists in /src/config/exchanges.ts
- Enabled modules: {ENABLED_MODULES}
- Mandatory modules: {MANDATORY_MODULES}
- Regulator: {REGULATOR}
- Filing system: {FILING_SYSTEM}

## Step 2: Update Company Model
File: /src/types/company.ts
- Add exchange code to Exchange type union
- Example: export type Exchange = 'TSX' | 'NASDAQ' | 'LSE' | '{CODE}' | ...

## Step 3: Update Menu System
File: /src/config/menu.ts
- Add {COUNTRY} to available locations
- Create {CODE}_NAV_GROUPS with enabled modules only
- Hide modules not in enabledModules array

## Step 4: Update Dashboard
Files:
- /src/app/dashboard/page.tsx - Add {EXCHANGE_NAME} to onboarding flow
- /src/app/dashboard/listed-services/preview/page.tsx - Show {CODE}-specific modules
- /src/components/CompanySelector.tsx - Add {COUNTRY} to location picker

## Step 5: Deploy
\`\`\`bash
npm run build
git add -A
git commit -m "Add {EXCHANGE_NAME} ({CODE}) support"
git push origin main
\`\`\`

## Testing Checklist
- [ ] Company can select {COUNTRY} as location
- [ ] Company can select {EXCHANGE_NAME} as exchange
- [ ] Only {ENABLED_MODULES} modules show in Listed Services
- [ ] Other modules are greyed out with "Not available for {CODE}" message
- [ ] Filing Calendar shows {CODE}-specific deadlines
- [ ] Pre-IPO checklist includes {CODE}-required documents
- [ ] All links to {REGULATOR} website work
`
