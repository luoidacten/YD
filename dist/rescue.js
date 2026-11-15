import {
 SPECIES,
 distance
}
from './data.js';
const has=(e,
id)=>e.passiveIds?.includes(id);
export function installRescue(Game){
 const P=Game.prototype;
 P.rescueTarget=function(e){
  return this.state.entities.filter(a=>a.status==='downed'&&a.faction===e.faction&&a.floorId===e.floorId&&a.id!==e.id&&distance(e,
  a)<8&&this.lineOfSight(e,
  a)).sort((a,
  b)=>(a.bleedOutAt||Infinity)-(b.bleedOutAt||Infinity))[0]
 }
 ;
 P.canDrag=function(e){
  return e.charms.includes('CH31')||e.inventory.some(id=>this.state.items.some(i=>i.id===id&&i.definitionId==='IT22'&&i.charges>0))
 }
 ;
 P.reviveAlly=function(e,
 target,
 fraction=.25){
  if(!target||target.status!=='downed'||target.floorId!==e.floorId)return false;
  target.status='active';
  target.hp=Math.max(1,
  target.maxHp*fraction);
  target.rescued=true;
  target.rescueProgress=0;
  target.bleedOutAt=null;
  target.downedAt=null;
  target.draggedBy=null;
  target.rescueLease=null;
  target.decision=0;
  this.applyStatus(target,
  'wounded',
  12,
  .5,
  e);
  this.log(`${
e.name
} cứu ${
target.name
} đứng dậy.`);
  this.event('heal');
  return true
 }
 ;
 P.pullBody=function(e,
 target,
 amount=4){
  if(!target||target.status!=='downed'||target.floorId!==e.floorId||!this.lineOfSight(e,
  target))return false;
  const dx=e.x-target.x,
  dy=e.y-target.y,
  n=Math.hypot(dx,
  dy)||1;
  let moved=0;
  while(moved<amount&&distance(e,
  target)>1.3){
   const p={
    x:target.x+dx/n*.15,
    y:target.y+dy/n*.15,
    floorId:target.floorId
   }
   ;
   if(!this.walkable(p.x,
   p.y,
   p.floorId,
   target)||!this.lineOfSight(target,
   p))break;
   target.x=p.x;
   target.y=p.y;
   moved+=.15
  }
  return moved>0
 }
 ;
 const damage=P.damage;
 P.damage=function(e,
 n,
 source=null,
 ctx={
 }
 ){
  const was=e.status;
  damage.call(this,
  e,
  n,
  source,
  ctx);
  if(was==='active'&&e.status==='downed'){
   e.downedAt=this.state.time;
   e.bleedOutAt=e.faction==='hero'?this.state.time+25:null;
   e.rescueProgress=0;
   e.rescueLease=null;
   e.draggedBy=null;
   for(const a of this.state.entities.filter(a=>a.status==='active'&&a.floorId===e.floorId&&distance(a,
   e)<=this.vision(a)&&this.lineOfSight(a,
   e))){
    a.bodyMemories??={
    }
    ;
    a.bodyMemories[e.id]={
     id:e.id,
     x:e.x,
     y:e.y,
     floorId:e.floorId,
     time:this.state.time,
     faction:e.faction
    }
   }
  }
 }
 ;
 const tick=P.tick;
 P.tick=function(dt){
  const s=this.state,
  active=!s.paused&&s.phase==='battle';
  if(active){
   for(const e of s.entities.filter(e=>e.status==='downed')){
    if(e.bleedOutAt&&s.time>=e.bleedOutAt){
     e.status='dead';
     e.hp=0;
     e.draggedBy=null;
     e.rescueLease=null;
     this.drop(e);
     this.log(`${
e.name
} đã chết vì không được cứu kịp.`,
     'warning')
    }
    else if(s.time-(e.lastRescuedAt||-100)>2)e.rescueProgress=Math.max(0,
    (e.rescueProgress||0)-dt*.25)
   }
  }
  tick.call(this,
  dt)
 }
 ;
 const target=P.skillTarget;
 P.skillTarget=function(e,
 k,
 enemies,
 allies){
  if(k.kind==='revive')return this.state.entities.find(a=>a.status==='downed'&&!a.rescued&&a.faction===e.faction&&a.floorId===e.floorId&&distance(e,
  a)<=k.range&&this.lineOfSight(e,
  a));
  return target.call(this,
  e,
  k,
  enemies,
  allies)
 }
 ;
 const cast=P.castSkill;
 P.castSkill=function(e,
 id,
 targetId,
 complete=false){
  const a=this.entity(targetId),
  was=a?.status,
  ok=cast.call(this,
  e,
  id,
  targetId,
  complete);
  if(ok&&was==='downed'&&a?.status==='active'){
   a.bleedOutAt=null;
   a.rescueProgress=0;
   a.draggedBy=null;
   a.rescueLease=null
  }
  return ok
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
  =context,
  s=this.state;
  const body=this.rescueTarget(e),
  friendlyRisk=body&&enemies.filter(a=>distance(a,
  body)<4).length;
  if(body){
   const danger=enemies.find(a=>distance(a,
   body)<4),
   revival=e.inventory.map(id=>s.items.find(i=>i.id===id)).find(i=>i?.definitionId==='IT21');
   if(revival&&distance(e,
   body)<1.6&&!danger)add('rescue-potion',
   2.0,
   {
    bodyId:body.id,
    itemId:revival.id
   }
   ,
   'Thuốc cao cấp cứu người gục sau 2 giây thi triển');
   if(!friendlyRisk||e.charms.includes('CH34'))add('rescue',
   1.25+(body.bleedOutAt&&body.bleedOutAt-s.time<8?.4:0)+this.charmMod(e,
   'rescue'),
   body.id,
   'Cứu hộ từ từ trong 4 giây; có thể bị ngắt');
   if(danger&&this.canDrag(e)){
    const dx=body.x-danger.x,
    dy=body.y-danger.y,
    n=Math.hypot(dx,
    dy)||1,
    home=e.faction==='monster'?s.rooms.find(r=>r.id===e.roomId):null;
    const safe=this.findFreeNear({
     x:body.x+dx/n*4,
     y:body.y+dy/n*4,
     floorId:e.floorId
    }
    ,
    home);
    if(safe&&this.path(e,
    safe).length)add('drag-body',
    1.8,
    {
     bodyId:body.id,
     ...safe
    }
    ,
    'Kéo đồng đội khỏi vùng nguy hiểm rồi cứu; không đánh khi kéo')
   }
  }
  if(e.faction==='monster'&&e.intelligence>=65){
   for(const m of Object.values(e.bodyMemories||{
   }
   )){
    if(m.faction===e.faction||s.time-m.time>7)continue;
    if(!enemies.length||enemies.some(a=>distance(a,
    m)<5))add('guard-body',
    (.85+(e.charms.includes('CH35')?.5:0)),
    {
     ...m
    }
    ,
    'Canh vị trí người gục đã thấy để cản cứu hộ; không đọc vị trí mới sau fog')
   }
  }
 }
 ;
 P.releaseBody=function(e){
  const body=this.entity(e.dragging);
  if(body?.draggedBy===e.id)body.draggedBy=null;
  e.dragging=null
 }
 ;
 const decide=P.decide;
 P.decide=function(e){
  decide.call(this,
  e);
  if(e.dragging&&(e.action!=='drag-body'||e.target?.bodyId!==e.dragging))this.releaseBody(e)
 }
 ;
 const act=P.act;
 P.act=function(e,
 dt){
  if(e.dragging&&e.action!=='drag-body')this.releaseBody(e);
  const custom=['rescue',
  'rescue-potion',
  'drag-body',
  'guard-body'].includes(e.action);
  if(!custom)return act.call(this,
  e,
  dt);
  e.decision-=dt;
  if(e.decision<=0){
   this.decide(e);
   if(!['rescue',
   'rescue-potion',
   'drag-body',
   'guard-body'].includes(e.action))return act.call(this,
   e,
   dt)
  }
  if(this.effect(e,
  'stun'))return;
  const s=this.state;
  if(e.action==='guard-body'){
   const p=e.target;
   if(!p||s.time-p.time>7){
    e.decision=0;
    return
   }
   this.move(e,
   p,
   dt,
   2.3);
   return
  }
  const data=e.target,
  target=this.entity(typeof data==='string'?data:data?.bodyId);
  if(!target||target.status!=='downed'||target.floorId!==e.floorId||!this.lineOfSight(e,
  target)){
   this.releaseBody(e);
   e.decision=0;
   return
  }
  if(e.action==='drag-body'){
   if(!e.dragging&&!this.canDrag(e)||this.state.time-(e.lastDamaged||-100)<.3){
    e.dragging=null;
    target.draggedBy=null;
    e.decision=0;
    return
   }
   if(distance(e,
   target)>1.6){
    this.move(e,
    target,
    dt,
    1.3);
    return
   }
   if(target.draggedBy&&target.draggedBy!==e.id)return;
   target.draggedBy=e.id;
   if(!e.dragging){
    e.dragging=target.id;
    const rope=e.inventory.map(id=>s.items.find(i=>i.id===id)).find(i=>i?.definitionId==='IT22');
    if(rope&&!e.charms.includes('CH31')){
     rope.charges--;
     if(rope.charges<=0){
      e.inventory=e.inventory.filter(id=>id!==rope.id);
      s.items=s.items.filter(i=>i!==rope)
     }
    }
   }
   const before={
    x:e.x,
    y:e.y
   }
   ,
   arrived=this.move(e,
   data,
   dt*.5,
   1),
   dx=e.x-before.x,
   dy=e.y-before.y,
   p={
    x:target.x+dx,
    y:target.y+dy,
    floorId:target.floorId
   }
   ;
   if(this.walkable(p.x,
   p.y,
   p.floorId,
   target)&&this.lineOfSight(target,
   p)){
    target.x=p.x;
    target.y=p.y
   }
   else{
    e.x=before.x;
    e.y=before.y
   }
   if(arrived){
    e.dragging=null;
    target.draggedBy=null;
    e.action='rescue';
    e.target=target.id;
    e.decision=.5
   }
   return
  }
  if(distance(e,
  target)>1.5){
   this.move(e,
   target,
   dt,
   1.3);
   return
  }
  if(this.state.time-(e.lastDamaged||-100)<.5||this.effect(e,
  'panic')){
   e.rescueChannel=0;
   return
  }
  if(target.rescueLease&&target.rescueLease.id!==e.id&&target.rescueLease.until>s.time)return;
  target.rescueLease={
   id:e.id,
   until:s.time+.5
  }
  ;
  const potion=e.action==='rescue-potion',
  item=potion?s.items.find(i=>i.id===data.itemId&&i.owner===e.id&&i.location==='bag'&&i.definitionId==='IT21'):null;
  if(potion&&!item){
   e.decision=0;
   return
  }
  const required=potion?2:4,
  speed=has(e,
  'PS55')?1.4:1;
  target.rescueProgress=Math.min(1,
  (target.rescueProgress||0)+dt/required*speed);
  target.lastRescuedAt=s.time;
  e.rescueChannel=(e.rescueChannel||0)+dt;
  e.channel=target.rescueProgress*required;
  if(target.rescueProgress>=1){
   this.reviveAlly(e,
   target,
   potion?.5:.25);
   if(item){
    item.charges--;
    if(item.charges<=0){
     e.inventory=e.inventory.filter(id=>id!==item.id);
     s.items=s.items.filter(i=>i!==item)
    }
   }
   e.channel=0;
   e.rescueChannel=0;
   e.action='guard';
   e.decision=0
  }
 }
 ;
}
