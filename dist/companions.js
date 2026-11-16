import {SPECIES,distance} from './data.js';
import './companions-data.js';
export function installCompanions(Game){
 const P=Game.prototype;
 P.isAdventurer=function(e){return e.faction==='hero'&&!e.ownerId};
 P.spawnCompanion=function(owner){
  if(owner.faction!=='hero'||!['beastmaster','hunter'].includes(owner.species)||owner.ownerId||
   this.state.entities.some(e=>e.ownerId===owner.id))return null;
  const p=this.findFreeNear(owner);if(!p)return null;
  const pet=this.spawn(owner.species==='hunter'?'hawk':'wolf_pet','hero',p.x,p.y,'Bạn của '+owner.name,[],
   {floorId:owner.floorId,ownerId:owner.id});
  pet.ownerId=owner.id;pet.capacity=0;pet.role='companion';pet.squadId=null;pet.gold=0;pet.potions=0;
  pet.quickScrolls=[];pet.skillIds=[];pet.passiveIds=[];pet.charms=[];pet.inventory=[];pet.gearSlots={};pet.equipment=null;
  this.state.items=this.state.items.filter(i=>i.owner!==pet.id);return pet;
 };
 const spawn=P.spawn;P.spawn=function(...args){
  const e=spawn.apply(this,args);if(args[6]?.ownerId)e.ownerId=args[6].ownerId;
  else this.spawnCompanion(e);return e;
 };
 const choose=P.chooseHeroSpecies;P.chooseHeroSpecies=function(base){
  if(this.state.wave>=2&&['knight','rogue','mage','archer'].includes(base)&&this.random()<.16)
   return base==='mage'?'druid':base==='knight'?'beastmaster':'hunter';
  return choose.call(this,base);
 };
 P.setBearForm=function(e,active){
  if(e.species!=='druid'||!!e.bearForm===active)return false;
  const ratio=e.hp/e.maxHp;e.maxHp=Math.max(1,Math.round(e.maxHp*(active?1.6:1/1.6)));e.hp=e.maxHp*ratio;
  e.bearForm=active;if(active){e.bearUntil=this.state.time+10;e.bearReadyAt=this.state.time+25}
  else delete e.bearUntil;this.visualCue(active?'holy':'heal',e);return true;
 };
 P.hawkReveal=function(owner){
  const allies=this.state.entities.filter(e=>e.faction==='hero'&&e.status==='active'&&e.floorId===owner.floorId&&distance(e,owner)<=6);
  for(const trap of this.state.traps.filter(t=>t.floorId===owner.floorId&&!t.disabled&&distance(t,owner)<=6))
   for(const a of allies)if(!a.knownTraps.includes(trap.id))a.knownTraps.push(trap.id);
  for(const enemy of this.state.entities.filter(e=>e.faction==='monster'&&e.status==='active'&&e.floorId===owner.floorId&&distance(e,owner)<=6)){
   enemy.concealed=false;enemy.hawkRevealedAt=this.state.time;
   for(const a of allies)a.seen[enemy.id]={x:enemy.x,y:enemy.y,floorId:enemy.floorId,time:this.state.time,
    firstSeen:a.seen[enemy.id]?.firstSeen??this.state.time,source:'hawk'};
  }
 };
 P.actCompanion=function(e,dt){
  const owner=this.entity(e.ownerId);e.moving=false;e.cooldown=Math.max(0,e.cooldown-dt);e.strike=Math.max(0,(e.strike||0)-dt);
  if(!owner||['dead','downed'].includes(owner.status)){
   e.ownerLostAt??=this.state.time;e.action='guard';
   if(owner&&owner.floorId===e.floorId&&distance(e,owner)>2)this.move(e,owner,dt,1.5);
   if(this.state.time-e.ownerLostAt>=10)e.status='escaped';return;
  }
  if(owner.status!=='active'){e.status='escaped';return}delete e.ownerLostAt;
  if(owner.floorId!==e.floorId){e.action='follow';this.stairs(e,dt,owner.floorId>e.floorId?'down':'up');return}
  if(e.species==='hawk'&&(e.hawkReadyAt||0)<=this.state.time){this.hawkReveal(owner);e.hawkReadyAt=this.state.time+3}
  const target=this.entity(e.wolfCommandUntil>this.state.time?e.wolfCommandTarget:owner.target);
  if(e.species==='wolf_pet'&&target?.status==='active'&&target.floorId===e.floorId&&target.faction!==e.faction&&
   distance(e,owner)<=3&&distance(target,owner)<=4&&this.canSeeEnemy(e,target)){
   e.action='attack';e.target=target.id;
   if(distance(e,target)>1.4)this.move(e,target,dt,1.1);
   else if(!e.cooldown){this.damage(target,9,e);e.cooldown=1.08;e.strike=.2}return;
  }
  e.action='follow';e.target={x:owner.x,y:owner.y,floorId:owner.floorId};
  if(distance(e,owner)>1.8)this.move(e,owner,dt,1.5);
  else e.action='guard';
 };
 const act=P.act;P.act=function(e,dt){
  if(e.ownerId)return this.actCompanion(e,dt);
  if(e.action==='hunter-trap'){
   e.moving=false;
   if(e.mana<8||this.state.time-(e.lastDamaged??-100)<.8){e.trapChannel=0;e.action='guard';e.decision=0;return}
   e.trapChannel=(e.trapChannel||0)+dt;
   if(e.trapChannel>=.8){const trap=this.createTrap('frost',e.target,e);
    if(trap){trap.rootTrap=true;trap.affectsFaction='monster';trap.affectsUntil=this.state.time+120;e.mana-=8;e.hunterTrapReady=this.state.time+18}
    e.trapChannel=0;e.decision=0;e.action='guard';}return;
  }
  if(e.species==='druid'){
   if(e.bearForm&&this.state.time>=e.bearUntil)this.setBearForm(e,false);
   if(!e.bearForm&&(e.bearReadyAt||0)<=this.state.time&&this.state.entities.some(a=>a.faction!==e.faction&&
    a.status==='active'&&a.floorId===e.floorId&&distance(a,e)<3&&this.canSeeEnemy(e,a)))this.setBearForm(e,true);
  }
  return act.call(this,e,dt);
 };
 const active=P.activeSkills;P.activeSkills=function(e){return e.bearForm||e.ownerId?[]:active.call(this,e)};
 const range=P.range;P.range=function(e){return e.bearForm?1.6:range.call(this,e)};
 const magic=P.usesMagicAttack;P.usesMagicAttack=function(e){return e.bearForm?false:magic.call(this,e)};
 const cast=P.castSkill;P.castSkill=function(e,id,target,...args){
  if(e.bearForm||e.ownerId)return false;const ok=cast.call(this,e,id,target,...args),a=this.entity(target);
  if(ok&&a?.faction!==e.faction&&a?.floorId===e.floorId){
   if(e.species==='hunter'&&id==='B06'){a.hunterMarkUntil=this.state.time+6;this.visualCue('curse',a)}
   if(e.species==='druid'&&id==='C02')this.applyStatus(a,'root',2,1,e);
   if(e.species==='beastmaster'&&id==='C09')for(const pet of this.state.entities.filter(p=>p.ownerId===e.id&&p.status==='active')){
    pet.wolfCommandTarget=a.id;pet.wolfCommandUntil=this.state.time+2;this.applyStatus(pet,'haste',2,.4,e);
   }
  }return ok;
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  if(source?.faction==='hero'&&e.hunterMarkUntil>this.state.time)n*=1.2;
  return damage.call(this,e,n,source,ctx);
 };
 const transfer=P.transfer;P.transfer=function(item,e){return e?.ownerId?false:transfer.call(this,item,e)};
 const intel=P.recordIntel;P.recordIntel=function(e){if(!e.ownerId)return intel.call(this,e)};
 const escape=P.escape;P.escape=function(e,...args){if(e.ownerId)return false;return escape.call(this,e,...args)};
 const choices=P.extendChoices;P.extendChoices=function(e,c){
  if(e.ownerId)return;choices.call(this,e,c);
  if(e.species==='beastmaster'&&!c.locked&&this.state.entities.some(p=>p.ownerId===e.id&&p.status!=='active'))
   c.add('retreat',1.8,e.home,'Thuần Thú Sư rút lui khi mất sói');
  if(e.species==='druid'&&c.enemies.length&&this.state.hazards.some(h=>h.type==='fire'&&h.floorId===e.floorId&&distance(e,h)<4))
   c.add('kite',1.5,e.home,'Druid tránh vùng cháy');
  if(e.species==='hunter'&&(e.hunterTrapReady||0)<=this.state.time&&e.mana>=8&&
   this.state.time-(e.lastDamaged??-100)>1&&!this.state.traps.some(t=>t.floorId===e.floorId&&distance(t,e)<2)){
   const p=this.findFreeNear(e);
   if(p&&distance(p,e)<2&&this.lineOfSight(e,p))
    c.add('hunter-trap',c.enemies.length?1.25:.7,p,'Thợ Săn bố trí bẫy rễ, niệm 0,8 giây');
  }
 };
}
