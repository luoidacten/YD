import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {EVENTS} from '../dist/management.js';

function fixture(){const g=new Game();g.addRoom(1,1,'guard');g.addRoom(2,1,'guard');
 Object.assign(g.state,{entities:[],items:[],props:[],traps:[],telegraphs:[],hazards:[],noises:[],squads:[],time:1,projectiles:[]});g.rebuild();return g}
const room=g=>g.state.rooms.find(r=>r.type==='guard');
function unit(g,species='goblin',faction='monster',dx=-3){const r=room(g);
 const e=g.spawn(species,faction,r.x+dx,r.y,species,[],{floorId:0,roomId:r.id});
 Object.assign(e,{charms:[],passiveIds:[],statuses:[],hp:100,maxHp:100,elite:false,decision:0});return e}

test('research costs souls, unlocks in order and changes one modifier set',()=>{
 const g=fixture();g.state.phase='prepare';g.state.souls=100;
 assert.equal(g.researchMods().upkeep,1);
 assert.ok(g.learnResearch('legion').ok);assert.equal(g.state.souls,90);assert.equal(g.researchMods().upkeep,.75);
 const cap=g.manaCapacity();assert.ok(g.learnResearch('dark').ok);assert.equal(g.manaCapacity(),cap+25);
 g.state.souls=0;assert.equal(g.learnResearch('legion').ok,false);
});

test('upkeep charges mana per monster and only the weakest leaves when mana runs out',()=>{
 const g=fixture();const strong=unit(g,'orc'),weak=unit(g,'goblin','monster',-4);strong.maxHp=300;weak.maxHp=20;
 assert.equal(g.upkeepCost(),2);
 g.state.mana=5;g.payUpkeep();assert.equal(g.state.mana,3);
 g.state.mana=0;g.payUpkeep();assert.ok(!g.entity(weak.id));assert.ok(g.entity(strong.id),'stronger stays');
});

test('fatigue reduces monster damage and rest clears it for mana',()=>{
 const g=fixture();const m=unit(g),h=unit(g,'rogue','hero',-2);g.affinity=()=>1;
 const hit=()=>{h.hp=100;h.statuses=[];g.damage(h,10,m,{secondary:false});return 100-h.hp};
 hit();const base=hit();m.fatigue=2;assert.ok(Math.abs(hit()-base*.84)<1e-6);
 g.state.phase='prepare';g.state.mana=50;assert.ok(g.restMonster(m.id).ok);assert.equal(m.fatigue,0);assert.equal(g.state.mana,40);
});

test('battle metrics, heatmap, infamy and the wave summary with three seeded events',()=>{
 const g=fixture();g.state.phase='battle';g.state.wave=2;
 const m=unit(g),h=unit(g,'rogue','hero',-2);g.waveMetrics();
 g.damage(h,500,m);g.sampleHeat();
 const w=g.mgmt().wave;assert.equal(w.heroesDown,1);assert.equal(w.killsByMonster[m.id],1);
 assert.ok(g.mgmt().infamy>0);
 g.finish();const last=g.mgmt().last;
 assert.equal(last.heroesDown,1);assert.equal(last.mvp.id,m.id);assert.equal(g.mgmt().events.length,3);
 const pick=g.mgmt().events.find(id=>!EVENTS[id].can||EVENTS[id].can(g));
 if(pick){assert.ok(g.chooseEvent(pick).ok);assert.equal(g.mgmt().events.length,0)}
 const copy=JSON.parse(g.serialize());assert.ok((copy.management||copy.state?.management).last);
});

test('guild report predicts the party without consuming gameplay randomness',()=>{
 const g=fixture();g.state.wave=3;const before=JSON.stringify(g.state.rng??g.state.seed??'');
 const r=g.guildReport();assert.equal(r.count,12);assert.equal(r.classes.length,12);
 assert.equal(JSON.stringify(g.state.rng??g.state.seed??''),before);
});
