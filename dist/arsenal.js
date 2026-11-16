import {
 SPECIES,
 SETTINGS,
 distance
}
from './data.js';
import {
 ITEMS
}
from './expansion.js';
import {
 NEW_MONSTERS,
 MONSTER_HIRES
}
from './arsenal-data.js';
export function installArsenal(Game){
 const P=Game.prototype;
 P.weaponDefinition=function(e){
  return ITEMS[this.state.items.find(i=>i.id===e.gearSlots?.weapon)?.definitionId]||null
 }
 ;
 const range=P.range;
 P.range=function(e){
  return this.weaponDefinition(e)?.reach??range.call(this,
  e)
 }
 ;
 const slots=P.unitSlots;
 P.unitSlots=function(e){
  return SPECIES[e.species]?.slots||slots.call(this,
  e)
 }
 ;
 P.setupArsenalUnit=function(e){
  if(e.arsenalKit)return;
  e.arsenalKit=true;
  const d=SPECIES[e.species];
  if(d.brain)e.intelligence=Math.min(100,
  d.brain+Math.floor(this.random()*15));
  if(d.weapon){
   this.equipItem(e,
   this.createItem(d.weapon,
   e));
   if(e.role==='ranged'&&!d.magic){
    e.maxMana=Math.max(e.maxMana,
    40);
    e.mana=e.maxMana
   }
  }
 }
 ;
 const spawn=P.spawn;
 P.spawn=function(...args){
  const e=spawn.apply(this,
  args);
  this.setupArsenalUnit(e);
  return e
 }
 ;
 const summon=P.summon;
 P.summon=function(species,
 x,
 y,
 floorId=0){
  if(!NEW_MONSTERS[species])return summon.call(this,
  species,
  x,
  y,
  floorId);
  const s=this.state,
  r=this.roomAt(x,
  y,
  floorId);
  const summonCost=NEW_MONSTERS[species].summonCost||35;
  if(!this.canPrepare()||!r||!this.walkable(x,
  y,
  floorId)||!this.roomHasSpace(r,
  {
   species
  }
  )||s.mana<summonCost||s.entities.filter(e=>e.faction==='monster').length>=SETTINGS.residentLimit)return{
   ok:false,
   message:'Cần nền trống, 35 mana và đủ ô quân trong phòng.'
  }
  ;
  if(s.entities.some(e=>e.status==='active'&&e.floorId===floorId&&distance(e,
  {
   x,
   y
  }
  )<.8))return{
   ok:false,
   message:'Ô này đang có cư dân.'
  }
  ;
  s.mana-=summonCost;
  const e=this.spawn(species,
  'monster',
  Math.round(x),
  Math.round(y),
  SPECIES[species].name,
  [],
  {
   floorId,
   roomId:r.id
  }
  );
  this.log(`${
e.name
} nhận giữ phòng.`);
  this.event('build');
  return{
   ok:true,
   entity:e
  }
  ;
 }
 ;
 const setup=P.setupLair;
 P.setupLair=function(){
  setup.call(this);
  for(const e of this.state.entities)this.setupArsenalUnit(e);
  const s=this.state;
  if(s.designedStart&&!s.arsenalStarter){
   s.arsenalStarter=true;
   if(s.phase==='prepare'&&s.wave===1)for(const id of ['contract-lizardArcher',
   'W01',
   'W03',
   'W10'])s.deck.hand.push(this.makeCard(id))
  }
 }
 ;
 const hire=P.hire;
 P.hire=function(roomId,
 species=null){
  if(!species||NEW_MONSTERS[species]){
   const r=this.state.rooms.find(r=>r.id===roomId),
   random=!species,
   cost=Math.ceil((random?110:75)*(this.state.deck.activeFate?.id==='F02'?1.5:1));
   const chosen=species||this.pickWeighted(MONSTER_HIRES.map(id=>[id,
    id==='pumpkin'?(this.state.world.event==='Chợ phiên'?.1:0):SPECIES[id]?.rare?.15:1]));
   if(!this.canPrepare()||!r||!this.roomOperational(r)||!this.roomHasSpace(r,
   {
    species:chosen
   }
   )||this.state.gold<cost||this.state.entities.filter(e=>e.faction==='monster').length>=SETTINGS.residentLimit)return null;
   const p=this.findFreeNear(r,
   r);
   if(!p)return null;
   this.state.gold-=cost;
   const e=this.spawn(chosen,
   'monster',
   p.x,
   p.y,
   SPECIES[chosen].name,
   [],
   {
    floorId:r.floorId,
    roomId:r.id
   }
   );
   if(random)this.setGrade(e,
   this.rollGrade(true),
   ['normal',
   'poison',
   'fire',
   'frost',
   'swift',
   'stone',
   'shadow'][Math.floor(this.random()*7)]);
   this.log(`Đã thuê ${
e.name
}.`);
   this.event('build');
   return e;
  }
  return hire.call(this,
  roomId,
  species);
 }
 ;
 const damage=P.damage;
 P.damage=function(e,
 n,
 source=null,
 ctx={
 }
 ){
  const hp=e.hp,
  result=damage.call(this,
  e,
  n,
  source,
  ctx),
  w=source?this.weaponDefinition(source):null;
  if(w?.hitEffect&&e.status==='active'&&e.hp<hp&&!ctx.secondary&&!ctx.skill)this.applyStatus(e,
  w.hitEffect,
  2,
  w.hitValue||1,
  source);
  return result;
 }
 ;
 // Main parties keep their support/tank core while adding a dedicated bow user.
 const start=P.start;
 P.start=function(){
  const result=start.call(this);
  if(result.ok){
   const q=this.state.encounter.spawnQueue;
   for(let i=0;
   i<q.length;
   i++)if(q[i].species==='rogue'&&i%8===1)q[i].species='archer'
  }
  return result
 }
 ;
 const act=P.act;
 P.act=function(e,
 dt){
  const before=e.cooldown,
  action=e.action,
  target=this.entity(typeof e.target==='string'?e.target:null);
  act.call(this,
  e,
  dt);
  if(action==='attack'&&e.cooldown>before&&target&&distance(e,
  target)>2.8){
   const w=this.weaponDefinition(e),
   last=this.effects.at(-1);
   if(last?.beam){
    Object.assign(last,
    {
     source:e.id,
     projectile:w?.projectile||(SPECIES[e.species].magic?'magic':'arrow'),
     life:.3,
     maxLife:.3
    }
    );
   }
  }
 }
 ;
}
