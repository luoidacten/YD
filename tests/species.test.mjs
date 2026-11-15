import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {SPECIES,ROOMS} from '../dist/data.js';
import {KITS} from '../dist/catalog.js';
import {FAVORITES} from '../dist/expansion.js';
import {SPECIES_V05} from '../dist/species-data.js';
function fixture(type='boss'){const g=new Game(),room=g.addRoom(1,1,type);g.state.props=[];g.rebuild();g.state.gold=10000;return{g,room}}
function unit(g,id,faction='monster',x=54){const e=g.spawn(id,faction,x,46,id,[]);e.hp=e.maxHp=1000;return e}

test('sixteen species hire and contract correctly with valid room favorites, kits and quota rejection',()=>{
 assert.equal(Object.keys(SPECIES_V05).length,16);
 for(const id of Object.keys(SPECIES_V05)){
  const {g,room}=fixture(),e=g.hire(room.id,id);assert.ok(e,id);assert.equal(g.unitSlots(e),SPECIES[id].slots||1);
  assert.equal(KITS[id].skills.length,4);assert.equal(KITS[id].passives.length,2);
  assert.ok(FAVORITES[id].every(r=>ROOMS[r]),id);
  g.state.mana=100;const c=g.makeCard('contract-'+id);g.state.deck.hand.push(c);assert.ok(g.playCard(c.uid,58,48,0).ok,id);
 }
 const {g,room}=fixture('guard');assert.ok(g.hire(room.id,'minotaur'));assert.ok(g.hire(room.id,'living_armor'));const gold=g.state.gold;
 assert.equal(g.hire(room.id,'troll'),null);assert.equal(g.state.gold,gold);
});
test('harpy steals only a light bag item through transfer with a single owner',()=>{
 const {g}=fixture(),harpy=unit(g,'harpy'),hero=unit(g,'knight','hero',55);g.random=()=>.99;
 const item=g.state.items.find(i=>i.id===hero.inventory[0]);g.damage(hero,1,harpy);
 assert.equal(item.owner,harpy.id);assert.ok(!hero.inventory.includes(item.id));assert.ok(harpy.inventory.includes(item.id));
});
test('gnoll pack and werewolf loss response require living same-room allies',()=>{
 const {g}=fixture(),a=unit(g,'gnoll'),target=unit(g,'knight','hero',56);a.passiveIds=[];a.charms=[];target.charms=[];
 g.random=()=>.99;target.seen[a.id]={firstSeen:-10};g.damage(target,10,a);const solo=1000-target.hp;
 target.hp=1000;unit(g,'gnoll','monster',57);g.damage(target,10,a);assert.ok(1000-target.hp>solo*1.15);
 const wolf=unit(g,'werewolf','monster',53),friend=unit(g,'goblin','monster',52);g.damage(friend,10000,target);
 assert.ok(g.effect(wolf,'power'));
});
test('burn stops troll regeneration; treant takes extra fire and immunities reject both status and periodic damage',()=>{
 const {g}=fixture(),troll=unit(g,'troll');troll.hp=500;g.state.time=1;g.pulseStatuses(troll);assert.ok(troll.hp>500);
 troll.hp=500;g.applyStatus(troll,'burn',5,1,troll);g.state.time=3;g.pulseStatuses(troll);assert.ok(troll.hp<500);
 const armor=unit(g,'living_armor'),salamander=unit(g,'salamander');
 for(const type of ['poison','bleed']){g.applyStatus(armor,type,3,1,troll);assert.ok(!g.effect(armor,type));
  const hp=armor.hp;g.damage(armor,10,troll,{secondary:true,effect:type});assert.equal(armor.hp,hp)}
 g.applyStatus(salamander,'burn',3,1,troll);assert.ok(!g.effect(salamander,'burn'));
 const tree=unit(g,'treant');tree.passiveIds=[];tree.charms=[];
 g.damage(tree,10,null,{secondary:true,effect:'burn'});assert.equal(tree.hp,985);
});
test('minotaur push stops at a wall and lich resurrection needs an operational grave',()=>{
 const {g}=fixture(),m=unit(g,'minotaur'),hero=unit(g,'knight','hero',55);
 g.state.props.push({id:'wall',type:'wall',solid:true,x:56,y:46,floorId:0});g.rebuild();
 assert.ok(g.castSkill(m,'C09',hero.id));assert.ok(hero.x<55.5);
 const lich=unit(g,'lich'),skeleton=unit(g,'skeleton','monster',53);skeleton.status='downed';skeleton.hp=0;
 assert.equal(g.castSkill(lich,'H05',skeleton.id),false);g.addRoom(0,1,'grave');g.state.time+=30;
 assert.ok(g.skeletonResurrectionAllowed(lich,skeleton));
});
test('kobold lays one nonblocking trap per wave with an interruptible channel and spends personal mana',()=>{
 const {g}=fixture(),e=unit(g,'kobold');g.state.phase='battle';e.visibleIds=[];g.decide(e);assert.equal(e.action,'lay-trap');
 const mana=e.mana;for(let i=0;i<20;i++){g.state.time+=1/30;g.act(e,1/30)}
 assert.equal(g.state.traps.length,1);assert.equal(e.mana,mana-8);assert.equal(e.laidTrapWave,g.state.wave);
 const trap=g.state.traps[0];assert.ok(e.knownTraps.includes(trap.id));assert.ok(g.walkable(trap.x,trap.y,trap.floorId,e));
 g.decide(e);assert.notEqual(e.action,'lay-trap');
});
