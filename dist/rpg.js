// v0.9 RPG layer (installed last, after presentation): elements + strengths/weaknesses applied in ONE place,
// mana for everyone + blood casters, 10 new AoE skills, real travelling projectiles, the Guild learning from
// losses, returning veterans, smarter target choice and room-master auras with player-chosen upgrade paths.
// Everything gameplay-relevant lives in state (saved) and uses Game.random() only.
import {SPECIES,distance} from './data.js';
import {SKILLS} from './catalog.js';
import {KITS} from './catalog.js';
import {AFFINITY,FAMILY_AFFINITY,SKILL_ELEMENT,SPECIES_ELEMENT,BLOOD_CASTERS,manaPool,manaRegen,MANA_COST,NEW_AOE,
 AOE_KITS,PROJECTILE,MASTER_AURA,ROLE_AURA,AURA_ORDER,MASTER_PATHS,COUNTERS,ELEMENTS} from './rpg-data.js';

// ---- catalog registration (once, at import) ----
for(const[id,name,description,counter,config]of NEW_AOE)if(!SKILLS[id])
 SKILLS[id]={id,name,kind:'aoe',description,counter,range:6,power:1,...config};
for(const[id,cost]of Object.entries(MANA_COST))if(SKILLS[id]&&!SKILLS[id].mana)SKILLS[id].mana=cost;

const isHero=e=>e.faction==='hero'&&!e.ownerId;
const ward=(e,el)=>e.wards?.[el]||0;

export function installRpg(Game){
 const P=Game.prototype;

 // ---------- elements and affinity ----------
 P.damageElement=function(source,ctx={}){
  if(ctx.element)return ctx.element;
  if(ctx.skill&&SKILL_ELEMENT[ctx.skill])return SKILL_ELEMENT[ctx.skill];
  if(ctx.effect==='fire')return 'fire';if(ctx.effect==='frost')return 'ice';if(ctx.effect==='holy')return 'holy';
  if(!source)return 'physical';
  const w=this.weaponDefinition?.(source);
  if(w?.family==='holy')return 'holy';
  if(this.usesMagicAttack?.(source))return SPECIES_ELEMENT[source.species]||'arcane';
  return 'physical';
 };
 P.affinity=function(e,element){
  const d=SPECIES[e.species]||{},fam=FAMILY_AFFINITY[e.family||d.family]?.[element]??1;
  const own=AFFINITY[e.species]?.[element];
  return (own??fam)*(1-ward(e,element));
 };
 P.affinityList=function(e){
  const strong=[],weak=[];
  for(const el of Object.keys(ELEMENTS)){const m=this.affinity(e,el);if(m<=.85)strong.push([el,m]);else if(m>=1.15)weak.push([el,m])}
  return {strong,weak};
 };

 // ---------- mana for everyone, blood casters ----------
 P.bloodRate=function(e){return BLOOD_CASTERS[e.species]||0};
 P.ensureMana=function(e){
  if(e.rpgMana)return;e.rpgMana=true;
  const pool=manaPool(SPECIES[e.species]||{});
  if(!e.maxMana&&pool){e.maxMana=pool;e.mana=pool}
 };
 const spawn=P.spawn;P.spawn=function(...args){
  const e=spawn.apply(this,args);this.ensureMana(e);
  const ids=AOE_KITS[e.species];
  if(ids&&e.skillIds)for(const id of ids)if(!e.skillIds.includes(id))e.skillIds.splice(Math.min(1,e.skillIds.length),0,id);
  if(isHero(e)&&this.state.phase==='battle')this.prepareHero(e);
  return e;
 };
 const available=P.skillAvailable;P.skillAvailable=function(e,k){
  this.ensureMana(e);
  if(k.bloodCost&&e.hp<=e.maxHp*(k.bloodCost+.15))return false;
  const rate=this.bloodRate(e);
  if(!rate||!k.mana)return available.call(this,e,k);
  if(e.hp<=e.maxHp*(.2+rate*k.mana))return false;           // keep a safety margin
  const m=e.mana;e.mana=1e9;const ok=available.call(this,e,k);e.mana=m;return ok;
 };
 const cast=P.castSkill;P.castSkill=function(e,id,targetId,complete=false){
  const k=SKILLS[id],rate=this.bloodRate(e),before=e.mana,count=this.state.telegraphs.length;
  const ok=cast.call(this,e,id,targetId,complete);
  if(!ok||complete&&!k?.channel)return ok;
  if(rate&&k?.mana&&!complete){const spent=Math.max(0,before-e.mana);e.mana=before;e.hp=Math.max(1,e.hp-spent*rate*e.maxHp)}
  if(k?.bloodCost&&!complete){e.hp=Math.max(1,e.hp-e.maxHp*k.bloodCost);this.log(`${e.name} đốt máu thi triển ${k.name}!`,'warning')}
  if(k?.impacts>1){
   const t=this.state.telegraphs.slice(count).find(t=>t.source===e.id&&t.skill===id);
   if(t)for(let i=1;i<k.impacts;i++){
    const a=i*2*Math.PI/k.impacts,r=k.radius*1.15;
    const x=t.x+Math.cos(a)*r,y=t.y+Math.sin(a)*r;
    if(this.blocksSight(x,y,t.floorId))continue;
    this.state.telegraphs.push({...t,id:this.id('skill'),x,y,tx:x,ty:y,resolveAt:t.resolveAt+i*.35});
   }
  }
  return ok;
 };

 // ---------- real projectiles ----------
 P.projectileKind=function(source,ctx={}){
  const w=this.weaponDefinition?.(source);
  if(w?.family==='crossbow')return 'bolt';
  if(w?.projectile)return w.projectile;
  if(this.usesMagicAttack?.(source)){
   const el=this.damageElement(source,ctx);
   return el==='fire'?'fire':el==='ice'?'frost':el==='shadow'?'curse':el==='holy'?'holy':'magic';
  }
  return 'arrow';
 };
 P.shouldFly=function(e,source,ctx){
  if(!source||ctx.fromProjectile||ctx.secondary||ctx.aoe||ctx.trap||ctx.bossSkill||e.floorId!==source.floorId)return false;
  if(distance(source,e)<=2.8)return false;
  if(ctx.skill)return SKILLS[ctx.skill]?.kind==='strike';
  return source.action==='attack';
 };
 P.launchProjectile=function(source,e,n,ctx){
  const s=this.state,kind=this.projectileKind(source,ctx),spec=PROJECTILE[kind]||PROJECTILE.arrow;
  const dx=e.x-source.x,dy=e.y-source.y,len=Math.hypot(dx,dy)||1;
  s.projectiles??=[];
  s.projectiles.push({id:this.id('shot'),kind,sourceId:source.id,faction:source.faction,targetId:e.id,floorId:source.floorId,
   x:source.x+dx/len*.5,y:source.y+dy/len*.5,vx:dx/len*spec.speed,vy:dy/len*spec.speed,radius:spec.radius,
   left:len/spec.speed+.35,n,ctx:{...ctx,fromProjectile:true}});
  this.metrics?.()&&(this.metrics().shots=(this.metrics().shots||0)+1);
  this.recordAttack?.(source,e,kind==='bolt'?'arrow':kind);
 };
 P.updateProjectiles=function(dt){
  const s=this.state;if(!s.projectiles?.length)return;
  const keep=[];
  for(const p of s.projectiles){
   const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/.25));let done=false;
   for(let i=0;i<steps&&!done;i++){
    p.x+=p.vx*dt/steps;p.y+=p.vy*dt/steps;p.left-=dt/steps;
    if(this.blocksSight(p.x,p.y,p.floorId)){done=true;this.effects.push({x:p.x,y:p.y,floorId:p.floorId,text:'·',color:'#c3bbb1',life:.3});break}
    const hit=s.entities.find(a=>a.status==='active'&&a.floorId===p.floorId&&a.faction!==p.faction&&
     Math.hypot(a.x-p.x,a.y-p.y)<=p.radius+(a.boss?.6:0));
    if(hit){done=true;const src=this.entity(p.sourceId)||null;
     this.damage(hit,p.n,src,p.ctx);
     if(hit.id!==p.targetId)this.metrics?.()&&(this.metrics().strayHits=(this.metrics().strayHits||0)+1);
    }
   }
   if(!done&&p.left<=0){done=true;const t=this.entity(p.targetId);
    if(t)this.effects.push({x:t.x,y:t.y,floorId:t.floorId,text:'NÉ',color:'#c3bbb1',life:.7});
    this.metrics?.()&&(this.metrics().dodged=(this.metrics().dodged||0)+1)}
   if(!done)keep.push(p);
  }
  s.projectiles=keep;
 };

 // ---------- the ONE damage step for elements, projectiles and Guild lore ----------
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  if(e.status!=='active')return damage.call(this,e,n,source,ctx);
  if(this.state.phase==='battle'&&this.shouldFly(e,source,ctx)){
   const w=this.weaponDefinition?.(source);
   if(w?.family==='gun'&&!ctx.skill&&(!this.gunReady(source)||this.jamGun(source)))return;
   this.launchProjectile(source,e,n,ctx);return;
  }
  const element=this.damageElement(source,ctx);
  let c=ctx;
  if(ctx.skill==='A17'&&!ctx.effect)c={...ctx,effect:'holy'};
  if(!ctx.secondary){const m=this.affinity(e,element);n*=m*(this.biomeElement?.(e.floorId,element)||1);
   if(m>=1.15&&source)this.effects.push({x:e.x,y:e.y-.6,floorId:e.floorId,text:'YẾU!',color:ELEMENTS[element].color,life:.6});
   else if(m<=.6&&source)this.effects.push({x:e.x,y:e.y-.6,floorId:e.floorId,text:'KHÁNG',color:'#9aa4ad',life:.6});
  }
  if(!c.element)c={...c,element};
  const was=e.status,result=damage.call(this,e,n,source,c);
  if(was==='active'&&e.status!=='active'&&isHero(e))this.learnFromLoss(e,source,c,element);
  return result;
 };

 // ---------- AoE extras in the resolver ----------
 const resolve=P.resolveWorld;P.resolveWorld=function(dt){
  const due=this.state.telegraphs.filter(t=>t.skill&&this.state.time>=t.resolveAt&&(SKILLS[t.skill]?.knock||SKILLS[t.skill]?.blind));
  const victims=due.map(t=>{const src=this.entity(t.source);
   return src?.status==='active'?[t,src,this.state.entities.filter(a=>a.status==='active'&&a.faction!==src.faction&&this.inDanger(a,t))]:null}).filter(Boolean);
  resolve.call(this,dt);
  for(const[t,src,list]of victims){const k=SKILLS[t.skill];
   for(const a of list){
    if(k.blind)this.applyStatus(a,'blind',k.duration||3,k.blind,src);
    if(k.knock&&a.status==='active'&&!a.boss){
     const dx=a.x-src.x,dy=a.y-src.y,l=Math.hypot(dx,dy)||1;
     for(let i=0;i<(k.knock+(this.biomeRules?.(a.floorId)?.knock||0))*4;i++){const x=a.x+dx/l*.25,y=a.y+dy/l*.25;if(!this.walkable(x,y,a.floorId,a))break;a.x=x;a.y=y}
     a.path=[];a.decision=0;
    }
   }
  }
 };

 // ---------- the Guild learns, prepares, and veterans return ----------
 P.guildLore=function(){return this.state.guildLore??={wave:0,score:{},veterans:[],lessons:[]}};
 P.learnFromLoss=function(e,source,ctx,element){
  const lore=this.guildLore(),add=(k,v=1)=>lore.score[k]=(lore.score[k]||0)+v;
  add(element);
  if(ctx.trap)add('trap',1.5);
  if(source?.boss)add('boss',1.5);
  if(source&&(source.family==='bone'||SPECIES[source.species]?.family==='bone'||['lich','necro_lord','wraith','ghost','zombie'].includes(source.species)))add('undead');
 };
 P.topLesson=function(){
  const lore=this.guildLore();let best=null;
  for(const[k,v]of Object.entries(lore.score))if(v>=2&&(!best||v>best[1]||v===best[1]&&k<best[0]))best=[k,v];
  return best;
 };
 const choose=P.chooseHeroSpecies;P.chooseHeroSpecies=function(base){
  const top=this.topLesson();
  if(top&&this.state.wave>=2){
   const pool=(COUNTERS[top[0]]?.classes||[]).filter(id=>SPECIES[id]&&id!=='paladin'||id==='paladin'&&this.state.wave>=3);
   if(pool.length&&this.random()<Math.min(.4,top[1]*.06))return pool[Math.floor(this.random()*pool.length)];
  }
  return choose.call(this,base);
 };
 P.prepareHero=function(e){
  const top=this.topLesson();e.wards??={};
  if(top&&ELEMENTS[top[0]]){e.wards[top[0]]=Math.min(.45,.15+top[1]*.05)}
  if(top?.[0]==='trap')e.trapWise=true;
  const lore=this.guildLore();
  if(e.squadId?.startsWith?.('main')&&lore.veterans.length&&this.random()<.3){
   const v=lore.veterans.shift();
   e.name=v.name+' · Kẻ Sống Sót';e.veteran=true;e.level=(e.level||1)+2;e.maxHp=Math.round(e.maxHp*1.2);e.hp=e.maxHp;
   this.log(`${e.name} quay lại báo thù, mạnh hơn lần trước!`,'warning');
  }
 };
 const start=P.start;P.start=function(){
  const result=start.call(this);
  if(result?.ok){
   const top=this.topLesson();
   if(top){const c=COUNTERS[top[0]];this.log(`Công hội rút kinh nghiệm: ${c?.name||top[0]} — đoàn mang ${c?.item||'chiến thuật khắc chế'}.`,'warning');
    this.guildLore().lessons.unshift({wave:this.state.wave,lesson:top[0]});this.guildLore().lessons.length=Math.min(6,this.guildLore().lessons.length)}
   for(const e of this.state.entities)if(isHero(e)&&e.status==='active'&&!e.rpgPrepared){e.rpgPrepared=true;this.prepareHero(e)}
  }
  return result;
 };
 const finish=P.finish;P.finish=function(){
  const lore=this.guildLore();
  for(const e of this.state.entities)if(isHero(e)&&e.status==='escaped'&&lore.veterans.length<6)
   lore.veterans.push({name:e.name.split(' · ')[0],species:e.species,level:e.level||1});
  for(const k of Object.keys(lore.score))lore.score[k]=+(lore.score[k]*.7).toFixed(3);
  this.state.projectiles=[];
  return finish.call(this);
 };

 // ---------- tick: mana regen, projectiles, room-master auras ----------
 const tick=P.tick;P.tick=function(dt){
  const r=tick.call(this,dt);
  if(this.state.phase==='battle'){
   for(const e of this.state.entities)if(e.status==='active'){
    this.ensureMana(e);
    if(e.maxMana>0&&e.mana<e.maxMana)e.mana=Math.min(e.maxMana,e.mana+manaRegen(SPECIES[e.species]||{})*dt*(1+(e.manaAura||0)));
   }
   this.updateProjectiles(dt);
   this.masterPulse=(this.masterPulse||0)+dt;
   if(this.masterPulse>=1){this.masterPulse-=1;this.updateMasterAuras();this.biomePulse?.()}
  }
  return r;
 };

 // ---------- room masters ----------
 P.roomNeighbors=function(room,depth){
  const seen=new Map([[room.id,0]]);let frontier=[room.id];
  for(let d=1;d<=depth;d++){const next=[];
   for(const c of this.corridors||[])for(const[a,b]of[[c.a,c.b],[c.b,c.a]])
    if(frontier.includes(a)&&!seen.has(b)){seen.set(b,d);next.push(b)}
   frontier=next}
  return seen;
 };
 P.masterInfo=function(e){
  const d=SPECIES[e.species]||{},kit=KITS[e.species];
  const base=ROLE_AURA[e.role||kit?.role||d.role]||'power',p=e.masterPath||{strong:0,far:0,varied:0};
  const auras=[base,...AURA_ORDER.filter(a=>a!==base).slice(0,p.varied)];
  const picks=Math.max(0,(e.level||1)-1-p.strong-p.far-p.varied);
  return {auras,strength:1+.5*p.strong,depth:1+p.far,picks,path:p};
 };
 P.chooseMasterPath=function(id,path){
  const e=this.entity(id);
  if(!e?.isCommander||!MASTER_PATHS[path]||this.state.phase==='battle')return {ok:false,message:'Chỉ chọn khi chuẩn bị, cho chủ phòng.'};
  const info=this.masterInfo(e);if(!info.picks)return {ok:false,message:'Chủ phòng cần lên cấp để tiến hóa hào quang.'};
  if(path==='varied'&&info.auras.length>=AURA_ORDER.length)return {ok:false,message:'Đã có đủ mọi loại hào quang.'};
  e.masterPath={...info.path,[path]:info.path[path]+1};
  this.log(`${e.name} tiến hóa hào quang: ${MASTER_PATHS[path].name}.`);return {ok:true};
 };
 P.updateMasterAuras=function(){
  for(const e of this.state.entities)e.manaAura=0;
  for(const room of this.state.rooms){
   const m=this.entity(room.commanderId);if(!m||m.status!=='active'||!m.isCommander)continue;
   const info=this.masterInfo(m),reach=this.roomNeighbors(room,info.depth);
   for(const a of this.state.entities){
    if(a.faction!=='monster'||a.status!=='active'||a.floorId!==room.floorId||!reach.has(a.roomId))continue;
    const f=info.strength*(reach.get(a.roomId)?.6:1);
    for(const id of info.auras){const aura=MASTER_AURA[id];
     if(id==='focus')a.manaAura=Math.max(a.manaAura||0,aura.value*f);
     else this.applyStatus(a,aura.status,1.6,aura.value*f,m);
    }
   }
  }
 };

 // ---------- smarter choices ----------
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);const{enemies,add}=context;
  if(!enemies?.length||e.ownerId)return;
  // exploit weaknesses with skills
  for(const k of this.activeSkills(e)){
   if(!['strike','aoe','control'].includes(k.kind)||!this.skillAvailable(e,k))continue;
   const el=SKILL_ELEMENT[k.id]||'physical';
   const target=enemies.filter(a=>distance(e,a)<=k.range).sort((a,b)=>this.affinity(b,el)-this.affinity(a,el)||a.id.localeCompare(b.id))[0];
   if(!target)continue;const m=this.affinity(target,el);
   if(m>=1.2)add('skill',1.08+Math.min(.25,(m-1)*.4),{skillId:k.id,targetId:target.id},`${k.name} đánh vào điểm yếu ${ELEMENTS[el].name} của ${target.name}`);
  }
  // focus: interrupt casters, finish the wounded, pick on healers
  const score=a=>(1-a.hp/a.maxHp)*.8+(a.channelCast?.6:0)+(['support'].includes(a.role)?.3:0)+(a.boss?-.4:0);
  const best=[...enemies].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))[0];
  if(best&&score(best)>.55&&(e.intelligence??50)>=35)
   add('attack',1.06+Math.min(.12,score(best)*.08),best.id,`Tập trung hạ ${best.name}${best.channelCast?' (ngắt phép)':''}`);
 };
}
