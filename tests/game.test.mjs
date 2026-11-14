import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/engine.js';
import {perceive,tacticalPosition} from '../dist/tactics.js';
const fresh=()=>{const g=new Game();g.state.entities=[];return g};
const step=(g,seconds)=>{for(let i=0;i<Math.ceil(seconds*30);i++)g.tick(1/30)};

test('construction: valid adjacency, no overlap, no isolated rooms, exact payment',()=>{
 const g=new Game(),gold=g.state.gold;assert.ok(g.connected());assert.equal(g.build(4,0,'guard').ok,false);assert.equal(g.build(1,1,'guard').ok,false);assert.ok(g.build(0,0,'guard').ok);assert.equal(g.state.gold,gold-70);assert.ok(g.connected());assert.ok(g.path({x:5,y:5},{x:29,y:13}).length>0);
});
test('cannot start if treasure has no route; no build while paused or fighting',()=>{
 const g=new Game();g.state.paused=true;assert.equal(g.build(0,0,'guard').ok,false);g.state.paused=false;g.state.rooms=g.state.rooms.filter(r=>!(r.col===2&&r.row===1));g.rebuild();assert.equal(g.start().ok,false);
 const h=new Game();h.start();assert.equal(h.build(0,0,'guard').ok,false);assert.equal(h.summon('goblin',13,13).ok,false);
});
test('navigation cannot cross bedrock and LOS is blocked by walls',()=>{
 const g=new Game();assert.equal(g.path({x:13,y:13},{x:0,y:0}).length,0);assert.equal(g.lineOfSight({x:13,y:12},{x:21,y:12}),false);assert.equal(g.lineOfSight({x:13,y:13},{x:21,y:13}),true);
});
test('Forsaken blocks all healing and AI potion use',()=>{
 const g=fresh(),e=g.spawn('knight','hero',13,13,'Cursed',['forsaken']);e.hp=10;const before=e.hp;assert.equal(g.heal(e,30),0);assert.equal(e.hp,before);g.decide(e);assert.ok(!e.scores.some(a=>a.action==='heal'));assert.equal(e.potions,1);
});
test('potions and main treasure consume bag capacity; transfer is unique',()=>{
 const g=fresh(),e=g.spawn('rogue','hero',13,13,'Ren');e.capacity=2;const item={id:'unique',owner:null,x:13,y:13,name:'Gem',value:30};g.state.items.push(item);assert.ok(g.transfer(item,e));assert.equal(g.usedSlots(e),2);assert.equal(g.transfer({id:'other',owner:null},e),false);assert.equal(g.transfer(item,e),false);assert.equal(e.inventory.length,1);e.potions=0;g.state.treasure.carrier=e.id;assert.equal(g.usedSlots(e),2);
});
test('Violent increases damage and physical attacks cannot spend unavailable mana',()=>{
 const run=charm=>{const g=fresh(),a=g.spawn('goblin','monster',13,13,'A',charm),b=g.spawn('knight','hero',14,13,'B');a.action='attack';a.target=b.id;a.decision=10;g.act(a,1/30);return b.maxHp-b.hp};assert.ok(run(['violent'])>run([]));const g=fresh(),a=g.spawn('mage','hero',13,13,'Mage'),b=g.spawn('slime','monster',14,13,'Slime');a.mana=0;a.action='attack';a.target=b.id;a.decision=10;g.act(a,1/30);assert.equal(a.mana,0);
});
test('Frenzy stacks in combat and decays after leaving combat',()=>{
 const g=fresh(),a=g.spawn('goblin','monster',13,13,'A',['frenzy']),b=g.spawn('knight','hero',14,13,'B');b.hp=b.maxHp=100000;a.action='attack';a.target=b.id;a.decision=100;for(let i=0;i<180;i++)g.act(a,1/30);assert.equal(a.frenzy,1);a.action='guard';a.target=a.home;a.decision=100;for(let i=0;i<100;i++)g.act(a,1/30);assert.equal(a.frenzy,0);
});
test('hidden enemies are not perceived; memory keeps last position, expires',()=>{
 const g=fresh(),a=g.spawn('goblin','monster',13,13,'A'),b=g.spawn('mage','hero',20,13,'B');g.state.time=2;perceive(g,a);assert.ok(a.seen[b.id]);const last={...a.seen[b.id]};b.x=21;b.y=12;g.state.time=3;perceive(g,a);assert.equal(a.visibleIds.includes(b.id),false);assert.equal(a.seen[b.id].x,last.x);assert.equal(a.seen[b.id].y,last.y);g.decide(a);assert.equal(a.action,'investigate');assert.equal(a.target.x,last.x);g.state.time=11;perceive(g,a);assert.equal(a.seen[b.id],undefined);
});
test('adventurers explore visible rooms before learning the central treasure position',()=>{
 const g=fresh(),e=g.spawn('rogue','hero',5,13,'Explorer');g.decide(e);assert.equal(e.treasureKnown,undefined);assert.equal(e.action,'explore');assert.ok(e.knownRooms.length<g.state.rooms.length);assert.ok(!e.scores.some(a=>a.action==='treasure'));e.x=25;e.y=13;g.decide(e);assert.ok(e.treasureKnown);assert.ok(e.scores.some(a=>a.action==='treasure'));
});
test('ally information is shared as a delayed snapshot',()=>{
 const g=fresh(),a=g.spawn('goblin','monster',13,13,'A'),b=g.spawn('goblin','monster',14,13,'B');g.state.time=1;b.seen={unknown:{x:21,y:13,time:1,source:'sight'}};perceive(g,a);assert.equal(a.seen.unknown,undefined);g.state.time=1.5;perceive(g,a);assert.equal(a.seen.unknown.source,'ally');assert.equal(a.seen.unknown.x,21);
});
test('nearby combat sound mobilizes a guard without revealing hidden enemy identity',()=>{
 const g=fresh(),guard=g.spawn('skeleton','monster',13,5,'Guard'),ally=g.spawn('goblin','monster',13,13,'Ally'),hero=g.spawn('mage','hero',14,13,'Enemy');g.state.time=1;g.damage(ally,5,hero);g.decide(guard);assert.equal(guard.action,'investigate');assert.deepEqual(guard.target,{x:13,y:13});assert.equal(guard.visibleIds.includes(hero.id),false);assert.equal(guard.seen[hero.id],undefined);assert.ok(guard.scores.some(s=>s.reason.includes('tiếng giao chiến')));
});
test('cover is behind a wall, reachable, and reserved by only one creature',()=>{
 const g=fresh(),a=g.spawn('goblin','monster',13,13,'A'),b=g.spawn('mage','hero',20,13,'B');a.hp=20;g.decide(a);assert.equal(a.action,'cover');assert.equal(g.lineOfSight(a.target,b),false);assert.ok(g.path(a,a.target).length);const c=g.spawn('goblin','monster',14,13,'C');c.hp=20;perceive(g,c);const spot=tacticalPosition(g,c,b,'cover');if(spot)assert.notDeepEqual(spot,a.target);
});
test('ranged mage kites a melee enemy instead of standing still',()=>{
 const g=fresh(),a=g.spawn('mage','hero',13,13,'Mage'),b=g.spawn('goblin','monster',14,13,'Enemy');g.decide(a);assert.equal(a.action,'kite');assert.ok(Math.hypot(a.target.x-b.x,a.target.y-b.y)>=3);
});
test('priest supports wounded ally, checks LOS and consumes exact mana',()=>{
 const g=fresh(),p=g.spawn('priest','hero',13,13,'Priest',['camaraderie']),a=g.spawn('knight','hero',14,13,'Knight');a.hp=20;g.decide(p);assert.equal(p.action,'support');const before=p.mana;g.act(p,1/30);assert.equal(p.mana,before-12);assert.equal(a.hp,45);a.charms.push('forsaken');g.decide(p);assert.ok(!p.scores.some(x=>x.action==='support'));
});
test('priest can channel a rescue once per expedition, preserving identity/charms',()=>{
 const g=fresh(),p=g.spawn('priest','hero',13,13,'Priest',['camaraderie']),a=g.spawn('knight','hero',14,13,'Knight',['forsaken']);a.hp=0;a.status='downed';g.decide(p);assert.equal(p.action,'rescue');p.decision=100;const id=a.id;for(let i=0;i<76;i++)g.act(p,1/30);assert.equal(a.status,'active');assert.equal(a.rescued,true);assert.equal(a.id,id);assert.deepEqual(a.charms,['forsaken']);assert.equal(p.mana,30);
});
test('Fearful and Proud make different retreat decisions in the same danger',()=>{
 const choose=charm=>{const g=fresh(),a=g.spawn('knight','hero',13,13,'A',[charm]);g.spawn('goblin','monster',14,13,'B');a.hp=15;a.potions=0;g.decide(a);return a.action};assert.equal(choose('fearful'),'retreat');assert.notEqual(choose('proud'),'retreat');
});
test('full bag suppresses loot candidates and favors retreat',()=>{
 const g=fresh(),e=g.spawn('rogue','hero',13,13,'Ren',['greedy']);e.capacity=1;g.state.items.push({id:'gem',owner:null,x:14,y:13,type:'gold',value:20});g.decide(e);assert.equal(e.action,'retreat');assert.ok(!e.scores.some(a=>a.action==='loot'));
});
test('taking main treasure is not a loss; dropping/recovering prevents game over',()=>{
 const g=fresh();g.state.phase='battle';const hero=g.spawn('rogue','hero',29,13,'Thief'),guard=g.spawn('goblin','monster',28,13,'Guard');hero.action='treasure';hero.target={x:29,y:13};hero.decision=10;g.act(hero,1/30);assert.equal(g.state.treasure.carrier,hero.id);assert.equal(g.state.phase,'battle');g.damage(hero,999,guard);assert.equal(g.state.treasure.carrier,null);assert.equal(g.state.phase,'battle');guard.x=29;guard.y=13;guard.action='recover';guard.decision=10;g.act(guard,1/30);assert.equal(g.state.treasure.x,29);
});
test('only an escaped main treasure carrier causes game over',()=>{
 const g=fresh();g.state.phase='battle';const hero=g.spawn('rogue','hero',5,13,'Thief');hero.inventory=['secondary'];g.escape(hero);assert.equal(g.state.phase,'battle');const other=g.spawn('knight','hero',5,13,'Carrier');g.state.treasure.carrier=other.id;g.escape(other);assert.equal(g.state.phase,'gameover');
});
test('anti teleport room blocks casting; valid casting consumes mana',()=>{
 const g=fresh();g.state.phase='battle';const e=g.spawn('mage','hero',21,21,'Mage');e.hp=10;e.potions=0;e.action='retreat';e.target={x:5,y:13};e.decision=100;e.path=[];for(let i=0;i<10;i++)g.act(e,1/30);assert.equal(e.teleport,0);e.x=13;e.y=13;e.path=[];for(let i=0;i<91;i++)g.act(e,1/30);assert.equal(e.status,'escaped');assert.equal(e.mana,25);
});
test('evolution and resurrection preserve identity, memory, equipment and charms',()=>{
 const g=fresh(),e=g.spawn('goblin','monster',13,13,'Grek',['violent']);e.xp=100;e.memory=['First battle'];const id=e.id;g.progress(e);assert.ok(e.evolution);assert.equal(e.id,id);assert.deepEqual(e.charms,['violent']);assert.equal(e.memory[0],'First battle');assert.ok(e.memory.some(m=>m.includes('Tiến hóa')));assert.ok(e.equipment);e.status='downed';e.hp=0;assert.equal(g.revive(e.id),true);assert.equal(e.id,id);assert.equal(g.state.souls,15);
});
test('serialization restores RNG, ownership, memory, Charm and live expedition',()=>{
 const g=new Game();g.start();const e=g.state.entities[1];e.memory.push('remember');const copy=new Game(JSON.parse(g.serialize()));assert.deepEqual(copy.state,g.state);assert.equal(copy.random(),g.random());assert.ok(copy.connected());
});
test('fixed simulation yields the same result regardless of render grouping',()=>{
 const a=new Game(),b=new Game();a.start();b.start();step(a,20);for(let group=0;group<150;group++)for(let tick=0;tick<4;tick++)b.tick(1/30);assert.equal(a.serialize(),b.serialize());
});
test('a legally prepared defense wins, receives rewards and proceeds to a real second expedition',()=>{
 const g=new Game();for(let i=0;i<3;i++)assert.ok(g.summon('skeleton',12+i,13).ok);assert.ok(g.summon('goblin',13,14).ok);g.start();step(g,180);assert.equal(g.state.phase,'result');assert.ok(g.state.gold>340);g.next();assert.equal(g.state.wave,2);assert.equal(g.state.phase,'prepare');assert.equal(g.state.entities.some(e=>e.faction==='hero'),false);assert.ok(g.start().ok);step(g,180);assert.ok(['result','gameover'].includes(g.state.phase));
});
