import {wallDecorations} from './world.js';
import {SPECIES,CARDS,contains,distance} from './data.js';
import {SKILLS} from './catalog.js';
import {ITEMS} from './expansion.js';
import {EXTRA_HEROES,EXTRA_MONSTERS} from './v04-data.js';

export function installV04(Game){const P=Game.prototype;
 P.pickWeighted=function(entries){
  const total=entries.reduce((n,a)=>n+a[1],0);let roll=this.random()*total;
  for(const [value,weight]of entries){roll-=weight;if(roll<0)return value}
  return entries.at(-1)?.[0];
 };
 P.pickCardDefinition=function(pool,type){
  return this.pickWeighted(pool.map(c=>[c,c.rare?(['armory','contracts'].includes(type)?.15:0):
   c.species==='pumpkin'?(this.state.world.event==='Chợ phiên'?.1:0):1]));
 };
 P.chooseHeroSpecies=function(base){
  const s=this.state;if(s.wave<2)return base;
  if(base==='knight')return this.pickWeighted([['knight',7],['shieldmaiden',3]]);
  if(['archer','rogue'].includes(base))return this.pickWeighted([[base,7],['dwarfMiner',3]]);
  if(base!=='priest')return base;
  const angel=s.wave>=3&&!s.encounter?.angelReserved&&
   !s.entities.some(e=>e.species==='angelHerald'&&e.expeditionWave===s.wave);
  const species=this.pickWeighted([['priest',6],['dwarfSmith',3],['angelHerald',angel?.6:0]]);
  if(species==='angelHerald'&&s.encounter)s.encounter.angelReserved=true;
  return species;
 };
 P.setupV04Unit=function(e){
  if(e.v04Kit)return;e.v04Kit=true;const d=SPECIES[e.species];
  if(d.mana){e.maxMana=Math.max(e.maxMana,d.mana);e.mana=e.maxMana}
  if(d.charms)e.charms=[...new Set([...e.charms,...d.charms])];
  if(e.species==='dwarfMiner'){this.createItem('I18',e);this.equipItem(e,this.createItem('I10',e))}
 };
 const spawn=P.spawn;P.spawn=function(...args){
  if(args[1]==='hero'&&args[6]?.reinforcement)args[0]=this.chooseHeroSpecies(args[0]);
  const e=spawn.apply(this,args);e.expeditionWave??=this.state.wave;this.setupV04Unit(e);return e;
 };
 P.canHireSpecies=function(id){return id!=='pumpkin'||this.state.world.event==='Chợ phiên'};
 const hire=P.hire;P.hire=function(roomId,species=null){
  if(species&&!this.canHireSpecies(species))return null;
  return hire.call(this,roomId,species);
 };
 const setup=P.setupLair;P.setupLair=function(){setup.call(this);for(const e of this.state.entities)this.setupV04Unit(e);
  for(const r of this.state.rooms)r.wallDecorations??=wallDecorations(r)};
 const start=P.start;P.start=function(){
  const result=start.call(this);
  if(result.ok)for(const spec of this.state.encounter.spawnQueue)spec.species=this.chooseHeroSpecies(spec.species);
  return result;
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const w=source?this.weaponDefinition(source):null,basic=source&&!ctx.secondary&&!ctx.skill;
  if(basic&&w?.hamperedBonus&&(this.effect(e,'slow')||this.effect(e,'rooted')))n*=1+w.hamperedBonus;
  const was=e.status,hp=e.hp,result=damage.call(this,e,n,source,ctx);
  if(basic&&e.hp<hp){
   if(w?.procEffect&&e.status==='active'&&(w.procChance===undefined||this.random()<w.procChance))
    this.applyStatus(e,w.procEffect,w.procDuration,1,source);
   if(w?.comboEvery){
    source.weaponCombo??={};const count=(source.weaponCombo[w.id]||0)+1;source.weaponCombo[w.id]=count;
    if(count%w.comboEvery===0)this.applyStatus(source,'haste',1.5,.2,source);
   }
   const d=SPECIES[source.species];
   if(d.innateEffect&&e.status==='active')this.applyStatus(e,d.innateEffect,3,d.innateValue||1,source);
  }
  if(was==='active'&&e.status==='downed'&&e.species==='pumpkin'&&!e.deathBurstSpent){
   e.deathBurstSpent=true;
   this.damageProp({id:this.id('pumpkin-burst'),x:e.x,y:e.y,floorId:e.floorId,type:'explosive',hp:1},1,e);
  }
  return result;
 };
 const transfer=P.transfer;P.transfer=function(item,owner){
  const ok=transfer.call(this,item,owner),w=owner?this.weaponDefinition(owner):null;
  if(ok&&item.type==='gold'&&w?.goldBonus&&!item.weaponGoldBoosted){
   item.value=Math.round(item.value*(1+w.goldBonus));item.weaponGoldBoosted=true;
  }
  return ok;
 };
 const gear=P.gearMod;P.gearMod=function(e,key){
  return gear.call(this,e,key)+(key==='power'?Object.values(e.gearSlots||{}).reduce((n,id)=>
   n+(this.state.items.find(i=>i.id===id)?.forgePower||0),0):0);
 };
 const controls=P.controlsTick;P.controlsTick=function(dt){
  controls.call(this,dt);const s=this.state;
  for(const smith of s.entities.filter(e=>e.species==='dwarfSmith'&&e.status==='active'&&!e.visibleIds?.length)){
   if(s.time-(smith.lastSmithRepair??-100)<5)continue;smith.lastSmithRepair=s.time;
   for(const ally of s.entities.filter(e=>e.faction===smith.faction&&e.status==='active'&&
    e.floorId===smith.floorId&&e.squadId===smith.squadId&&distance(e,smith)<4&&this.lineOfSight(e,smith))){
    if(ally.equipment)ally.equipment.durability=Math.min(100,ally.equipment.durability+20);
    const room=this.roomAt(ally.x,ally.y,ally.floorId);
    if(room?.type!=='forge'||room.owner!=='adventurers'||room.buildingHp<=0)continue;
    const weapon=s.items.find(i=>i.id===ally.gearSlots.weapon);
    if(weapon&&weapon.forgeWave!==s.wave){
     weapon.forgeWave=s.wave;weapon.forgePower=Math.min(.15,(weapon.forgePower||0)+.05);
    }
   }
  }
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);
  if(e.species==='dwarfSmith'&&!context.enemies.length&&!context.locked){
   const forge=this.rooms(e.floorId).find(r=>r.type==='forge'&&r.buildingHp>0&&
    r.owner==='dungeon'&&e.knownRooms.includes(r.id)&&!this.roomMonsters(r).length);
   if(forge)context.add(contains(forge,e,1)?'capture':'explore',.9,
    contains(forge,e,1)?forge.id:{x:forge.x,y:forge.y,floorId:forge.floorId},'Thợ rèn ưu tiên chiếm lò rèn để nâng trang bị');
  }
 };
 const rescue=P.rescueTarget;P.rescueTarget=function(e){
  if(e.species!=='angelHerald')return rescue.call(this,e);
  return this.state.entities.filter(a=>a.status==='downed'&&a.faction===e.faction&&
   !a.charms.includes('forsaken')&&a.floorId===e.floorId&&distance(e,a)<8&&this.lineOfSight(e,a))
   .sort((a,b)=>(a.bleedOutAt||Infinity)-(b.bleedOutAt||Infinity))[0];
 };
 const revive=P.reviveAlly;P.reviveAlly=function(e,target,...rest){
  if(e.species==='angelHerald'&&target?.charms.includes('forsaken'))return false;
  return revive.call(this,e,target,...rest);
 };
 const target=P.skillTarget;P.skillTarget=function(e,k,enemies,allies){
  const result=target.call(this,e,k,enemies,allies);
  return e.species==='angelHerald'&&result?.charms?.includes('forsaken')?null:result;
 };
 const cast=P.castSkill;P.castSkill=function(e,id,targetId,...rest){
  const target=this.entity(targetId);
  if(e.species==='angelHerald'&&target?.charms.includes('forsaken')&&
   ['heal','healArea','revive','shieldAlly'].includes(SKILLS[id]?.kind))return false;
  return cast.call(this,e,id,targetId,...rest);
 };
 const act=P.act;P.act=function(e,dt){
  const room=e.action==='open-chest'?this.state.rooms.find(r=>r.id===e.target):null;
  const chest=room?.rewardChest,was=chest?.opened;act.call(this,e,dt);
  if(chest&&!was&&chest.opened&&chest.tier>=4&&!chest.rareRolled){
   chest.rareRolled=true;if(this.random()<.12){
    const reward=this.createItem(this.random()<.5?'W21':'W22');
    Object.assign(reward,{x:chest.x,y:chest.y,floorId:chest.floorId});
   }
  }
 };
}
