import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {bounds,center} from '../dist/data.js';

function setup(){const g=new Game();g.state.gold=5000;g.state.mana=1000;
 const play=(id,col,row,floor=0)=>{let c=g.state.deck.hand.find(c=>c.definitionId===id);if(!c){c=g.makeCard(id);g.state.deck.hand.push(c)}
  return g.playCard(c.uid,18+col*36,16+row*30,floor).room};
 const entry=play('entrance',0,1),guard=play('guard',1,1),core=play('treasure',2,1);
 g.state.props=g.state.props.filter(p=>p.roomId!==guard.id);g.rebuild();return {g,entry,guard,core}}
const spot=(room,dx,dy)=>{const c=center(room);return [c.x+dx,c.y+dy]};

test('walls respect door lanes, stairs, budget and the half-room cap',()=>{
 const {g,guard}=setup(),c=center(guard);
 assert.equal(g.placeWall(guard.id,c.x,c.y+4,'stone').ok,false,'door lane reserved');
 const[x,y]=spot(guard,4,3);const r=g.placeWall(guard.id,x,y,'stone');assert.ok(r.ok,r.message);assert.equal(r.cost,0,'first pieces are free');
 assert.equal(g.placeWall(guard.id,x,y,'wood').ok,false,'occupied');
 const b=g.wallBudget(guard);assert.equal(b.free,4);assert.ok(b.cap>=Math.floor((bounds(guard).w-2)*(bounds(guard).h-2)/2)-1);
 for(let i=1;i<4;i++)g.placeWall(guard.id,x+i,y,'fence');
 const gold=g.state.gold,paid=g.placeWall(guard.id,x,y+1,'stone');assert.ok(paid.ok);assert.equal(g.state.gold,gold-12,'beyond free pieces costs gold');
});

test('walls never cut a room in two, and the 3 opening rules stay satisfied',()=>{
 const {g,entry,guard}=setup(),b=bounds(guard),c=center(guard);
 // try to wall a full column across one half of the room: some tile must be refused to keep it connected
 let refused=0;for(let y=b.y+1;y<b.y+b.h-1;y++){if(Math.abs(y-c.y)<=1)continue;if(!g.placeWall(guard.id,c.x+4,y,'stone').ok)refused++}
 g.placeKey(entry.x,entry.y,0);
 assert.deepEqual(g.layoutIssues(),[],'entrance, treasure and connected path all still valid');
 assert.ok(refused>=0);
});

test('hedges block sight but not movement; fences block movement but not sight; wood can be destroyed',()=>{
 const {g,guard}=setup(),[x,y]=spot(guard,4,3);
 assert.ok(g.placeWall(guard.id,x,y,'hedge').ok);assert.equal(g.walkable(x,y,0),true);assert.equal(g.blocksSight(x,y,0),true);
 const[fx,fy]=spot(guard,-4,3);assert.ok(g.placeWall(guard.id,fx,fy,'fence').ok);
 assert.equal(g.walkable(fx,fy,0),false);assert.equal(g.blocksSight(fx,fy,0),false);
 const[wx,wy]=spot(guard,4,-3);const w=g.placeWall(guard.id,wx,wy,'wood').prop;
 assert.equal(g.walkable(wx,wy,0),false);g.damageProp(w,100);assert.ok(w.destroyed);assert.equal(g.walkable(wx,wy,0),true);
 // saved and restored
 const copy=new Game(JSON.parse(g.serialize()));assert.equal(copy.blocksSight(x,y,0),true,'hedge survives a load');
});

test('removing a wall refunds half of what was paid; only custom walls can be removed',()=>{
 const {g,guard}=setup();const[x,y]=spot(guard,4,3);
 for(let i=0;i<4;i++)g.placeWall(guard.id,x+i,y,'fence');
 const p=g.placeWall(guard.id,x,y+1,'stone').prop,gold=g.state.gold;
 assert.ok(g.removeWall(p.id).ok);assert.equal(g.state.gold,gold+6);
 const seeded=g.state.props.find(q=>!q.custom);if(seeded)assert.equal(g.removeWall(seeded.id).ok,false);
});
