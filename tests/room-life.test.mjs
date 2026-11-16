import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game} from '../dist/simulation.js';
import {ROOMS,SPECIES,contains,distance} from '../dist/data.js';
import {ITEMS} from '../dist/expansion.js';
import {NEW_MONSTERS} from '../dist/arsenal-data.js';

function fixture(){const g=new Game(),r=g.addRoom(1,1,'guard');g.state.props=[];g.rebuild();return{g,r}}
function unit(g,species,faction,x=54,y=46){const e=g.spawn(species,faction,x,y,species,[]);Object.assign(e,{charms:[],passiveIds:[],skillIds:[],statuses:[],inventory:[],gearSlots:{},equipment:null,potions:0,quickScrolls:[],capacity:20,hp:100,maxHp:100,qualityPower:1,variant:'normal',order:'guard',concealed:false,decision:100,action:'wait',target:{x,y,floorId:0}});g.state.items=g.state.items.filter(i=>i.owner!==e.id);return e}
function act(g,e,seconds){for(let i=0;i<seconds*30;i++){g.state.time+=1/30;g.act(e,1/30)}}

test('every room type rewards a living visitor after clearing, never during preparation or at a distance',()=>{
 for(const type of Object.keys(ROOMS)){const g=new Game(),r=g.addRoom(1,1,type);g.rebuild();g.updateSeals();assert.equal(r.rewardChest,undefined);g.state.phase='battle';g.updateSeals();assert.equal(r.rewardChest,undefined);unit(g,'knight','hero',r.x,r.y);g.updateSeals();assert.ok(r.rewardChest,type);assert.ok(r.rewardChest.tier>=1&&r.rewardChest.tier<=5)}
});
test('last defender unlocks exactly one chest; revival and another clear do not farm a second reward',()=>{
 const {g,r}=fixture(),m=unit(g,'goblin','monster'),h=unit(g,'knight','hero',55,46);g.state.phase='battle';g.updateSeals();assert.equal(r.rewardChest,undefined);g.damage(m,10000,h);g.updateSeals();const c=structuredClone(r.rewardChest);assert.ok(c);m.status='active';m.hp=100;g.updateSeals();assert.equal(g.canOpenChest(h,r),false);g.damage(m,10000,h);g.updateSeals();assert.deepEqual(r.rewardChest,c);const loaded=new Game(JSON.parse(g.serialize()));assert.deepEqual(loaded.state.rooms[0].rewardChest,c)
});
test('chest grades scale with room level, floor and defenders; boss chests are ancient',()=>{
 const {g,r}=fixture();assert.equal(g.chestTier(r),1);r.level=3;r.floorId=1;r.defensePower=500;assert.equal(g.chestTier(r),4);r.type='boss';assert.equal(g.chestTier(r),5)
});
test('opening channels, interrupts on damage, commits one owner and cannot duplicate loot',()=>{
 const {g,r}=fixture(),a=unit(g,'knight','hero',54,48),b=unit(g,'rogue','hero',55,48);g.state.phase='battle';g.updateSeals();a.action='open-chest';a.target=r.id;act(g,a,.6);assert.equal(r.rewardChest.opened,false);a.lastDamaged=g.state.time;act(g,a,.2);assert.equal(a.chestChannel,0);act(g,a,1.6);assert.ok(r.rewardChest.opened);const gold=g.state.items.filter(i=>i.type==='gold');assert.equal(gold.length,1);assert.equal(gold[0].owner,a.id);b.action='open-chest';b.target=r.id;act(g,b,2);assert.equal(g.state.items.filter(i=>i.type==='gold').length,1)
});
test('heroes do not target an unseen chest or open one with a full bag or across floors',()=>{
 const {g,r}=fixture(),h=unit(g,'knight','hero',54,48);g.state.phase='battle';g.updateSeals();h.capacity=0;assert.equal(g.canOpenChest(h,r),false);h.capacity=20;h.floorId=1;assert.equal(g.canOpenChest(h,r),false);h.floorId=0;const c=r.rewardChest;h.x=c.x;h.y=c.y-4;g.state.props.push({id:'wall',type:'wall',solid:true,x:c.x,y:c.y-2,floorId:0});g.rebuild();assert.equal(g.canOpenChest(h,r),false)
});
test('preparation residents spread and keep walking within their own room; pause freezes patrols',()=>{
 const {g,r}=fixture(),members=[0,1,2,3].map(i=>unit(g,'skeleton','monster',54+i*.1,46));const visited=new Set();
 for(let i=0;i<30*18;i++){g.tick(1/30);for(const e of members){assert.ok(contains(r,e,1));visited.add(`${e.id}:${Math.round(e.x)},${Math.round(e.y)}`)}}
 assert.ok(visited.size>20);assert.ok(members.some(e=>distance(e,e.home)>2));const before=members.map(e=>[e.x,e.y]);g.state.paused=true;for(let i=0;i<100;i++)g.tick(1/30);assert.deepEqual(members.map(e=>[e.x,e.y]),before)
});
test('a defender returns home after combat and a Mimic keeps its disguise instead of wandering',()=>{
 const {g}=fixture(),m=unit(g,'skeleton','monster'),h=unit(g,'knight','hero',59,46);m.home={x:54,y:46,floorId:0};m.x=60;m.action='attack';m.target=h.id;h.status='downed';m.intelligence=10;g.act(m,1/30);assert.ok(m.returningHome);g.decide(m);assert.equal(m.action,'patrol');act(g,m,5);assert.ok(distance(m,m.home)<1);const mimic=g.spawn('mimic','monster',57,48,'Mimic',[]),p={x:mimic.x,y:mimic.y};for(let i=0;i<90;i++)g.tick(1/30);assert.equal(mimic.x,p.x);assert.equal(mimic.y,p.y);assert.ok(mimic.disguised)
});
test('all ten new monsters can be hired and summoned by actual contract cards with valid sprite frames',()=>{
 for(const[id,d]of Object.entries(NEW_MONSTERS)){const {g,r}=fixture();g.state.gold=1000;assert.ok(g.hire(r.id,id),id);g.state.entities=[];g.state.items=[];const card=g.makeCard('contract-'+id);g.state.deck.hand.push(card);g.state.mana=100;const result=g.playCard(card.uid,58,48,0);assert.ok(result.ok,`${id}: ${result.message}`);assert.equal(result.entity.species,id);assert.equal(g.state.mana,100-(d.summonCost||35));for(const state of d.animation==='single'?['']:['idle','run'])for(let i=0;i<4;i++)assert.ok(fs.existsSync(`dist/assets/frames/${d.sprite}_${state?state+'_':''}anim_f${i}.png`))}
});
test('large new monsters obey quota and rejected contracts preserve card and resources',()=>{
 const {g,r}=fixture();for(let i=0;i<g.roomCapacity(r);i++)unit(g,'goblin','monster',54+i,46);g.state.gold=1000;const gold=g.state.gold;assert.equal(g.hire(r.id,'brute'),null);assert.equal(g.state.gold,gold);const c=g.makeCard('contract-brute');g.state.deck.hand.push(c);const mana=g.state.mana;assert.equal(g.playCard(c.uid,58,48,0).ok,false);assert.equal(g.state.mana,mana);assert.ok(g.state.deck.hand.some(a=>a.uid===c.uid))
});
test('equipping each new weapon applies its actual reach while preserving equipment ownership',()=>{
 const {g}=fixture(),e=unit(g,'goblin','monster');for(const id of Object.keys(ITEMS).filter(id=>/^W\d+$/.test(id)&&Number(id.slice(1))<=30)){const item=g.createItem(id,e);assert.ok(g.useItem(e,item.id));assert.equal(g.range(e),ITEMS[id].reach);assert.equal(item.location,'equipment');assert.equal(item.owner,e.id);assert.ok(!e.inventory.includes(item.id))}assert.equal(Object.keys(NEW_MONSTERS).length,58)
});
test('physical bows attack at long range with zero mana and produce an arrow instead of a melee swing',()=>{
 const {g}=fixture(),a=unit(g,'goblin','monster',51,46),h=unit(g,'knight','hero',57,46);g.equipItem(a,g.createItem('W01',a));a.mana=0;a.action='attack';a.target=h.id;g.act(a,1/30);assert.ok(h.hp<100);assert.equal(a.mana,0);assert.ok(g.effects.some(e=>e.projectile==='arrow'));g.state.props.push({id:'wall',type:'wall',solid:true,x:54,y:46,floorId:0});g.rebuild();a.cooldown=0;a.action='attack';a.target=h.id;a.decision=100;const hp=h.hp;g.act(a,1/30);assert.equal(h.hp,hp)
});
test('a physical bow user can choose kiting with zero mana and fire staff inflicts its stated effect',()=>{
 const {g}=fixture(),a=unit(g,'goblin','monster',54,46),h=unit(g,'knight','hero',56,46);g.equipItem(a,g.createItem('W01',a));a.mana=0;g.decide(a);assert.ok(a.scores.some(s=>s.action==='kite'));g.equipItem(a,g.createItem('W05',a));g.damage(h,10,a);assert.ok(g.effect(h,'burn'));assert.ok(SPECIES.archer)
});
test('idle allies yield a corridor lane to the treasure carrier instead of blocking passage forever',()=>{
 const {g}=fixture(),carrier=unit(g,'knight','hero',51,46),blocker=unit(g,'knight','hero',52.2,46);g.state.treasure.carrier=carrier.id;carrier.action='retreat';blocker.action='wait';blocker.target={x:blocker.x,y:blocker.y,floorId:0};
 for(let i=0;i<150;i++){g.state.time+=1/30;g.move(carrier,{x:58,y:46,floorId:0},1/30,.5);g.act(blocker,1/30);g.separate(1/30)}assert.ok(carrier.x>54)
});

test('weapon packs only offer usable weapons and keep their exact results across save/load',()=>{
 const {g}=fixture();g.state.gold=1000;assert.ok(g.buyPack('armory'));assert.equal(g.state.gold,910);const p=g.state.deck.pendingPack;assert.equal(p.cards.length,3);for(const c of p.cards)assert.equal(ITEMS[c.definitionId]?.slot,'weapon');const loaded=new Game(JSON.parse(g.serialize()));assert.deepEqual(loaded.state.deck.pendingPack,p);assert.ok(loaded.choosePackCard(p.cards[0].uid));assert.equal(loaded.state.deck.pendingPack,null);assert.equal(loaded.choosePackCard(p.cards[0].uid),false)
});
