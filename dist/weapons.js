import {SPECIES,distance} from './data.js';
import {ITEMS} from './expansion.js';
import {SKILLS} from './catalog.js';
import {PROFICIENCY,ROLE_PROFICIENCY} from './weapon-data.js';

export function installWeapons(Game){
 const P=Game.prototype;
 P.usesMagicAttack=function(e){
  const w=this.weaponDefinition(e);return w?.family?!!w.magic||['staff','wand','holy'].includes(w.family):SPECIES[e.species].magic;
 };
 P.brain=function(e){return e.intelligence??SPECIES[e.species]?.brain??50};
 P.proficiency=function(e,family){
  return PROFICIENCY[e.species]?.[family]??(e.faction==='monster'?ROLE_PROFICIENCY[e.role]?.[family]:undefined)??1;
 };
 P.itemDefinition=function(item){return ITEMS[typeof item==='string'?item:item?.definitionId]||item};
 P.offhandDefinition=function(e){return this.itemDefinition(this.state.items.find(i=>i.id===e.gearSlots?.offhand))||null};
 P.equipIssue=function(e,item){
  const d=this.itemDefinition(item);if(!d?.slot)return 'Vật phẩm không có ô trang bị';
  if(d.strict&&this.brain(e)<(d.req?.brain||0))return `Không đủ trí khôn (${this.brain(e)}/${d.req.brain})`;
  if(d.family&&this.proficiency(e,d.family)===0)return 'Class không biết dùng họ vũ khí này';
  if(!SPECIES[e.species].capacity)return 'Không có khả năng mang trang bị';
  if(d.slot==='offhand'&&this.weaponDefinition(e)?.hands===2)return 'Vũ khí hai tay không đi cùng khiên';
  if(d.hands===2&&this.offhandDefinition(e))return 'Cần bỏ khiên trước khi dùng vũ khí hai tay';
  return '';
 };
 P.canEquip=function(e,item){return !this.equipIssue(e,item)};
 P.weaponFactor=function(e,item=this.weaponDefinition(e)){
  const d=this.itemDefinition(item);if(!d?.family)return 1;
  return [0,.7,1,1.1][this.proficiency(e,d.family)]*(this.brain(e)>=(d.req?.brain||0)?1:.6);
 };
 P.weaponSpeedFactor=function(e,d=this.weaponDefinition(e)){
  if(!d?.family)return 1;
  return [0,.8,1,1.1][this.proficiency(e,d.family)]*(this.brain(e)>=(d.req?.brain||0)?1:.6);
 };
 P.weaponScore=function(e,item){
  const d=this.itemDefinition(item);if(!d||!this.canEquip(e,item))return 0;
  const attack=SPECIES[e.species].attack;
  return Math.max(.1,attack*(1+(d.power||0)))*this.weaponFactor(e,d)+
   (this.proficiency(e,d.family)>=2&&this.brain(e)>=(d.req?.technique||0)?attack*.12:0);
 };
 P.weaponTechnique=function(e){
  const d=this.weaponDefinition(e);
  return d?.technique&&this.canEquip(e,d)&&this.proficiency(e,d.family)>=2&&
   this.brain(e)>=(d.req?.technique||0)?SKILLS[d.technique]:null;
 };
 P.unequipItem=function(e,slot){
  const item=this.state.items.find(i=>i.id===e.gearSlots?.[slot]);if(!item)return false;
  e.gearSlots[slot]=null;e.statuses=e.statuses.filter(s=>s.gearSlot!==slot);
  if(slot==='weapon'){e.equipment=null;e.gunState=null}
  item.location='bag';
  if(this.usedSlots(e)+item.slotCost<=e.capacity)e.inventory.push(item.id);
  else Object.assign(item,{owner:null,x:Math.round(e.x),y:Math.round(e.y),floorId:e.floorId,location:'ground'});
  return true;
 };
 const equip=P.equipItem;P.equipItem=function(e,item){
  if(!this.canEquip(e,item))return false;
  const ok=equip.call(this,e,item);if(ok&&this.itemDefinition(item).slot==='weapon')e.gunState=null;return ok;
 };
 const active=P.activeSkills;P.activeSkills=function(e){
  const skills=active.call(this,e),technique=this.weaponTechnique(e);
  if(technique){
   const index=skills.findIndex(k=>k.id===technique.id);
   if(index<0)skills.push({...technique,weaponTechnique:true});
   else skills[index]={...skills[index],weaponTechnique:true};
  }
  return skills;
 };
 const available=P.skillAvailable;P.skillAvailable=function(e,k){
  if(k.weaponTechnique&&this.weaponTechnique(e)?.id!==k.id)return false;
  if(this.weaponDefinition(e)?.family==='gun'&&e.gunState?.ready===false&&k.kind==='strike')return false;
  return available.call(this,e,k);
 };
 P.metrics=function(){return this.state.weaponMetrics??={basicAttacks:0,shots:0,jamAttempts:0,jams:0,techniqueOffers:0,techniqueUses:0,bombs:0,blocks:0}};
 const setup=P.setupLair;P.setupLair=function(){
  setup.call(this);this.metrics();for(const e of this.state.entities)e.gearSlots.offhand??=null;
 };
 const spawn=P.spawn;P.spawn=function(...args){const e=spawn.apply(this,args);e.gearSlots.offhand??=null;return e};
 P.gunReady=function(e){
  const w=this.weaponDefinition(e);if(w?.family!=='gun')return true;
  if(e.gunState?.weaponId!==e.gearSlots.weapon)e.gunState={weaponId:e.gearSlots.weapon,ready:true,progress:0};
  return e.gunState.ready;
 };
 P.beginReload=function(e,jammed=false){
  e.gunState={weaponId:e.gearSlots.weapon,ready:false,progress:0,startedAt:this.state.time,
   damageAt:e.lastDamaged,jammed};e.reloadChannel=0;
 };
 P.jamGun=function(e){
  const w=this.weaponDefinition(e);if(w?.family!=='gun'||!this.gunReady(e))return false;
  const metrics=this.metrics();metrics.jamAttempts++;
  if(this.proficiency(e,'gun')===1&&this.random()<.18){
   metrics.jams++;this.beginReload(e,true);e.action='reload';e.decision=.4;return true;
  }
  return false;
 };
 P.gunFired=function(e){
  this.metrics().shots++;this.beginReload(e);
  this.state.noises.push({x:e.x,y:e.y,floorId:e.floorId,time:this.state.time,gun:true});
  this.state.noises=this.state.noises.slice(-30);this.event('sword',{x:e.x,y:e.y,floorId:e.floorId});
 };
 P.reloadGun=function(e,dt){
  const state=e.gunState,w=this.weaponDefinition(e);if(!state||!w)return;
  if(e.lastDamaged!==state.damageAt&&e.lastDamaged>=state.startedAt){
   state.progress=0;state.startedAt=this.state.time;state.damageAt=e.lastDamaged;
  }
  state.progress+=dt;e.reloadChannel=state.progress;e.moving=false;
  e.cooldown=Math.max(0,e.cooldown-dt);e.strike=Math.max(0,(e.strike||0)-dt);
  if(state.progress>=w.reload*(state.jammed?1.5:1)){
   state.ready=true;state.jammed=false;state.progress=0;e.reloadChannel=0;e.decision=0;
  }
 };
 P.throwBomb=function(e,item,target){
  const d=this.itemDefinition(item);
  if(d?.kind!=='bomb'||item.owner!==e.id||item.charges<=0||target?.floorId!==e.floorId||
   distance(e,target)>d.reach||!this.lineOfSight(e,target))return false;
  const landing={x:target.x,y:target.y,floorId:e.floorId};
  if(this.brain(e)<35&&this.random()<.25){
   const angle=Math.floor(this.random()*8)*Math.PI/4,r=1+Math.floor(this.random()*2);
   landing.x+=Math.round(Math.cos(angle)*r);landing.y+=Math.round(Math.sin(angle)*r);
  }
  const blast={id:this.id('thrown-bomb'),type:'explosive',hp:1,...landing};
  this.damageProp(blast,1,e);this.metrics().bombs++;
  if(d.fireBomb)this.state.hazards.push({...landing,type:'fire',radius:2,until:this.state.time+3});
  this.effects.push({x:e.x,y:e.y,tx:landing.x,ty:landing.y,floorId:e.floorId,source:e.id,projectile:'bomb',life:.4,maxLife:.4});
  item.charges--;if(item.charges<=0){e.inventory=e.inventory.filter(id=>id!==item.id);this.state.items=this.state.items.filter(i=>i!==item)}
  return true;
 };
 const useful=P.itemUseful;P.itemUseful=function(e,item,enemies){
  const d=this.itemDefinition(item);
  if(d?.slot==='weapon')return item.owner===e.id&&item.location==='bag'&&this.canEquip(e,item)&&
   this.proficiency(e,d.family)>=2&&this.weaponScore(e,item)>this.weaponScore(e,this.weaponDefinition(e))*1.15;
  if(d?.slot==='offhand')return item.owner===e.id&&item.location==='bag'&&this.canEquip(e,item)&&
   this.proficiency(e,'shield')>=2&&!this.offhandDefinition(e);
  if(d?.kind==='bomb')return item.owner===e.id&&item.location==='bag'&&item.charges>0&&
   enemies.some(a=>distance(a,e)<=d.reach&&this.lineOfSight(e,a)&&
    (this.brain(e)<35||!this.state.entities.some(b=>b.faction===e.faction&&b.status==='active'&&
     b.floorId===a.floorId&&distance(b,a)<3.3)));
  return useful.call(this,e,item,enemies);
 };
 const use=P.useItem;P.useItem=function(e,id){
  const item=this.state.items.find(i=>i.id===id),d=this.itemDefinition(item);
  if(d?.kind==='bomb'){
   const target=this.state.entities.find(a=>e.visibleIds?.includes(a.id)&&a.status==='active'&&
    a.floorId===e.floorId&&distance(e,a)<=d.reach);
   return target?this.throwBomb(e,item,target):false;
  }
  return use.call(this,e,id);
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);if(this.weaponTechnique(e))this.metrics().techniqueOffers++;
 };
 const cast=P.castSkill;P.castSkill=function(e,id,targetId,complete=false){
  const isTechnique=!!e.target?.weaponTechnique,technique=this.weaponTechnique(e),w=this.weaponDefinition(e);
  if(isTechnique&&technique?.id!==id)return false;
  const gunStrike=w?.family==='gun'&&(SKILLS[id]?.kind==='strike'||isTechnique);
  if(gunStrike&&!complete&&(!this.gunReady(e)||this.jamGun(e)))return false;
  const ok=cast.call(this,e,id,targetId,complete);
  if(ok&&(!SKILLS[id]?.channel||complete)){
   if(gunStrike)this.gunFired(e);
   if(isTechnique){
    this.metrics().techniqueUses++;const target=this.entity(targetId);
    if(target&&this.canSeeEnemy(e,target)&&['crossbow','thrown'].includes(w.family)){
     const dx=target.x-e.x,dy=target.y-e.y,n=Math.hypot(dx,dy)||1;
     const next=w.family==='thrown'?target:this.state.entities.find(a=>a.faction!==e.faction&&a.status==='active'&&
      a.floorId===e.floorId&&a.id!==target.id&&this.canSeeEnemy(e,a)&&distance(a,e)<=this.range(e)&&
      ((a.x-e.x)*dx+(a.y-e.y)*dy)/n>n&&Math.abs((a.x-e.x)*dy-(a.y-e.y)*dx)/n<.75);
     if(next)this.damage(next,SPECIES[e.species].attack*.75,e,{skill:id});
    }
   }
  }
  return ok;
 };
 P.frontShield=function(target,source){
  const dx=target.x-source.x,dy=target.y-source.y,n=dx*dx+dy*dy||1;
  return this.state.entities.find(a=>a.faction===target.faction&&a.status==='active'&&a.floorId===target.floorId&&
   this.offhandDefinition(a)&&distance(a,target)<=3&&(a.flip?source.x<a.x:source.x>a.x)&&
   this.lineOfSight(source,a)&&this.lineOfSight(a,target)&&
   (a===target||((a.x-source.x)*dx+(a.y-source.y)*dy)/n>0&&
    ((a.x-source.x)*dx+(a.y-source.y)*dy)/n<1&&Math.abs((a.x-source.x)*dy-(a.y-source.y)*dx)/Math.sqrt(n)<.9));
 };
 // The single proficiency damage multiplier. Other wrappers must not multiply it again.
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  if(source&&!ctx.fromProjectile&&!ctx.secondary&&!ctx.skill&&source.action==='attack'&&this.weaponDefinition(source)?.family==='gun'&&
   (!this.gunReady(source)||this.jamGun(source)))return;
  if(source&&!ctx.secondary)n*=this.weaponFactor(source);
  if(source&&!ctx.aoe&&!ctx.secondary&&distance(source,e)>2.8){
   const guard=this.frontShield(e,source);
   if(guard){n*=1-this.offhandDefinition(guard).shieldBlock;this.metrics().blocks++;this.visualCue('shield',guard)}
  }
  return damage.call(this,e,n,source,ctx);
 };
 const act=P.act;P.act=function(e,dt){
  const w=this.weaponDefinition(e),before=e.cooldown,target=this.entity(typeof e.target==='string'?e.target:null);
  const ready=this.gunReady(e);
  if(w?.family==='gun'&&!ready&&['attack','reload'].includes(e.action)){
   e.action='reload';e.decision-=dt;this.reloadGun(e,dt);
   if(e.gunState.ready)e.action='guard';return;
  }
  if(e.action==='reload'&&ready){e.action='guard';e.decision=0}
  act.call(this,e,dt);
  if(e.cooldown>before&&e.strike>0&&!(w?.family==='gun'&&e.gunState?.jammed)){
   const metrics=this.metrics();metrics.basicAttacks=(metrics.basicAttacks||0)+1;
   // The single proficiency attack-speed adjustment, once per committed basic attack.
   e.cooldown/=Math.max(.1,this.weaponSpeedFactor(e,w));
   if(w?.family==='gun'&&e.gunState?.ready!==false)this.gunFired(e);
  }
 };
}
