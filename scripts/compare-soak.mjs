import fs from 'node:fs';
const files=process.argv.slice(2);
const before=JSON.parse(fs.readFileSync(files[0]||'tests/fixtures/soak-baseline.json','utf8'));
const after=JSON.parse(fs.readFileSync(files[1]||'tests/fixtures/soak-formatted.json','utf8'));
const mismatch=before.battles.filter(b=>after.battles.find(a=>a.seed===b.seed&&a.wave===b.wave)?.hash!==b.hash);
if(mismatch.length||before.battles.length!==after.battles.length)throw Error('Soak hashes differ');
console.log(`Full saved-state SHA-256: ${before.battles.length}/${before.battles.length} identical`);
