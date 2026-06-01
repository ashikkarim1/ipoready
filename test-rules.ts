import { IPO_SEQUENCING_RULES } from './src/lib/ipo-sequencing';

const errorRules = IPO_SEQUENCING_RULES.filter((r) => r.severity === 'error');
const blockerConcepts = [
  'auditor',
  'cap table',
  'accounting policies',
  'audit complete',
  'regulatory',
  'exchange listing',
  'compliance',
  'disclosure',
];

console.log(`Total error rules: ${errorRules.length}\n`);

for (const rule of errorRules) {
  const desc = rule.description.toLowerCase();
  const matches = blockerConcepts.filter((concept) => desc.includes(concept));
  
  if (matches.length === 0) {
    console.log(`❌ MISSING: ${rule.id}`);
    console.log(`   ${rule.description}`);
    console.log();
  }
}
