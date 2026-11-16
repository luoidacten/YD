import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';

function fixture(){const g=new Game();g.addRoom(1,1,'guard');g.addRoom(2,1,'guard');
 Object.assign(g.state,{entities:[],items:[],props:[],traps:[],telegraphs:[],hazards:[],noises:[],squads:[],time:20,projectiles:[]});
 g.rebuild();g.state.phase='battle';g.state.encounter={spawnQueue:[],reinforcements:[],mainCount:3};return g}
const hero=(g,sp,x,y,name)=>{const e=g.spawn(sp,'hero',x,y,name,[],{floorId:0,squadId:'main-0'});e.inventory=[];e.potions=0;return e};

test('a hurt party rests after clearing a room: greedy heroes eat, others sleep, both heal',()=>{
 const g=fixture(),r=g.state.rooms.find(r=>r.type==='guard');
 const a=hero(g,'knight',r.x-1,r.y,'A'),b=hero(g,'priest',r.x+1,r.y,'B');
 a.charms=['greedy'];b.charms=[];b.personality={aggression:.9,teamwork:1.1};b.restStyle=undefined;
 for(const e of [a,b]){e.hp=e.maxHp*.4;e.lastEnemySeen=0;e.lastDamaged=0}
 assert.equal(g.restStyle(a),'eat');
 g.decide(a);assert.ok(a.scores.some(s=>s.reason.includes('Ăn')),'eats');assert.equal(a.action,'guard');
 const hp=a.hp;for(let i=0;i<30*3;i++)g.tick(1/30);assert.ok(a.hp>hp,'healing while eating');
});

test('the squad gathers at the door, talks it over, and enters together once everyone is ready',()=>{
 const g=fixture(),rooms=g.state.rooms.filter(r=>r.type==='guard'),dest=rooms[1];
 const c=g.corridors.find(c=>[c.a,c.b].includes(dest.id)),door={x:c.x+c.w-2,y:c.y+1};
 const a=hero(g,'knight',door.x,door.y,'A'),b=hero(g,'rogue',door.x-5,door.y,'B'),m=hero(g,'mage',door.x-1,door.y+1,'C');
 for(const e of [a,b,m]){e.destinationRoom=dest.id;e.visitedRooms=[]}
 g.decide(a);assert.ok(g.squadRecord(a).rally,'rally point set');assert.ok(a.scores.some(s=>s.reason.includes('Bàn bạc')),'talks while waiting');
 g.decide(b);assert.ok(b.scores.some(s=>s.reason.includes('Tập hợp')),'lagging member walks to the rally');
 b.x=door.x-1;b.y=door.y-1;g.decide(a);assert.equal(g.squadRecord(a).rally,null,'all ready → go');
 assert.equal(g.squadRecord(a).enteredRoom,dest.id);
});

test('in combat casters keep distance and skirmishers let the tank engage first',()=>{
 const g=fixture(),r=g.state.rooms.find(r=>r.type==='guard');
 const tank=hero(g,'knight',r.x-6,r.y,'T'),mage=hero(g,'mage',r.x-1,r.y,'M'),rogue=hero(g,'rogue',r.x-6,r.y+2,'R');
 const mon=g.spawn('goblin','monster',r.x+1,r.y,'G',[],{floorId:0,roomId:r.id});
 const ctx=(e)=>{const list=[];g.extendChoices(e,{enemies:[mon],allies:[],locked:false,add:(action,score,target,reason)=>list.push({action,score,reason})});return list};
 assert.ok(ctx(mage).some(c=>c.action==='kite'),'mage kites');
 assert.ok(ctx(rogue).some(c=>c.reason.includes('lao lên giữ chân')),'rogue waits for the tank');
});

test('a squad remembers a dangerous room and heals up before going back in',()=>{
 const g=fixture(),rooms=g.state.rooms.filter(r=>r.type==='guard'),dest=rooms[1];
 const c=g.corridors.find(c=>[c.a,c.b].includes(dest.id)),door={x:c.x+c.w-2,y:c.y+1};
 const a=hero(g,'knight',door.x,door.y,'A'),b=hero(g,'mage',door.x-1,door.y,'B');
 for(const e of [a,b]){e.destinationRoom=dest.id;e.visitedRooms=[];e.hp=e.maxHp*.5}
 g.squadRecord(a).danger={[dest.id]:2};
 g.decide(a);assert.ok(a.scores.some(s=>s.reason.includes('nguy hiểm')),'waits to heal before a known kill-zone');
 assert.ok(g.squadRecord(a).rally,'still gathered at the door');
});

test('ranged heroes focus the enemy their tank is holding',()=>{
 const g=fixture(),r=g.state.rooms.find(r=>r.type==='guard');
 const tank=hero(g,'knight',r.x-3,r.y,'T'),archer=hero(g,'archer',r.x-7,r.y,'R');
 const m1=g.spawn('goblin','monster',r.x-2,r.y,'G1',[],{floorId:0,roomId:r.id}),m2=g.spawn('goblin','monster',r.x+3,r.y+2,'G2',[],{floorId:0,roomId:r.id});
 tank.target=m1.id;const list=[];
 g.extendChoices(archer,{enemies:[m2,m1],allies:[tank],locked:false,add:(action,score,target,reason)=>list.push({action,target,reason})});
 assert.ok(list.some(c=>c.action==='attack'&&c.target===m1.id&&c.reason.includes('Dồn hỏa lực')));
});
