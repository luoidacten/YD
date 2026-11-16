import {SPECIES,contains,distance} from './data.js';
import {BOSS_POOL} from './boss-data.js';

export function installBossCombat(Game){
 const P=Game.prototype;
 // Floor masters' innate ranged strikes are not equipped mana weapons.
 // Their spell economy is the phased cooldown system, not a finite hero pool.
 const magic=P.usesMagicAttack;P.usesMagicAttack=function(e){return this.bossDefinition(e)?false:magic.call(this,e)};
 P.bossDefinition=function(e){return BOSS_POOL[e.floorBossId||e.boss]||null};
 P.bossTarget=function(e,skill,enemies){
  if(skill.target==='weakest')return [...enemies].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  if(skill.target==='farthest')return [...enemies].sort((a,b)=>distance(e,b)-distance(e,a))[0];
  if(skill.kind==='taunt')return [...enemies].sort((a,b)=>SPECIES[b.species].attack-SPECIES[a.species].attack)[0];
  return [...enemies].sort((a,b)=>distance(e,a)-distance(e,b))[0];
 };
 P.bossTelegraph=function(e,skill,target){
  const dx=target.x-e.x,dy=target.y-e.y,n=Math.hypot(dx,dy)||1,line=['line','beam'].includes(skill.kind),cone=skill.kind==='cone';
  const origin=line||cone||skill.self?e:target;
  return {source:e.id,floorId:e.floorId,type:line?'line':cone?'cone':'circle',x:origin.x,y:origin.y,
   tx:e.x+dx/n*skill.range,ty:e.y+dy/n*skill.range,radius:skill.radius,width:skill.width||1,
   damage:skill.damage,createdAt:this.state.time,resolveAt:this.state.time+skill.windup,bossSkill:skill,targetId:target.id};
 };
 P.bossLanding=function(e,target){
  const room=this.state.rooms.find(r=>r.id===e.roomId),p=this.findFreeNear(target,room);
  return p&&contains(room,p,1)&&this.walkable(p.x,p.y,e.floorId,e)&&this.lineOfSight(e,p)?p:null;
 };
 P.castBossSkill=function(e,skill,target){
  if(!e||e.status!=='active'||!target||target.floorId!==e.floorId||!this.canSeeEnemy(e,target)||
   skill.phase>e.bossStage||e.bossSkillReady?.[skill.id]>this.state.time||skill.once&&e.bossSkillUsed?.[skill.id])return false;
  if(skill.execute&&target.hp/target.maxHp>=.35)return false;
  if(skill.kind==='resurrect'&&!this.state.entities.some(a=>a.family==='bone'&&a.floorId===e.floorId&&a.status==='downed'))return false;
  const landing=skill.kind==='leap'?this.bossLanding(e,target):null;if(skill.kind==='leap'&&!landing)return false;
  e.bossSkillReady??={};e.bossSkillUsed??={};e.bossSkillReady[skill.id]=this.state.time+skill.cd;
  e.bossSkillUsed[skill.id]=(e.bossSkillUsed[skill.id]||0)+1;
  const count=skill.count&&skill.kind==='circle'?skill.count:1;
  for(let i=0;i<count;i++){
   const t=this.bossTelegraph(e,skill,target);t.id=this.id('boss-cast');
   if(landing){t.x=landing.x;t.y=landing.y;t.landing=landing}
   if(i){const angle=this.random()*Math.PI*2,r=1+this.random()*2;t.x+=Math.cos(angle)*r;t.y+=Math.sin(angle)*r}
   this.state.telegraphs.push(t);
  }
  e.castUntil=this.state.time+skill.windup;e.bossWindupUntil=e.castUntil;e.bossCastSkill=skill.id;
  e.bossCooldown=[8.5,7,5.5][e.bossStage];this.event('boss',{floorId:e.floorId,x:e.x,y:e.y});return true;
 };
 P.bossTick=function(e,dt){
  const d=this.bossDefinition(e);if(!d||e.status!=='active')return;
  e.bossCooldown=Math.max(0,(e.bossCooldown||0)-dt);
  const stage=e.hp/e.maxHp<.3?2:e.hp/e.maxHp<.6?1:0;
  if(stage!==e.bossStage){e.bossStage=stage;this.log(`${e.name} · Giai đoạn ${stage+1}`,'warning');this.event('boss',{floorId:e.floorId})}
  if(e.castUntil>this.state.time||e.bossBeamUntil>this.state.time)return;
  const enemies=this.state.entities.filter(a=>a.faction!==e.faction&&a.status==='active'&&a.floorId===e.floorId&&this.canSeeEnemy(e,a));
  if(!enemies.length)return;
  this.bossPosition(e,d,enemies,dt);
  if(e.bossCooldown>0)return;
  const room=this.state.rooms.find(r=>r.id===e.roomId),free=this.roomCapacity(room)-this.roomSlotsUsed(room);
  const choices=d.skills.filter(k=>k.phase<=stage&&!(e.bossSkillReady?.[k.id]>this.state.time)&&
   !(k.once&&e.bossSkillUsed?.[k.id])&&(!(k.kind==='summon')||free>=1)&&
   (!k.execute||enemies.some(a=>a.hp/a.maxHp<.35))).map(k=>{
    const target=this.bossTarget(e,k,enemies),area=this.bossTelegraph(e,k,target);
    const hits=enemies.filter(a=>this.inDanger(a,area)).length;
    let value=k.damage?Math.max(1,hits)*k.damage:25;
    if(k.kind==='summon')value=free>=2?55:20;
    if(k.kind==='resurrect')value=20+this.state.entities.filter(a=>a.family==='bone'&&a.status==='downed'&&a.floorId===e.floorId).length*35;
    if(k.kind==='aura'&&e.hp/e.maxHp<.35)value+=55;
    if(k.kind==='beam'&&e.hp/e.maxHp<.7)value+=35;
    return{k,target,score:value+(k.phase===stage?12:0)-(e.bossSkillUsed?.[k.id]||0)*6+this.random()*.01};
   }).sort((a,b)=>b.score-a.score);
  for(const c of choices)if(this.castBossSkill(e,c.k,c.target))break;
 };
 P.bossPosition=function(e,d,enemies,dt){
  const target=this.bossTarget(e,{target:d.style==='duelist'?'weakest':''},enemies);
  const room=this.state.rooms.find(r=>r.id===e.roomId);if(!room)return;
  let point=target;
  if(d.style==='ambusher'){
   if(!enemies.some(a=>contains(room,a,1))){e.concealed=true;return}e.concealed=false;
  }
  if(d.style==='summoner'&&distance(e,target)<2&&(e.bossBlinkReady||0)<=this.state.time){
   for(let i=0;i<8;i++){const p={x:Math.round(room.x+(this.random()-.5)*(room.w-4)),
    y:Math.round(room.y+(this.random()-.5)*(room.h-4)),floorId:e.floorId};
    if(contains(room,p,1)&&this.walkable(p.x,p.y,e.floorId,e)&&distance(p,target)>4){
     e.x=p.x;e.y=p.y;e.path=[];e.bossBlinkReady=this.state.time+12;this.visualCue('curse',e);return;
    }
   }
  }
  if(d.style==='zoner')point=room;
  else if(['summoner','controller','warlord-summoner'].includes(d.style)){
   const desired=d.style==='summoner'?6:d.style==='controller'?5:3;
   if(distance(e,target)>=desired)return;
   const dx=e.x-target.x,dy=e.y-target.y,n=Math.hypot(dx,dy)||1;
   point={x:Math.round(e.x+dx/n*3),y:Math.round(e.y+dy/n*3),floorId:e.floorId};
  }
  if(this.walkable(point.x,point.y,e.floorId,e)&&contains(room,point,1))this.move(e,point,dt,.5);
 };
 P.bossSpawn=function(e,id,near=e){
  const species=SPECIES[id]?id:'skeleton',room=this.state.rooms.find(r=>r.id===e.roomId);
  if(!room||!this.roomHasSpace(room,{species}))return null;
  const p=this.findFreeNear(near,room);if(!p||!this.walkable(p.x,p.y,e.floorId,e))return null;
  const unit=this.spawn(species,'monster',p.x,p.y,SPECIES[species].name,[],{floorId:e.floorId,roomId:e.roomId});
  unit.bossSummoned=true;if(species==='skeleton'||species.startsWith('skeleton_')||species.startsWith('bone_'))unit.family='bone';
  return unit;
 };
 P.bossDisplace=function(target,source,amount){
  const dx=target.x-source.x,dy=target.y-source.y,n=Math.hypot(dx,dy)||1;
  for(let moved=0;moved<amount;moved+=.2){const p={x:target.x+dx/n*.2,y:target.y+dy/n*.2,floorId:target.floorId};
   if(!this.walkable(p.x,p.y,p.floorId,target)||!this.lineOfSight(target,p))break;target.x=p.x;target.y=p.y;
  }
  target.path=[];target.decision=0;
 };
 P.resolveBossSkill=function(t){
  const e=this.entity(t.source),k=t.bossSkill,s=this.state;if(!e||e.status!=='active')return;
  const room=s.rooms.find(r=>r.id===e.roomId),target=this.entity(t.targetId);
  if(k.kind==='summon')for(const id of k.units)this.bossSpawn(e,id);
  else if(k.kind==='eggs')for(let i=0;i<(k.count||2);i++){
   const p=this.findFreeNear({x:e.x+(i?2:-2),y:e.y+2,floorId:e.floorId},room);
   if(p)s.props.push({id:this.id('egg'),type:'egg',...p,roomId:e.roomId,hp:20,maxHp:20,solid:false,
    destroyed:false,hatchAt:s.time+4,source:e.id});
  }
  else if(k.kind==='resurrect')for(const a of s.entities.filter(a=>a.family==='bone'&&a.floorId===e.floorId&&a.status==='downed')){
   const r=s.rooms.find(r=>r.id===a.roomId);if(this.roomHasSpace(r,a))this.reviveAlly(e,a,.5);
  }
  else if(k.kind==='aura'){
   let allies=s.entities.filter(a=>a.faction===e.faction&&a.status==='active'&&a.roomId===e.roomId&&a.floorId===e.floorId);
   if(k.target==='ally')allies=[...allies].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp).slice(0,1);
   else if(k.target==='bones')allies=allies.filter(a=>a.family==='bone');
   else if(k.target!=='allies')allies=[e];
   for(const a of allies){this.applyStatus(a,k.effect,k.duration,k.value,e);if(k.haste)this.applyStatus(a,'haste',k.duration,k.haste,e)}
  }
  else if(k.kind==='taunt'&&target?.status==='active'){
   this.applyStatus(target,'taunt',k.duration,k.value,e);e.bossDuelTarget=target.id;e.bossDuelUntil=s.time+k.duration;
  }
  else{
   if(t.landing&&this.walkable(t.landing.x,t.landing.y,e.floorId,e)){e.x=t.landing.x;e.y=t.landing.y;e.path=[]}
   for(const a of s.entities.filter(a=>a.faction!==e.faction&&a.status==='active'&&a.floorId===e.floorId&&
    this.inDanger(a,t)&&this.lineOfSight({x:t.x,y:t.y,floorId:e.floorId},a))){
    const hp=a.hp;if(k.damage)this.damage(a,k.damage,e,{skill:k.id,aoe:true,effect:k.effect==='burn'?'fire':null});
    if(k.effect)this.applyStatus(a,k.effect,k.duration||3,k.value||1,e);
    if(k.push)this.bossDisplace(a,e,k.push);if(k.drain)this.heal(e,Math.max(0,hp-a.hp));
   }
   if(['beam','zone'].includes(k.kind)){
    s.bossZones??=[];s.bossZones.push({...t,until:s.time+k.duration,nextTick:s.time+1});
    if(k.kind==='beam')e.bossBeamUntil=s.time+k.duration;
   }
   if(k.charge&&target){
    const dx=target.x-e.x,dy=target.y-e.y,n=Math.hypot(dx,dy)||1;
    for(let i=0;i<Math.min(n,k.range)/.2;i++){
     const p={x:e.x+dx/n*.2,y:e.y+dy/n*.2,floorId:e.floorId};
     if(!this.walkable(p.x,p.y,e.floorId,e)||!this.lineOfSight(e,p))break;e.x=p.x;e.y=p.y;
    }
   }
  }
  this.recordAttack(e);this.visualCue(k.effect==='poison'?'poison':k.effect==='slow'?'frost':'holy',e);
 };
 const resolve=P.resolveWorld;P.resolveWorld=function(dt){
  const due=this.state.telegraphs.filter(t=>t.bossSkill&&t.resolveAt<=this.state.time);
  this.state.telegraphs=this.state.telegraphs.filter(t=>!due.includes(t));
  resolve.call(this,dt);for(const t of due)this.resolveBossSkill(t);
  for(const z of this.state.bossZones||[]){
   if(this.state.time>=z.until||this.state.time<z.nextTick)continue;z.nextTick+=1;
   const e=this.entity(z.source),k=z.bossSkill;if(e?.status!=='active')continue;
   for(const a of this.state.entities.filter(a=>a.faction!==e.faction&&a.status==='active'&&a.floorId===z.floorId&&
    this.inDanger(a,z)&&this.lineOfSight(z,a))){const hp=a.hp;this.damage(a,k.damage,e,{skill:k.id,aoe:true});
    if(k.effect)this.applyStatus(a,k.effect,1.2,k.value||1,e);if(k.drain)this.heal(e,Math.max(0,hp-a.hp));}
  }
  this.state.bossZones=(this.state.bossZones||[]).filter(z=>z.until>this.state.time&&this.entity(z.source)?.status==='active');
  for(const egg of this.state.props.filter(p=>p.type==='egg'&&!p.destroyed&&p.hatchAt<=this.state.time)){
   const parent=this.entity(egg.source);if(parent)this.bossSpawn(parent,'spider',egg);egg.destroyed=true;
  }
 };
 const danger=P.inDanger;P.inDanger=function(p,t,padding=0){
  if(t.bossSkill&&t.type==='cone'){
   if(p.floorId!==t.floorId||distance(p,t)>t.radius+padding)return false;
   const angle=Math.atan2(t.ty-t.y,t.tx-t.x),a=Math.atan2(p.y-t.y,p.x-t.x);
   return Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)))<=(t.bossSkill.angle||Math.PI/3)/2;
  }
  return danger.call(this,p,t,padding);
 };
 const spawn=P.spawn;P.spawn=function(...args){
  const e=spawn.apply(this,args),d=this.bossDefinition(e);if(d)e.name=d.name;return e;
 };
 const setup=P.setupLair;P.setupLair=function(){
  setup.call(this);for(const e of this.state.entities){const d=this.bossDefinition(e);if(d)e.name=d.name}
 };
 const active=P.activeSkills;P.activeSkills=function(e){return this.bossDefinition(e)?[]:active.call(this,e)};
 const act=P.act;P.act=function(e,dt){
  if(e.bossBeamUntil>this.state.time){e.moving=false;e.cooldown=Math.max(0,e.cooldown-dt);return}
  return act.call(this,e,dt);
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  if(source&&this.effect(source,'curse')&&!ctx.secondary)n*=.75;
  if(e.bossDuelUntil>this.state.time&&source&&source.id!==e.bossDuelTarget)n*=.7;
  return damage.call(this,e,n,source,ctx);
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);if(e.faction!=='hero')return;
  const egg=this.state.props.find(p=>p.type==='egg'&&!p.destroyed&&p.floorId===e.floorId&&
   distance(p,e)<=this.vision(e)&&this.lineOfSight(e,p));
  if(egg)context.add('barrel',.95,egg.id,'Phá trứng nhện đã nhìn thấy trước khi nở');
 };
}
