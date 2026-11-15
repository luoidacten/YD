import {SPECIES,distance} from './data.js';
import {SKILLS} from './catalog.js';
import {ART_HEROES,ART_MONSTERS} from './bestiary-data.js';

export function installBestiary(Game){
 const P=Game.prototype;
 P.visualCue=function(kind,target){
  this.visualEvents??=[];
  this.visualEvents.push({id:(this.visualSequence=(this.visualSequence||0)+1),kind,
   x:target.x,y:target.y,floorId:target.floorId});
  if(this.visualEvents.length>40)this.visualEvents.splice(0,this.visualEvents.length-40);
 };
 const heal=P.heal;P.heal=function(e,...args){const n=heal.call(this,e,...args);if(n>0)this.visualCue('heal',e);return n};
 const apply=P.applyStatus;P.applyStatus=function(e,type,...args){
  const result=apply.call(this,e,type,...args);
  const kind={poison:'poison',stun:'lightning'}[type];if(kind)this.visualCue(kind,e);return result;
 };
 const cast=P.castSkill;P.castSkill=function(e,id,target,...args){
  const ok=cast.call(this,e,id,target,...args),k=SKILLS[id];
  if(ok&&(!k?.channel||args[0])){
   const a=this.entity(target)||e;
   if(['revive','heal','healArea','shieldAlly'].includes(k?.kind))this.visualCue(k.kind==='revive'?'holy':'heal',a);
   if(id==='A01')this.visualCue('fireball',a);
  }
  return ok;
 };
 const choose=P.chooseHeroSpecies;P.chooseHeroSpecies=function(base){
  const wave=this.state.wave;
  const pool=base==='knight'?[['berserker',1],['paladin',wave>=3?1:0]]:
   ['rogue','archer'].includes(base)?[['assassin',1]]:base==='mage'?[['frost_mage',1],['pyromancer',1]]:[];
  if(wave>=2&&pool.length&&this.random()<.25)return this.pickWeighted(pool);
  return choose.call(this,base);
 };
 const skillTarget=P.skillTarget;P.skillTarget=function(e,k,enemies,allies){
  if(e.species==='skeleton_king'&&k.kind==='revive'){
   const room=this.state.rooms.find(r=>r.id===e.roomId);
   if(room?.type!=='grave'||!this.roomOperational(room))return null;
   return this.state.entities.find(a=>a.species==='skeleton'&&a.roomId===e.roomId&&a.status==='downed'&&!a.rescued&&
    distance(a,e)<=k.range&&this.lineOfSight(e,a))||null;
  }
  return skillTarget.call(this,e,k,enemies,allies);
 };
 const hire=P.hire;P.hire=function(roomId,species=null){
  const cost=SPECIES[species]?.hireCost,room=this.state.rooms.find(r=>r.id===roomId);
  if(!cost)return hire.call(this,roomId,species);
  const multiplier=this.state.deck.activeFate?.id==='F02'?1.5:1,extra=Math.ceil(cost*multiplier)-Math.ceil(75*multiplier);
  if(this.state.gold<cost*multiplier||!room)return null;
  const e=hire.call(this,roomId,species);if(e)this.state.gold-=extra;return e;
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);
  if(['assassin'].includes(e.species)&&context.enemies.length){
   const weak=context.enemies.reduce((a,b)=>a.hp/a.maxHp<b.hp/b.maxHp?a:b);
   context.add('attack',1.12,weak.id,'Sát thủ chọn đối thủ yếu đang thực sự nhìn thấy');
  }
 };
}
