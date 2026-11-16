import {SPECIES,distance} from './data.js';
import './bone-data.js';
export function installBones(Game){
 const P=Game.prototype;
 P.setupBone=function(e){
  const d=SPECIES[e.species];if(d.family!=='bone')return;e.family='bone';e.undead=true;
  e.statuses=e.statuses.filter(status=>!['poison','bleed'].includes(status.type));
  if(d.offhand&&!e.boneEquipment){e.boneEquipment=true;this.equipItem(e,this.createItem(d.offhand,e))}
 };
 const spawn=P.spawn;P.spawn=function(...args){const e=spawn.apply(this,args);this.setupBone(e);return e};
 const setup=P.setupLair;P.setupLair=function(){setup.call(this);for(const e of this.state.entities)this.setupBone(e)};
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const revive=this.floorSeals(e.floorId).boneRevive,was=e.status;
  if(e.family==='bone'&&(ctx.effect==='holy'||ctx.skill==='A10'||this.weaponDefinition(source||{})?.family==='holy'))n*=1.5;
  const result=damage.call(this,e,n,source,ctx);
  if(was==='active'&&e.status==='downed'){
   if(e.family==='bone'&&revive&&!e.boneReviveUsed)e.boneReviveAt=this.state.time+8;
   if(e.species==='ember_skeleton'){
    this.damageProp({id:this.id('bone-burst'),type:'explosive',hp:1,x:e.x,y:e.y,floorId:e.floorId},1,e);
    for(const a of this.state.entities.filter(a=>a.status==='active'&&a.floorId===e.floorId&&distance(e,a)<3&&this.lineOfSight(e,a)))
     this.applyStatus(a,'burn',3,1,e);
   }
   if(e.species==='bone_giant')for(let i=0;i<2;i++)this.bossSpawn(e,'skeleton',e);
  }
  return result;
 };
 const controls=P.controlsTick;P.controlsTick=function(dt){
  controls.call(this,dt);
  for(const e of this.state.entities.filter(e=>e.family==='bone'&&e.status==='downed'&&Number.isFinite(e.boneReviveAt))){
   if(!this.floorSeals(e.floorId).boneRevive){delete e.boneReviveAt;continue}
   if(this.state.time<e.boneReviveAt)continue;
   const room=this.state.rooms.find(r=>r.id===e.roomId);
   if(room&&this.roomHasSpace(room,e)&&this.walkable(e.x,e.y,e.floorId,e)&&this.reviveAlly(e,e,.5)){
    e.boneReviveUsed=true;delete e.boneReviveAt;const m=this.metrics();m.boneRevivals=(m.boneRevivals||0)+1;
    this.log(e.name+' trỗi dậy nhờ Ấn Chiêu Hồn.','boss');
   }
  }
 };
 const start=P.start;P.start=function(){const result=start.call(this);if(result.ok)for(const e of this.state.entities){
  if(e.family==='bone'){e.boneReviveUsed=false;delete e.boneReviveAt}
 }return result};
}
