// v0.3.3 — adventurer parties: first party of 3 (tank/mage/healer), squads of 3–5 with a leader, visible talk bubbles,
// synchronized "blink to the gate" entry once everyone agrees, squads teaming up from wave 5, agility dodges for
// ranged heroes, and sharing healing potions. Speech is presentation only (not saved, no RNG); dodges use Game.random().
import {SPECIES,distance} from './data.js';
import {ITEMS} from './expansion.js';
import {roomDoors} from './world.js';

export const LINES={
 leader:['Mọi người sẵn sàng chưa?','Giữ đội hình, đừng tách nhau.','Nghe kỹ: vào là đánh dứt điểm.'],
 tank:['Tôi đi trước, theo sát sau lưng.','Khiên đã sẵn sàng.','Để tôi giữ chân bọn chúng.'],
 ranged:['Tôi yểm trợ từ phía sau.','Đã lên dây cung.','Đừng che đường bắn của tôi.'],
 support:['Máu tôi lo, đừng chạy xa.','Ai bị thương thì lùi về chỗ tôi.','Thánh quang phù hộ chúng ta.'],
 scout:['Tôi thấy dấu bẫy, cẩn thận.','Để tôi nhìn trước một chút.','Có tiếng động bên trong.'],
 skirmisher:['Chờ hộ vệ lên trước rồi tôi xông vào.','Tôi lo lũ đứng sau.','Đánh nhanh rút nhanh.'],
 ready:['Sẵn sàng!','Rõ!','Đi thôi.','Tôi theo.'],go:['Vào!','Xông lên!','Cùng vào nào!'],
};
const pick=(list,n)=>list[Math.abs(n)%list.length];
const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return h>>>0};

export function installParty(Game){
 const P=Game.prototype;
 // ---- speech (presentation only) ----
 P.say=function(e,text,dur=2.6){
  this.speech??=new Map();this.speech.set(e.id,{text,until:this.state.time+dur,floorId:e.floorId});
 };
 P.talkLine=function(e,leader){
  const role=e===leader?'leader':(e.role in LINES?e.role:'skirmisher');
  return pick(LINES[role],hash(e.id)+Math.floor(this.state.time/3));
 };
 P.partyTalk=function(team,ready){
  const leader=team.find(a=>this.squadRecord?.(a)?.leaderId===a.id)||team[0],slot=Math.floor(this.state.time/1.4)%team.length,e=team[slot];
  if(!e||this.speech?.get(e.id)?.until>this.state.time)return;
  this.say(e,ready.includes(e)&&e!==leader&&slot%2?pick(LINES.ready,hash(e.id)):this.talkLine(e,leader));
 };
 // ---- adventurers carry their starting kit without already having a 'full bag' (which made them leave at once) ----
 const spawn=P.spawn;P.spawn=function(...args){
  const e=spawn.apply(this,args);
  if(e.faction==='hero'&&!e.ownerId&&!e.bagRoom){e.bagRoom=true;e.capacity=(e.capacity||6)+3}
  return e;
 };
 // ---- first party: 3 heroes with proper roles ----
 const start=P.start;P.start=function(){
  const r=start.call(this);if(!r?.ok)return r;
  const s=this.state,enc=s.encounter;
  if(s.wave===1&&s.rules?.smallFirstParty!==false){
   // replace only the base main party; keep units added by Fates/events (e.g. F08 elite hunters)
   const BASE=/^(Arthur|Ren|Elara|Seren|Borin|Lyra|Cyrus|Mira)( II)?$|\(thêm\)$/;
   const extra=enc.spawnQueue.filter(u=>!String(u.squadId||'').startsWith('scouts')&&(u.reinforcement||!BASE.test(u.name||'')));
   enc.scouting=false;
   enc.spawnQueue=[['knight','Arthur'],['mage','Elara'],['priest','Seren']].map(([species,name])=>
    ({species,name,squadId:'main-0',elite:false,reinforcement:false})).concat(extra);
   enc.mainCount=enc.spawnQueue.filter(u=>!u.reinforcement).length;for(const rf of enc.reinforcements)rf.state='resolved';
   this.log('Đoàn đầu tiên: ba mạo hiểm giả — Hiệp sĩ, Pháp sư, Tu sĩ.');
  }
  return r;
 };
 // ---- synchronized entry: blink the whole team to the gate, then they go in together ----
 P.blinkToGate=function(team,roomId){
  const room=this.state.rooms.find(r=>r.id===roomId);if(!room||!team.length)return false;
  const from=team[0],doors=room.doors||roomDoors(room,this.state.rooms)||[];
  const door=doors.map(d=>({...d,floorId:room.floorId})).sort((a,b)=>distance(a,from)-distance(b,from))[0];if(!door)return false;
  const dx=Math.sign(from.x-door.x),dy=Math.sign(from.y-door.y),out={x:Math.abs(from.x-door.x)>Math.abs(from.y-door.y)?dx:0,y:0};
  if(!out.x)out.y=dy||1;
  const side={x:out.y,y:out.x},spots=[];
  for(const back of [1,2,3])for(const lat of [0,-1,1])spots.push({x:door.x+out.x*back+side.x*lat,y:door.y+out.y*back+side.y*lat,floorId:room.floorId});
  const free=spots.filter(p=>this.walkable(p.x,p.y,p.floorId)&&!this.roomAt(p.x,p.y,p.floorId)&&!this.gates?.has(`${p.floorId}:${p.x},${p.y}`));
  if(free.length<Math.min(team.length,3))return false;
  team.forEach((e,i)=>{const p=free[i%free.length];e.x=p.x;e.y=p.y;e.path=[];e.decision=0;
   this.effects.push({x:p.x,y:p.y,floorId:p.floorId,text:'✦',color:'#72d6ce',life:.5})});
  return true;
 };
 // ---- ranged heroes dodge incoming shots by agility ----
 P.agility=function(e){
  const d=SPECIES[e.species]||{},back=['ranged','support','scout'].includes(e.role)||this.usesMagicAttack?.(e);
  return back?Math.max(.1,Math.min(.6,((d.speed||2)-1.6)/2.2+.15)):.05;
 };
 const proj=P.updateProjectiles;P.updateProjectiles=function(dt){
  for(const p of this.state.projectiles||[]){
   if(p.dodgeRolled||p.faction!=='monster')continue;const t=this.entity(p.targetId);
   if(!t||t.status!=='active'||t.faction!=='hero'||Math.hypot(t.x-p.x,t.y-p.y)>1.8)continue;
   p.dodgeRolled=true;
   if(this.random()<this.agility(t)){const l=Math.hypot(p.vx,p.vy)||1,nx=-p.vy/l,ny=p.vx/l;
    for(const sgn of [1,-1]){const x=t.x+nx*.8*sgn,y=t.y+ny*.8*sgn;if(this.walkable(x,y,t.floorId,t)){t.x=x;t.y=y;t.path=[];break}}
    this.effects.push({x:t.x,y:t.y-1,floorId:t.floorId,text:'Né!',color:'#72d6ce',life:.6})}
  }
  return proj.call(this,dt);
 };
 // ---- share healing potions with a wounded squadmate ----
 P.sharePotions=function(e,mates){
  if((e.lastShare||-99)>this.state.time-10)return false;
  const heal=id=>ITEMS[this.state.items.find(i=>i.id===id)?.definitionId]?.kind==='heal';
  const mine=e.inventory?.filter(heal)||[];if(!mine.length)return false;
  const needy=mates.filter(a=>distance(a,e)<3&&a.hp/a.maxHp<.6&&!(a.inventory||[]).some(heal)).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  if(!needy||e.hp/e.maxHp<needy.hp/needy.maxHp)return false;
  const item=this.state.items.find(i=>i.id===mine[0]);
  if(item&&this.transfer(item,needy)){e.lastShare=this.state.time;this.say(e,`${needy.name.split(' ')[0]}, cầm lấy bình máu!`);
   this.log(`${e.name} đưa bình máu cho ${needy.name}.`);return true}
  return false;
 };
 P.squadInfo=function(e){
  const q=this.state.squads.find(q=>q.id===e.squadId);if(!q)return null;
  const members=this.state.entities.filter(a=>a.squadId===e.squadId&&!a.ownerId&&a.faction==='hero');
  const mode=q.rally?'Bàn bạc ở cửa phòng':members.some(a=>a.restUntil>this.state.time)?'Nghỉ ngơi':q.mode==='engage'?'Giao chiến':q.mode==='withdraw'?'Rút lui':'Khám phá';
  return {id:q.id,leaderId:q.leaderId,mode,members};
 };
}
