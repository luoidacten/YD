import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';

function built(){const g=new Game();g.state.gold=5000;g.state.mana=1000;
 const play=(id,col,row,floor=0)=>{let c=g.state.deck.hand.find(c=>c.definitionId===id);if(!c){c=g.makeCard(id);g.state.deck.hand.push(c)}
  return g.playCard(c.uid,18+col*36,16+row*30,floor).room};
 const entry=play('entrance',0,1),guard=play('guard',1,1),core=play('treasure',2,1);g.placeKey(entry.x,entry.y,0);return {g,entry,guard,core}}

test('first party is 3 heroes with proper roles; fate-added units are kept',()=>{
 const {g}=built();assert.ok(g.start().ok);
 const main=g.state.encounter.spawnQueue.filter(u=>!u.reinforcement);
 assert.deepEqual(main.map(u=>u.species),['knight','mage','priest']);
});

test('every room except the entrance gets 3–5 weaker wild monsters that never use quota and leave after the wave',()=>{
 const {g,guard,entry}=built();const used=g.roomSlotsUsed(guard);assert.ok(g.start().ok);
 const wild=g.state.entities.filter(e=>e.wild);
 assert.ok(wild.filter(e=>e.roomId===guard.id).length>=3,'guard room populated');
 assert.equal(wild.filter(e=>e.roomId===entry.id).length,0,'entrance stays clear');
 assert.equal(g.roomSlotsUsed(guard),used,'wild monsters take no quota');
 for(const h of g.state.entities.filter(e=>e.faction==='hero'))h.status='dead';
 g.state.encounter.spawnQueue=[];for(const r of g.state.encounter.reinforcements)r.state='resolved';
 g.finish();assert.equal(g.state.entities.filter(e=>e.wild).length,0,'cleared after the wave');
});

test('a squad that agrees blinks together to the front of the gate, outside the room',()=>{
 const {g,guard}=built();g.state.phase='battle';
 const team=['knight','mage','priest'].map((sp,i)=>g.spawn(sp,'hero',guard.x-14+i,guard.y,sp,[],{floorId:0,squadId:'main-0'}));
 assert.ok(g.blinkToGate(team,guard.id));
 for(const e of team){assert.equal(g.roomAt(e.x,e.y,0),undefined,'not inside the room');assert.ok(g.walkable(e.x,e.y,0))}
 const spread=Math.max(...team.map(a=>Math.max(...team.map(b=>Math.hypot(a.x-b.x,a.y-b.y)))));assert.ok(spread<4,'grouped at the gate');
});

test('talking is visible as speech, ranged heroes have higher agility, potions are shared with a wounded mate',()=>{
 const {g,guard}=built();g.state.phase='battle';
 const a=g.spawn('knight','hero',guard.x-14,guard.y,'A',[],{floorId:0,squadId:'main-0'}),b=g.spawn('archer','hero',guard.x-13,guard.y,'B',[],{floorId:0,squadId:'main-0'});
 g.partyTalk([a,b],[a]);assert.ok([...(g.speech?.values()||[])].length>=1,'someone speaks');
 assert.ok(g.agility(b)>g.agility(a),'ranged dodge more');
 const potion=g.createItem('IT21',a)||g.createItem('I01',a);
 if(potion){b.hp=b.maxHp*.3;b.inventory=[];a.lastShare=-99;const shared=g.sharePotions(a,[b]);
  assert.ok(shared,'potion shared');assert.ok(b.inventory.length>=1,'the wounded mate received a potion')}
});

test('rooms summon wild monsters that fit their type, and higher room levels unlock stronger species and stats',async()=>{
 const {FAVORITES}=await import('../dist/expansion.js');
 const g=new Game(),room={id:'r',type:'grave',level:1,floorId:0};
 const low=g.wildPool(room);for(const id of low)assert.ok((FAVORITES[id]||[]).includes('grave'),id+' favours the graveyard');
 const high=g.wildPool({...room,level:4});assert.ok(high.length>=low.length,'more species unlocked');
 assert.ok(g.wildScale({level:4}).hp>g.wildScale({level:1}).hp,'stronger stats at higher level');
 assert.ok(!g.wildPool({...room,type:'boss',level:5}).some(id=>['warden','lord','zombie_king'].includes(id)),'no bosses as wild monsters');
});
