import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {SPECIES,CARDS} from '../dist/data.js';
import {ITEMS} from '../dist/expansion.js';
import {KITS} from '../dist/catalog.js';
import {EXTRA_WEAPONS,EXTRA_HEROES,EXTRA_MONSTERS} from '../dist/v04-data.js';
import {makeFixture} from '../scripts/soak.mjs';
import {perceive} from '../dist/ai.js';
import {Painter} from '../dist/painter.js';

function fixture(type='guard'){const g=new Game(),room=g.addRoom(1,1,type);g.state.props=[];g.rebuild();return{g,room}}
function unit(g,species='goblin',faction='monster',x=54,y=46){
 const e=g.spawn(species,faction,x,y,species,[]);
 Object.assign(e,{charms:[],passiveIds:[],skillIds:[],statuses:[],inventory:[],gearSlots:{},
  equipment:null,potions:0,quickScrolls:[],capacity:30,hp:100,maxHp:100,qualityPower:1,variant:'normal'});
 g.state.items=g.state.items.filter(i=>i.owner!==e.id);return e;
}
test('W13–W22 all equip with the declared range and each role uses an existing combat mechanism',()=>{
 const {g}=fixture(),e=unit(g);assert.equal(EXTRA_WEAPONS.length,10);
 for(const[id]of EXTRA_WEAPONS){const item=g.createItem(id,e);assert.ok(g.useItem(e,item.id));
  assert.equal(g.range(e),ITEMS[id].reach);assert.equal(item.location,'equipment')}
});
test('rusty sword marks brittle, machete exploits control and cleaver has a one-second bleed',()=>{
 const {g}=fixture(),a=unit(g),b=unit(g,'knight','hero',56);
 g.equipItem(a,g.createItem('W13',a));g.damage(b,10,a);assert.ok(g.effect(b,'brittle'));
 b.statuses=[];b.hp=100;g.equipItem(a,g.createItem('W20',a));g.damage(b,10,a);const plain=100-b.hp;
 b.hp=100;g.applyStatus(b,'slow',3,.2,a);g.damage(b,10,a);assert.ok(100-b.hp>plain*1.3);
 b.statuses=[];g.equipItem(a,g.createItem('W19',a));g.damage(b,1,a);assert.equal(g.effect(b,'bleed').until-g.state.time,1);
});
test('mace stuns are seeded, short and probabilistic; fast sword gives haste on the third strike',()=>{
 const {g}=fixture(),a=unit(g),b=unit(g,'knight','hero',56);
 b.hp=b.maxHp=10000;g.equipItem(a,g.createItem('W18',a));const saved=g.serialize();
 const count=game=>{let n=0;const x=game.entity(a.id),y=game.entity(b.id);for(let i=0;i<200;i++){
  y.statuses=[];game.damage(y,1,x);const s=game.effect(y,'stun');if(s){n++;assert.equal(s.until-game.state.time,.4)}}return n};
 const first=count(g);assert.equal(first,count(new Game(JSON.parse(saved))));assert.ok(first>10&&first<50);
 g.equipItem(a,g.createItem('W22',a));for(let i=0;i<2;i++)g.damage(b,1,a);assert.ok(!g.effect(a,'haste'));
 g.damage(b,1,a);assert.equal(g.effect(a,'haste').value,.2);
});
test('lavish sword boosts gold exactly once across repeated ownership transfers',()=>{
 const {g}=fixture(),a=unit(g),b=unit(g,'skeleton');g.equipItem(a,g.createItem('W21',a));
 const item={id:'gold',type:'gold',value:100,owner:null,x:54,y:46,floorId:0};g.state.items.push(item);
 assert.ok(g.transfer(item,a));assert.equal(item.value,125);g.drop(a);assert.ok(g.transfer(item,b));
 g.drop(b);assert.ok(g.transfer(item,a));assert.equal(item.value,125);
});
test('rare swords cannot be drawn from mystery packs, but have a low nonzero armory chance',()=>{
 const {g}=fixture(),pool=CARDS.filter(c=>c.kind==='item'&&ITEMS[c.id]?.slot==='weapon');
 for(let i=0;i<1000;i++)assert.ok(!g.pickCardDefinition(pool,'mystery').rare);
 let rare=0;for(let i=0;i<2000;i++)if(g.pickCardDefinition(pool,'armory').rare)rare++;
 assert.ok(rare>0&&rare<100);
 assert.ok(!g.state.deck.hand.some(c=>['W21','W22'].includes(c.definitionId)));
});
test('new hero kits spawn and weighted main/reinforcement choices respect wave and angel limits',()=>{
 const seen=new Set();for(const wave of [1,2,3])for(let seed=1;seed<=24;seed++){
  const g=makeFixture(seed,wave);assert.ok(g.start().ok);const queue=g.state.encounter.spawnQueue;
  for(const c of queue){if(EXTRA_HEROES[c.species])seen.add(c.species);if(wave===1)assert.ok(!EXTRA_HEROES[c.species]);
   if(wave<3)assert.notEqual(c.species,'angelHerald')}
  for(let i=0;i<10;i++)g.spawn('priest','hero',18,46,'Rear',[],{reinforcement:true});
  const angels=queue.filter(c=>c.species==='angelHerald').length+g.state.entities.filter(e=>e.species==='angelHerald').length;
  assert.ok(angels<=1);
 }
 for(const id of Object.keys(EXTRA_HEROES)){assert.ok(seen.has(id),id);const {g}=fixture();
  const e=g.spawn(id,'hero',54,46,id,[]);assert.equal(KITS[id].skills.length,4);assert.equal(KITS[id].passives.length,2);
  assert.ok(e.charms.length);assert.ok(g.weaponDefinition(e));}
});
test('miner detects and disarms traps through the existing knowledge and tool APIs',()=>{
 const {g,room}=fixture(),e=g.spawn('dwarfMiner','hero',54,46,'Miner',[]);
 const trap={id:'trap',type:'spikes',x:58,y:46,floorId:0,roomId:room.id,disabled:false};
 g.state.traps.push(trap);g.random=()=>0;perceive(g,e);assert.ok(e.knownTraps.includes(trap.id));
 g.decide(e);assert.ok(e.scores.some(s=>s.action==='disarm'));
});
test('smith repairs and grants one forge upgrade per weapon per wave, bounded at fifteen percent',()=>{
 const {g,room}=fixture('forge'),smith=g.spawn('dwarfSmith','hero',54,46,'Smith',[]),ally=g.spawn('knight','hero',56,46,'Ally',[]);
 room.owner='adventurers';smith.squadId=ally.squadId='s';ally.equipment.durability=20;smith.visibleIds=[];
 const weapon=g.state.items.find(i=>i.id===ally.gearSlots.weapon);
 for(let wave=1;wave<=4;wave++){g.state.wave=wave;g.state.time+=6;g.controlsTick(1);g.state.time+=6;g.controlsTick(1)}
 assert.equal(ally.equipment.durability,100);assert.equal(weapon.forgePower,.15);
});
test('herald rescues normal allies faster but cannot heal or revive Forsaken',()=>{
 const {g}=fixture(),angel=g.spawn('angelHerald','hero',54,46,'Angel',[]),body=unit(g,'knight','hero',55,46);
 g.damage(body,10000);body.charms=['forsaken'];assert.equal(g.reviveAlly(angel,body),false);
 assert.equal(g.castSkill(angel,'SK56',body.id),false);body.charms=[];angel.skillIds=[];
 angel.action='rescue';angel.target=body.id;angel.decision=100;
 for(let i=0;i<90;i++){g.state.time+=1/30;g.act(angel,1/30)}assert.equal(body.status,'active');
 body.charms=['forsaken'];body.hp=1;assert.equal(g.heal(body,50),0);
});
test('four new monsters obey hire/contract quotas and use their actual frame sequences',()=>{
 const painter=Object.create(Painter.prototype);painter.game={state:{time:1}};
 for(const[id,d]of Object.entries(EXTRA_MONSTERS)){const {g,room}=fixture();g.state.gold=1000;
  assert.ok(g.hire(room.id,id));g.state.mana=100;const card=g.makeCard('contract-'+id);g.state.deck.hand.push(card);
  const result=g.playCard(card.uid,58,48,0);assert.ok(result.ok);assert.equal(g.unitSlots(result.entity),1);
  assert.equal(painter.bodySprite({...result.entity,lastDamaged:-100},2),d.sprite+(d.animation==='single'?'_anim_f2':'_idle_anim_f2'));
 }
});
test('ice and swamp attacks apply slow/poison; pumpkin uses the existing explosion once with friendly fire',()=>{
 const {g}=fixture(),ice=unit(g,'iceZombie'),swamp=unit(g,'swampy'),hero=unit(g,'knight','hero',56);
 g.damage(hero,1,ice);assert.ok(g.effect(hero,'slow'));g.damage(hero,1,swamp);assert.ok(g.effect(hero,'poison'));
 const pumpkin=unit(g,'pumpkin','monster',56,46),friend=unit(g,'goblin','monster',57,46);
 hero.hp=100;hero.statuses=[];g.damage(pumpkin,10000,hero);assert.ok(hero.hp<100);assert.ok(friend.hp<100);
 const hp=friend.hp;pumpkin.status='active';pumpkin.hp=1;g.damage(pumpkin,10000,hero);assert.equal(friend.hp,hp);
});
test('seeded goo and destroyed-wall details are saved and never become movement blockers',()=>{
 const {g,room}=fixture('grave');assert.ok(room.wallDecorations.some(d=>d.art==='wall_goo'));
 assert.ok(room.wallDecorations.some(d=>d.requiresDestroyed));const saved=new Game(JSON.parse(g.serialize()));
 assert.deepEqual(saved.state.rooms[0].wallDecorations,room.wallDecorations);
 assert.ok(g.walkable(room.x,room.y));
});
test('rare chest swords appear only once after a tier IV/V chest commits its opening',()=>{
 for(const tier of [2,4]){const {g,room}=fixture(),hero=unit(g,'knight','hero');
  g.state.phase='battle';const chest=g.spawnClearChest(room);chest.tier=tier;
  hero.x=chest.x;hero.y=chest.y;hero.action='open-chest';hero.target=room.id;hero.decision=100;
  g.random=()=>.01;for(let i=0;i<40;i++){g.state.time+=1/30;g.act(hero,1/30)}
  const rare=g.state.items.filter(i=>['W21','W22'].includes(i.definitionId));assert.equal(rare.length,tier>=4?1:0);
  for(let i=0;i<40;i++)g.act(hero,1/30);
  assert.equal(g.state.items.filter(i=>['W21','W22'].includes(i.definitionId)).length,rare.length);
 }
});
