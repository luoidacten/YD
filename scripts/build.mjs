import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {CARDS,ROOMS} from '../dist/data.js';
import '../dist/expansion.js';
const required=['index.html','app.css','fantasy.css','app.js','simulation.js','world.js','ai.js','systems.js','content-systems.js','painter.js','audio.js','data.js','catalog.js','catalog-data.js','expansion.js','expansion-data.js'];
for(const name of required){const file='dist/'+name;if(!fs.existsSync(file))throw Error(`Missing ${file}`);if(name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status)throw Error(result.stderr)}}
for(const icon of new Set([...CARDS.map(c=>c.art),...Object.values(ROOMS).map(r=>r.icon)]))if(!fs.existsSync(`dist/assets/frames/${icon}.png`))throw Error(`Missing icon ${icon}`);
for(const clip of ['ui-click','sword','hit','coin','build','trap','boss','magic','heal','reinforcement'])if(!fs.existsSync(`dist/assets/audio/${clip}.ogg`))throw Error(`Missing sound ${clip}`);
console.log('Static build verified: modules, icons and 10 local CC0 sounds.');
