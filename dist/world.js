import {
 WIDTH,
 HEIGHT,
 SETTINGS,
 center,
 bounds,
 contains
}
from './data.js';
export function seeded(seed){
 let n=seed>>>0||1;
 return()=>{
  n^=n<<13;
  n^=n>>>17;
  n^=n<<5;
  return(n>>>0)/4294967296
 }
}
export const tileKey=(x,
y)=>`${
Math.round(x)
},${
Math.round(y)
}`;
export function roomShape(type){
 return type==='boss'||type==='treasure'?{
  w:31,
  h:25
 }
 :['trap',
 'guard'].includes(type)?{
  w:23,
  h:19
 }
 :{
  w:17,
  h:15
 }
}
export function roomDoors(room,
rooms){
 const p=center(room),
 b=bounds(room),
 doors=[];
 for(const other of rooms){
  if(other.floorId!==room.floorId)continue;
  const dx=other.col-room.col,
  dy=other.row-room.row;
  if(Math.abs(dx)+Math.abs(dy)!==1)continue;
  doors.push({
   x:dx===-1?b.x:dx===1?b.x+b.w-1:p.x,
   y:dy===-1?b.y:dy===1?b.y+b.h-1:p.y,
   axis:dx?'x':'y',
   to:other.id
  }
  )
 }
 return doors
}
export function makeTerrain(rooms,
floorId){
 const grid=Array.from({
  length:HEIGHT
 }
 ,
 ()=>new Uint8Array(WIDTH));
 const corridors=[];
 const floorRooms=rooms.filter(r=>r.floorId===floorId);
 for(const r of floorRooms){
  const b=bounds(r);
  for(let y=b.y+1;
  y<b.y+b.h-1;
  y++)for(let x=b.x+1;
  x<b.x+b.w-1;
  x++)grid[y][x]=1;
  for(const other of floorRooms){
   if(!((other.col===r.col+1&&other.row===r.row)||(other.row===r.row+1&&other.col===r.col)))continue;
   const a=center(r),
   z=center(other),
   id=[r.id,
   other.id].sort().join(':');
   if(a.y===z.y){
    for(let x=a.x;
    x<=z.x;
    x++)for(let off=-1;
    off<=1;
    off++)grid[a.y+off][x]=1;
    const b2=bounds(other);
    corridors.push({
     id,
     a:r.id,
     b:other.id,
     floorId,
     axis:'x',
     x:b.x+b.w,
     y:a.y-1,
     w:b2.x-(b.x+b.w),
     h:3
    }
    )
   }
   else{
    for(let y=a.y;
    y<=z.y;
    y++)for(let off=-1;
    off<=1;
    off++)grid[y][a.x+off]=1;
    const b2=bounds(other);
    corridors.push({
     id,
     a:r.id,
     b:other.id,
     floorId,
     axis:'y',
     x:a.x-1,
     y:b.y+b.h,
     w:3,
     h:b2.y-(b.y+b.h)
    }
    )
   }
  }
 }
 return{
  grid,
  corridors
 }
 ;
}
// Connected lanes are reserved before furnishing. The seeded placement pass can
// only use cells outside those lanes, including all future cardinal entrances.
export function furnish(room,
seed,
id){
 const random=seeded((seed^(room.col*73856093)^(room.row*19349663)^((room.floorId+1)*83492791))>>>0),
 p=center(room),
 b=bounds(room),
 out=[],
 blocked=new Set(),
 template=Math.floor(random()*3);
 room.layoutTemplate=['stone-maze',
 'rift-islands',
 'ruined-store'][template];
 const count=Math.floor((b.w-2)*(b.h-2)/(template===1?8:template===0?12:20)),
 reserved=(x,
 y)=>Math.abs(x-p.x)<=2||Math.abs(y-p.y)<=2||distanceToStairs(room,
 {
  x,
  y
 }
 )<3;
 for(let tries=0;
 out.length<count&&tries<count*15;
 tries++){
  const x=b.x+2+Math.floor(random()*(b.w-4)),
  y=b.y+2+Math.floor(random()*(b.h-4)),
  kind=template===1?(random()<.85?'pit':'wall'):template===0?(random()<.85?'wall':'pillar'):['crate',
  'wood',
  'pillar',
  'wall'][Math.floor(random()*4)],
  cluster=['wall',
  'pit'].includes(kind),
  cw=cluster?2+Math.floor(random()*2):1,
  ch=cluster?1+Math.floor(random()*3):1,
  cells=[];
  for(let dy=0;
  dy<ch;
  dy++)for(let dx=0;
  dx<cw;
  dx++){
   const xx=x+dx,
   yy=y+dy,
   key=tileKey(xx,
   yy);
   if(xx<b.x+1||xx>=b.x+b.w-1||yy<b.y+1||yy>=b.y+b.h-1||reserved(xx,
   yy)||blocked.has(key))continue;
   cells.push({
    x:xx,
    y:yy,
    key
   }
   )
  }
  if(!cells.length)continue;
  for(const c of cells)blocked.add(c.key);
  if(!connectedInterior(room,
  blocked)){
   for(const c of cells)blocked.delete(c.key);
   continue
  }
  for(const c of cells){
   const fixed=['wall',
   'pit',
   'pillar'].includes(kind);
   out.push({
    id:id('prop'),
    roomId:room.id,
    floorId:room.floorId,
    x:c.x,
    y:c.y,
    type:kind,
    hp:fixed?999:20,
    maxHp:fixed?999:20,
    solid:true,
    destroyed:false,
    generated:true,
    seed:Math.floor(random()*10000)
   }
   )
  }
 }
 return out;
}
export function connectedInterior(room,
blocked){
 const b=bounds(room),
 p=center(room),
 key=tileKey(p.x,
 p.y),
 queue=[[p.x,
 p.y]],
 seen=new Set([key]);
 let n=0;
 while(n<queue.length){
  const[x,
  y]=queue[n++];
  for(const[dx,
  dy]of[[1,
  0],
  [-1,
  0],
  [0,
  1],
  [0,
  -1]]){
   const xx=x+dx,
   yy=y+dy,
   k=tileKey(xx,
   yy);
   if(xx>b.x&&xx<b.x+b.w-1&&yy>b.y&&yy<b.y+b.h-1&&!blocked.has(k)&&!seen.has(k)){
    seen.add(k);
    queue.push([xx,
    yy])
   }
  }
 }
 return seen.size===(b.w-2)*(b.h-2)-blocked.size
}
export function distanceToStairs(room,
p){
 const c=center(room);
 return Math.hypot(p.x-(c.x+5),
 p.y-c.y)
}
export function interiorSpawn(room,
index=0){
 const p=center(room),
 width=Math.min(7,
 Math.floor((room.w-4)/2)),
 row=Math.floor(index/width),
 col=index%width;
 return{
  x:p.x-width/2+col,
  y:p.y-3+row*1.25,
  floorId:room.floorId
 }
}
export function reachable(grid,
a,
b,
blocked=new Set()){
 const sx=Math.round(a.x),
 sy=Math.round(a.y),
 tx=Math.round(b.x),
 ty=Math.round(b.y),
 queue=[[sx,
 sy]],
 seen=new Set([tileKey(sx,
 sy)]);
 let k=0;
 while(k<queue.length){
  const[x,
  y]=queue[k++];
  if(x===tx&&y===ty)return true;
  for(const[dx,
  dy]of[[1,
  0],
  [-1,
  0],
  [0,
  1],
  [0,
  -1]]){
   const nx=x+dx,
   ny=y+dy,
   key=tileKey(nx,
   ny);
   if(grid[ny]?.[nx]&&!seen.has(key)&&!blocked.has(key)){
    seen.add(key);
    queue.push([nx,
    ny])
   }
  }
 }
 return false
}
export function isInAssignedRoom(game,
e,
p){
 const room=game.state.rooms.find(r=>r.id===e.roomId);
 return e.faction!=='monster'||!room||contains(room,
 {
  ...p,
  floorId:e.floorId
 }
 ,
 1)
}
