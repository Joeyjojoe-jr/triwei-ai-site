import { execSync } from 'node:child_process';
const out = execSync('du -sm dist').toString().split(/\s+/)[0];
const mb = Number(out); const BUDGET = 300;
if (mb > BUDGET) { console.error(`Build too large: ${mb}MB > ${BUDGET}MB`); process.exit(1); }
console.log(`dist size OK: ${mb}MB ≤ ${BUDGET}MB`);