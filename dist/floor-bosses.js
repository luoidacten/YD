import {SPECIES} from './data.js';
import {BOSS_POOL} from './boss-data.js';
const MODS={warden:{hp:.15},inferno:{burnTraps:true,burnDuration:-.5},necro_lord:{boneRevive:true,soulBonus:.5},
 spider_queen:{webDoors:true,spiderSpeed:.2},frost_witch:{heroSpeed:-.1,initialShield:15,trapSlow:1},
 orc_warlord:{damage:.1,moraleLock:true},death_knight:{vampire:.1},bone_king:{boneDiscount:.25,boneArmor:3}};
export function installFloorBosses(Game){
 const P=Game.prototype;
 P.floorBossRoom=function(floorId){return this.rooms(floorId).find(r=>r.type===(floorId===0?'boss':'treasure'))};
 P.floorBossOffers=function(floorId){
  const s=this.state;s.floorBoss??={};const record=s.floorBoss[floorId]??={id:null,offered:[],rerolled:false,sealWasActive:false};
  if(record.id)return record.offered.map(id=>BOSS_POOL[id]).filter(Boolean);
  const used=Object.values(s.floorBoss).filter(r=>r!==record).map(r=>r.id);
  const pool=Object.values(BOSS_POOL).filter(d=>d.floors.includes(floorId)&&!used.includes(d.id));
  if(record.offered.length!==3||record.offered.some(id=>!pool.some(d=>d.id===id))){
   const remaining=[...pool];record.offered=[];
   while(record.offered.length<3&&remaining.length){const index=Math.floor(this.random()*remaining.length);
    record.offered.push(remaining.splice(index,1)[0].id)}
  }
  return record.offered.map(id=>BOSS_POOL[id]);
 };
 P.rerollFloorBosses=function(floorId){
  const record=this.state.floorBoss?.[floorId];
  if(!this.canPrepare()||!this.floorBossRoom(floorId)||!record||record.id||record.rerolled||this.state.gold<50)return false;
  const previous=new Set(record.offered),used=Object.values(this.state.floorBoss).map(r=>r.id);
  let pool=Object.values(BOSS_POOL).filter(d=>d.floors.includes(floorId)&&!used.includes(d.id)&&!previous.has(d.id));
  if(pool.length<3)pool=Object.values(BOSS_POOL).filter(d=>d.floors.includes(floorId)&&!used.includes(d.id));
  record.offered=[];for(let i=0;i<3&&pool.length;i++)record.offered.push(pool.splice(Math.floor(this.random()*pool.length),1)[0].id);
  record.rerolled=true;this.state.gold-=50;return true;
 };
 P.floorBossCost=function(floorId,id){return Math.ceil((BOSS_POOL[id]?.hireCost||0)*(this.state.deck.activeFate?.id==='F02'?1.5:1))};
 P.hireFloorBoss=function(floorId,id,{legacy=false}={}){
  const room=this.floorBossRoom(floorId),d=BOSS_POOL[id],s=this.state;
  if(!room||!d||!d.floors.includes(floorId)||!this.canPrepare())return null;
  this.floorBossOffers(floorId);const record=s.floorBoss[floorId],cost=this.floorBossCost(floorId,id);
  if(record.id||!legacy&&!record.offered.includes(id)||Object.entries(s.floorBoss).some(([f,r])=>+f!==floorId&&r.id===id)||
   s.gold<cost||!this.roomHasSpace(room,{species:d.species,boss:id}))return null;
  const p=this.findFreeNear(room,room);if(!p)return null;
  s.gold-=cost;const e=this.spawn(d.species,'monster',p.x,p.y,d.name,[],{floorId,roomId:room.id,boss:id});
  e.floorBossId=id;e.maxHp=e.hp=d.hp;e.name=d.name;Object.assign(record,{id,species:d.species,entityId:e.id});
  this.refreshFloorSeals();this.log(`${d.name} nhận giữ tầng ${floorId+1}.`,'boss');return e;
 };
 P.pendingFloorBosses=function(){return [0,1].filter(f=>this.floorBossRoom(f)&&!this.state.floorBoss?.[f]?.id)};
 P.floorSeals=function(floorId){
  const result={hp:0,damage:0,heroSpeed:0,spiderSpeed:0,burnDuration:1,burnTraps:false,boneRevive:false,
   soulBonus:1,boneDiscount:0,boneArmor:0,initialShield:0,trapSlow:0,webDoors:false,vampire:0,moraleLock:false};
  const record=this.state.floorBoss?.[floorId],boss=this.entity(record?.entityId);
  if(!record?.id||boss?.status!=='active'||record.suppressed)return result;
  const strength=1+(this.researchMods?.().sealStrength||0)+(this.biomeRules?.(floorId).homeSealBonus||0);
  for(const[key,value]of Object.entries(MODS[record.id]||{}))result[key]=typeof value==='boolean'?value:result[key]+value*strength;
  return result;
 };
 P.refreshFloorSeals=function(){
  for(const floorId of [0,1]){
   const mods=this.floorSeals(floorId),record=this.state.floorBoss?.[floorId],active=!!record?.id&&
    this.entity(record.entityId)?.status==='active'&&!record.suppressed;
   if(record){if(record.sealWasActive&&!active)this.log(`Ấn Tầng vỡ · Tầng ${floorId+1}`,'warning');record.sealWasActive=active}
   for(const e of this.state.entities.filter(e=>e.faction==='monster'&&e.floorId===floorId)){
    const previous=e.sealHpBonus||0;if(previous!==mods.hp){const ratio=e.maxHp?e.hp/e.maxHp:0;
     e.maxHp=Math.max(1,Math.round(e.maxHp/(1+previous)*(1+mods.hp)));e.hp=e.status==='downed'?0:Math.min(e.maxHp,e.maxHp*ratio);e.sealHpBonus=mods.hp}
    if(!active)e.statuses=e.statuses.filter(status=>!status.floorSeal);
    if(this.state.phase==='battle'&&mods.initialShield&&e.status==='active'&&e.sealShieldWave!==this.state.wave){
     e.sealShieldWave=this.state.wave;
     if(!this.effect(e,'shield')){this.applyStatus(e,'shield',0,mods.initialShield/e.maxHp,e);
      const status=this.effect(e,'shield');if(status)status.floorSeal=true}
    }
    for(const status of e.statuses)if(status.floorSeal)status.value=Math.min(status.value,mods.initialShield);
   }
   for(const r of this.rooms(floorId)){const previous=r.sealHpBonus||0;
    if(previous!==mods.hp&&r.buildingMaxHp){const ratio=r.buildingHp/r.buildingMaxHp;
     r.buildingMaxHp=Math.round(r.buildingMaxHp/(1+previous)*(1+mods.hp));r.buildingHp=r.buildingMaxHp*ratio;r.sealHpBonus=mods.hp}
   }
  }
 };
 const setup=P.setupLair;P.setupLair=function(){
  setup.call(this);this.state.floorBoss??={};
  for(const floorId of [0,1]){
   const existing=this.state.entities.find(e=>e.boss&&e.floorId===floorId);
   if(existing&&!this.state.floorBoss[floorId]?.id){const id=existing.floorBossId||existing.boss;
    if(BOSS_POOL[id])this.state.floorBoss[floorId]={id,species:existing.species,entityId:existing.id,offered:[],rerolled:false};}
   else if(this.floorBossRoom(floorId)&&!this.state.floorBoss[floorId])this.floorBossOffers(floorId);
  }
  this.refreshFloorSeals();
 };
 const add=P.addRoom;P.addRoom=function(...args){
  const r=add.apply(this,args);if(this.state.lairVersion&&this.floorBossRoom(r.floorId)?.id===r.id)this.floorBossOffers(r.floorId);return r;
 };
 const hire=P.hire;P.hire=function(roomId,species=null){
  const room=this.state.rooms.find(r=>r.id===roomId);
  if(['warden','lord'].includes(species)&&room&&['boss','treasure'].includes(room.type))
   return this.hireFloorBoss(room.floorId,species==='lord'?'inferno':'warden',{legacy:true});
  return hire.call(this,roomId,species);
 };
 P.hirePrice=function(room,id,random=false){
  return Math.ceil((random?110:SPECIES[id]?.hireCost||75)*(this.state.deck.activeFate?.id==='F02'?1.5:1)*
   (SPECIES[id]?.family==='bone'?1-this.floorSeals(room?.floorId||0).boneDiscount:1));
 };
 const issues=P.layoutIssues;P.layoutIssues=function(){return [...issues.call(this),...this.pendingFloorBosses().map(f=>`Chọn Tầng Chủ cho tầng ${f+1}.`)]};
 const spawn=P.spawn;P.spawn=function(...args){const e=spawn.apply(this,args);if(this.state.floorBoss)this.refreshFloorSeals();return e};
 const start=P.start;P.start=function(){const result=start.call(this);if(result.ok)this.refreshFloorSeals();return result};
 const controls=P.controlsTick;P.controlsTick=function(dt){controls.call(this,dt);this.refreshFloorSeals()};
 const move=P.move;P.move=function(e,target,dt,...args){
  const mods=this.floorSeals(e.floorId),factor=e.faction==='hero'?1+mods.heroSpeed:
   e.species.includes('spider')?1+mods.spiderSpeed:1;
  return move.call(this,e,target,dt*factor,...args);
 };
 const apply=P.applyStatus;P.applyStatus=function(e,type,duration,...args){
  const mods=this.floorSeals(e.floorId);
  if(type==='panic'&&mods.moraleLock&&e.faction==='monster'&&/orc|goblin/i.test(e.species))return null;
  if(type==='burn'&&e.faction==='monster')duration*=mods.burnDuration;
  return apply.call(this,e,type,duration,...args);
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const mods=this.floorSeals(e.floorId),out=source?.faction==='monster'?this.floorSeals(source.floorId):null;
  if(out)n*=1+out.damage;if(e.family==='bone')n=Math.max(0,n-mods.boneArmor);
  const hp=e.hp,was=e.status,result=damage.call(this,e,n,source,ctx),actual=Math.max(0,hp-e.hp);
  if(out?.vampire&&e.faction!==source.faction&&!ctx.secondary&&actual)this.heal(source,actual*out.vampire);
  if(ctx.trap&&mods.burnTraps&&actual)this.applyStatus(e,'burn',3,1,source);
  if(was==='active'&&e.status==='downed'){
   if(e.faction==='hero'&&!e.ownerId&&e.soulPaidWave!==this.state.wave){e.soulPaidWave=this.state.wave;
    const reward=Math.round(2*mods.soulBonus);this.state.souls+=reward;const metric=this.metrics();metric.souls=(metric.souls||0)+reward;}
   if(e.boss)this.refreshFloorSeals();
  }
  return result;
 };
 const updateSeals=P.updateSeals;P.updateSeals=function(){
  updateSeals.call(this);
  for(const e of this.state.entities.filter(e=>e.faction==='hero'&&e.status==='active')){
   const room=this.roomAt(e.x,e.y,e.floorId);if(!room||!this.floorSeals(e.floorId).webDoors)continue;
   e.webDoorVisits??={};const key=this.state.wave+':'+room.id;
   if(!e.webDoorVisits[key]){e.webDoorVisits[key]=true;this.applyStatus(e,'slow',3,.3,e)}
  }
 };
}
