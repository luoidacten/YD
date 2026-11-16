import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {SPECIES} from '../dist/data.js';
function fixture(){const g=new Game();g.state.gold=10000;const room=g.addRoom(1,1,'boss',0);g.state.props=[];g.rebuild();return{g,room}}
function forceOffer(g,id,floor=0){g.state.floorBoss[floor]={id:null,offered:[id,'warden','frost_witch'].filter((v,i,a)=>a.indexOf(v)===i),rerolled:false};
 while(g.state.floorBoss[floor].offered.length<3)g.state.floorBoss[floor].offered.push('orc_warlord')}

test('three floor-boss offers are seeded, saved, and cannot duplicate a selected boss on another floor',()=>{
 const a=fixture().g,b=fixture().g;assert.deepEqual(a.floorBossOffers(0).map(d=>d.id),b.floorBossOffers(0).map(d=>d.id));
 assert.equal(new Set(a.floorBossOffers(0).map(d=>d.id)).size,3);
 const selected=a.floorBossOffers(0)[0].id;assert.ok(a.hireFloorBoss(0,selected));
 a.addRoom(1,1,'treasure',1);a.rebuild();assert.ok(a.floorBossOffers(1).every(d=>d.id!==selected));
 const saved=new Game(JSON.parse(a.serialize()));assert.deepEqual(saved.state.floorBoss,a.state.floorBoss);
});
test('reroll is a new seeded set, costs fifty once, and cannot happen after a choice',()=>{
 const {g}=fixture(),original=g.floorBossOffers(0).map(d=>d.id),gold=g.state.gold;
 assert.ok(g.rerollFloorBosses(0));assert.equal(g.state.gold,gold-50);
 assert.ok(g.floorBossOffers(0).every(d=>!original.includes(d.id)));assert.equal(g.rerollFloorBosses(0),false);
 assert.ok(g.hireFloorBoss(0,g.floorBossOffers(0)[0].id));assert.equal(g.rerollFloorBosses(0),false);
});
test('a built boss chamber blocks start until its master is chosen and rejects unaffordable choices without mutation',()=>{
 const {g}=fixture();assert.ok(g.layoutIssues().some(x=>x.includes('Tầng Chủ')));g.state.gold=0;
 const before=g.serialize();assert.equal(g.hireFloorBoss(0,g.floorBossOffers(0)[0].id),null);assert.equal(g.serialize(),before);
});
test('Titan HP seal preserves health ratios, disappears on downing, and logs the broken seal',()=>{
 const {g,room}=fixture();forceOffer(g,'warden');const resident=g.spawn('goblin','monster',room.x+3,room.y,'G',[]);
 const max=resident.maxHp;resident.hp=max*.4;const boss=g.hireFloorBoss(0,'warden');assert.ok(boss);
 assert.equal(g.floorSeals(0).hp,.15);assert.ok(resident.maxHp>max);assert.ok(Math.abs(resident.hp/resident.maxHp-.4)<.0001);
 g.damage(boss,100000);assert.equal(g.floorSeals(0).hp,0);assert.equal(resident.maxHp,max);
 assert.ok(g.state.logs.some(l=>l.message.includes('Ấn Tầng vỡ')));
});
test('legacy boss saves infer their master without rerolling or replacing entity identity',()=>{
 const {g,room}=fixture(),boss=g.spawn('warden','monster',54,46,'Hộ Môn',[],{boss:'warden',roomId:room.id});
 const old=JSON.parse(g.serialize());delete old.floorBoss;const seed=old.seed;
 const loaded=new Game(old);assert.equal(loaded.state.floorBoss[0].entityId,boss.id);assert.equal(loaded.entity(boss.id).name,'Titan');
 assert.deepEqual(loaded.pendingFloorBosses(),[]);assert.equal(loaded.state.seed,seed);
});
test('bone hire discount and necromancer soul multiplier use central seal modifiers',()=>{
 const {g,room}=fixture();forceOffer(g,'bone_king');assert.ok(g.hireFloorBoss(0,'bone_king'));
 const family=SPECIES.skeleton.family;SPECIES.skeleton.family='bone';
 try{const gold=g.state.gold;assert.ok(g.hire(room.id,'skeleton'));assert.equal(gold-g.state.gold,57)}
 finally{SPECIES.skeleton.family=family}
 const other=fixture().g;forceOffer(other,'necro_lord');const necro=other.hireFloorBoss(0,'necro_lord');
 const hero=other.spawn('knight','hero',56,46,'H',[]),souls=other.state.souls;other.damage(hero,100000,necro);
 assert.equal(other.state.souls,souls+3);other.reviveAlly(necro,hero);other.damage(hero,100000,necro);
 assert.equal(other.state.souls,souls+3);
});

test('frost seal is fifteen flat HP rather than fifteen times maximum HP, including loaded shields',()=>{
 const {g}=fixture(),boss=g.hireFloorBoss(0,'frost_witch',{legacy:true});g.state.phase='battle';g.refreshFloorSeals();
 assert.equal(g.effect(boss,'shield').value,15);g.effect(boss,'shield').value=8250;g.refreshFloorSeals();
 assert.equal(g.effect(boss,'shield').value,15);g.effect(boss,'shield').value=6;g.refreshFloorSeals();assert.equal(g.effect(boss,'shield').value,6);
});
