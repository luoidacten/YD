// v0.11 — 20 new traps (turrets, mines, mechanical, arcane). They live in state.traps (so AI detection, disarm,
// path cost and save keep working) with `plus:true`; the base trap loop is neutralised for them each tick and this
// module resolves them. Turrets fire real projectiles (rpg.js). No gameplay randomness is used here.
import {CARDS,distance} from './data.js';

const T=(name,kind,cost,stats)=>({name,kind,cost,...stats});
export const TRAP_PLUS={
 T01:T('Ụ Nỏ','turret',60,{range:7,cd:1.6,damage:12,shot:'arrow',element:'physical',text:'Bắn nỏ vào hero gần nhất trong tầm 7.'}),
 T02:T('Ụ Súng','turret',85,{range:8,cd:3,damage:22,shot:'bullet',element:'physical',noise:true,text:'Đạn mạnh, tiếng nổ báo động cả tầng.'}),
 T03:T('Ụ Phun Lửa','turret',80,{range:3.5,cd:2.5,damage:14,blast:1.6,element:'fire',effect:'burn',duration:3,text:'Phun lửa tầm gần, gây bỏng.'}),
 T04:T('Ụ Băng','turret',70,{range:7,cd:2,damage:9,shot:'frost',element:'ice',effect:'slow',value:.35,duration:2,text:'Đạn băng làm chậm.'}),
 T05:T('Tháp Sét','turret',95,{range:5,cd:3,damage:16,chain:3,element:'lightning',text:'Sét lan tối đa 3 hero.'}),
 T06:T('Ụ Pháo','turret',110,{range:9,cd:5,damage:30,mortar:2,windup:.8,element:'physical',text:'Pháo cối nổ vùng bán kính 2, có báo trước.'}),
 T07:T('Ụ Phun Độc','turret',65,{range:6,cd:2,damage:7,shot:'magic',element:'poison',effect:'poison',duration:4,text:'Đạn độc kéo dài.'}),
 T08:T('Ụ Hắc Ấn','turret',75,{range:6,cd:3,damage:8,shot:'curse',element:'shadow',effect:'curse',value:.25,duration:5,text:'Nguyền hero, giảm 25% sát thương.'}),
 T09:T('Mìn Nổ','mine',40,{radius:2.2,damage:40,element:'physical',text:'Nổ một lần khi hero dẫm lên.'}),
 T10:T('Ụ Nổ','mine',55,{radius:3,damage:35,element:'fire',effect:'burn',duration:3,text:'Kho thuốc nổ, nổ lan và gây bỏng.'}),
 T11:T('Mìn Băng','mine',40,{radius:2,damage:12,element:'ice',effect:'rooted',duration:2,text:'Trói chân cả nhóm 2 giây.'}),
 T12:T('Mìn Khói Độc','mine',45,{radius:2.5,damage:6,element:'poison',effect:'blind',value:.4,duration:4,cloud:true,text:'Làm mù và để lại mây độc.'}),
 T13:T('Lưỡi Cưa','zone',60,{radius:1.2,cd:.5,damage:6,element:'physical',effect:'bleed',duration:3,text:'Cưa liên tục khi hero đứng trên.'}),
 T14:T('Búa Lắc','zone',70,{radius:1.4,cd:3,damage:20,knock:2,element:'physical',text:'Đập văng hero 2 ô.'}),
 T15:T('Lưới Bắt','zone',45,{radius:1.2,cd:8,damage:0,effect:'rooted',duration:3,text:'Trói 3 giây.'}),
 T16:T('Hố Chông','zone',50,{radius:1.1,cd:6,damage:25,element:'physical',effect:'bleed',duration:4,text:'Sát thương lớn và chảy máu.'}),
 T17:T('Nam Châm','zone',65,{radius:3.5,cd:7,damage:0,pull:true,effect:'disarm',duration:2,text:'Hút hero vào giữa và tước vũ khí 2 giây.'}),
 T18:T('Vòng Rút Mana','zone',60,{radius:2.5,cd:6,damage:0,drain:30,text:'Rút 30 mana của hero trong vòng.'}),
 T19:T('Bia Nguyền','aura',70,{radius:3,cd:1,damage:0,effect:'curse',value:.15,duration:1.5,slow:.15,text:'Hero quanh bia bị nguyền và chậm.'}),
 T20:T('Cột Hồi Sinh','totem',90,{radius:4,cd:20,text:'Hồi sinh một quái gục gần đó, mỗi đợt một lần.'}),
};
for(const[id,d]of Object.entries(TRAP_PLUS))if(!CARDS.some(c=>c.id===id))CARDS.push({id,kind:'trap',name:d.name,category:'BẪY',
 cost:d.cost,resource:'gold',art:'yd/traps/trap_'+id,description:d.text,tone:'red'});

export function installTrapsPlus(Game){
 const P=Game.prototype;
 const place=P.place;P.place=function(kind,x,y,floorId){
  const d=TRAP_PLUS[kind];if(!d)return place.call(this,kind,x,y,floorId);
  if(!this.canPrepare()||!this.walkable(x,y,floorId))return {ok:false,message:'Chỉ đặt trên nền trống trong giai đoạn chuẩn bị.'};
  x=Math.round(x);y=Math.round(y);
  const room=this.roomAt(x,y,floorId),corridor=this.corridorAt(x,y,floorId);
  if(!room&&!corridor)return {ok:false,message:'Hãy chọn phòng hoặc hành lang.'};
  if(this.state.traps.some(t=>t.floorId===floorId&&distance(t,{x,y})<1))return {ok:false,message:'Đã có bẫy ở đây.'};
  if(this.state.gold<d.cost)return {ok:false,message:`Cần ${d.cost} vàng.`};
  this.state.gold-=d.cost;
  const t={id:this.id('trap'),type:kind,plus:true,x,y,floorId,roomId:room?.id,corridorId:corridor?.id,disabled:false,
   revealed:['turret','totem','aura'].includes(d.kind),cooldown:0,windup:0,plusCd:0,spent:false,usedWave:0};
  this.state.traps.push(t);this.navRevision=(this.navRevision||0)+1;
  return {ok:true,trap:t};
 };
 const tick=P.tick;P.tick=function(dt){
  const plus=this.state.traps.filter(t=>t.plus),saved=plus.map(t=>[t.cooldown,t.windup]);
  for(const t of plus){t.cooldown=1e9;t.windup=0}            // the base trap loop must ignore plus traps
  const r=tick.call(this,dt);
  plus.forEach((t,i)=>{[t.cooldown,t.windup]=saved[i]});
  if(this.state.phase==='battle')this.updatePlusTraps(dt);
  return r;
 };
 P.trapTargets=function(t,r,needSight=true){
  return this.state.entities.filter(e=>e.status==='active'&&e.faction==='hero'&&e.floorId===t.floorId&&
   distance(e,t)<=r&&(!needSight||this.lineOfSight(t,e))&&!e.concealed).sort((a,b)=>distance(a,t)-distance(b,t)||a.id.localeCompare(b.id));
 };
 P.trapHit=function(e,d,t,n=d.damage){
  if(n>0)this.damage(e,n,null,{trap:true,element:d.element,trapId:t.id});
  if(d.effect&&e.status==='active')this.applyStatus(e,d.effect,d.duration||2,d.value||1,null);
  if(d.slow&&e.status==='active')this.applyStatus(e,'slow',d.duration||1.5,d.slow,null);
 };
 P.updatePlusTraps=function(dt){
  const s=this.state;
  for(const t of s.traps){
   if(!t.plus||t.disabled||t.spent)continue;const d=TRAP_PLUS[t.type];if(!d)continue;
   t.plusCd=Math.max(0,(t.plusCd||0)-dt);
   if(t.pending){t.pending.left-=dt;if(t.pending.left<=0){const p=t.pending;t.pending=null;
     for(const e of s.entities)if(e.status==='active'&&e.faction==='hero'&&e.floorId===t.floorId&&distance(e,p)<=d.mortar)this.trapHit(e,d,t);
     this.effects.push({x:p.x,y:p.y,floorId:t.floorId,radius:d.mortar,blast:true,life:.5,color:'#ee8e2e'});this.event('trap',{floorId:t.floorId})}
    continue}
   if(t.plusCd>0)continue;
   if(d.kind==='turret'){
    const target=this.trapTargets(t,d.range)[0];if(!target)continue;t.plusCd=d.cd;
    if(d.shot){const dx=target.x-t.x,dy=target.y-t.y,l=Math.hypot(dx,dy)||1,v=d.shot==='bullet'?26:d.shot==='arrow'?16:11;
     s.projectiles??=[];s.projectiles.push({id:this.id('shot'),kind:d.shot,sourceId:null,faction:'monster',targetId:target.id,
      floorId:t.floorId,x:t.x+dx/l*.6,y:t.y+dy/l*.6,vx:dx/l*v,vy:dy/l*v,radius:.45,left:l/v+.35,n:d.damage,
      ctx:{trap:true,fromProjectile:true,element:d.element,trapId:t.id,trapEffect:t.type}});
     if(d.noise){s.noises.push({x:t.x,y:t.y,floorId:t.floorId,time:s.time});s.noises=s.noises.slice(-30)}}
    else if(d.chain){let from=t;const hit=new Set();
     for(let i=0;i<d.chain;i++){const e=this.trapTargets(from,i?3:d.range,!i).find(e=>!hit.has(e.id));if(!e)break;hit.add(e.id);
      this.effects.push({x:from.x,y:from.y,tx:e.x,ty:e.y,floorId:t.floorId,beam:true,color:'#facb3e',life:.25});
      this.trapHit(e,d,t,d.damage*(i?.7:1));from=e}}
    else if(d.mortar){t.pending={x:target.x,y:target.y,left:d.windup};
     s.telegraphs.push({id:this.id('trapcast'),source:null,floorId:t.floorId,type:'circle',x:target.x,y:target.y,radius:d.mortar,
      createdAt:s.time,resolveAt:s.time+d.windup,damage:0,visualOnly:true})}
    else if(d.blast){for(const e of this.trapTargets(t,d.range))if(distance(e,target)<=d.blast)this.trapHit(e,d,t);
     this.effects.push({x:target.x,y:target.y,floorId:t.floorId,radius:d.blast,blast:true,life:.4,color:'#ee8e2e'})}
    this.event('trap',{floorId:t.floorId});
   }
   else if(d.kind==='mine'){
    if(!this.trapTargets(t,1.1,false).length)continue;
    for(const e of this.trapTargets(t,d.radius,false))this.trapHit(e,d,t);
    for(const e of s.entities)if(e.status==='active'&&e.faction==='monster'&&e.floorId===t.floorId&&distance(e,t)<=d.radius*.6)
     this.damage(e,d.damage*.5,null,{trap:true,element:d.element});                 // friendly fire, half
    if(d.cloud)s.hazards.push({id:this.id('gas'),type:'poison',x:t.x,y:t.y,floorId:t.floorId,radius:d.radius,until:s.time+5,tick:0});
    this.effects.push({x:t.x,y:t.y,floorId:t.floorId,radius:d.radius,blast:true,life:.6,color:d.element==='ice'?'#72d6ce':'#ee8e2e'});
    t.spent=true;t.revealed=true;this.event('trap',{floorId:t.floorId});
   }
   else if(d.kind==='zone'||d.kind==='aura'){
    const list=this.trapTargets(t,d.radius,false);if(!list.length)continue;t.plusCd=d.cd;
    for(const e of list){
     if(d.pull){const dx=t.x-e.x,dy=t.y-e.y,l=Math.hypot(dx,dy)||1;
      for(let i=0;i<8&&l>1;i++){const x=e.x+dx/l*.25,y=e.y+dy/l*.25;if(!this.walkable(x,y,e.floorId,e))break;e.x=x;e.y=y}e.path=[]}
     if(d.knock){const dx=e.x-t.x,dy=e.y-t.y,l=Math.hypot(dx,dy)||1;
      for(let i=0;i<d.knock*4;i++){const x=e.x+dx/l*.25,y=e.y+dy/l*.25;if(!this.walkable(x,y,e.floorId,e))break;e.x=x;e.y=y}e.path=[];e.decision=0}
     if(d.drain)e.mana=Math.max(0,(e.mana||0)-d.drain);
     this.trapHit(e,d,t);
    }
    if(d.kind==='zone')this.event('trap',{floorId:t.floorId});
   }
   else if(d.kind==='totem'){
    if(t.usedWave===s.wave)continue;
    const fallen=s.entities.filter(e=>e.faction==='monster'&&e.status==='downed'&&e.floorId===t.floorId&&distance(e,t)<=d.radius)
     .sort((a,b)=>b.maxHp-a.maxHp||a.id.localeCompare(b.id))[0];
    if(fallen&&this.reviveAlly(fallen,fallen,.5)){t.usedWave=s.wave;t.plusCd=d.cd;
     this.effects.push({x:fallen.x,y:fallen.y,floorId:t.floorId,text:'HỒI SINH',color:'#97da3f',life:1});this.log(`Cột Hồi Sinh dựng dậy ${fallen.name}.`)}
   }
  }
 };
 // turret / projectile effects land with the projectile
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const r=damage.call(this,e,n,source,ctx);
  if(ctx.trapEffect&&e.status==='active'){const d=TRAP_PLUS[ctx.trapEffect];if(d?.effect)this.applyStatus(e,d.effect,d.duration||2,d.value||1,null)}
  return r;
 };
 const finish=P.finish;P.finish=function(){
  const r=finish.call(this);
  for(const t of this.state.traps)if(t.plus){t.pending=null;if(t.spent&&TRAP_PLUS[t.type]?.kind==='mine'){t.spent=false}}  // mines re-arm next wave
  return r;
 };
}
