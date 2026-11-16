import {SPECIES,distance} from './data.js';
import {SKILLS} from './catalog.js';
import './species-data.js';

export function installSpecies(Game){
 const P=Game.prototype;
 // Shared trap constructor for player placement and the Kobold's one-charge combat tool.
 P.createTrap=function(kind,p,actor=null){
  const room=this.roomAt(p.x,p.y,p.floorId),corridor=this.corridorAt(p.x,p.y,p.floorId);
  if(!['spikes','dart','frost'].includes(kind)||!this.walkable(p.x,p.y,p.floorId,actor)||!room&&!corridor||
   actor?.faction==='monster'&&room?.id!==actor.roomId||this.state.traps.some(t=>t.floorId===p.floorId&&distance(t,p)<1)||
   this.state.entities.some(e=>e.status==='active'&&e.floorId===p.floorId&&distance(e,p)<1))return null;
  const trap={id:this.id('trap'),type:kind,x:Math.round(p.x),y:Math.round(p.y),floorId:p.floorId,
   roomId:room?.id,corridorId:corridor?.id,disabled:false,revealed:false,cooldown:0,windup:0,
   sourceActor:actor?.id||null};
  this.state.traps.push(trap);
  for(const e of this.state.entities.filter(e=>e.faction===(actor?.faction||'monster')&&e.floorId===p.floorId&&
   (e.faction==='monster'?e.roomId===room?.id:distance(e,p)<6)))
   if(!e.knownTraps.includes(trap.id))e.knownTraps.push(trap.id);
  return trap;
 };
 const apply=P.applyStatus;P.applyStatus=function(e,type,...args){
  if(SPECIES[e.species].immune?.includes(type))return null;return apply.call(this,e,type,...args);
 };
 const pulse=P.pulseStatuses;P.pulseStatuses=function(e){
  const previous=this.regenerationActor;this.regenerationActor=e.id;
  try{return pulse.call(this,e)}finally{this.regenerationActor=previous}
 };
 const heal=P.heal;P.heal=function(e,...args){
  if(e.species==='troll'&&this.regenerationActor===e.id&&this.effect(e,'burn'))return 0;
  return heal.call(this,e,...args);
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  if(SPECIES[e.species].immune?.includes(ctx.effect))return;
  if(e.species==='treant'&&['burn','fire'].includes(ctx.effect))n*=1.5;
  if(source?.species==='gnoll'&&!ctx.secondary&&this.state.entities.filter(a=>a.species==='gnoll'&&
   a.status==='active'&&a.roomId===source.roomId&&a.floorId===source.floorId).length>=2)n*=1.2;
  const hp=e.hp,was=e.status,result=damage.call(this,e,n,source,ctx);
  if(source?.species==='harpy'&&e.faction==='hero'&&e.hp<hp&&!ctx.secondary&&this.passiveReady(source,'harpy-theft',8)){
   const light=e.inventory.map(id=>this.state.items.find(i=>i.id===id)).find(i=>(i?.slotCost||1)<=1);
   if(light)this.transfer(light,source);
  }
  if(was==='active'&&e.status==='downed')for(const ally of this.state.entities.filter(a=>a.species==='werewolf'&&
   a.faction===e.faction&&a.status==='active'&&a.roomId===e.roomId&&a.floorId===e.floorId&&this.lineOfSight(a,e)))
   this.applyStatus(ally,'power',5,.2,ally);
  return result;
 };
 P.skeletonResurrectionAllowed=function(e,target){
  if(!['lich','skeleton_king'].includes(e.species))return true;
  const grave=this.rooms(e.floorId).some(r=>r.type==='grave'&&this.roomOperational(r));
  return grave&&target?.species==='skeleton'&&target.roomId===e.roomId;
 };
 const target=P.skillTarget;P.skillTarget=function(e,k,enemies,allies){
  const a=target.call(this,e,k,enemies,allies);
  return k.kind==='revive'&&!this.skeletonResurrectionAllowed(e,a)?null:a;
 };
 const cast=P.castSkill;P.castSkill=function(e,id,targetId,...args){
  if(SKILLS[id]?.kind==='revive'&&!this.skeletonResurrectionAllowed(e,this.entity(targetId)))return false;
  return cast.call(this,e,id,targetId,...args);
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);
  if(e.species!=='kobold'||this.state.phase!=='battle'||e.laidTrapWave===this.state.wave||e.mana<8||context.enemies.length)return;
  for(const [dx,dy]of [[2,1],[-2,1],[1,-2],[-1,2]]){
   const p={x:Math.round(e.x)+dx,y:Math.round(e.y)+dy,floorId:e.floorId};
   if(this.roomAt(p.x,p.y,p.floorId)?.id===e.roomId&&this.walkable(p.x,p.y,p.floorId,e)&&
    this.lineOfSight(e,p)&&!this.state.traps.some(t=>t.floorId===p.floorId&&distance(t,p)<1)&&
    !this.state.entities.some(a=>a.status==='active'&&a.floorId===p.floorId&&distance(a,p)<1)){
    context.add('lay-trap',.9,p,'Kobold bố trí một bẫy gai trong phòng, dùng 8 mana');break;
   }
  }
 };
 const act=P.act;P.act=function(e,dt){
  if(e.action!=='lay-trap'){e.trapChannel=0;return act.call(this,e,dt)}
  if(e.species!=='kobold'||e.laidTrapWave===this.state.wave||e.mana<8){e.decision=0;e.action='guard';return}
  e.moving=false;e.trapChannel=(e.trapChannel||0)+dt;
  if(this.state.time-(e.lastDamaged??-100)<.6){e.trapChannel=0;e.decision=0;e.action='guard';return}
  if(e.trapChannel>=.6){
   if(this.createTrap('spikes',e.target,e)){e.mana-=8;e.laidTrapWave=this.state.wave}
   e.trapChannel=0;e.decision=0;e.action='guard';
  }
 };
}
