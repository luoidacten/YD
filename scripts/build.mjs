import fs from 'node:fs';
for(const f of ['dist/index.html','dist/style.css','dist/main.js','dist/engine.js','dist/render.js','dist/data.js','dist/tactics.js'])if(!fs.existsSync(f))throw Error(`Missing ${f}`);
console.log('Static game ready in dist/ — no runtime dependencies.');
