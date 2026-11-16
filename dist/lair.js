import {installBones} from './bones.js';
import {installFloorBosses} from './floor-bosses.js';
import {installBossCombat} from './boss-combat.js';
import {installAttackVisuals} from './attack-visuals.js';
import {installSpecies} from './species.js';
import {installClasses} from './classes.js';
import {installWeapons} from './weapons.js';
import {installBestiary} from './bestiary.js';
import {installV04} from './v04.js';
import './lair-data.js';
import {
 installRoomLife
}
from './room-life.js';
import {
 installArsenal
}
from './arsenal.js';
import {
 ROOMS,
 SPECIES,
 SETTINGS,
 center,
 bounds,
 contains,
 distance
}
from './data.js';
import {
 roomShape,
 roomDoors,
 tileKey
}
from './world.js';
import {
 installRescue
}
from './rescue.js';
import {
 installTactics
}
from './terrain-tactics.js';
export function installLair(Game){
 const P=Game.prototype;
 P.roomCapacity=function(r){
  if(!r)return 0;
  const shape=roomShape(r.type),
  base=shape.w>=31?10:shape.w>=23?7:4;
  return base+Math.floor(((r.level||1)-1)*(base===4?1:base===7?1.5:2))
 }
 ;
 P.unitSlots=function(e){
  return e.boss?4:['warden',
  'lord'].includes(e.species)?2:1
 }
 ;
 P.roomSlotsUsed=function(r,
 except=null){
  return this.state.entities.filter(e=>e.faction==='monster'&&e.roomId===r?.id&&e.id!==except&&e.status!=='dead').reduce((n,
  e)=>n+this.unitSlots(e),
  0)
 }
 ;
 P.roomHasSpace=function(r,
 e){
  return this.roomSlotsUsed(r,
  e?.id)+this.unitSlots(e)<=this.roomCapacity(r)
 }
 ;
 P.setupLairUnit=function(e){
  if(!Number.isFinite(e.intelligence)){
   const base={
    slime:12,
    goblin:40,
    skeleton:35,
    shaman:65,
    warden:55,
    lord:75,
    knight:55,
    mage:65,
    priest:65,
    rogue:60
   }
   [e.species]||40;
   e.intelligence=Math.min(100,
   Math.round(base+this.random()*25+(e.elite?10:0)))
  }
  e.bodyMemories??={
  }
  ;
  if(!e.lairKit){
   e.lairKit=true;
   const seed=Number(e.id.replace(/\D/g,
   ''))||1;
   e.skillIds.splice(1,
   0,
   e.role==='support'?'SK56':SPECIES[e.species].range>=4?'SK55':e.species==='goblin'&&seed%3===0?'SK51':seed%2?'SK52':'SK53');
   e.passiveIds.push('PS'+(51+seed%8));
   if(e.role==='support'&&seed%2===0)e.skillIds.splice(2,
   0,
   'SK54');
   if(e.species==='shaman')e.skillIds.splice(2,
   0,
   'SK58');
   if(e.species==='rogue')e.skillIds.splice(2,
   0,
   'SK57');
   if(seed%4===0)e.charms.push('CH'+(31+seed%7));
   if(e.charms.includes('CH31'))e.capacity+=2;
   if(e.faction==='hero'&&e.role==='support')this.createItem('IT21',
   e);
   if(e.faction==='hero'&&seed%5===0)this.createItem('IT22',
   e)
  }
 }
 ;
 P.setupLair=function(){
  const s=this.state;
  const fresh=s.designedStart&&!s.lairVersion;
  s.lairVersion=1;
  s.manualStart??=true;
  s.keyQuest??={
   required:true,
   locked:s.phase!=='battle',
   placed:false,
   owner:null,
   x:null,
   y:null,
   floorId:0
  }
  ;
  if(fresh){
   s.deck.hand=['entrance',
   'treasure',
   'boss',
   'arrival',
   'guard',
   'guard',
   'guard',
   'guard',
   'mana',
   'grave',
   'goblin',
   'skeleton',
   'shaman',
   'spikes',
   'explosive',
   'poison'].map(id=>this.makeCard(id));
   s.deck.discard=[];
   s.deck.pendingPack=null;
  }
  for(const e of s.entities)this.setupLairUnit(e);
  this.rebuild();
  this.updateCommanders(true)
 }
 ;
 const spawn=P.spawn;
 P.spawn=function(...args){
  const e=spawn.apply(this,
  args);
  this.setupLairUnit(e);
  return e
 }
 ;
 const hire=P.hire;
 P.hire=function(roomId,
 species=null){
  const r=this.state.rooms.find(r=>r.id===roomId);
  if(!r||!this.roomHasSpace(r,
  {
   species:species||'goblin',
   boss:['warden',
   'lord'].includes(species)
  }
  ))return null;
  if(['warden',
  'lord'].includes(species)){
   const cost=species==='warden'?300:400;
   if(!this.canPrepare()||this.state.gold<cost||r.type!==(species==='warden'?'boss':'treasure'))return null;
   const p=this.findFreeNear(center(r),
   r);
   if(!p)return null;
   this.state.gold-=cost;
   return this.spawn(species,
   'monster',
   p.x,
   p.y,
   species==='warden'?'Hộ Môn':'Chúa Tể',
   [],
   {
    floorId:r.floorId,
    roomId:r.id,
    boss:species==='warden'?'warden':'inferno'
   }
   )
  }
  return hire.call(this,
  roomId,
  species)
 }
 ;
 const summon=P.summon;
 P.summon=function(species,
 x,
 y,
 floorId=0){
  const room=this.roomAt(x,
  y,
  floorId);
  if(!room||!this.roomHasSpace(room,
  {
   species
  }
  ))return{
   ok:false,
   message:`Phòng đã đủ sức chứa (${
room?this.roomSlotsUsed(room):0
}/${
this.roomCapacity(room)
} ô quân).`
  }
  ;
  return summon.call(this,
  species,
  x,
  y,
  floorId)
 }
 ;
 const relocate=P.relocate;
 P.relocate=function(id,
 x,
 y,
 floorId){
  const e=this.entity(id),
  r=this.roomAt(x,
  y,
  floorId);
  if(!e||!r||!this.roomHasSpace(r,
  e))return false;
  const ok=relocate.call(this,
  id,
  x,
  y,
  floorId);
  if(ok&&this.state.keyQuest.owner===id){
   const k=this.state.keyQuest;
   if(!this.canPlaceKey(e)){
    k.owner=null;
    k.placed=false;
    k.x=k.y=null;
    this.log('Vị trí mới không hợp lệ cho chìa khóa: hãy đặt lại chìa.',
    'warning')
   }
  }
  return ok
 }
 ;
 P.build=function(col,
 row,
 type,
 floorId=0){
  const s=this.state;
  if(!this._usingCard||!this.canPrepare())return{
   ok:false,
   message:'Dùng bản thiết kế trong giai đoạn chuẩn bị, không tạm dừng.'
  }
  ;
  if(!ROOMS[type]||col<0||col>=4||row<0||row>=3||this.rooms(floorId).some(r=>r.col===col&&r.row===row))return{
   ok:false,
   message:'Chọn một ô phòng trống.'
  }
  ;
  if(['entrance',
  'treasure',
  'boss',
  'arrival'].includes(type)&&s.rooms.some(r=>r.type===type))return{
   ok:false,
   message:'Công trình nền móng này chỉ có một phòng.'
  }
  ;
  if(type==='entrance'&&floorId!==0||type==='boss'&&floorId!==0||type==='arrival'&&floorId!==1)return{
   ok:false,
   message:'Cổng vào/cầu thang xuống ở tầng 1; bậc thang đến ở tầng 2.'
  }
  ;
  const rooms=this.rooms(floorId);
  if(rooms.length&&!rooms.some(r=>Math.abs(r.col-col)+Math.abs(r.row-row)===1))return{
   ok:false,
   message:'Phòng mới phải kề một phòng cùng tầng.'
  }
  ;
  if(rooms.length>=SETTINGS.roomLimit||s.mana<5)return{
   ok:false,
   message:'Đã đầy tầng hoặc thiếu 5 mana.'
  }
  ;
  s.mana-=5;
  const r=this.addRoom(col,
  row,
  type,
  floorId);
  if(type==='treasure')s.treasure={
   carrier:null,
   ...center(r)
  }
  ;
  this.rebuild();
  this.log(`Đã xây ${
ROOMS[type].name
}; bố cục ${
r.layoutTemplate
}.`);
  this.event('build');
  return{
   ok:true,
   room:r
  }
 }
 ;
 P.removeRoom=function(id){
  const s=this.state,
  r=s.rooms.find(r=>r.id===id);
  if(!this.canPrepare()||!r||s.entities.some(e=>e.roomId===id&&e.faction==='monster'))return false;
  s.rooms=s.rooms.filter(a=>a!==r);
  s.props=s.props.filter(p=>p.roomId!==id);
  s.traps=s.traps.filter(t=>t.roomId!==id);
  s.deck.hand.push(this.makeCard(r.type));
  s.mana=Math.min(this.manaCapacity(),
  s.mana+5);
  if(r.type==='treasure')s.treasure={
   carrier:null,
   x:0,
   y:0,
   floorId:0
  }
  ;
  if(s.keyQuest.placed&&(this.entity(s.keyQuest.owner)?.roomId===r.id||!s.keyQuest.owner&&contains(r,
  s.keyQuest,
  0))){
   s.keyQuest.placed=false;
   s.keyQuest.owner=null;
   s.keyQuest.x=s.keyQuest.y=null
  }
  this.rebuild();
  return true
 }
 ;
 const rebuild=P.rebuild;
 P.rebuild=function(){
  rebuild.call(this);
  this.keyGates=new Map();
  if(this.state.keyQuest?.locked){
   const r=this.state.rooms.find(r=>r.type==='treasure');
   if(r)for(const d of roomDoors(r,
   this.state.rooms))for(let n=-1;
   n<=1;
   n++)this.keyGates.set(`${
r.floorId
}:${
tileKey(d.x+(d.axis==='y'?n:0),
d.y+(d.axis==='x'?n:0))
}`,
   r.id)
  }
 }
 ;
 const walkable=P.walkable;
 P.walkable=function(x,
 y,
 floor=0,
 actor=null,
 ignoreGates=false){
  return walkable.call(this,
  x,
  y,
  floor,
  actor,
  ignoreGates)&&(ignoreGates||!this.keyGates?.has(`${
floor
}:${
tileKey(x,
y)
}`))
 }
 ;
 const blocks=P.blocksSight;
 P.blocksSight=function(x,
 y,
 floor=0){
  return blocks.call(this,
  x,
  y,
  floor)||!!this.keyGates?.has(`${
floor
}:${
tileKey(x,
y)
}`)
 }
 ;
 P.connected=function(){
  const s=this.state,
  entry=s.rooms.find(r=>r.type==='entrance'),
  core=s.rooms.find(r=>r.type==='treasure');
  if(!entry||!core||entry.floorId!==0)return false;
  const stair=s.rooms.find(r=>r.type==='boss'),
  arrival=s.rooms.find(r=>r.type==='arrival');
  if(core.floorId===1&&(!stair||!arrival))return false;
  const origins=[entry,
  arrival];
  for(const r of s.rooms){
   const origin=origins[r.floorId];
   if(!origin||r!==origin&&!this.path(center(origin),
   center(r),
   {
    ignoreGates:true
   }
   ).length)return false
  }
  return !arrival||!!stair&&!!this.path(center(entry),
  center(stair),
  {
   ignoreGates:true
  }
  ).length
 }
 ;
 P.canPlaceKey=function(p){
  const s=this.state,
  core=s.rooms.find(r=>r.type==='treasure'),
  entry=s.rooms.find(r=>r.type==='entrance');
  if(!entry||!core||p.floorId===core.floorId&&contains(core,
  p,
  0)||!this.walkable(p.x,
  p.y,
  p.floorId,
  null,
  false))return false;
  const origin=p.floorId===0?entry:s.rooms.find(r=>r.type==='arrival'),
  stair=s.rooms.find(r=>r.type==='boss');
  if(!origin||p.floorId===1&&(!stair||!this.path(center(entry),
  center(stair)).length))return false;
  return distance(origin,
  p)<1||this.path(center(origin),
  p).length>0
 }
 ;
 P.placeKey=function(x,
 y,
 floorId,
 ownerId=null){
  if(!this.canPrepare())return{
   ok:false,
   message:'Đặt chìa trước trận, khi không pause.'
  }
  ;
  const owner=this.entity(ownerId),
  p=owner||{
   x:Math.round(x),
   y:Math.round(y),
   floorId
  }
  ;
  if(owner&&(owner.faction!=='monster'||owner.status!=='active'))return{
   ok:false,
   message:'Quái giữ chìa phải đang sống và có túi trống.'
  }
  ;
  if(!this.canPlaceKey(p))return{
   ok:false,
   message:'Chìa phải ở nền đi tới được từ cổng vào, ngoài phòng rương và ngoài cổng khóa.'
  }
  ;
  Object.assign(this.state.keyQuest,
  {
   placed:true,
   locked:true,
   owner:owner?.id||null,
   x:owner?null:p.x,
   y:owner?null:p.y,
   floorId:p.floorId
  }
  );
  this.log(owner?`${
owner.name
} nhận giữ chìa phòng rương.`:'Đã đặt chìa khóa phòng rương.');
  this.rebuild();
  return{
   ok:true
  }
 }
 ;
 P.layoutIssues=function(){
  const s=this.state,
  issues=[];
  if(!s.rooms.some(r=>r.type==='entrance'))issues.push('Đặt Cổng hầm ngục ở tầng 1.');
  if(!s.rooms.some(r=>r.type==='treasure'))issues.push('Đặt Phòng rương trung tâm.');
  if(s.rooms.length&&!this.connected())issues.push('Nối mọi phòng với cổng vào; tầng 2 cần cả hai phòng cầu thang.');
  if(s.rooms.some(r=>this.roomSlotsUsed(r)>this.roomCapacity(r)))issues.push('Phân bố lại quái: có phòng vượt sức chứa.');
  const k=s.keyQuest;
  if(k?.required){
   const p=k.owner?this.entity(k.owner):k;
   if(!k.placed||!p||!this.canPlaceKey(p))issues.push('Đặt chìa khóa ở vị trí có thể lấy được, ngoài phòng rương.')
  }
  return issues
 }
 ;
 const start=P.start;
 P.start=function(){
  const issues=this.layoutIssues();
  if(issues.length)return{
   ok:false,
   message:issues.join(' ')
  }
  ;
  for(const e of this.state.entities){
   e.bodyMemories={
   }
   ;
   if(e.faction==='monster')e.knownTraps=this.state.traps.filter(t=>t.floorId===e.floorId&&!t.disabled).map(t=>t.id)
  }
  this.updateCommanders(true);
  return start.call(this)
 }
 ;
 const used=P.usedSlots;
 P.usedSlots=function(e){
  return used.call(this,
  e)+(this.state.keyQuest?.owner===e.id&&e.capacity>0?1:0)
 }
 ;
 const drop=P.drop;
 P.drop=function(e){
  drop.call(this,
  e);
  const k=this.state.keyQuest;
  if(k?.owner===e.id){
   const p=this.findFreeNear({
    x:e.x,
    y:e.y,
    floorId:e.floorId
   }
   )||e;
   Object.assign(k,
   {
    owner:null,
    x:Math.round(p.x),
    y:Math.round(p.y),
    floorId:e.floorId
   }
   );
   this.log('Chìa khóa phòng rương đã rơi xuống sàn.',
   'warning')
  }
 }
 ;
 const escape=P.escape;
 P.escape=function(e,
 ...args){
  const ok=escape.call(this,
  e,
  ...args),
  k=this.state.keyQuest;
  if(ok&&k?.owner===e.id){
   const entry=this.state.rooms.find(r=>r.type==='entrance');
   Object.assign(k,
   {
    owner:null,
    x:entry.x,
    y:entry.y,
    floorId:entry.floorId
   }
   );
   this.log('Người rút lui để lại chìa khóa ở cổng hầm ngục.',
   'warning')
  }
  return ok
 }
 ;
 const next=P.next;
 P.next=function(){
  const was=this.state.phase,
  result=next.call(this);
  if(was==='result'&&this.state.phase==='prepare'){
   const k=this.state.keyQuest;
   Object.assign(k,
   {
    required:true,
    locked:true,
    placed:false,
    owner:null,
    x:null,
    y:null
   }
   );
   for(const e of this.state.entities){
    e.bodyMemories={
    }
    ;
    e.knownKey=null;
    e.needsKey=false
   }
   this.rebuild()
  }
  return result
 }
 ;
 installRescue(Game);
 installTactics(Game);
 installRoomLife(Game);
 installArsenal(Game);
 installV04(Game);
 installBestiary(Game);
 installWeapons(Game);
 installClasses(Game);
 installSpecies(Game);
 installAttackVisuals(Game);
 installBossCombat(Game);
 installFloorBosses(Game);
 installBones(Game);
 installCompanions(Game);
 installPresentation(Game);
 installBiomes(Game);
 installRpg(Game);
 installManagement(Game);
 installTrapsPlus(Game);
 installZombies(Game);
 installKingdom(Game);
 installSquadTactics(Game);
 installDifficulty(Game);
 installWalls(Game);
 installRoomSpawns(Game);
 installParty(Game);
}
import {installCompanions} from './companions.js';
import {installPresentation} from './presentation.js';
import {installRpg} from './rpg.js';
import {installBiomes} from './biomes.js';
import {installManagement} from './management.js';
import {installTrapsPlus} from './traps-plus.js';
import {installZombies} from './zombies.js';
import {installKingdom} from './kingdom.js';
import {installSquadTactics} from './squad-tactics.js';
import {installDifficulty} from './difficulty.js';
import {installWalls} from './walls.js';
import {installRoomSpawns} from './room-spawns.js';
import {installParty} from './party.js';
