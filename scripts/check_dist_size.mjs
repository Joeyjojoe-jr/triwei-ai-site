import { execSync } from 'node:child_process';
const out = execSync('du -sm dist').toString().split(/\s+/)[0];
const mb = Number(out); const BUDGET = 300;
if (mb > BUDGET) { console.error(Build too large:  MB >  MB); process.exit(1); }
console.log(dist size OK:  MB ≤  MB);