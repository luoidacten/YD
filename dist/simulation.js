import {
 installSystems
}
from './systems.js';
import {
 installContent
}
from './content-systems.js';
import {
 installLair
}
from './lair.js';
import {
 VERSION,
 SETTINGS,
 WIDTH,
 HEIGHT,
 COLS,
 ROWS,
 ROOMS,
 SPECIES,
 center,
 bounds,
 contains,
 distance
}
from './data.js';
import {
 seeded,
 tileKey,
 roomShape,
 roomDoors,
 makeTerrain,
 furnish,
 interiorSpawn,
 isInAssignedRoom
}
from './world.js';
import {
 chooseAction
}
from './ai.js';
class Heap {
 constructor(){
  this.a=[]
 }
 push(v){
  const a=this.a;
  let i=a.push(v)-1;
  while(i){
   const p=(i-1)>>1;
   if(a[p].f<=v.f)break;
   a[i]=a[p];
   i=p
  }
  a[i]=v
 }
 pop(){
  const a=this.a,
  root=a[0],
  last=a.pop();
  if(a.length){
   let i=0;
   while(i*2+1<a.length){
    let c=i*2+1;
    if(c+1<a.length&&a[c+1].f<a[c].f)c++;
    if(a[c].f>=last.f)break;
    a[i]=a[c];
    i=c
   }
   a[i]=last
  }
  return root
 }
 get length(){
  return this.a.length
 }
}
export class Game {
 constructor(saved=null){
  this.listeners=[];
  this.events=[];
  this.effects=[];
  this.navRevision=0;
  this.state=saved?.version===VERSION?structuredClone(saved):this.initial(saved);
  this.validate();
  this.rebuild();
  this.createCorridorTraps();
  this.setupSystems();
  this.setupContent();
  this.setupLair();
 }
 initial(old){
  const s={
   version:VERSION,
   seed:old?.seed||92817,
   worldSeed:old?.seed||92817,
   id:0,
   time:0,
   wave:Math.max(1,
   old?.wave||1),
   phase:'prepare',
   remaining:180,
   paused:false,
   speed:1,
   currentFloor:0,
   gold:Math.max(500,
   old?.gold||0),
   mana:Math.max(180,
   old?.mana||0),
   souls:Math.max(45,
   old?.souls||0),
   rooms:[],
   entities:[],
   props:[],
   traps:[],
   items:[],
   hazards:[],
   telegraphs:[],
   noises:[],
   reports:old?.reports||[],
   logs:[],
   encounter:null,
   result:null,
   statistics:{
    downed:0,
    escaped:0,
    reinforced:0
   }
  }
  ;
  this.state=s;
  if(!old){
   s.manualStart=true;
   s.designedStart=true;
   s.treasure={
    carrier:null,
    x:0,
    y:0,
    floorId:0
   }
   ;
   s.gold=700;
   s.mana=100;
   this.log('Bản thiết kế trống: tự đặt cổng vào, các phòng, phòng rương, cư dân và chìa khóa. Mở trận khi đường đi hợp lệ.',
   'system');
   return s
  }
  for(const [floorId,
  col,
  row,
  type]of [[0,
  0,
  1,
  'entrance'],
  [0,
  1,
  1,
  'guard'],
  [0,
  2,
  1,
  'trap'],
  [0,
  3,
  1,
  'boss'],
  [0,
  1,
  0,
  'grave'],
  [0,
  1,
  2,
  'mana'],
  [1,
  0,
  1,
  'arrival'],
  [1,
  1,
  1,
  'guard'],
  [1,
  2,
  1,
  'trap'],
  [1,
  3,
  1,
  'treasure'],
  [1,
  1,
  0,
  'shop'],
  [1,
  2,
  2,
  'mana']])this.addRoom(col,
  row,
  type,
  floorId);
  s.treasure={
   carrier:null,
   ...center(s.rooms.find(r=>r.type==='treasure'))
  }
  ;
  const room=(floor,
  type)=>s.rooms.find(r=>r.floorId===floor&&r.type===type),
  g=room(0,
  'guard'),
  deep=room(1,
  'guard');
  for(const [species,
  name,
  charms,
  index]of [['goblin',
  'Grek',
  ['violent',
  'guardian'],
  0],
  ['goblin',
  'Nix',
  ['fearful'],
  1],
  ['skeleton',
  'Morrow',
  ['frenzy'],
  7],
  ['slime',
  'Mochi',
  ['forsaken'],
  8],
  ['shaman',
  'Vex',
  ['camaraderie'],
  14]]){
   const p=interiorSpawn(g,
   index);
   this.spawn(species,
   'monster',
   p.x,
   p.y,
   name,
   charms,
   {
    floorId:0,
    roomId:g.id
   }
   )
  }
  const elite=this.spawn('skeleton',
  'monster',
  ...this.xy(center(deep)),
  'Sentinelle',
  ['guardian'],
  {
   floorId:1,
   roomId:deep.id,
   elite:true
  }
  );
  const boss=room(0,
  'boss');
  this.spawn('warden',
  'monster',
  boss.x,
  boss.y,
  'Gor · Hộ Môn',
  ['proud'],
  {
   floorId:0,
   roomId:boss.id,
   boss:'warden'
  }
  );
  const core=room(1,
  'treasure');
  this.spawn('lord',
  'monster',
  core.x-2,
  core.y,
  'Azrakh',
  ['guardian',
  'frenzy'],
  {
   floorId:1,
   roomId:core.id,
   boss:'inferno'
  }
  );
  if(old?.entities){
   const residents=old.entities.filter(e=>e.faction==='monster'&&e.species!=='lord');
   for(let i=0;
   i<Math.min(residents.length,
   20);
   i++){
    const a=residents[i],
    existing=s.entities.find(e=>e.name===a.name&&e.faction==='monster');
    let e=existing;
    if(!e){
     const p=interiorSpawn(g,
     i+20);
     e=this.spawn(SPECIES[a.species]?a.species:'goblin',
     'monster',
     p.x,
     p.y,
     a.name,
     a.charms||[],
     {
      floorId:0,
      roomId:g.id
     }
     )
    }
    e.level=a.level||1;
    e.xp=a.xp||0;
    e.memory=a.memory||[];
    e.evolution=a.evolution||null;
    if(a.equipment)e.equipment=structuredClone(a.equipment);
    e.maxHp=Math.max(e.maxHp,
    a.maxHp||0);
    e.hp=e.maxHp;
   }
  }
  this.log(old?'Đã chuyển cư dân và tiến trình cũ sang bản đồ hai tầng. Bố trí được tạo lại theo seed.':'Những đại sảnh thức giấc. Chọn phòng để nhìn gần, hoặc thu nhỏ xem toàn tầng.',
  'system');
  return s;
 }
 xy(p){
  return[p.x,
  p.y]
 }
 validate(){
  const s=this.state;
  if(s.version!==VERSION||!Array.isArray(s.rooms)||!Array.isArray(s.entities)||!s.treasure||s.rooms.some(r=>!ROOMS[r.type]||!Number.isFinite(r.x)||!Number.isFinite(r.y))||s.entities.some(
  e=>!SPECIES[e.species]))throw Error('Bản lưu không hợp lệ.');
 }
 id(prefix){
  return prefix+(++this.state.id)
 }
 random(){
  let n=this.state.seed|0;
  n^=n<<13;
  n^=n>>>17;
  n^=n<<5;
  this.state.seed=n>>>0;
  return this.state.seed/4294967296
 }
 on(fn){
  this.listeners.push(fn)
 }
 emit(){
  for(const fn of this.listeners)fn()
 }
 event(type,
 data={
 }
 ){
  this.events.push({
   type,
   ...data,
   time:this.state.time
  }
  );
  this.events=this.events.slice(-80)
 }
 log(message,
 type='event'){
  this.state.logs.unshift({
   message,
   type,
   time:Math.floor(this.state.time)
  }
  );
  this.state.logs=this.state.logs.slice(0,
  80)
 }
 addRoom(col,
 row,
 type,
 floorId=0){
  const p=center({
   col,
   row
  }
  ),
  shape=roomShape(type),
  r={
   id:this.id('room'),
   col,
   row,
   x:p.x,
   y:p.y,
   ...shape,
   type,
   floorId,
   loot:type==='loot'?30:0,
   cleared:false,
   sealed:false,
   sealAt:null,
   stairs:type==='boss'||type==='arrival',
   layoutSeed:((this.state.worldSeed||this.state.seed)+floorId*10007+col*331+row*997)>>>0
  }
  ;
  this.state.rooms.push(r);
  this.state.props.push(...furnish(r,
  r.layoutSeed,
  k=>this.id(k)));
  return r
 }
 spawn(species,
 faction,
 x,
 y,
 name,
 charms=[],
 options={
 }
 ){
  const d=SPECIES[species],
  room=this.roomAt(x,
  y,
  options.floorId??0);
  const elite=!!options.elite,
  boss=options.boss||null,
  mult=elite?1.5:1;
  const maxHp=Math.round(d.hp*mult*(charms.includes('blessed')?1.12:1)*(boss==='inferno'?4:1));
  const e={
   id:this.id('entity'),
   species,
   faction,
   x,
   y,
   floorId:options.floorId??0,
   roomId:options.roomId??room?.id,
   home:{
    x,
    y,
    floorId:options.floorId??0
   }
   ,
   name,
   charms:[...charms],
   elite,
   boss,
   level:options.level||1,
   xp:0,
   maxHp,
   hp:maxHp,
   mana:d.magic?100:0,
   maxMana:d.magic?100:0,
   capacity:d.capacity,
   potions:faction==='hero'?2:0,
   gold:faction==='hero'?40:0,
   inventory:[],
   equipment:d.capacity?{
    name:d.magic?'Trượng cổ':'Kiếm sắt',
    power:elite?5:2,
    durability:100
   }
   :null,
   status:'active',
   action:'guard',
   target:null,
   path:[],
   pathEnd:null,
   navRevision:-1,
   cooldown:0,
   decision:.1+this.random()*.3,
   scores:[],
   seen:{
   }
   ,
   knownTraps:[],
   knownRooms:[],
   visitedRooms:[],
   memory:[],
   personality:{
    aggression:.88+this.random()*.24,
    teamwork:.88+this.random()*.24
   }
   ,
   actionSince:0,
   combatTime:0,
   frenzy:0,
   coverCooldown:0,
   order:'guard',
   bossCooldown:3,
   bossStage:0,
   slowUntil:0,
   squadId:options.squadId||null,
   reinforcement:!!options.reinforcement
  }
  ;
  this.state.entities.push(e);
  return e
 }
 rebuild(){
  this.terrain={
  }
  ;
  this.corridors=[];
  for(let f=0;
  f<2;
  f++){
   const t=makeTerrain(this.state.rooms,
   f);
   this.terrain[f]=t.grid;
   this.corridors.push(...t.corridors)
  }
  this.propsByTile=new Map();
  for(const p of this.state.props)if(!p.destroyed&&p.solid)this.propsByTile.set(`${
p.floorId
}:${
tileKey(p.x,
p.y)
}`,
  p);
  this.gates=new Map();
  for(const r of this.state.rooms){
   r.doors=roomDoors(r,
   this.state.rooms);
   if(r.sealed)for(const door of r.doors)for(let off=-1;
   off<=1;
   off++)this.gates.set(`${
r.floorId
}:${
tileKey(door.x+(door.axis==='y'?off:0),
door.y+(door.axis==='x'?off:0))
}`,
   r.id)
  }
  this.navRevision++;
 }
 createCorridorTraps(){
 }
 rooms(floorId){
  return this.state.rooms.filter(r=>r.floorId===floorId)
 }
 roomAt(x,
 y,
 floorId=0){
  return this.state?.rooms.find(r=>r.floorId===floorId&&contains(r,
  {
   x,
   y,
   floorId
  }
  ,
  1))
 }
 corridorAt(x,
 y,
 floorId=0){
  return this.corridors.find(c=>c.floorId===floorId&&x>=c.x-.4&&x<=c.x+c.w-.6&&y>=c.y-.4&&y<=c.y+c.h-.6)
 }
 walkable(x,
 y,
 floorId=0,
 actor=null,
 ignoreGates=false){
  x=Math.round(x);
  y=Math.round(y);
  return !!this.terrain[floorId]?.[y]?.[x]&&!this.propsByTile.has(`${
floorId
}:${
x
},${
y
}`)&&(ignoreGates||!this.gates.has(`${
floorId
}:${
x
},${
y
}`))&&(!actor||isInAssignedRoom(
  this,
  actor,
  {
   x,
   y
  }
  ))
 }
 blocksSight(x,
 y,
 floorId=0){
  x=Math.round(x);
  y=Math.round(y);
  const prop=this.propsByTile.get(`${
floorId
}:${
x
},${
y
}`);
  return !this.terrain[floorId]?.[y]?.[x]||this.gates.has(`${
floorId
}:${
x
},${
y
}`)||!!prop&&prop.type!=='pit'
 }
 lineOfSight(a,
 b){
  const floor=a.floorId??b.floorId??0;
  if((a.floorId??floor)!==(b.floorId??floor))return false;
  const n=Math.ceil(distance(a,
  b)*3);
  for(let i=1;
  i<n;
  i++){
   const x=a.x+(b.x-a.x)*i/n,
   y=a.y+(b.y-a.y)*i/n;
   if(Math.round(x)===Math.round(b.x)&&Math.round(y)===Math.round(b.y))continue;
   if(this.blocksSight(x,
   y,
   floor))return false;
  }
  return true
 }
 path(a,
 b,
 options={
 }
 ){
  const floor=options.floorId??a.floorId??b.floorId??0,
  actor=options.actor??(a.faction?a:null),
  ignoreGates=!!options.ignoreGates,
  sx=Math.round(a.x),
  sy=Math.round(a.y),
  tx=Math.round(b.x),
  ty=Math.round(b.y);
  if(!this.walkable(tx,
  ty,
  floor,
  actor,
  ignoreGates)||!this.walkable(sx,
  sy,
  floor,
  actor,
  ignoreGates))return[];
  const start=sy*WIDTH+sx,
  goal=ty*WIDTH+tx,
  open=new Heap(),
  cost=new Map([[start,
  0]]),
  previous=new Map();
  open.push({
   key:start,
   x:sx,
   y:sy,
   g:0,
   f:Math.abs(tx-sx)+Math.abs(ty-sy)
  }
  );
  let count=0;
  const hazards=new Map();
  if(actor)for(const id of actor.knownTraps||[]){
   const t=this.state.traps.find(t=>t.id===id&&!t.disabled&&t.floorId===floor);
   if(t)hazards.set(tileKey(t.x,
   t.y),
   12*this.trapCaution(actor))
  }
  while(open.length&&count++<WIDTH*HEIGHT){
   const n=open.pop();
   if(n.g!==cost.get(n.key))continue;
   if(n.key===goal){
    let key=goal,
    out=[];
    while(key!==start){
     out.unshift({
      x:key%WIDTH,
      y:Math.floor(key/WIDTH),
      floorId:floor
     }
     );
     key=previous.get(key);
     if(key===undefined)return[]
    }
    return out
   }
   for(const[dx,
   dy]of[[1,
   0],
   [-1,
   0],
   [0,
   1],
   [0,
   -1]]){
    const x=n.x+dx,
    y=n.y+dy,
    key=y*WIDTH+x;
    if(!this.walkable(x,
    y,
    floor,
    actor,
    ignoreGates))continue;
    const edgeFear=actor?.charms.includes('CH32')&&this.nearGeometry({
     x,
     y,
     floorId:floor
    }
    ,
    'pit',
    1.5)?3:0;
    const g=n.g+1+(hazards.get(tileKey(x,
    y))||0)+edgeFear;
    if(g>=(cost.get(key)??Infinity))continue;
    cost.set(key,
    g);
    previous.set(key,
    n.key);
    open.push({
     key,
     x,
     y,
     g,
     f:g+Math.abs(tx-x)+Math.abs(ty-y)
    }
    )
   }
  }
  return[];
 }
 approach(e,
 target,
 stop){
  if(this.walkable(target.x,
  target.y,
  e.floorId,
  e))return target;
  const choices=[];
  for(let dy=-Math.ceil(stop);
  dy<=Math.ceil(stop);
  dy++)for(let dx=-Math.ceil(stop);
  dx<=Math.ceil(stop);
  dx++){
   const p={
    x:Math.round(target.x)+dx,
    y:Math.round(target.y)+dy,
    floorId:e.floorId
   }
   ;
   if(distance(p,
   target)<=stop&&this.walkable(p.x,
   p.y,
   e.floorId,
   e))choices.push(p)
  }
  choices.sort((a,
  b)=>distance(e,
  a)-distance(e,
  b));
  return choices[0]
 }
 move(e,
 target,
 dt,
 stop=.35){
  if(!target||(target.floorId??e.floorId)!==e.floorId)return false;
  if(distance(e,
  target)<=stop)return true;
  const end=this.approach(e,
  target,
  Math.max(1.1,
  stop));
  if(!end)return false;
  const key=`${
Math.round(end.x)
},${
Math.round(end.y)
}`;
  if(e.navRevision!==this.navRevision||e.pathEnd!==key||!e.path.length){
   e.path=this.path(e,
   end);
   e.pathEnd=key;
   e.navRevision=this.navRevision;
   if(!e.path.length)return distance(e,
   target)<=stop;
  }
  const next=e.path[0],
  dx=next.x-e.x,
  dy=next.y-e.y,
  dist=Math.hypot(dx,
  dy);
  if(dist<.3&&e.path.length>1){
   e.path.shift();
   return this.move(e,
   target,
   dt,
   stop)
  }
  let speed=SPECIES[e.species].speed*(e.elite?1.08:1)*(e.hp/e.maxHp<.3&&e.charms.includes('fearful')?1.25:1)*(this.state.time<e.slowUntil?.45:1)*(e.moveFactor||1);
  if(e.boss&&e.bossStage>=2)speed*=1.2;
  const amount=Math.min(dist,
  speed*dt),
  p={
   x:e.x+(dist?dx/dist*amount:0),
   y:e.y+(dist?dy/dist*amount:0),
   floorId:e.floorId
  }
  ;
  if(this.walkable(p.x,
  p.y,
  e.floorId,
  e)&&this.lineOfSight(e,
  p)){
   e.x=p.x;
   e.y=p.y;
   e.moving=true;
   e.flip=dx<0;
  }
  else{
   e.path=[];
   e.decision=0
  }
  if(dist<.08||amount===dist)e.path.shift();
  return distance(e,
  target)<=stop
 }
 connected(){
  const entry=this.state.rooms.find(r=>r.type==='entrance'),
  stair=this.state.rooms.find(r=>r.type==='boss'),
  arrival=this.state.rooms.find(r=>r.type==='arrival'),
  treasure=this.state.rooms.find(r=>r.type==='treasure');
  return !!entry&&!!stair&&!!arrival&&!!treasure&&this.path(center(entry),
  center(stair),
  {
   ignoreGates:true
  }
  ).length>0&&this.path(center(arrival),
  center(treasure),
  {
   ignoreGates:true
  }
  ).length>0
 }
 canPrepare(){
  return this.state.phase==='prepare'&&!this.state.paused
 }
 build(col,
 row,
 type,
 floorId=0){
  const s=this.state;
  if(!this.canPrepare())return{
   ok:false,
   message:'Xây dựng trong giai đoạn chuẩn bị, khi không tạm dừng.'
  }
  ;
  if(!ROOMS[type]||['entrance',
  'arrival',
  'treasure',
  'boss'].includes(type)||col<0||col>=COLS||row<0||row>=ROWS||s.rooms.some(r=>r.floorId===floorId&&r.col===col&&r.row===row))return{
   ok:false,
   message:'Ô xây dựng không hợp lệ.'
  }
  ;
  if(!this.rooms(floorId).some(r=>Math.abs(r.col-col)+Math.abs(r.row-row)===1))return{
   ok:false,
   message:'Chọn ô kề một phòng hiện có.'
  }
  ;
  if(this.rooms(floorId).length>=SETTINGS.roomLimit||s.mana<5)return{
   ok:false,
   message:'Đã đầy tầng hoặc không đủ vàng.'
  }
  ;
  s.mana-=5;
  const r=this.addRoom(col,
  row,
  type,
  floorId);
  this.rebuild();
  this.createCorridorTraps();
  this.log(`Đã xây ${
ROOMS[type].name
}, nội thất theo seed ${
r.layoutSeed
}.`);
  this.event('build');
  this.emit();
  return{
   ok:true,
   room:r
  }
 }
 summon(species,
 x,
 y,
 floorId=0){
  const costs={
   goblin:25,
   skeleton:30,
   slime:20,
   shaman:45
  }
  ,
  s=this.state,
  room=this.roomAt(x,
  y,
  floorId);
  if(!this.canPrepare()||!(species in costs)||!room||!this.walkable(x,
  y,
  floorId))return{
   ok:false,
   message:'Chọn nền trong phòng, ở giai đoạn chuẩn bị không tạm dừng.'
  }
  ;
  if(s.entities.filter(e=>e.faction==='monster').length>=SETTINGS.residentLimit||s.mana<costs[species])return{
   ok:false,
   message:'Không đủ mana hoặc đã đủ 40 cư dân.'
  }
  ;
  s.mana-=costs[species];
  const pool=['violent',
  'fearful',
  'guardian',
  'frenzy',
  'greedy',
  'forsaken',
  'opportunist',
  'proud',
  'camaraderie'],
  e=this.spawn(species,
  'monster',
  Math.round(x),
  Math.round(y),
  `${
SPECIES[species].name
} ${
s.id+1
}`,
  [pool[Math.floor(this.random()*pool.length)]],
  {
   floorId,
   roomId:room.id
  }
  );
  this.log(`${
e.name
} giữ ${
ROOMS[room.type].name
}.`);
  this.event('heal');
  this.emit();
  return{
   ok:true,
   entity:e
  }
 }
 relocate(id,
 x,
 y,
 floorId){
  const e=this.entity(id),
  room=this.roomAt(x,
  y,
  floorId);
  if(!this.canPrepare()||!e||e.faction!=='monster'||e.boss||!room||!this.walkable(x,
  y,
  floorId))return false;
  e.x=Math.round(x);
  e.y=Math.round(y);
  e.floorId=floorId;
  e.roomId=room.id;
  e.home={
   x:e.x,
   y:e.y,
   floorId
  }
  ;
  e.path=[];
  return true
 }
 place(kind,
 x,
 y,
 floorId){
  if(!this.canPrepare()||!this.walkable(x,
  y,
  floorId))return{
   ok:false,
   message:'Chỉ đặt trên nền trống trong giai đoạn chuẩn bị.'
  }
  ;
  x=Math.round(x);
  y=Math.round(y);
  const room=this.roomAt(x,
  y,
  floorId),
  corridor=this.corridorAt(x,
  y,
  floorId),
  trap=['spikes',
  'dart',
  'frost'].includes(kind),
  cost=trap?kind==='spikes'?35:45:20;
  if(!room&&!corridor)return{
   ok:false,
   message:'Hãy chọn phòng hoặc hành lang.'
  }
  ;
  if(this.state.mana<3)return{
   ok:false,
   message:'Không đủ 3 mana để đặt thẻ.'
  }
  ;
  if(this.state.traps.some(t=>t.floorId===floorId&&distance(t,
  {
   x,
   y
  }
  )<1)||this.state.entities.some(e=>e.floorId===floorId&&e.status==='active'&&distance(e,
  {
   x,
   y
  }
  )<1))return{
   ok:false,
   message:'Vị trí đang có nhân vật hoặc bẫy.'
  }
  ;
  if(trap){
   this.state.traps.push({
    id:this.id('trap'),
    type:kind,
    x,
    y,
    floorId,
    roomId:room?.id,
    corridorId:corridor?.id,
    disabled:false,
    revealed:false,
    cooldown:0,
    windup:0
   }
   )
  }
  else{
   if(!room||Math.abs(x-room.x)<=2||Math.abs(y-room.y)<=2)return{
    ok:false,
    message:'Giữ trống các trục cửa và giữa phòng; đặt thùng sang bên.'
   }
   ;
   this.state.props.push({
    id:this.id('prop'),
    type:kind,
    x,
    y,
    floorId,
    roomId:room.id,
    hp:20,
    maxHp:20,
    solid:true,
    destroyed:false
   }
   );
   this.rebuild()
  }
  this.state.mana-=3;
  this.event('build');
  return{
   ok:true
  }
 }
 promote(id){
  const e=this.entity(id);
  if(!this.canPrepare()||!e||e.faction!=='monster'||e.status!=='active'||e.elite||e.boss||this.state.souls<20)return false;
  this.state.souls-=20;
  e.elite=true;
  e.maxHp=Math.round(e.maxHp*1.5);
  e.hp=e.maxHp;
  if(e.equipment)e.equipment.power+=3;
  e.charms=[...new Set([...e.charms,
  'guardian'])];
  this.log(`${
e.name
} trở thành tinh anh.`);
  this.event('boss');
  return true
 }
 entity(id){
  return this.state.entities.find(e=>e.id===id)
 }
 roomMonsters(room){
  return this.state.entities.filter(e=>e.faction==='monster'&&e.roomId===room.id&&e.status==='active')
 }
 updateSeals(){
  let changed=false;
  const s=this.state;
  for(const room of s.rooms){
   const monsters=this.roomMonsters(room),
   intruders=s.entities.filter(e=>e.faction==='hero'&&e.status==='active'&&e.floorId===room.floorId&&contains(room,
   e,
   1));
   if(!monsters.length){
    if(room.sealed||room.sealAt!==null){
     room.sealed=false;
     room.sealAt=null;
     changed=true;
     this.log(`${
ROOMS[room.type].name
}: đã quét sạch, cửa mở.`);
     this.event('coin')
    }
    room.cleared=true;
    continue
   }
   room.cleared=false;
   if(!intruders.length){
    if(room.sealed||room.sealAt!==null){
     room.sealed=false;
     room.sealAt=null;
     changed=true
    }
    continue
   }
   if(!room.sealed&&room.sealAt===null){
    room.sealAt=s.time+1.2;
    this.log(`${
ROOMS[room.type].name
}: cửa đang đóng!`,
    'warning');
    this.event('boss')
   }
   if(!room.sealed&&s.time>=room.sealAt){
    room.sealed=true;
    changed=true;
    this.log(`${
ROOMS[room.type].name
}: tiêu diệt ${
monsters.length
} quái để mở cửa.`,
    'warning')
   }
  }
  if(changed){
   this.rebuild();
   for(const e of s.entities){
    e.path=[];
    e.decision=0;
    if(!this.walkable(e.x,
    e.y,
    e.floorId,
    e)){
     const room=this.roomAt(e.x,
     e.y,
     e.floorId);
     for(let radius=1;
     radius<5;
     radius++){
      let found=false;
      for(let dy=-radius;
      dy<=radius&&!found;
      dy++)for(let dx=-radius;
      dx<=radius;
      dx++)if(this.walkable(e.x+dx,
      e.y+dy,
      e.floorId,
      e)){
       e.x=Math.round(e.x+dx);
       e.y=Math.round(e.y+dy);
       found=true;
       break
      }
      if(found)break
     }
    }
   }
  }
 }
 roomForHero(e){
  return this.state.rooms.find(r=>r.floorId===e.floorId&&r.sealed&&contains(r,
  e,
  1))
 }
 start(){
  if(this.state.phase!=='prepare'||!this.connected())return{
   ok:false,
   message:'Cần đường nối qua cầu thang đến kho báu.'
  }
  ;
  const s=this.state;
  s.phase='battle';
  s.paused=false;
  s.speed=1;
  s.battleTime=0;
  s.result=null;
  s.statistics={
   downed:0,
   escaped:0,
   reinforced:0
  }
  ;
  const count=Math.min(SETTINGS.mainPartyMax,
  SETTINGS.mainParty+(s.wave-1)*2),
  types=['knight',
  'rogue',
  'mage',
  'priest'],
  names=['Arthur',
  'Ren',
  'Elara',
  'Seren',
  'Borin',
  'Lyra',
  'Cyrus',
  'Mira'];
  s.encounter={
   spawnQueue:[],
   reinforcements:[],
   mainCount:count,
   spawnTimer:0
  }
  ;
  for(let i=0;
  i<count;
  i++)s.encounter.spawnQueue.push({
   species:types[i%4],
   name:names[i%8]+(i>=8?' II':''),
   squadId:'main-'+Math.floor(i/4),
   elite:i%8===0,
   reinforcement:false
  }
  );
  const extra=this.random()<.3?2:1;
  for(let i=0;
  i<extra;
  i++)s.encounter.reinforcements.push({
   at:SETTINGS.reinforcementMin+this.random()*(SETTINGS.reinforcementMax-SETTINGS.reinforcementMin)+i*35,
   state:'pending',
   waited:0
  }
  );
  this.createCorridorTraps();
  this.log(`Cuộc thám hiểm ${
s.wave
}: ${
count
} người trong đoàn chính. Viện binh chưa rõ.`,
  'warning');
  this.event('boss');
  this.emit();
  return{
   ok:true
  }
 }
 spawnExpedition(dt){
  const s=this.state,
  enc=s.encounter;
  if(!enc)return;
  for(const r of enc.reinforcements){
   if(r.state!=='pending'||s.battleTime<r.at)continue;
   const count=3+Math.floor(this.random()*4),
   types=['knight',
   'rogue',
   'mage',
   'priest'];
   for(let i=0;
   i<count;
   i++)enc.spawnQueue.push({
    species:types[Math.floor(this.random()*types.length)],
    name:`Hậu quân ${
s.wave
}-${
s.statistics.reinforced+i+1
}`,
    squadId:'rear-'+r.at,
    reinforcement:true,
    elite:false
   }
   );
   r.state='arriving';
   this.log('Tiếng bước chân mới! Viện binh xuất hiện ở lối vào.',
   'warning');
   this.event('reinforcement')
  }
  enc.spawnTimer-=dt;
  if(enc.spawnTimer>0||!enc.spawnQueue.length)return;
  const entry=s.rooms.find(r=>r.type==='entrance'),
  p=center(entry);
  let spot=null;
  for(let i=0;
  i<40;
  i++){
   const x=p.x-5+this.random()*10,
   y=p.y-4+this.random()*8;
   if(this.walkable(x,
   y,
   0)&&!s.entities.some(e=>e.status==='active'&&e.floorId===0&&distance(e,
   {
    x,
    y
   }
   )<1.2)){
    spot={
     x:Math.round(x),
     y:Math.round(y)
    }
    ;
    break
   }
  }
  if(!spot){
   enc.spawnTimer=.5;
   enc.blockedSince??=s.battleTime;
   if(s.battleTime-enc.blockedSince>25){
    enc.spawnQueue.shift();
    this.log('Một nhóm không tìm được lối vào và đã bỏ cuộc.')
   }
   return
  }
  enc.blockedSince=null;
  const spec=enc.spawnQueue.shift(),
  old=s.reports.find(r=>r.survived&&!r.returned&&r.species===spec.species),
  charms=spec.species==='knight'?['guardian']:spec.species==='rogue'?['greedy',
  'fearful']:spec.species==='priest'?['camaraderie']:['violent'];
  const e=this.spawn(spec.species,
  'hero',
  spot.x,
  spot.y,
  old?old.name:spec.name,
  charms,
  {
   ...spec,
   floorId:0,
   level:old?old.level+1:1+Math.floor((s.wave-1)/2)
  }
  );
  if(old){
   old.returned=true;
   e.memory=[...old.memory]
  }
  if(spec.reinforcement){
   e.maxHp=Math.round(e.maxHp*.75);
   e.hp=e.maxHp;
   e.potions=1;
   e.powerScale=.75;
   s.statistics.reinforced++
  }
  else e.powerScale=1;
  e.maxHp+=Math.max(0,
  s.wave-1)*6;
  e.hp=e.maxHp;
  enc.spawnTimer=.3;
  for(const r of enc.reinforcements)if(r.state==='arriving'&&!enc.spawnQueue.some(e=>e.reinforcement))r.state='resolved';
 }
 usedSlots(e){
  return e.inventory.length+(e.potions||0)+(this.state.treasure.carrier===e.id?1:0)
 }
 transfer(item,
 owner){
  if(!item||!owner||owner.status!=='active'||item.owner===owner.id||this.usedSlots(owner)>=owner.capacity)return false;
  const old=this.entity(item.owner);
  if(old)old.inventory=old.inventory.filter(id=>id!==item.id);
  item.owner=owner.id;
  item.x=null;
  item.y=null;
  item.floorId=owner.floorId;
  owner.inventory.push(item.id);
  return true
 }
 heal(e,
 amount){
  if(e.status!=='active'||e.charms.includes('forsaken'))return 0;
  const n=Math.min(amount,
  e.maxHp-e.hp);
  e.hp+=n;
  return n
 }
 drop(e){
  for(const id of e.inventory){
   const item=this.state.items.find(i=>i.id===id);
   if(item)Object.assign(item,
   {
    owner:null,
    x:Math.round(e.x),
    y:Math.round(e.y),
    floorId:e.floorId
   }
   )
  }
  e.inventory=[];
  if(this.state.treasure.carrier===e.id){
   this.state.treasure={
    carrier:null,
    x:Math.round(e.x),
    y:Math.round(e.y),
    floorId:e.floorId
   }
   ;
   this.log('Kho báu bị đánh rơi, vẫn có thể thu hồi!',
   'warning')
  }
 }
 damage(e,
 amount,
 source=null){
  if(e.status!=='active')return;
  const s=this.state;
  e.lastDamaged=s.time;
  const actual=amount*(e.charms.includes('guardian')?.85:1);
  e.hp=Math.max(0,
  e.hp-actual);
  this.effects.push({
   x:e.x,
   y:e.y,
   floorId:e.floorId,
   text:'−'+Math.round(actual),
   color:e.faction==='monster'?'#f6a18c':'#f2d086',
   life:.75
  }
  );
  const room=this.roomAt(e.x,
  e.y,
  e.floorId),
  p=room?center(room):e;
  s.noises.push({
   x:p.x,
   y:p.y,
   floorId:e.floorId,
   time:s.time
  }
  );
  s.noises=s.noises.slice(-30);
  if(e.hp>0)return;
  e.status='downed';
  this.drop(e);
  this.event('hit',
  {
   x:e.x,
   y:e.y,
   floorId:e.floorId
  }
  );
  if(e.faction==='hero'){
   s.statistics.downed++;
   if(e.gold){
    s.items.push({
     id:this.id('item'),
     name:'Túi vàng',
     type:'gold',
     value:e.gold,
     owner:null,
     x:Math.round(e.x),
     y:Math.round(e.y),
     floorId:e.floorId
    }
    );
    e.gold=0
   }
  }
  if(source){
   this.gainXP(source,
   18);
   for(const ally of s.entities.filter(a=>a.status==='active'&&a.faction===source.faction&&a.floorId===source.floorId&&distance(a,
   source)<8))if(ally!==source)this.gainXP(ally,
   5)
  }
  this.log(`${
e.name
} đã mất khả năng chiến đấu.`)
 }
 damageProp(prop,
 amount,
 source=null,
 visited=new Set()){
  if(!prop||prop.destroyed||['pillar',
  'wall',
  'pit'].includes(prop.type)||visited.has(prop.id))return;
  prop.hp-=amount;
  if(prop.hp>0)return;
  visited.add(prop.id);
  prop.destroyed=true;
  this.propsByTile.delete(`${
prop.floorId
}:${
tileKey(prop.x,
prop.y)
}`);
  this.navRevision++;
  this.event('trap',
  {
   floorId:prop.floorId,
   x:prop.x,
   y:prop.y
  }
  );
  if(prop.type==='explosive'){
   this.effects.push({
    ...prop,
    blast:true,
    radius:3.2,
    life:.5,
    color:'#efa75c'
   }
   );
   for(const e of this.state.entities)if(e.floorId===prop.floorId&&e.status==='active'&&distance(e,
   prop)<=3.2)this.damage(e,
   38,
   source,
   {
    secondary:true,
    aoe:true,
    environment:true,
    explosion:true
   }
   );
   for(const other of this.state.props)if(other.floorId===prop.floorId&&!other.destroyed&&distance(other,
   prop)<=3.2)this.damageProp(other,
   40,
   source,
   visited)
  }
  else if(prop.type==='poison')this.state.hazards.push({
   id:this.id('gas'),
   type:'poison',
   x:prop.x,
   y:prop.y,
   floorId:prop.floorId,
   radius:3.1,
   until:this.state.time+6,
   tick:0
  }
  );
  else if(prop.type==='water'){
   this.state.hazards=this.state.hazards.filter(h=>h.floorId!==prop.floorId||distance(h,
   prop)>4);
   this.effects.push({
    ...prop,
    blast:true,
    radius:3.5,
    life:.5,
    color:'#70bcca'
   }
   )
  }
  else{
   this.state.items.push({
    id:this.id('item'),
    name:'Vàng trong thùng',
    type:'gold',
    value:3+Math.floor(this.random()*6),
    owner:null,
    x:prop.x,
    y:prop.y,
    floorId:prop.floorId
   }
   )
  }
 }
 escape(e,
 teleport=false){
  if(e.status!=='active'||this.roomForHero(e))return false;
  const entry=center(this.state.rooms.find(r=>r.type==='entrance'));
  if(!teleport&&(e.floorId!==0||distance(e,
  entry)>1.5))return false;
  e.status='escaped';
  this.state.statistics.escaped++;
  e.memory.push(`Thoát màn ${
this.state.wave
}`);
  if(this.state.treasure.carrier===e.id){
   this.state.phase='gameover';
   this.state.result={
    lost:true,
    title:'Trái tim đã bị đánh cắp',
    description:`${
e.name
} đã mang kho báu ra khỏi hầm ngục.`
   }
   ;
   this.event('boss');
   this.emit()
  }
  else this.log(`${
e.name
} rút lui với ${
e.inventory.length
} vật phẩm.`);
  return true
 }
 stairs(e,
 dt,
 direction){
  const stair=this.state.rooms.find(r=>direction==='down'?r.type==='boss':r.type==='arrival');
  if(!stair||e.faction!=='hero'||e.floorId!==stair.floorId)return;
  if(direction==='down'&&this.roomMonsters(stair).length)return;
  const p={
   x:stair.x+5,
   y:stair.y,
   floorId:stair.floorId
  }
  ;
  if(!this.move(e,
  p,
  dt,
  .6))return;
  const destination=this.state.rooms.find(r=>direction==='down'?r.type==='arrival':r.type==='boss');
  e.floorId=destination.floorId;
  e.x=destination.x+5;
  e.y=destination.y;
  e.path=[];
  e.decision=0;
  e.stairCooldown=this.state.time+2;
  e.visitedRooms=[];
  e.knownRooms=[];
  e.seen={
  }
  ;
  this.event('ui-click');
 }
 decide(e){
  chooseAction(this,
  e)
 }
 act(e,
 dt){
  const s=this.state,
  d=SPECIES[e.species];
  e.cooldown=Math.max(0,
  e.cooldown-dt);
  e.decision-=dt;
  e.moving=false;
  e.strike=Math.max(0,
  (e.strike||0)-dt);
  if(e.decision<=0)this.decide(e);
  if(e.castUntil>s.time)return;
  const action=e.action,
  target=this.entity(e.target);
  if(action==='dodge'||action==='cover'||action==='kite'||action==='regroup'||action==='explore'||action==='investigate'||action==='guard'||action==='wait'){
   if(this.move(e,
   e.target||e.home,
   dt,
   .4)){
    if(action==='cover'){
     e.coverArrivedAt??=s.time;
     if(s.time-e.coverArrivedAt>1.3)e.decision=0
    }
    else e.decision=Math.min(e.decision,
    .2)
   }
   e.combatTime=Math.max(0,
   e.combatTime-dt*2);
   return
  }
  if(action==='heal'){
   if(e.potions>0&&this.heal(e,
   38)>0){
    e.potions--;
    this.event('heal')
   }
   e.decision=0;
   return
  }
  if(action==='support'){
   if(!target||target.status!=='active'||e.mana<12||target.charms.includes('forsaken')){
    e.decision=0;
    return
   }
   if(distance(e,
   target)>5||!this.lineOfSight(e,
   target)){
    this.move(e,
    target,
    dt,
    3);
    return
   }
   if(e.cooldown===0){
    const n=this.heal(target,
    e.elite?36:28);
    e.mana-=12;
    e.cooldown=2.5;
    this.gainXP(e,
    2);
    this.effects.push({
     x:target.x,
     y:target.y,
     floorId:e.floorId,
     text:'+'+Math.round(n),
     color:'#a9d29c',
     life:1
    }
    );
    this.event('heal')
   }
   return
  }
  if(action==='rescue'){
   if(!target||target.status!=='downed'||target.rescued||e.mana<20){
    e.decision=0;
    return
   }
   if(distance(e,
   target)>1.5){
    this.move(e,
    target,
    dt,
    1.2);
    e.channel=0;
    return
   }
   if(s.time-(e.lastDamaged??-100)<.5){
    e.channel=0;
    return
   }
   e.channel=(e.channel||0)+dt;
   if(e.channel>=2.5){
    e.mana-=20;
    target.status='active';
    target.hp=target.maxHp*.25;
    target.rescued=true;
    target.decision=0;
    e.channel=0;
    e.decision=0;
    this.log(`${
e.name
} cứu ${
target.name
} đứng dậy.`);
    this.event('heal')
   }
   return
  }
  if(action==='attack'){
   if(!target||target.status!=='active'||target.floorId!==e.floorId){
    e.decision=0;
    return
   }
   if(!this.lineOfSight(e,
   target)||distance(e,
   target)>SETTINGS.vision+1){
    const last=e.seen[target.id];
    e.action=last?'investigate':'guard';
    e.target=last?{
     ...last,
     floorId:e.floorId
    }
    :e.home;
    e.path=[];
    e.decision=0;
    return
   }
   const range=(d.magic&&e.mana<5?1.4:this.range(e))+(target.boss?.9:0);
   e.combatTime+=dt;
   e.frenzy=e.charms.includes('frenzy')?Math.min(8,
   Math.floor(e.combatTime/5)):0;
   if(distance(e,
   target)>range){
    this.move(e,
    target,
    dt,
    Math.max(1,
    range*.85));
    return
   }
   if(e.cooldown===0){
    const magic=d.magic&&e.mana>=5;
    if(magic)e.mana-=5;
    const power=(d.attack+(e.equipment?.durability>0?e.equipment.power:0)+e.level*1.5)*(e.elite?1.22:1)*(e.powerScale||1)*(e.charms.includes('violent')?1.2:1)*(e.charms.includes('blessed')?
    1.1:1)*(1+e.frenzy*.05);
    this.damage(target,
    power,
    e);
    e.cooldown=e.elite?.88:1.08;
    e.strike=.2;
    if(e.equipment)e.equipment.durability=Math.max(0,
    e.equipment.durability-.4);
    this.effects.push({
     x:e.x,
     y:e.y,
     tx:target.x,
     ty:target.y,
     floorId:e.floorId,
     beam:true,
     color:magic?'#acbbf0':'#ead0a1',
     life:.16
    }
    );
    this.event(magic?'magic':'sword',
    {
     floorId:e.floorId,
     x:e.x,
     y:e.y
    }
    )
   }
   return
  }
  if(action==='barrel'){
   const prop=s.props.find(p=>p.id===e.target);
   if(!prop||prop.destroyed){
    e.decision=0;
    return
   }
   const range=!d.magic||e.mana>=5?this.range(e):1.4;
   if(distance(e,
   prop)>range){
    this.move(e,
    prop,
    dt,
    range);
    return
   }
   if(e.cooldown===0){
    if(d.magic&&e.mana>=5)e.mana-=5;
    this.damageProp(prop,
    d.attack+8,
    e);
    e.cooldown=1;
    e.strike=.2
   }
   return
  }
  if(action==='disarm'){
   const t=s.traps.find(t=>t.id===e.target);
   if(!t||t.disabled||!e.knownTraps.includes(t.id)){
    e.decision=0;
    return
   }
   if(distance(e,
   t)>1.7){
    this.move(e,
    t,
    dt,
    1.5);
    e.channel=0;
    return
   }
   e.channel=(e.channel||0)+dt;
   if(e.channel>=1.6){
    t.disabled=true;
    e.channel=0;
    e.decision=0;
    e.xp+=6;
    this.log(`${
e.name
} vô hiệu hóa bẫy ${
t.type
}.`)
   }
   return
  }
  if(action==='down'||action==='up'){
   this.stairs(e,
   dt,
   action);
   return
  }
  if(action==='retreat'){
   if(this.roomForHero(e)){
    e.decision=0;
    return
   }
   if(e.floorId>0){
    this.stairs(e,
    dt,
    'up');
    return
   }
   const room=this.roomAt(e.x,
   e.y,
   e.floorId);
   if(e.species==='mage'&&e.mana>=25&&e.hp/e.maxHp<.25&&room?.type!=='mana'){
    e.teleport=(e.teleport||0)+dt;
    if(e.teleport>=3){
     e.mana-=25;
     this.escape(e,
     true)
    }
    return
   }
   if(this.move(e,
   center(s.rooms.find(r=>r.type==='entrance')),
   dt,
   1))this.escape(e);
   return
  }
  if(action==='treasure'){
   if(s.treasure.carrier){
    e.decision=0;
    return
   }
   if(this.move(e,
   e.target,
   dt,
   .7)&&distance(e,
   s.treasure)<1&&e.floorId===s.treasure.floorId&&this.usedSlots(e)<e.capacity){
    s.treasure.carrier=e.id;
    this.log(`${
e.name
} lấy kho báu! Phải chặn trước khi ra khỏi cả hai tầng.`,
    'warning');
    e.decision=0;
    this.event('reinforcement')
   }
   return
  }
  if(action==='recover'){
   if(!s.treasure.carrier&&this.move(e,
   e.target,
   dt,
   .7)){
    s.treasure={
     carrier:null,
     ...center(s.rooms.find(r=>r.type==='treasure'))
    }
    ;
    this.log(`${
e.name
} đã thu hồi kho báu.`);
    e.decision=0
   }
   return
  }
  if(action==='lure'){
   const room=s.rooms.find(r=>r.id===e.target);
   if(room&&room.loot>0&&this.move(e,
   center(room),
   dt,
   1)&&this.usedSlots(e)<e.capacity){
    const item={
     id:this.id('item'),
     name:'Vàng trong rương',
     type:'gold',
     value:room.loot,
     owner:null,
     x:e.x,
     y:e.y,
     floorId:e.floorId
    }
    ;
    s.items.push(item);
    if(this.transfer(item,
    e))room.loot=0;
    e.decision=0
   }
   return
  }
  if(action==='loot'){
   const item=s.items.find(i=>i.id===e.target);
   if(!item||item.owner||item.x===null){
    e.decision=0;
    return
   }
   if(this.move(e,
   item,
   dt,
   .8)){
    if(this.transfer(item,
    e))this.event('coin');
    e.decision=0
   }
   return
  }
  if(action==='shop'){
   const shop=this.roomAt(e.target.x,
   e.target.y,
   e.floorId),
   price=shop?.owner==='dungeon'?20:0;
   if(shop?.stock>0&&shop.buildingHp>0&&this.move(e,
   e.target,
   dt,
   1)&&e.gold>=price&&this.heal(e,
   28)>0){
    e.gold-=price;
    s.gold+=price;
    shop.stock--;
    e.decision=0;
    this.event('coin')
   }
   return
  }
 }
 bossTick(e,
 dt){
  const s=this.state;
  if(!e.boss||e.status!=='active')return;
  const enemies=s.entities.filter(a=>a.faction!==e.faction&&a.status==='active'&&a.floorId===e.floorId&&e.visibleIds?.includes(a.id));
  if(!enemies.length)return;
  e.bossCooldown-=dt;
  const stage=e.hp/e.maxHp<.3?2:e.hp/e.maxHp<.6?1:0;
  if(stage>e.bossStage){
   e.bossStage=stage;
   this.log(`${
e.name
} chuyển sang giai đoạn ${
stage+1
}!`,
   'warning');
   this.event('boss');
   if(stage===1){
    const room=s.rooms.find(r=>r.id===e.roomId);
    for(let i=0;
    i<2;
    i++){
     const p=this.findFreeNear({
      x:e.x+(i?3:-3),
      y:e.y+3,
      floorId:e.floorId
     }
     ,
     room);
     if(p&&this.roomSlotsUsed(room)+1<=this.roomCapacity(room))this.spawn(e.boss==='warden'?'skeleton':'goblin',
     'monster',
     p.x,
     p.y,
     'Vệ binh của '+e.name,
     ['guardian'],
     {
      floorId:e.floorId,
      roomId:e.roomId
     }
     )
    }
   }
  }
  if(e.bossCooldown>0)return;
  const target=enemies.sort((a,
  b)=>distance(a,
  e)-distance(b,
  e))[0];
  const line=e.boss==='warden'&&Math.floor(s.time)%2===0,
  windup=line?.9:1.2,
  p=line?e:target;
  const dx=target.x-e.x,
  dy=target.y-e.y,
  n=Math.hypot(dx,
  dy)||1;
  e.castUntil=s.time+windup;
  s.telegraphs.push({
   id:this.id('cast'),
   source:e.id,
   floorId:e.floorId,
   type:line?'line':'circle',
   x:p.x,
   y:p.y,
   tx:e.x+dx/n*10,
   ty:e.y+dy/n*10,
   radius:e.boss==='warden'?4:3.5,
   width:1.5,
   resolveAt:s.time+windup,
   createdAt:s.time,
   damage:e.boss==='warden'?32:28,
   fire:e.boss==='inferno'
  }
  );
  e.bossCooldown=stage===2?5.5:8.5;
  this.event('boss',
  {
   floorId:e.floorId
  }
  )
 }
 inDanger(p,
 t,
 padding=0){
  if(p.floorId!==t.floorId)return false;
  if(t.type==='line'){
   const dx=t.tx-t.x,
   dy=t.ty-t.y,
   l=dx*dx+dy*dy,
   q=Math.max(0,
   Math.min(1,
   ((p.x-t.x)*dx+(p.y-t.y)*dy)/(l||1)));
   return Math.hypot(p.x-t.x-q*dx,
   p.y-t.y-q*dy)<t.width+padding
  }
  return distance(p,
  t)<t.radius+padding
 }
 resolveWorld(dt){
  const s=this.state;
  for(const t of [...s.telegraphs]){
   if(s.time<t.resolveAt)continue;
   s.telegraphs=s.telegraphs.filter(a=>a.id!==t.id);
   const source=this.entity(t.source);
   if(!source||source.status!=='active')continue;
   for(const e of s.entities)if(e.faction!==source.faction&&e.status==='active'&&this.inDanger(e,
   t))this.damage(e,
   t.damage,
   source,
   {
    aoe:true,
    skill:t.skill||null,
    effect:t.skill==='A04'?'frost':t.skill==='A01'||t.fire?'fire':null,
    element:t.skill==='A06'?'lightning':null
   }
   );
   if(t.fire)s.hazards.push({
    id:this.id('fire'),
    type:'fire',
    x:t.x,
    y:t.y,
    floorId:t.floorId,
    radius:t.radius,
    until:s.time+4,
    tick:0
   }
   );
   this.effects.push({
    ...t,
    blast:true,
    life:.6,
    color:t.fire?'#ec9c55':'#d4a48e'
   }
   );
   this.event('trap',
   {
    floorId:t.floorId
   }
   )
  }
  for(const t of s.traps){
   t.cooldown=Math.max(0,
   t.cooldown-dt);
   if(t.disabled)continue;
   if(t.windup>0){
    t.windup-=dt;
    if(t.windup<=0){
     const hit={
      ...t,
      radius:t.type==='frost'?2.3:t.type==='spikes'?1.1:3
     }
     ;
     for(const e of s.entities)if(e.status==='active'&&e.faction===(t.affectsUntil>s.time?t.affectsFaction:'hero')&&e.floorId===t.floorId&&distance(e,
     hit)<=hit.radius&&this.lineOfSight(t,
     e)){
      this.damage(e,
      t.type==='spikes'?18:t.type==='dart'?14:10,
      this.entity(t.activatedBy),
      {
       trap:true
      }
      );
      if(t.type==='frost')e.slowUntil=s.time+3
     }
     t.cooldown=5;
     this.event('trap',
     {
      floorId:t.floorId
     }
     );
     this.effects.push({
      ...hit,
      blast:true,
      life:.4,
      color:t.type==='frost'?'#7bbbd4':'#d6ad8f'
     }
     )
    }
    continue
   }
   if(t.cooldown===0&&s.entities.some(e=>e.status==='active'&&e.faction===(t.affectsUntil>s.time?t.affectsFaction:'hero')&&e.floorId===t.floorId&&distance(e,
   t)<1)){
    t.windup=.7;
    t.revealed=true
   }
  }
  for(const h of s.hazards){
   h.tick=(h.tick||0)+dt;
   if(h.tick<.75)continue;
   h.tick=0;
   for(const e of s.entities)if(e.status==='active'&&e.floorId===h.floorId&&distance(e,
   h)<h.radius)this.damage(e,
   h.type==='poison'?5:6,
   null,
   {
    effect:h.type
   }
   )
  }
  s.hazards=s.hazards.filter(h=>h.until>s.time);
  this.effects=this.effects.filter(e=>(e.life-=dt)>0);
 }
 findFreeNear(p,
 room=null){
  for(let r=0;
  r<6;
  r++)for(let dy=-r;
  dy<=r;
  dy++)for(let dx=-r;
  dx<=r;
  dx++){
   const q={
    x:Math.round(p.x)+dx,
    y:Math.round(p.y)+dy,
    floorId:p.floorId
   }
   ;
   if(this.walkable(q.x,
   q.y,
   q.floorId)&&(!room||contains(room,
   q,
   1))&&!this.state.entities.some(e=>e.status==='active'&&e.floorId===q.floorId&&distance(e,
   q)<.8))return q
  }
  return null
 }
 separate(dt){
  const active=this.state.entities.filter(e=>e.status==='active');
  for(let i=0;
  i<active.length;
  i++)for(let j=i+1;
  j<active.length;
  j++){
   const a=active[i],
   b=active[j];
   if(a.floorId!==b.floorId)continue;
   let dx=a.x-b.x,
   dy=a.y-b.y,
   dist=Math.hypot(dx,
   dy);
   const spacing=(a.boss||b.boss)?1.55:.96;
   if(dist>=spacing)continue;
   if(dist<.01){
    dx=(i%2?1:-1)*.1;
    dy=.1;
    dist=.1414
   }
   const push=Math.min(.13,
   (spacing-dist)*dt*6);
   for(const[e,
   sign]of[[a,
   1],
   [b,
   -1]]){
    const p={
     x:e.x+dx/dist*push*sign,
     y:e.y+dy/dist*push*sign,
     floorId:e.floorId
    }
    ;
    if(this.walkable(p.x,
    p.y,
    e.floorId,
    e)&&this.lineOfSight(e,
    p)){
     e.x=p.x;
     e.y=p.y
    }
   }
  }
 }
 tick(dt){
  const s=this.state;
  if(s.paused||['result',
  'gameover'].includes(s.phase))return;
  s.time+=dt;
  if(s.phase==='prepare'){
   if(s.manualStart)return;
   s.remaining-=dt;
   if(s.remaining<=0)this.start();
   return
  }
  s.battleTime+=dt;
  this.spawnExpedition(dt);
  this.updateSeals();
  for(const e of [...s.entities]){
   if(s.phase!=='battle')break;
   if(e.status!=='active')continue;
   this.act(e,
   dt);
   this.bossTick(e,
   dt)
  }
  this.resolveWorld(dt);
  this.separate(dt);
  this.updateSeals();
  if(s.phase!=='battle')return;
  if(s.battleTime>SETTINGS.battleLimit&&s.entities.some(e=>e.faction==='hero'&&e.status==='active')){
   for(const e of s.entities.filter(e=>e.faction==='hero'&&e.status==='active')){
    e.status='surrendered';
    this.drop(e)
   }
   s.encounter.spawnQueue=[];
   for(const r of s.encounter.reinforcements)r.state='resolved';
   this.log('Đoàn thám hiểm kiệt sức và đầu hàng, không thoát qua cửa khóa.',
   'warning')
  }
  if(!s.encounter.spawnQueue.length&&s.encounter.reinforcements.every(r=>r.state==='resolved')&&s.entities.filter(e=>e.faction==='hero').every(e=>e.status!=='active'&&e.status!=='downed')
  )this.finish()
 }
 progress(e){
  while(e.xp>=e.level*30){
   e.xp-=e.level*30;
   e.level++;
   e.maxHp+=10;
   e.hp=Math.min(e.maxHp,
   e.hp+10);
   this.log(`${
e.name
} đạt cấp ${
e.level
}.`)
  }
  if(e.species==='goblin'&&e.level>=3&&!e.evolution){
   e.evolution=e.charms.includes('guardian')?'Hobgoblin hộ vệ':e.charms.includes('camaraderie')?'Goblin Shaman':'Goblin chiến binh';
   if(e.evolution==='Goblin Shaman'){
    e.species='shaman';
    e.mana=e.maxMana=100
   }
   e.maxHp+=25;
   e.hp=Math.min(e.maxHp,
   e.hp+25);
   if(e.equipment)e.equipment.power+=4;
   e.memory.push('Tiến hóa: '+e.evolution);
   this.log(`${
e.name
} tự tiến hóa: ${
e.evolution
}.`)
  }
 }
 finish(){
  const s=this.state;
  if(s.phase!=='battle')return;
  s.phase='result';
  const reward=90+s.wave*20+s.statistics.downed*8;
  s.gold+=reward;
  s.mana=Math.min(this.manaCapacity(),
  s.mana+20+s.rooms.filter(r=>['mana',
  'darkaltar'].includes(r.type)&&this.roomOperational(r)).reduce((n,
  r)=>n+r.level*15,
  0));
  s.souls+=5;
  let recovered=0;
  for(const e of s.entities.filter(e=>e.faction==='monster')){
   for(const id of [...e.inventory]){
    const item=s.items.find(i=>i.id===id);
    if(item?.type==='gold'){
     s.gold+=item.value;
     recovered+=item.value;
     e.inventory=e.inventory.filter(a=>a!==id);
     s.items=s.items.filter(i=>i.id!==id)
    }
   }
   if(e.status==='active'){
    this.heal(e,
    e.maxHp*.3);
    this.gainXP(e,
    15)
   }
   else if(e.species==='skeleton'&&s.rooms.some(r=>r.type==='grave'&&r.floorId===e.floorId&&this.roomOperational(r))){
    e.status='active';
    e.hp=e.maxHp*.6
   }
   this.progress(e);
   this.resetAction(e);
   e.x=e.home.x;
   e.y=e.home.y;
   e.mana=Math.min(e.maxMana,
   e.mana+30)
  }
  for(const item of [...s.items])if(!item.owner){
   if(item.type==='gold'){
    s.gold+=item.value;
    recovered+=item.value
   }
   s.items=s.items.filter(i=>i.id!==item.id)
  }
  for(const e of s.entities.filter(e=>e.faction==='hero'))s.reports.push({
   name:e.name,
   species:e.species,
   level:e.level,
   survived:e.status==='escaped',
   memory:[...e.memory],
   wave:s.wave,
   returned:false,
   elite:e.elite,
   reinforcement:e.reinforcement
  }
  );
  s.result={
   lost:false,
   title:'Hầm ngục vẫn đứng vững',
   description:`${
s.statistics.downed
} người bị hạ · ${
s.statistics.escaped
} người thoát · ${
s.statistics.reinforced
} viện binh đã đến.`,
   reward,
   recovered
  }
  ;
  this.log(`Giữ vững hai tầng. Nhận ${
reward
} vàng.`);
  this.event('coin');
  this.emit()
 }
 resetAction(e){
  Object.assign(e,
  {
   action:'guard',
   target:null,
   path:[],
   scores:[],
   frenzy:0,
   combatTime:0,
   decision:0,
   cooldown:0,
   teleport:0,
   channel:0,
   castUntil:0,
   coverArrivedAt:null,
   seen:{
   }
   ,
   knownRooms:[],
   visitedRooms:[],
   rescued:false,
   treasureKnown:null,
   heard:null
  }
  )
 }
 next(){
  if(this.state.phase!=='result')return;
  const s=this.state;
  s.entities=s.entities.filter(e=>e.faction==='monster');
  const ids=new Set(s.entities.map(e=>e.id));
  s.items=s.items.filter(i=>!i.owner||ids.has(i.owner));
  s.wave++;
  s.phase='prepare';
  s.remaining=180;
  s.result=null;
  s.paused=false;
  s.encounter=null;
  s.treasure={
   carrier:null,
   ...center(s.rooms.find(r=>r.type==='treasure'))
  }
  ;
  s.hazards=[];
  s.telegraphs=[];
  for(const r of s.rooms){
   r.sealed=false;
   r.sealAt=null
  }
  for(const e of s.entities)this.resetAction(e);
  this.rebuild();
  this.emit()
 }
 revive(id){
  const e=this.entity(id),
  cost=e?.boss?20:5;
  if(!this.canPrepare()||!e||e.faction!=='monster'||e.status!=='downed'||this.state.souls<cost)return false;
  this.state.souls-=cost;
  e.status='active';
  e.hp=e.maxHp*.65;
  e.x=e.home.x;
  e.y=e.home.y;
  e.bossStage=0;
  e.bossCooldown=3;
  this.resetAction(e);
  this.event('heal');
  return true
 }
 spell(id){
  const e=this.entity(id);
  if(this.state.phase!=='battle'||this.state.paused||!e||e.faction!=='monster'||this.state.mana<15||e.hp===e.maxHp||this.heal(e,
  40)===0)return false;
  this.state.mana-=15;
  this.event('heal');
  return true
 }
 serialize(){
  return JSON.stringify(this.state)
 }
}
installSystems(Game);
installContent(Game);
installLair(Game);
