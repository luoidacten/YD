import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SPECIES} from '../dist/data.js';
import '../dist/v04-data.js';
import {Painter} from '../dist/painter.js';

export function auditSprites(root=process.cwd()){
 const frames=fs.readdirSync(path.join(root,'dist/assets/frames')).filter(n=>n.endsWith('.png')).map(n=>n.slice(0,-4)).sort();
 const source=fs.readdirSync(path.join(root,'dist')).filter(n=>/\.(js|html|css)$/.test(n))
  .map(n=>fs.readFileSync(path.join(root,'dist',n),'utf8')).join('\n').replace(/\\\r?\n/g,'');
 const used=new Set(frames.filter(n=>new RegExp(`(?<![a-zA-Z0-9_])${n}(?![a-zA-Z0-9_])`).test(source)));
 // Expand the actual unit frame selector rather than guessing every matching prefix.
 const painter={game:{state:{time:10}}};
 for(const species of Object.keys(SPECIES))for(const moving of [false,true])for(const lastDamaged of [0,10])
  for(const disguised of [false,true])for(let f=0;f<4;f++){
   const frame=Painter.prototype.bodySprite.call(painter,{species,moving,lastDamaged,disguised},f);
   if(frames.includes(frame))used.add(frame);
  }
 // Dynamic environment/UI selectors in Painter, app.healthHearts and world.wallDecorations.
 const dynamic=/^(floor_[1-8]|wall_banner_(red|blue|yellow|green)|wall_hole_[12]|button_(red|blue)_(up|down)|ui_heart_(full|half|empty)|wall_fountain_(mid|basin)_(red|blue)_anim_f[0-2]|doc_idle_anim_f[0-3]|elf_f_idle_anim_f[0-3]|floor_spikes_anim_f[0-3]|coin_anim_f[0-3])$/;
 for(const n of frames)if(dynamic.test(n))used.add(n);
 const reasons=JSON.parse(fs.readFileSync(path.join(root,'scripts/sprite-exemptions.json'),'utf8'));
 const unused=frames.filter(n=>!used.has(n));
 const unexplained=unused.filter(n=>!reasons[n]);if(unexplained.length)throw Error('Unexplained stock sprites: '+unexplained.join(', '));
 const report={scope:'370 stock 0x72 root frames; project art in yd/ is outside this audit',
  total:frames.length,referenced:frames.length-unused.length,exempt:unused.length,unexplained:0,
  referencedFrames:frames.filter(n=>used.has(n)),exemptions:Object.fromEntries(unused.map(n=>[n,reasons[n]]))};
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=auditSprites();fs.writeFileSync('tests/fixtures/sprite-audit.json',JSON.stringify(report,null,1)+'\n');
 console.log(`0x72: ${report.total} frames, ${report.referenced} referenced, ${report.exempt} documented exemptions, 0 unexplained.`);
}
