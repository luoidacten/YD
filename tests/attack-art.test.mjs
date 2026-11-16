import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {Painter} from '../dist/painter.js';
import {ART_SIZE} from '../dist/art-metadata.js';
import {auditProjectArt} from '../scripts/project-art-audit.mjs';
import {ITEMS} from '../dist/expansion.js';

test('every delivered v0.4-v0.6 project PNG is referenced and byte-identical to the handoff',()=>{
 const result=auditProjectArt();assert.equal(result.total,877);assert.deepEqual(result.unused,[]);
});
test('attack events do not change saved simulation state; four poses last exactly 0.3 renderer seconds',()=>{
 const g=new Game();g.addRoom(1,1,'boss');const e=g.spawn('ninja','hero',54,46,'Ninja',[]);e.lastDamaged=-100;
 const before=g.serialize();g.recordAttack(e);assert.equal(g.serialize(),before);
 const p=Object.assign(Object.create(Painter.prototype),{game:g,time:10});p.captureAttacks();
 for(let f=0;f<4;f++){p.time=10+f*.075+.001;assert.equal(p.bodySprite(e,0),`yd/attack/ninja_attack_anim_f${f}`)}
 p.time=10.301;assert.equal(p.bodySprite(e,0),'yd/chars/ninja_idle_anim_f0');assert.equal(g.serialize(),before);
});
test('Mimic retains opening frames and a missing attack frame falls back to a real idle frame',()=>{
 const g=new Game(),p=Object.assign(Object.create(Painter.prototype),{game:g,time:1,attackPoses:new Map()});
 p.attackPoses.set('m',{started:.9});assert.equal(p.bodySprite({id:'m',species:'mimic',disguised:false,lastDamaged:-100},2),
  'chest_mimic_open_anim_f2');
 const key='yd/attack/goblin_attack_anim_f1',value=ART_SIZE[key];
 try{delete ART_SIZE[key];assert.equal(p.bodySprite({id:'m',species:'goblin',lastDamaged:-100},3),'goblin_idle_anim_f0')}
 finally{ART_SIZE[key]=value}
});
test('native project sprites use integer nearest-neighbor scaling and gun poses are horizontal',()=>{
 const calls=[],p=Object.assign(Object.create(Painter.prototype),{bounds:{tile:32},time:1,
  point:()=>({x:12.3,y:20.6}),image:()=>({complete:true,naturalWidth:16,naturalHeight:18}),
  ctx:{save(){},restore(){},translate:(...v)=>calls.push(['translate',...v]),scale(){},rotate:a=>calls.push(['rotate',a]),
   drawImage:(...v)=>calls.push(['draw',...v.slice(1)])},attackPoses:new Map([['e',{started:.9}]])});
 p.nativeSprite('yd/monsters/ghost_idle_anim_f0',0,0);assert.deepEqual(calls[0],['translate',12,21]);
 assert.deepEqual(calls[1],['draw',-16,-36,32,36]);assert.equal(p.ctx.imageSmoothingEnabled,false);
 p.drawWeapon({id:'e',x:0,y:0,flip:false},ITEMS.W39);assert.ok(calls.some(c=>c[0]==='rotate'&&c[1]===Math.PI/2));
});
test('changing Game clears old renderer attack and spell queues without touching either save',()=>{
 const g=new Game(),p=Object.assign(Object.create(Painter.prototype),{game:g,time:1});p.captureAttacks();
 p.attackPoses.set('old',{started:1});p.fx=[{}];p.game=new Game();p.captureAttacks();
 assert.equal(p.attackPoses.size,0);assert.deepEqual(p.fx,[]);
});

test('boss windup holds frame one, resolve begins at frame two, and bear form uses its supplied animations',()=>{
 const g=new Game(),room=g.addRoom(1,1,'boss'),e=g.spawn('necro_lord','monster',54,46,'Boss',[],{roomId:room.id,boss:'necro_lord'});
 const p=Object.assign(Object.create(Painter.prototype),{game:g,time:10,attackPoses:new Map()});
 e.bossWindupUntil=1;e.bossCastSkill='N01';assert.equal(p.bodySprite(e,0),'yd/attack/necro_lord_attack_anim_f1');
 g.state.time=1;g.recordAttack(e);p.captureAttacks();assert.equal(p.bodySprite(e,0),'yd/attack/necro_lord_attack_anim_f2');
 p.time+=.08;assert.equal(p.bodySprite(e,0),'yd/attack/necro_lord_attack_anim_f3');
 const druid=g.spawn('druid','hero',56,46,'Druid',[]);g.setBearForm(druid,true);p.attackPoses.clear();
 assert.equal(p.bodySprite(druid,2),'yd/monsters/druid_bear_idle_anim_f2');
 druid.moving=true;assert.equal(p.bodySprite(druid,3),'yd/monsters/druid_bear_run_anim_f3');
});

test('static floor raster is reused until terrain or floor revision changes, without gameplay RNG',()=>{
 const {WIDTH,HEIGHT}= {WIDTH:148,HEIGHT:94},previous=globalThis.document;let draws=0;
 const terrain=Array.from({length:HEIGHT},()=>Array(WIDTH).fill(0));terrain[4][4]=1;
 const g={state:{worldSeed:1},terrain:[terrain],navRevision:1};
 const p=Object.assign(Object.create(Painter.prototype),{game:g,floor:0,camera:{tile:32},
  image:()=>({complete:true,naturalWidth:16})});
 try{
  globalThis.document={createElement:()=>({getContext:()=>({drawImage(){draws++},fillRect(){}})})};
  const first=p.floorLayer();assert.equal(draws,1);assert.equal(p.floorLayer(),first);assert.equal(draws,1);
  g.navRevision++;assert.notEqual(p.floorLayer(),first);assert.equal(draws,2);
 }finally{globalThis.document=previous}
});
