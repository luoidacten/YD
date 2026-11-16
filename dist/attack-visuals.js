import {SPECIES} from './data.js';
import {SKILLS} from './catalog.js';
export function installAttackVisuals(Game){
 const P=Game.prototype;
 P.recordAttack=function(e,target=null,projectile=null,weapon=null){
  this.attackEvents??=[];this.attackTimes??={};
  if(this.attackTimes[e.id]===this.state.time)return;
  this.attackTimes[e.id]=this.state.time;
  const w=weapon||this.weaponDefinition(e);
  this.attackEvents.push({id:(this.attackSequence=(this.attackSequence||0)+1),entityId:e.id,startFrame:e.boss&&e.bossCastSkill?2:0,
   x:e.x,y:e.y,tx:target?.x??e.x,ty:target?.y??e.y,floorId:e.floorId,
   weapon:w,projectile:projectile||(target&&this.range(e)>2.8?(w?.projectile||(SPECIES[e.species].magic?'magic':'arrow')):null)});
  if(this.attackEvents.length>80)this.attackEvents.splice(0,this.attackEvents.length-80);
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const basic=source&&!ctx.secondary&&!ctx.skill&&source.action==='attack';
  const result=damage.call(this,e,n,source,ctx);
  if(basic&&!source.gunState?.jammed)this.recordAttack(source,e);return result;
 };
 const cast=P.castSkill;P.castSkill=function(e,id,target,...args){
  const ok=cast.call(this,e,id,target,...args);
  if(ok&&(!SKILLS[id]?.channel||args[0]))
   this.recordAttack(e,['strike','control'].includes(SKILLS[id]?.kind)?this.entity(target):null);return ok;
 };
 const bomb=P.throwBomb;P.throwBomb=function(e,item,target){
  const ok=bomb.call(this,e,item,target);if(ok)this.recordAttack(e,target,'bomb',this.itemDefinition(item));return ok;
 };
}
