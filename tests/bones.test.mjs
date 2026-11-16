import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {BONE_SPECIES} from '../dist/bone-data.js';
import {KITS} from '../dist/catalog.js';
function fixture(){const g=new Game(),room=g.addRoom(1,1,'boss');g.state.gold=10000;g.state.props=[];g.rebuild();return{g,room}}
function bone(g,room,id='skeleton'){return g.spawn(id,'monster',room.x+3,room.y,id,[],{roomId:room.id})}
test('seven bone contracts have real kits, equipment and status immunities',()=>{
 for(const id of Object.keys(BONE_SPECIES)){const {g,room}=fixture(),e=bone(g,room,id);
  assert.equal(e.family,'bone');assert.ok(e.undead);assert.equal(KITS[id].skills.length,4);
  g.applyStatus(e,'poison',3);g.applyStatus(e,'bleed',3);assert.ok(!g.effect(e,'poison')&&!g.effect(e,'bleed'));
  if(id==='skeleton_guard')assert.equal(g.offhandDefinition(e).id,'W32');
  if(id==='skeleton_knight')assert.equal(g.weaponDefinition(e).id,'W43');
 }
});
test('holy damage is amplified once for bones',()=>{
 const {g,room}=fixture(),a=bone(g,room),b=bone(g,room);for(const e of [a,b]){
  e.hp=e.maxHp=10000;e.charms=[];e.passiveIds=[];e.statuses=[];e.gearSlots={};e.equipment=null;
 }
 g.damage(a,10,null,{effect:'holy'});g.damage(b,10);assert.ok(Math.abs((10000-a.hp)/(10000-b.hp)-1.5)<.01);
});
test('necromancer seal revives each bone once after eight seconds and stops after its boss falls',()=>{
 const {g,room}=fixture();const boss=g.hireFloorBoss(0,'necro_lord',{legacy:true}),e=bone(g,room);
 e.charms=[];e.passiveIds=[];g.damage(e,1e6);assert.equal(e.boneReviveAt,8);
 g.state.time=7.99;g.controlsTick(0);assert.equal(e.status,'downed');g.state.time=8;g.controlsTick(0);
 assert.equal(e.status,'active');assert.equal(e.hp,e.maxHp*.5);assert.ok(e.boneReviveUsed);
 g.damage(e,1e6);g.state.time=20;g.controlsTick(0);assert.equal(e.status,'downed');
 const other=bone(g,room);g.damage(other,1e6);g.damage(boss,1e6);g.state.time=40;g.controlsTick(0);assert.equal(other.status,'downed');
});
test('giant splitting respects the corpse quota and ember blast damages both factions on its own floor',()=>{
 const {g,room}=fixture(),giant=bone(g,room,'bone_giant');g.damage(giant,1e6);
 assert.equal(g.state.entities.filter(e=>e.species==='skeleton').length,2);assert.ok(g.roomSlotsUsed(room)<=g.roomCapacity(room));
 const ember=bone(g,room,'ember_skeleton');ember.x=52;ember.charms=[];ember.passiveIds=[];
 const h=g.spawn('knight','hero',53,46,'H',[]),friend=bone(g,room);friend.x=51;
 for(const e of [h,friend]){e.hp=e.maxHp=1000;e.charms=[];e.passiveIds=[];e.statuses=[]}
 const remote=g.spawn('knight','hero',53,46,'Other floor',[],{floorId:1}),hp=remote.hp;
 g.damage(ember,1e6);assert.ok(h.hp<1000&&friend.hp<1000);assert.ok(g.effect(h,'burn'));assert.equal(remote.hp,hp);
 const filled=fixture(),big=bone(filled.g,filled.room,'bone_giant');
 for(let i=0;i<7;i++)bone(filled.g,filled.room);filled.g.damage(big,1e6);
 assert.equal(filled.g.state.entities.filter(e=>e.species==='skeleton').length,7);
});
