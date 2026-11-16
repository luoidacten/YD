// v0.3.1 — adventurers play like a human party.
//  1) Ready check: the first member to reach the door of an unexplored room sets a rally point. Everyone walks there,
//     shows "…" while they talk it over, and when the whole squad (3–5) is ready — or after 12 s — they enter TOGETHER.
//  2) Rest after a cleared room: by personality — greedy/aggressive heroes EAT (faster HP), the rest SLEEP (HP + mana).
//  3) Smarter fights: tanks engage first, skirmishers wait for the tank to hold the line, casters/archers/healers keep
//     distance, the badly wounded fall back behind the tank, and nobody stacks on top of an ally.
// Everything uses existing actions (guard/regroup/kite) with explicit spots and hard time limits. No gameplay RNG.
import {distance} from './data.js';
import {choosePosition} from './ai.js';

const RALLY=3,READY_MAX=12,REST=10,HOLD=3;
const roleOf=(g,e)=>e.role||'';
const isBack=(g,e)=>['support','ranged'].includes(roleOf(g,e))||g.usesMagicAttack?.(e)||g.range?.(e)>=4;
const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return (h>>>0)%100};

export function installSquadTactics(Game){
 const P=Game.prototype;
 P.squadOf=function(e){
  return e.squadId?this.state.entities.filter(a=>a!==e&&a.squadId===e.squadId&&a.status==='active'&&!a.ownerId&&a.floorId===e.floorId):[];
 };
 P.squadRecord=function(e){
  if(!e.squadId)return null;let q=this.state.squads.find(q=>q.id===e.squadId);
  if(!q){q={id:e.squadId,leaderId:e.id,mode:'explore',nextElection:0};this.state.squads.push(q)}return q;
 };
 // safety nets: never stand still for long in a "moving" action
 P.stallGuard=function(e,context){
  const s=this.state,tile=Math.round(e.x)+','+Math.round(e.y)+','+e.floorId;
  if(e.stallTile!==tile){e.stallTile=tile;e.stallSince=s.time;return}
  const still=s.time-(e.stallSince??s.time);
  if(e.faction==='monster'&&e.action==='guard-body'&&still>8)context.add('guard',1.0,e.home,'Canh xác quá lâu, quay về giữ phòng');
  if(e.faction==='monster'&&['patrol','investigate'].includes(e.action)&&still>8)
   context.add('guard',1.0,{x:e.x,y:e.y,floorId:e.floorId},'Lối đi bị chắn, giữ chỗ hiện tại');
  if(e.faction==='hero'&&e.action==='explore'&&still>12&&!context.enemies?.length&&s.treasure?.carrier!==e.id)
   context.add('retreat',1.3,null,'Bế tắc không tìm được đường tiếp, rút khỏi hầm ngục');
  if(e.faction==='hero'&&['explore','regroup'].includes(e.action)&&still>10&&!context.enemies?.length){
   if(e.destinationRoom&&!e.visitedRooms?.includes(e.destinationRoom))(e.visitedRooms??=[]).push(e.destinationRoom);
   const q=this.squadRecord?.(e);if(q?.rally)q.rally=null;e.stallSince=s.time;e.path=[];
  }
 };
 P.restStyle=function(e){
  return e.restStyle??=(e.charms?.includes('greedy')||(e.personality?.aggression??1)>1||hash(e.id)<25)?'eat':'sleep';
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);
  this.stallGuard(e,context);
  if(e.faction!=='hero'||e.ownerId||e.status!=='active')return;
  const s=this.state,{enemies,add}=context,here={x:e.x,y:e.y,floorId:e.floorId},room=this.roomAt(e.x,e.y,e.floorId);
  const mates=this.squadOf(e),squad=this.squadRecord(e),carrier=s.treasure?.carrier===e.id;
  if(enemies?.length){e.lastEnemySeen=s.time;e.restUntil=0;this.combatChoices(e,context,mates);return}
  if(carrier)return;                                                          // the treasure runner never stops
  // ---- 1) ready check before an unexplored room ----
  if(squad&&mates.length){
   const dest=s.rooms.find(r=>r.id===e.destinationRoom&&r.floorId===e.floorId);
   if(!squad.rally&&!room&&dest&&!e.visitedRooms?.includes(dest.id)&&distance(e,dest)<Math.max(dest.w,dest.h)/2+5&&squad.enteredRoom!==dest.id){
    // from wave 5 squads heading for the same room join one rally (bigger strike)
    const other=s.wave>=5&&s.squads.find(q=>q!==squad&&q.rally?.roomId===dest.id&&q.rally.floorId===e.floorId);
    squad.rally=other?{...other.rally}:{roomId:dest.id,x:e.x,y:e.y,floorId:e.floorId,since:s.time};
    if(other)this.log('Hai tổ đội hợp lực để cùng tấn công một phòng!','warning');
   }
   const rally=squad.rally;
   if(rally&&rally.floorId===e.floorId){
    const allies=s.wave>=5?s.entities.filter(a=>a!==e&&a.faction==='hero'&&!a.ownerId&&a.status==='active'&&a.floorId===e.floorId&&
     this.squadRecord(a)?.rally?.roomId===rally.roomId):mates;
    const team=[e,...allies],ready=team.filter(a=>distance(a,rally)<=RALLY);
    const far=team.some(a=>distance(a,rally)>6);                    // squad scattered: let the base AI close the gap first
    const danger=(squad.danger?.[rally.roomId]||0),avgHp=team.reduce((n,a)=>n+a.hp/a.maxHp,0)/team.length;
    if(danger>.6&&avgHp<.85&&s.time-rally.since<READY_MAX){                         // known kill-zone: heal up first
     if(!e.restUntil||e.restUntil<s.time){e.restUntil=s.time+6}
     add('guard',1.56,here,'Phòng này nguy hiểm — hồi sức đủ rồi mới vào');this.partyTalk?.(team,ready);return}
    if(ready.length===team.length||s.time-rally.since>READY_MAX){
     for(const a of team){const q=this.squadRecord(a);if(q){q.rally=null;q.enteredRoom=rally.roomId}}
     squad.rally=null;squad.enteredRoom=rally.roomId;
     this.blinkToGate?.(team,rally.roomId);
     team.forEach((a,i)=>this.say?.(a,i===0?'Vào!':['Rõ!','Đi thôi.','Xông lên!','Tôi theo.'][i%4],1.6));
     this.log(`Tổ đội ${team.map(a=>a.name.split(' ')[0]).join(', ')} bàn bạc xong, cùng tiến vào phòng.`);
     for(const a of team){a.decision=0;a.waitedRoom=rally.roomId}
    }else if(far&&distance(e,rally)<=RALLY){/* go meet the stragglers (base regroup) instead of standing */}
    else if(distance(e,rally)>RALLY)add('regroup',1.6,{x:rally.x,y:rally.y,floorId:rally.floorId},'Tập hợp ở cửa phòng với tổ đội');
    else{add('guard',1.55,here,`Bàn bạc: ${ready.length}/${team.length} người sẵn sàng`);
     this.partyTalk?.(team,ready);this.sharePotions?.(e,team.filter(a=>a!==e))}
   }
  }
  // ---- 2) rest after clearing a room ----
  if(room&&!room.sealed&&s.time-(e.lastEnemySeen??-100)>4&&!this.roomMonsters(room).some(m=>m.status==='active')){
   const party=[e,...mates.filter(a=>distance(a,e)<8)],avg=party.reduce((n,a)=>n+a.hp/a.maxHp,0)/party.length;
   if(e.restedRoom!==room.id&&avg<.75){e.restedRoom=room.id;e.restUntil=s.time+REST;
    this.log(this.restStyle(e)==='eat'?`${e.name} lấy lương khô ra ăn.`:`${e.name} ngả lưng chợp mắt.`)}
   if(e.restUntil>s.time&&e.hp<e.maxHp*.95)add('guard',1.5,here,this.restStyle(e)==='eat'?'Ăn lương khô hồi sức':'Ngủ một lát hồi sức');
  }
 };
 // ---- 3) combat roles ----
 P.combatChoices=function(e,context,mates){
  const s=this.state,{enemies,add}=context,here={x:e.x,y:e.y,floorId:e.floorId};
  const near=[...enemies].sort((a,b)=>distance(a,e)-distance(b,e))[0];if(!near)return;
  const tanks=mates.filter(a=>roleOf(this,a)==='tank'),tank=tanks.sort((a,b)=>distance(a,near)-distance(b,near))[0];
  const back=isBack(this,e),role=roleOf(this,e);
  // coordinated focus: ranged/support shoot what the tank is holding (suppression-style support)
  const held=tank&&typeof tank.target==='string'&&this.entity(tank.target);
  if(back&&held&&held.status==='active'&&enemies.includes(held)&&distance(e,held)<=this.range(e)+1)
   add('attack',1.2,held.id,`Dồn hỏa lực vào ${held.name} mà ${tank.name.split(' ')[0]} đang giữ chân`);
  // casters / archers / healers keep their distance
  if(back&&distance(e,near)<3.2){const p=choosePosition(this,e,near,'kite');if(p)add('kite',1.42,p,'Giữ khoảng cách, để hộ vệ chặn phía trước')}
  // wounded fall back behind the tank
  if(role!=='tank'&&tank&&e.hp/e.maxHp<.35&&distance(e,near)<4){
   const dx=tank.x-near.x,dy=tank.y-near.y,l=Math.hypot(dx,dy)||1,p={x:tank.x+dx/l*1.8,y:tank.y+dy/l*1.8,floorId:e.floorId};
   if(this.walkable(p.x,p.y,p.floorId,e))add('regroup',1.5,p,'Lùi sau lưng hộ vệ khi máu thấp');
  }
  // skirmishers wait (≤3 s) for the tank to engage first
  if(!back&&role!=='tank'&&tank&&distance(tank,near)>2.6&&distance(e,near)>2.6){
   if(!e.holdSince||s.time-e.holdSince>8)e.holdSince=s.time;
   if(s.time-e.holdSince<HOLD)add('guard',1.32,here,`Chờ ${tank.name.split(' ')[0]} lao lên giữ chân trước`);
  }
  // don't stack on an ally (area attacks): step aside
  const stacked=mates.find(a=>distance(a,e)<.7);
  if(stacked&&e.id>stacked.id){
   const dx=near.y-e.y,dy=e.x-near.x,l=Math.hypot(dx,dy)||1,p={x:e.x+dx/l*1.3,y:e.y+dy/l*1.3,floorId:e.floorId};
   if(this.walkable(p.x,p.y,p.floorId,e))add('regroup',1.12,p,'Tản ra, không đứng chồng lên đồng đội');
  }
 };
 // danger map (influence-map idea, per squad): damage taken inside a room raises that room's danger
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const hp=e.hp,r=damage.call(this,e,n,source,ctx),lost=Math.max(0,hp-e.hp);
  if(lost&&e.faction==='hero'&&!e.ownerId&&e.squadId){const room=this.roomAt(e.x,e.y,e.floorId),q=room&&this.squadRecord(e);
   if(q){q.danger??={};q.danger[room.id]=(q.danger[room.id]||0)+lost/Math.max(1,e.maxHp)}}
  return r;
 };
 const tick=P.tick;P.tick=function(dt){
  const r=tick.call(this,dt),s=this.state;
  if(s.phase!=='battle')return r;
  this.restClock=(this.restClock||0)+dt;const pulse=this.restClock>=1;if(pulse)this.restClock-=1;
  for(const e of s.entities){
   if(e.faction!=='hero'||e.status!=='active'||!(e.restUntil>s.time))continue;
   if(e.lastEnemySeen>s.time-.5||(e.lastDamaged??-100)>s.time-1){e.restUntil=0;continue}
   if(e.action!=='guard')continue;
   const eat=this.restStyle(e)==='eat';
   if(!e.charms?.includes('forsaken'))e.hp=Math.min(e.maxHp,e.hp+e.maxHp*(eat?.06:.04)*dt);
   if(e.maxMana&&!eat)e.mana=Math.min(e.maxMana,e.mana+e.maxMana*.04*dt);
   if(pulse)this.effects.push({x:e.x+.3,y:e.y-1.4,floorId:e.floorId,text:eat?'Nhai…':'Zzz',color:eat?'#ffcc68':'#cae6f5',life:.9});
   if(e.hp>=e.maxHp*.95)e.restUntil=0;
  }
  return r;
 };
}
