import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import '../dist/simulation.js';
import {SPECIES} from '../dist/data.js';
import {ITEMS} from '../dist/expansion.js';
import {Painter} from '../dist/painter.js';
import {FX_KINDS} from '../dist/bestiary-data.js';

export function auditProjectArt(root=process.cwd()){
 const scopes=['v05','v06'].map(v=>JSON.parse(fs.readFileSync(path.join(root,`tests/fixtures/art-scope-${v}.json`),'utf8')));
 const scope={sourceCommit:scopes.map(s=>s.sourceCommit).join('+'),frames:Object.assign({},...scopes.map(s=>s.frames))};
 const used=new Set(),p=Object.assign(Object.create(Painter.prototype),{time:10,game:{state:{time:10}},attackPoses:new Map()});
 for(const[id,d]of Object.entries(SPECIES))for(const elite of [false,true])for(const moving of [false,true])for(let f=0;f<4;f++){
  const e={id:'audit',species:id,elite,moving,lastDamaged:-100,disguised:false};p.attackPoses.clear();
  for(const name of [p.bodySprite(e,f),p.bodySprite({...e,lastDamaged:10},f)])used.add(name);
  p.attackPoses.set(e.id,{started:10-f*.075-.001});used.add(p.bodySprite(e,f));
 }
 for(const d of Object.values(ITEMS))if(d.art)used.add(d.art);
 for(const moving of [false,true])for(let f=0;f<4;f++){
  const e={id:'bear',species:'druid',bearForm:true,moving,lastDamaged:-100};
  p.attackPoses.clear();used.add(p.bodySprite(e,f));p.attackPoses.set(e.id,{started:10-f*.075-.001});used.add(p.bodySprite(e,f));
 }
 for(const kind of FX_KINDS)for(const name of p.fxSprite(kind))used.add(name);
 const unused=[];
 for(const[name,expected]of Object.entries(scope.frames)){
  const file=path.join(root,'dist/assets/frames',name+'.png');
  if(!fs.existsSync(file))throw Error('Missing director art: '+name);
  if(createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==expected)throw Error('Director PNG changed: '+name);
  if(!used.has(name))unused.push(name);
 }
 return{scopeCommit:scope.sourceCommit,total:Object.keys(scope.frames).length,referenced:Object.keys(scope.frames).length-unused.length,unused};
}
if(process.argv[1]?.endsWith('project-art-audit.mjs')){
 const report=auditProjectArt();console.log(JSON.stringify(report,null,1));
}
