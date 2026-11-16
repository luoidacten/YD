import {auditProjectArt} from './project-art-audit.mjs';
import {writeArtMetadata} from './art-metadata.mjs';
import {auditSprites} from './sprite-audit.mjs';
import {buildIconManifest} from './icon-assets.mjs';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {CARDS,ROOMS,SPECIES} from '../dist/data.js';
import '../dist/species-data.js';
writeArtMetadata();
const required=['index.html','app.css','fantasy.css','app.js','simulation.js','world.js','ai.js','systems.js','content-systems.js','lair.js','v04.js','v04-data.js','bestiary.js','bestiary-data.js','weapons.js','weapon-data.js','classes.js','classes-data.js','species.js','species-data.js','attack-visuals.js','weapon-ui.js','art-metadata.js','icons.js','showcase.js','room-life.js','arsenal.js','arsenal-data.js','lair-data.js','rescue.js','terrain-tactics.js','painter.js','audio.js','data.js','catalog.js','catalog-data.js','expansion.js','expansion-data.js'];
for(const name of required){const file='dist/'+name;if(!fs.existsSync(file))throw Error(`Missing ${file}`);if(name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status)throw Error(result.stderr)}}
for(const icon of new Set([...CARDS.map(c=>c.art),...Object.values(ROOMS).map(r=>r.icon)]))if(!fs.existsSync(`dist/assets/frames/${icon}.png`))throw Error(`Missing icon ${icon}`);
for(const d of Object.values(SPECIES)){if(['tiny_slug','chest_mimic','necromancer'].includes(d.sprite))continue;for(const state of d.animation==='single'?['']:['idle','run'])for(let i=0;i<4;i++)if(!fs.existsSync(`dist/assets/frames/${d.sprite}_${state?state+'_':''}anim_f${i}.png`))throw Error(`Missing animation ${d.sprite} ${state} ${i}`)}
for(const clip of ['ui-click','sword','hit','coin','build','trap','boss','magic','heal','reinforcement'])if(!fs.existsSync(`dist/assets/audio/${clip}.ogg`))throw Error(`Missing sound ${clip}`);
const icons=buildIconManifest();console.log('Approved UI icons:',Object.values(icons).reduce((n,g)=>n+Object.keys(g).length,0));
const audit=auditSprites();console.log(`Stock sprites: ${audit.referenced}/${audit.total} referenced; ${audit.exempt} documented exemptions.`);
const project=auditProjectArt();if(project.unused.length)throw Error('Unreferenced project art: '+project.unused.join(', '));
console.log(`Project art v0.4–v0.5: ${project.referenced}/${project.total} referenced, original PNG hashes unchanged.`);
console.log('Room icon backlog:',Object.keys(ROOMS).filter(id=>!icons.room[id]).join(', '));
console.log('Static build verified: modules, icons and 10 local CC0 sounds.');
