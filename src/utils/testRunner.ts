import { runScoringEngineValidation } from './scoringValidation';

const results = runScoringEngineValidation();
console.log('=== SCORING ENGINE VALIDATION RESULTS ===');
let allPassed = true;
results.forEach((r, idx) => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] Scenario ${idx + 1}: ${r.scenario}`);
  console.log(`       Details: ${r.details}`);
  if (!r.passed) allPassed = false;
});
console.log('==========================================');
console.log(`Total Scenarios: ${results.length} | All Passed: ${allPassed}`);
if (!allPassed) process.exit(1);
