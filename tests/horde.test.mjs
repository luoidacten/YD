import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {CARDS,SPECIES} from '../dist/data.js';
import {TRAP_PLUS} from '../dist/traps-plus.js';
import {ZOMBIES} from '../dist/zombies.js';
import {KINGDOM,OFFENSIVES,PURGE_WAVE} from '../dist/kingdom.js';
import {BOSS_POOL} from '../dist/boss-data.js';
import fs from 'node:fs';

function fixture(){const g=new Game();g.addRoom(1,1,'guard');g.addRoom(2,1,'guard');
 Object.assign(g.state,{entities:[],items:[],props:[],traps:[],telegraphs:[],hazards:[],noises:[],squads:[],time:1,projectiles:[]});g.rebuild();return g}
const room=g=>g.state.rooms.find(r=>r.type==='guard');
function unit(g,species,faction,dx){const r=room(g);const e=g.spawn(species,faction,r.x+dx,r.y,species,[],{floorId:0,roomId:r.id});
 Object.assign(e,{charms:[],passiveIds:[],statuses:[]});return e}

test('20 new traps have cards and art, and are placed only in preparation for gold',()=>{
 assert.equal(Object.keys(TRAP_PLUS).length,20);
 for(const id of Object.keys(TRAP_PLUS)){assert.ok(CARDS.some(c=>c.id===id&&c.kind==='trap'),id);
  assert.ok(fs.existsSync(`dist/assets/frames/yd/traps/trap_${id}.png`),id)}
 const g=fixture(),r=room(g);g.state.phase='prepare';g.state.gold=200;
 assert.ok(g.place('T01',r.x+2,r.y,0).ok);assert.equal(g.state.gold,140);
 assert.equal(g.place('T01',r.x+2,r.y,0).ok,false,'no stacking');
});

test('a turret fires a real projectile and a mine explodes once per wave',()=>{
 const g=fixture(),r=room(g);g.state.phase='prepare';g.state.gold=999;
 g.place('T01',r.x-4,r.y,0);g.place('T09',r.x+3,r.y+2,0);g.state.phase='battle';
 const h=unit(g,'rogue','hero',0);h.hp=h.maxHp=500;
 for(let i=0;i<60;i++)g.updatePlusTraps(1/30),g.updateProjectiles(1/30);
 assert.ok(h.hp<500,'turret hit the hero');
 const mine=g.state.traps.find(t=>t.type==='T09');h.x=mine.x;h.y=mine.y;const hp=h.hp;
 g.updatePlusTraps(1/30);assert.ok(h.hp<hp,'mine exploded');assert.ok(mine.spent);
});

test('zombies revive unless burnt, and regenerate fast out of combat',()=>{
 assert.equal(Object.keys(ZOMBIES).length,10);assert.ok(BOSS_POOL.zombie_king);
 const g=fixture();g.state.phase='battle';g.state.encounter={spawnQueue:[],reinforcements:[],mainCount:1};
 const z=unit(g,'zombie_shambler','monster',-2),h=unit(g,'rogue','hero',-1);h.hp=h.maxHp=9999;h.action='guard';
 assert.equal(z.zombieRevives,1);
 g.damage(z,9999,h,{skill:'A02'});assert.equal(z.status,'downed');g.state.time+=6;g.tick(1/30);
 assert.equal(z.status,'active','stood back up');
 g.damage(z,9999,h,{skill:'A01'});g.state.time+=6;g.tick(1/30);assert.equal(z.status,'downed','fire keeps it down');
 g.state.phase='prepare';g.state.entities=g.state.entities.filter(e=>e.faction==='monster');      // out of combat
 const y=unit(g,'zombie_runner','monster',-3);y.hp=10;y.lastDamaged=-100;for(let i=0;i<30*7;i++)g.tick(1/30);
 assert.ok(y.hp>=y.maxHp*.95,'fast regen');
});

test('kingdom units are smart heroes with gear; offensives queue extra waves and hold the battle open',()=>{
 assert.equal(Object.keys(KINGDOM).length,5);
 const g=fixture();g.state.phase='battle';const k=unit(g,'royal_guard','hero',0);
 assert.ok(k.intelligence>=75);assert.ok(g.weaponDefinition(k),'royal guard is armed');
 assert.equal(g.offensiveFor(PURGE_WAVE),'purge');
 assert.equal(OFFENSIVES.purge.waves.length,5);
 g.state.encounter={spawnQueue:[],reinforcements:[],mainCount:0,offensive:'raid',
  extraWaves:[{at:45,index:0,released:false,units:[{species:'knight',name:'X',squadId:'raid-0',reinforcement:false}]}]};
 g.finish();assert.equal(g.state.phase,'battle','pending offensive wave keeps the battle going');
 assert.equal(g.state.encounter.spawnQueue.length,1);
});

test('smart heroes spot turrets and choose to dismantle them',()=>{
 const g=fixture(),r=room(g);g.state.phase='prepare';g.state.gold=999;g.place('T02',r.x+4,r.y,0);g.state.phase='battle';
 const h=unit(g,'royal_archer','hero',-2);g.heroSense();
 const t=g.state.traps.find(t=>t.type==='T02');assert.ok(h.knownTraps.includes(t.id));
 g.decide(h);assert.ok(h.scores.some(s=>s.action==='disarm'),'disarm considered');
});
