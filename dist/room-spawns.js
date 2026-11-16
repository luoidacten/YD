// v0.3.3 — every room (except the entrance and the arrival stairs) gets 3–5 wild monsters each wave.
// Wild monsters are weaker, never take quota slots (they can't block your hires), and are cleared at the end of the
// wave. Monsters you place yourself are the fixed garrison: a one-time +15% HP and +15% power.
import {center} from './data.js';

const POOLS=[
 [1,['goblin','skeleton','slime','giant_rat','kobold','zombie_shambler']],
 [4,['orc','skeleton_archer','zombie_runner','spider','bat','imp']],
 [8,['gnoll','werewolf','skeleton_knight','orcShaman','zombie_brute','naga']],
];
export function installRoomSpawns(Game){
 const P=Game.prototype;
 const used=P.roomSlotsUsed;P.roomSlotsUsed=function(r,except=null){
  return used.call(this,r,except)-this.state.entities.filter(e=>e.wild&&e.roomId===r?.id&&e.id!==except&&e.status!=='dead')
   .reduce((n,e)=>n+this.unitSlots(e),0);
 };
 P.wildPool=function(){const w=this.state.wave;return POOLS.filter(([min])=>w>=min).flatMap(([,ids])=>ids)};
 P.spawnWildMonsters=function(){
  const s=this.state,pool=this.wildPool();let made=0;
  for(const r of s.rooms){
   if(['entrance','arrival'].includes(r.type)||r.owner==='hero')continue;
   const n=3+Math.floor(this.random()*3);
   for(let i=0;i<n;i++){
    const species=pool[Math.floor(this.random()*pool.length)],p=this.findFreeNear(center(r),r);if(!p)break;
    const e=this.spawn(species,'monster',p.x,p.y,species,[],{floorId:r.floorId,roomId:r.id});
    if(!e)continue;
    e.wild=true;e.name=(e.name||species)+' hoang';e.maxHp=Math.max(1,Math.round(e.maxHp*.7));e.hp=e.maxHp;
    e.powerScale=(e.powerScale||1)*.75;e.home={x:e.x,y:e.y,floorId:e.floorId};made++;
   }
  }
  if(made)this.log(`${made} quái hoang trỗi dậy trong các phòng.`);
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
