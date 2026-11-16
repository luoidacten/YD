// v0.3.4 — every room (except the entrance and the arrival stairs) summons 3–5 wild monsters each wave, picked at random
// from the species that favour that room type (barracks → soldiers, graveyard → undead…). Higher room level unlocks
// stronger species and scales their stats.
// Wild monsters are weaker, never take quota slots (they can't block your hires), and are cleared at the end of the
// wave. Monsters you place yourself are the fixed garrison: a one-time +15% HP and +15% power.
import {center,SPECIES} from './data.js';
import {FAVORITES} from './expansion.js';

const GENERIC=['goblin','skeleton','slime','giant_rat','kobold','zombie_shambler','orc','bat','spider','skeleton_archer'];
const NEVER_WILD=new Set(['warden','lord','mimic','goblin_king','skeleton_king','bone_king','zombie_king','necro_lord','spider_queen',
 'frost_witch','orc_warlord','death_knight','knight','mage','rogue','priest']);
export function installRoomSpawns(Game){
 const P=Game.prototype;
 const used=P.roomSlotsUsed;P.roomSlotsUsed=function(r,except=null){
  return used.call(this,r,except)-this.state.entities.filter(e=>e.wild&&e.roomId===r?.id&&e.id!==except&&e.status!=='dead')
   .reduce((n,e)=>n+this.unitSlots(e),0);
 };
 P.wildPool=function(room){
  const threat=id=>(SPECIES[id]?.hp||60)+(SPECIES[id]?.attack||8)*4;
  let pool=Object.entries(FAVORITES).filter(([id,rooms])=>SPECIES[id]&&!NEVER_WILD.has(id)&&SPECIES[id].role!=='companion'&&
   (rooms||[]).includes(room.type)).map(([id])=>id);
  if(pool.length<3)pool=[...new Set([...pool,...GENERIC.filter(id=>SPECIES[id])])];
  pool.sort((a,b)=>threat(a)-threat(b)||a.localeCompare(b));
  const level=room.level||1,share=Math.min(1,.25+.25*level);          // level 1: weakest half, level 3+: everything
  return pool.slice(0,Math.max(2,Math.ceil(pool.length*share)));
 };
 P.wildScale=function(room){const L=room.level||1;return {hp:.45+.12*L,power:.5+.1*L}};
 P.spawnWildMonsters=function(){
  const s=this.state;let made=0;
  for(const r of s.rooms){
   if(['entrance','arrival'].includes(r.type)||r.owner==='hero')continue;
   const pool=this.wildPool(r),k=this.wildScale(r),n=3+Math.floor(this.random()*3);
   for(let i=0;i<n;i++){
    const species=pool[Math.floor(this.random()*pool.length)],p=this.findFreeNear(center(r),r);if(!p)break;
    const e=this.spawn(species,'monster',p.x,p.y,species,[],{floorId:r.floorId,roomId:r.id});
    if(!e)continue;
    e.wild=true;e.name=(SPECIES[species]?.name||species)+' hoang';e.maxHp=Math.max(1,Math.round(e.maxHp*k.hp));e.hp=e.maxHp;
    e.powerScale=(e.powerScale||1)*k.power;e.home={x:e.x,y:e.y,floorId:e.floorId};made++;
   }
  }
  if(made)this.log(`${made} quái hoang được các phòng triệu hồi.`);
 };
 const start=P.start;P.start=function(){
  const r=start.call(this);if(!r?.ok)return r;
  for(const e of this.state.entities)if(e.faction==='monster'&&!e.wild&&!e.boss&&!e.fixedBonus){
   e.fixedBonus=true;e.maxHp=Math.round(e.maxHp*1.15);e.hp=Math.min(e.maxHp,e.hp*1.15);e.powerScale=(e.powerScale||1)*1.15;
  }
  if(this.state.rules?.wildMonsters!==false)this.spawnWildMonsters();
  return r;
 };
 const finish=P.finish;P.finish=function(){
  const r=finish.call(this);
  if(this.state.phase!=='battle'){const before=this.state.entities.length;
   this.state.entities=this.state.entities.filter(e=>!e.wild);
   for(const room of this.state.rooms)if(room.commanderId&&!this.entity(room.commanderId))room.commanderId=null;
   if(before!==this.state.entities.length)this.updateCommanders?.(true)}
  return r;
 };
}
