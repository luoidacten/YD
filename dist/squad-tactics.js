// v0.2.1 — adventurers move like a real party:
//  * Regroup: at the threshold of an unexplored room, a hero waits (max 6 s) for squadmates lagging > 4 tiles behind.
//  * Rest: after a room is cleared (no enemy seen for 4 s, room empty of monsters, not sealed) and the squad is hurt,
//    they hold position and rest up to 10 s: +4% max HP and +3% max mana per second, "Zzz". Any enemy wakes them.
// Both use the existing `guard` action with an explicit spot and hard time limits, so nobody can stand forever.
import {distance} from './data.js';

const WAIT=6,REST=10;
export function installSquadTactics(Game){
 const P=Game.prototype;
 P.squadOf=function(e){
  return e.squadId?this.state.entities.filter(a=>a!==e&&a.squadId===e.squadId&&a.status==='active'&&!a.ownerId&&a.floorId===e.floorId):[];
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);
  if(e.faction!=='hero'||e.ownerId||e.status!=='active')return;
  const s=this.state,{enemies,add}=context,here={x:e.x,y:e.y,floorId:e.floorId},room=this.roomAt(e.x,e.y,e.floorId);
  if(enemies?.length){e.lastEnemySeen=s.time;e.restUntil=0;return}
  if(e.carryingTreasure||s.treasure?.carrier===e.id)return;                       // the treasure runner never stops
  // --- regroup at the door of an unexplored room ---
  const dest=s.rooms.find(r=>r.id===e.destinationRoom&&r.floorId===e.floorId);
  const mates=this.squadOf(e);
  if(!room&&dest&&!e.visitedRooms?.includes(dest.id)&&distance(e,dest)<Math.max(dest.w,dest.h)/2+5&&e.waitedRoom!==dest.id){
   const lagging=mates.filter(a=>distance(a,e)>4&&distance(a,dest)>distance(e,dest));
   if(lagging.length){
    if(!e.waitStart||e.waitFor!==dest.id){e.waitStart=s.time;e.waitFor=dest.id}
    if(s.time-e.waitStart<WAIT)add('guard',1.45,here,`Đợi ${lagging.length} đồng đội để cùng vào phòng`);
    else e.waitedRoom=dest.id;
   }
  }
  // --- rest after clearing a room ---
  if(room&&!room.sealed&&s.time-(e.lastEnemySeen??-100)>4&&!this.roomMonsters(room).some(m=>m.status==='active')){
   const party=[e,...mates.filter(a=>distance(a,e)<8)],avg=party.reduce((n,a)=>n+a.hp/a.maxHp,0)/party.length;
   if(e.restedRoom!==room.id&&avg<.75){e.restedRoom=room.id;e.restUntil=s.time+REST;this.log(`${e.name} và đồng đội dừng lại nghỉ ngơi.`)}
   if(e.restUntil>s.time&&e.hp<e.maxHp*.95)add('guard',1.5,here,'Nghỉ ngơi hồi sức sau khi dọn sạch phòng');
  }
 };
 const tick=P.tick;P.tick=function(dt){
  const r=tick.call(this,dt),s=this.state;
  if(s.phase!=='battle')return r;
  this.restClock=(this.restClock||0)+dt;const pulse=this.restClock>=1;if(pulse)this.restClock-=1;
  for(const e of s.entities){
   if(e.faction!=='hero'||e.status!=='active'||!(e.restUntil>s.time))continue;
   if(e.lastEnemySeen>s.time-.5||(e.lastDamaged??-100)>s.time-1){e.restUntil=0;continue}
   if(e.action!=='guard')continue;
   if(!e.charms?.includes('forsaken'))e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.04*dt);
   if(e.maxMana)e.mana=Math.min(e.maxMana,e.mana+e.maxMana*.03*dt);
   if(pulse)this.effects.push({x:e.x+.3,y:e.y-1.4,floorId:e.floorId,text:'Zzz',color:'#cae6f5',life:.9});
   if(e.hp>=e.maxHp*.95)e.restUntil=0;
  }
  return r;
 };
}
