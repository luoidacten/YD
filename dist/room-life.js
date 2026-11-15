import {
 ROOMS,
 center,
 bounds,
 contains,
 distance
}
from './data.js';
export const CHEST_TIERS=[
{
 name:'Rương gỗ',
 color:'#b49771'
}
,
{
 name:'Rương sắt',
 color:'#a6bdc5'
}
,
{
 name:'Rương bạc',
 color:'#a8cbdc'
}
,
{
 name:'Rương vàng',
 color:'#e8c578'
}
,
{
 name:'Rương cổ đại',
 color:'#ccabe9'
}
];
export function installRoomLife(Game){
 const P=Game.prototype;
 const move=P.move;
 P.move=function(e,
 target,
 dt,
 stop){
  if(e.faction==='hero'&&target&&distance(e,
  target)>2){
   const priority=a=>this.state.treasure.carrier===a.id?3:a.action==='retreat'?2:1;
   const dx=target.x-e.x,
   dy=target.y-e.y,
   n=Math.hypot(dx,
   dy)||1;
   const blocker=this.state.entities.find(a=>a!==e&&a.faction===e.faction&&a.status==='active'&&a.floorId===e.floorId&&!a.trafficYield&&distance(a,
   e)<1.6&&((a.x-e.x)*dx+(a.y-e.y)*dy)/n>.25&&(priority(e)>priority(a)||priority(e)===priority(a)&&e.id.localeCompare(a.id)<0));
   if(blocker&&!blocker.visibleIds?.length){
    for(const sign of[1,
    -1]){
     const p={
      x:Math.round(blocker.x)+(Math.abs(dy)>Math.abs(dx)?sign:0),
      y:Math.round(blocker.y)+(Math.abs(dx)>=Math.abs(dy)?sign:0),
      floorId:e.floorId
     }
     ;
     if(!this.walkable(p.x,
     p.y,
     p.floorId,
     blocker)||!this.lineOfSight(blocker,
     p)||this.state.entities.some(a=>a!==blocker&&a.status==='active'&&a.floorId===p.floorId&&distance(a,
     p)<.7))continue;
     blocker.trafficYield={
      ...p,
      expires:this.state.time+2.5
     }
     ;
     break;
    }
   }
  }
  return move.call(this,
  e,
  target,
  dt,
  stop);
 }
 ;
 P.chestTier=function(room){
  if(['boss',
  'treasure'].includes(room.type))return 5;
  return Math.min(4,
  1+room.floorId+(room.level||1)-1+(room.defensePower>=400?1:0));
 }
 ;
 P.rewardPosition=function(room){
  return this.findFreeNear({
   x:room.x,
   y:room.y+2,
   floorId:room.floorId
  }
  ,
  room)||center(room);
 }
 ;
 P.spawnClearChest=function(room){
  if(room.rewardChest?.wave===this.state.wave)return room.rewardChest;
  const tier=this.chestTier(room),
  p=this.rewardPosition(room);
  room.rewardChest={
   ...p,
   tier,
   wave:this.state.wave,
   opened:false,
   value:12+tier*12+this.state.wave*3
  }
  ;
  this.log(`${
ROOMS[room.type].name
} đã sạch: xuất hiện ${
CHEST_TIERS[tier-1].name.toLowerCase()
}.`);
  this.event('coin');
  return room.rewardChest;
 }
 ;
 const start=P.start;
 P.start=function(){
  const ok=start.call(this);
  if(ok.ok)for(const r of this.state.rooms){
   r.rewardChest=null;
   r.defensePower=this.roomMonsters(r).reduce((n,
   e)=>n+e.maxHp,
   0)
  }
  return ok;
 }
 ;
 const seals=P.updateSeals;
 P.updateSeals=function(){
  seals.call(this);
  if(this.state.phase!=='battle')return;
  for(const r of this.state.rooms){
   if(this.roomMonsters(r).length||r.rewardChest?.wave===this.state.wave)continue;
   // Empty rooms also reward exploration, only after a living adventurer enters.
   if(this.state.entities.some(e=>e.faction==='hero'&&e.status==='active'&&e.floorId===r.floorId&&contains(r,
   e,
   1)))this.spawnClearChest(r);
  }
 }
 ;
 P.canOpenChest=function(e,
 r){
  const c=r?.rewardChest;
  return !!c&&!c.opened&&e.status==='active'&&e.faction==='hero'&&e.floorId===r.floorId&&!r.sealed&&!this.roomMonsters(r).length&&distance(e,
  c)<=this.vision(e)&&this.lineOfSight(e,
  c)&&this.usedSlots(e)<e.capacity;
 }
 ;
 P.patrolPoint=function(e){
  const r=this.state.rooms.find(r=>r.id===e.roomId);
  if(!r)return null;
  const b=bounds(r),
  others=this.roomMonsters(r).filter(a=>a!==e),
  choices=[];
  for(let i=0;
  i<12;
  i++){
   const p={
    x:b.x+2+Math.floor(this.random()*(b.w-4)),
    y:b.y+2+Math.floor(this.random()*(b.h-4)),
    floorId:r.floorId
   }
   ;
   if(distance(e,
   p)<1.5||e.boss&&distance(p,
   center(r))>6||!this.walkable(p.x,
   p.y,
   p.floorId,
   e))continue;
   if(this.state.traps.some(t=>!t.disabled&&t.floorId===p.floorId&&distance(t,
   p)<1.5)||this.state.hazards.some(h=>h.floorId===p.floorId&&distance(h,
   p)<h.radius+1))continue;
   const gap=Math.min(8,
   ...others.map(a=>Math.min(distance(a,
   p),
   a.patrolTarget?distance(a.patrolTarget,
   p):8)));
   if(gap<1.4||!this.path(e,
   p).length)continue;
   choices.push({
    p,
    score:gap-distance(e,
    p)*.12
   }
   );
  }
  choices.sort((a,
  b)=>b.score-a.score);
  return choices[0]?.p||null;
 }
 ;
 P.idleDestination=function(e){
  if(e.returningHome){
   if(distance(e,
   e.home)>.6)return e.home;
   e.returningHome=false
  }
  if(e.patrolTarget&&!this.walkable(e.patrolTarget.x,
  e.patrolTarget.y,
  e.floorId,
  e))e.patrolTarget=null;
  if(e.patrolTarget&&distance(e,
  e.patrolTarget)<.6){
   e.patrolTarget=null;
   e.idleUntil=this.state.time+1+this.random()*3
  }
  if(this.state.time<(e.idleUntil||0))return null;
  if(!e.patrolTarget)e.patrolTarget=this.patrolPoint(e);
  return e.patrolTarget;
 }
 ;
 const choices=P.extendChoices;
 P.extendChoices=function(e,
 context){
  choices.call(this,
  e,
  context);
  const {
   enemies,
   add
  }
  =context;
  if(e.faction==='monster'&&!enemies.length&&!e.disguised&&e.order!=='ambush'){
   const p=this.idleDestination(e)||{
    x:e.x,
    y:e.y,
    floorId:e.floorId
   }
   ;
   add('patrol',
   e.returningHome?.46:.34,
   p,
   e.returningHome?'Trở về vị trí giữ phòng sau giao chiến':'Đi tuần trong phòng, chọn vị trí cách xa đồng đội');
  }
  if(e.faction==='hero'&&!enemies.length&&!this.roomForHero(e)&&this.state.treasure.carrier!==e.id){
   for(const r of this.rooms(e.floorId))if(this.canOpenChest(e,
   r))add('open-chest',
   e.charms.includes('greedy')?1.02:.57,
   r.id,
   'Phòng đã sạch; mở rương nhìn thấy để lấy chiến lợi phẩm');
  }
 }
 ;
 const act=P.act;
 P.act=function(e,
 dt){
  if(e.action!=='open-chest'||e.chestRoom!==e.target){
   e.chestChannel=0;
   e.chestRoom=e.action==='open-chest'?e.target:null
  }
  if(e.trafficYield){
   const p=e.trafficYield;
   e.moving=false;
   if(p.floorId!==e.floorId||this.state.time>p.expires||e.visibleIds?.length){
    e.trafficYield=null;
    e.path=[];
    e.decision=0
   }
   else{
    if(!p.until&&this.move(e,
    p,
    dt,
    .15))p.until=this.state.time+.8;
    if(!p.until||this.state.time<p.until)return;
    e.trafficYield=null;
    e.path=[];
    e.decision=0
   }
  }
  if(e.faction==='monster'&&['attack',
  'barrel',
  'dodge',
  'cover',
  'kite'].includes(e.action)){
   e.returningHome=true;
   e.patrolTarget=null
  }
  if(!['patrol',
  'open-chest'].includes(e.action))return act.call(this,
  e,
  dt);
  e.moving=false;
  e.decision-=dt;
  if(e.decision<=0){
   this.decide(e);
   if(!['patrol',
   'open-chest'].includes(e.action))return act.call(this,
   e,
   dt)
  }
  if(this.effect(e,
  'stun'))return;
  if(e.action==='patrol'){
   this.move(e,
   e.target,
   dt*.55,
   .5);
   return
  }
  const r=this.state.rooms.find(r=>r.id===e.target),
  c=r?.rewardChest;
  if(!this.canOpenChest(e,
  r)){
   e.chestChannel=0;
   e.decision=0;
   return
  }
  if(!this.move(e,
  c,
  dt,
  1)){
   e.chestChannel=0;
   return
  }
  if(this.state.time-(e.lastDamaged??-100)<.5){
   e.chestChannel=0;
   return
  }
  e.chestChannel=(e.chestChannel||0)+dt;
  if(e.chestChannel<1.2)return;
  // Recheck on commit: two looters must never duplicate one chest's contents.
  if(c.opened)return;
  const item={
   id:this.id('item'),
   name:`Vàng từ ${
CHEST_TIERS[c.tier-1].name.toLowerCase()
}`,
   type:'gold',
   value:c.value,
   owner:null,
   x:c.x,
   y:c.y,
   floorId:r.floorId,
   location:'ground'
  }
  ;
  this.state.items.push(item);
  if(!this.transfer(item,
  e)){
   this.state.items=this.state.items.filter(a=>a!==item);
   e.decision=0;
   return
  }
  c.opened=true;
  c.openedBy=e.id;
  e.chestChannel=0;
  e.decision=0;
  if(c.tier>=3){
   const reward=this.createItem(['I14',
   'I15',
   'IT21'][c.tier-3]);
   Object.assign(reward,
   {
    x:c.x,
    y:c.y,
    floorId:r.floorId
   }
   );
  }
  this.log(`${
e.name
} mở ${
CHEST_TIERS[c.tier-1].name.toLowerCase()
} ở ${
ROOMS[r.type].name
}.`);
  this.event('coin');
 }
 ;
 const tick=P.tick;
 P.tick=function(dt){
  const prepare=this.state.phase==='prepare'&&!this.state.paused;
  tick.call(this,
  dt);
  if(!prepare||this.state.phase!=='prepare')return;
  for(const e of this.state.entities.filter(e=>e.faction==='monster'&&e.status==='active')){
   e.moving=false;
   if(e.disguised||this.effect(e,
   'stun')||this.effect(e,
   'rooted'))continue;
   const p=this.idleDestination(e);
   e.action=p?'patrol':'guard';
   e.target=p||{
    x:e.x,
    y:e.y,
    floorId:e.floorId
   }
   ;
   if(p)this.move(e,
   p,
   dt*.55,
   .5);
  }
  this.separate(dt);
 }
 ;
 const finish=P.finish;
 P.finish=function(){
  const positions=new Map(this.state.entities.filter(e=>e.faction==='monster'&&e.status==='active').map(e=>[e.id,
  {
   x:e.x,
   y:e.y
  }
  ]));
  finish.call(this);
  for(const e of this.state.entities){
   const p=positions.get(e.id);
   if(p&&e.status==='active'){
    Object.assign(e,
    p);
    e.returningHome=true;
    e.patrolTarget=null;
    e.path=[];
   }
  }
 }
 ;
 const relocate=P.relocate;
 P.relocate=function(...args){
  const ok=relocate.apply(this,
  args);
  if(ok){
   const e=this.entity(args[0]);
   e.patrolTarget=null;
   e.idleUntil=0;
   e.returningHome=false;
   e.decision=0
  }
  return ok
 }
 ;
}
