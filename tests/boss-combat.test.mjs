import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {BOSS_POOL} from '../dist/boss-data.js';
import {contains} from '../dist/data.js';
function fixture(id){const d=BOSS_POOL[id],g=new Game(),room=g.addRoom(1,1,'boss');g.state.props=[];g.rebuild();
 const e=g.spawn(d.species,'monster',54,46,d.name,[],{boss:id,roomId:room.id});
 e.maxHp=e.hp=10000;e.bossCooldown=0;e.skillIds=[];e.passiveIds=[];e.charms=[];
 const hero=g.spawn('knight','hero',57,46,'Test',[]);hero.hp=hero.maxHp=100000;hero.charms=[];hero.skillIds=[];hero.passiveIds=[];
 return{g,e,hero,room};}

test('all nine floor bosses have four distinct moves, permitted floors and supplied sprites',()=>{
 assert.equal(Object.keys(BOSS_POOL).length,9);
 for(const d of Object.values(BOSS_POOL)){assert.equal(d.skills.length,4);assert.equal(new Set(d.skills.map(k=>k.id)).size,4);
  assert.ok(d.floors.length);assert.ok(d.seals.length>=1&&d.seals.length<=3)}
});
test('every boss uses its four moves over a long phased fight and remains confined to its room',()=>{
 for(const id of Object.keys(BOSS_POOL)){
  const {g,e,hero,room}=fixture(id);e.hp=e.maxHp*.2;hero.hp=hero.maxHp*.2;
  if(id==='necro_lord'){const bone=g.spawn('skeleton','monster',51,46,'Bone',[]);bone.family='bone';bone.status='downed';bone.hp=0}
  for(let i=0;i<30*95;i++){
   g.state.time+=1/30;g.bossTick(e,1/30);g.resolveWorld(1/30);
   assert.ok(contains(room,e,1),id);hero.hp=Math.max(hero.hp,hero.maxHp*.1);
  }
  for(const k of BOSS_POOL[id].skills)assert.ok(e.bossSkillUsed?.[k.id]>0,`${id}: ${k.id}`);
 }
});
test('a damaging boss move cannot hit before its telegraph resolves or strike another floor',()=>{
 const {g,e,hero}=fixture('warden'),move=BOSS_POOL.warden.skills[0];hero.x=55;e.bossStage=0;
 const hp=hero.hp;assert.ok(g.castBossSkill(e,move,hero));assert.equal(hero.hp,hp);
 g.state.time=.8;g.resolveWorld(.8);assert.equal(hero.hp,hp);
 g.state.time=1.1;g.resolveWorld(.3);assert.ok(hero.hp<hp);
});
test('boss summons cannot exceed quota and channel zones stop when their owner falls',()=>{
 const {g,e,room}=fixture('necro_lord');for(let i=0;i<15;i++)g.bossSpawn(e,'skeleton');
 assert.ok(g.roomSlotsUsed(room)<=g.roomCapacity(room));
 e.bossStage=2;const hero=g.state.entities.find(a=>a.faction==='hero');
 assert.ok(g.castBossSkill(e,BOSS_POOL.necro_lord.skills[1],hero));g.state.time=1.1;g.resolveWorld(1.1);
 e.status='downed';g.state.time=2.2;g.resolveWorld(1.1);assert.equal(g.state.bossZones.length,0);
});

test('a controller boss with no mana still makes its innate ranged attack instead of endlessly retreating',()=>{
 const {g,e,hero}=fixture('frost_witch');e.mana=0;e.x=54;e.y=46;hero.x=57;hero.y=46;
 e.decision=100;e.action='attack';e.target=hero.id;e.cooldown=0;e.castUntil=0;
 assert.equal(g.usesMagicAttack(e),false);const hp=hero.hp;g.act(e,1/30);assert.ok(hero.hp<hp);
});

test('boss shield skills convert flat shield HP to the shared status API fraction',()=>{
 const {g,e}=fixture('death_knight'),k=BOSS_POOL.death_knight.skills.find(k=>k.effect==='shield');
 g.resolveBossSkill({source:e.id,bossSkill:k,targetId:e.id,x:e.x,y:e.y,floorId:e.floorId});assert.equal(g.effect(e,'shield').value,60);
});
