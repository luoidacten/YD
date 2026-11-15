import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {contains,distance} from '../dist/data.js';
import {runBattle,summarize} from '../scripts/soak.mjs';

function fixture(){
 const g=new Game();
 const entry=g.addRoom(0,1,'entrance'),guard=g.addRoom(1,1,'guard'),core=g.addRoom(2,1,'treasure');
 g.state.props=[];g.rebuild();return{g,entry,guard,core};
}
function unit(g,species,faction,x,y){
 const e=g.spawn(species,faction,x,y,species,[]);
 Object.assign(e,{charms:[],skillIds:[],passiveIds:[],statuses:[],gearSlots:{},inventory:[],
  potions:0,quickScrolls:[],equipment:null,order:'guard',concealed:false,capacity:20,intelligence:10});
 g.state.items=g.state.items.filter(i=>i.owner!==e.id);return e;
}
test('observing an empty key tile invalidates stale ally reports without learning an unseen position',()=>{
 const {g,entry}=fixture(),e=unit(g,'knight','hero',18,46),ally=unit(g,'rogue','hero',19,46);
 g.placeKey(entry.x,entry.y,0);g.state.keyQuest.owner=ally.id;g.state.time=10;
 e.knownKey=ally.knownKey={x:18,y:46,floorId:0,time:1};
 const context={enemies:[],allies:[ally],room:entry,locked:null,add:()=>{}};
 g.extendChoices(e,context);assert.equal(e.knownKey,null);
 g.state.time++;g.extendChoices(e,context);assert.equal(e.knownKey,null);
 e.knownKey={x:22,y:46,floorId:0,time:12};g.state.props.push({id:'wall',type:'wall',solid:true,x:20,y:46,floorId:0});
 g.rebuild();g.state.time=13;g.extendChoices(e,context);assert.equal(e.knownKey.x,22);
});
test('a closed room path approaches its gate, holds outside and resumes when the gate opens',()=>{
 const {g,guard}=fixture(),e=unit(g,'knight','hero',18,46);
 guard.sealed=true;g.rebuild();
 for(let i=0;i<30*20;i++)g.move(e,guard,1/30,.5);
 assert.ok(e.x>40&&e.x<43);assert.ok(!contains(guard,e,1));assert.equal(e.action,'guard');
 guard.sealed=false;g.rebuild();for(let i=0;i<30*15;i++)g.move(e,guard,1/30,.5);
 assert.ok(distance(e,guard)<1);
});
test('a confined melee monster does not repeatedly attack an unreachable target outside its room',()=>{
 const {g}=fixture(),m=unit(g,'skeleton','monster',45,46);unit(g,'knight','hero',41,46);
 g.decide(m);assert.ok(m.scores.every(s=>s.action!=='attack'));
});
test('an adventurer with no remaining known objective returns home instead of waiting forever',()=>{
 const {g,core}=fixture(),e=unit(g,'knight','hero',core.x,core.y);
 e.visitedRooms=g.state.rooms.map(r=>r.id);e.knownRooms=[...e.visitedRooms];g.state.treasure.carrier='another-hero';
 g.state.keyQuest.locked=false;g.rebuild();g.decide(e);assert.equal(e.action,'retreat');
});
test('floor loot on a closed doorway can be picked up from the reachable adjacent tile',()=>{
 const {g,guard}=fixture(),e=unit(g,'knight','hero',42,47);
 guard.sealed=true;g.rebuild();const item=g.createItem('IT21');
 Object.assign(item,{x:43,y:47,floorId:0});e.action='loot';e.target=item.id;e.decision=100;
 for(let i=0;i<30;i++)g.act(e,1/30);
 assert.equal(item.owner,e.id);assert.ok(e.x<43);
});
test('local pathing routes a resident around a stationary ally instead of pushing into the same tile',()=>{
 const {g}=fixture(),e=unit(g,'skeleton','monster',54,45);unit(g,'skeleton','monster',53,45);
 for(let i=0;i<120;i++){g.state.time+=1/30;g.move(e,{x:49,y:45,floorId:0},1/30,.5);g.separate(1/30)}
 assert.ok(e.x<51);
});
test('discipline ignores formation commands from another floor or an expired snapshot',()=>{
 const {g,entry}=fixture(),e=unit(g,'knight','hero',18,46);e.charms=['CH10'];g.state.time=20;
 const actions=[];const context={enemies:[],allies:[],room:entry,locked:null,add:(a,s,t,r)=>actions.push(r)};
 e.teamOrder={x:54,y:46,floorId:1,time:20};g.extendChoices(e,context);
 assert.ok(!actions.includes('Kỷ luật: bám sát đội hình Leader'));
 e.teamOrder.floorId=0;e.teamOrder.time=1;g.extendChoices(e,context);
 assert.ok(!actions.includes('Kỷ luật: bám sát đội hình Leader'));
});
test('extended vision does not cause an attack/investigate loop at the old fixed vision boundary',()=>{
 const {g}=fixture(),e=unit(g,'mage','hero',30,46),m=unit(g,'goblin','monster',44.8,46);
 e.passiveIds=['P07'];e.action='attack';e.target=m.id;e.decision=100;g.act(e,1/30);
 assert.equal(e.action,'attack');assert.ok(e.x>30);
});
test('a leader closes the distance to a trailing ally rather than waiting for that ally indefinitely',()=>{
 const {g}=fixture(),e=unit(g,'knight','hero',30,46),ally=unit(g,'priest','hero',21,46);
 e.squadId=ally.squadId='team';g.state.squads=[{id:'team',leaderId:e.id}];
 g.decide(e);assert.equal(e.action,'regroup');assert.ok(e.target.x<e.x);
});
test('channel consumables wait for an actual safe interval after damage',()=>{
 const {g}=fixture(),e=unit(g,'knight','hero',18,46);e.hp=e.maxHp*.4;
 const item=g.createItem('I14',e);g.state.time=20;e.lastDamaged=20;
 assert.equal(g.itemUseful(e,item,[]),false);g.state.time=21.2;assert.equal(g.itemUseful(e,item,[]),true);
});
test('a room defender does not attempt to guard a body with no reachable post inside its room',()=>{
 const {g,guard}=fixture(),e=unit(g,'skeleton','monster',54,46);e.intelligence=90;
 e.bodyMemories.body={id:'body',x:40,y:46,floorId:0,time:0,faction:'hero'};
 const actions=[];g.extendChoices(e,{enemies:[],allies:[],room:guard,locked:null,add:a=>actions.push(a)});
 assert.ok(!actions.includes('guard-body'));
});
test('five seeded battles finish naturally without a living entity stagnating for fifteen seconds',()=>{
 const battles=Array.from({length:5},(_,i)=>runBattle(i+1));const s=summarize(battles);
 assert.equal(s.limitHits,0,JSON.stringify(battles.filter(b=>b.limit)));
 assert.equal(s.stuckEpisodes,0,JSON.stringify(battles.flatMap(b=>b.stuck)));
});
