import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';

function fixture(){const g=new Game();g.addRoom(1,1,'guard');g.addRoom(2,1,'guard');
 Object.assign(g.state,{entities:[],items:[],props:[],traps:[],telegraphs:[],hazards:[],noises:[],squads:[],time:20,projectiles:[]});
 g.rebuild();g.state.phase='battle';g.state.encounter={spawnQueue:[],reinforcements:[],mainCount:2};return g}

test('a hurt party rests in a cleared room, heals, then gets up', ()=>{
 const g=fixture(),r=g.state.rooms.find(r=>r.type==='guard');
 const a=g.spawn('knight','hero',r.x-1,r.y,'A',[],{floorId:0,squadId:'main-0'}),b=g.spawn('priest','hero',r.x+1,r.y,'B',[],{floorId:0,squadId:'main-0'});
 for(const e of [a,b]){e.hp=e.maxHp*.4;e.lastEnemySeen=0;e.lastDamaged=0;e.inventory=[];e.potions=0}
 g.decide(a);assert.ok(a.scores.some(s=>s.reason.includes('Nghỉ ngơi')),'rest considered');assert.equal(a.action,'guard');
 const hp=a.hp;for(let i=0;i<30*3;i++)g.tick(1/30);assert.ok(a.hp>hp,'healing while resting');
 assert.ok(a.restUntil<=g.state.time+10);
});

test('a hero waits at the door of an unexplored room for a lagging squadmate, at most 6 seconds', ()=>{
 const g=fixture(),rooms=g.state.rooms.filter(r=>r.type==='guard'),dest=rooms[1];
 const c=g.corridors.find(c=>[c.a,c.b].includes(dest.id));assert.ok(c,'corridor exists');
 const p={x:c.x+c.w-2,y:c.y+1};                                   // in the corridor, right at the door
 const a=g.spawn('knight','hero',p.x,p.y,'A',[],{floorId:0,squadId:'main-0'}),b=g.spawn('rogue','hero',rooms[0].x-4,rooms[0].y,'B',[],{floorId:0,squadId:'main-0'});
 a.destinationRoom=dest.id;a.visitedRooms=[];
 g.decide(a);assert.ok(a.scores.some(s=>s.reason.includes('Đợi')),'waits for the squad');
 g.state.time+=7;a.decision=0;g.decide(a);assert.ok(!a.scores.some(s=>s.reason.includes('Đợi')),'gives up after 6 s');
});
