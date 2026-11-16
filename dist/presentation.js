export function installPresentation(Game){
 const P=Game.prototype;
 P.present=function(type,data={}){
  this.presentationEvents??=[];this.presentationEvents.push({id:(this.presentationSequence=(this.presentationSequence||0)+1),type,...data});
  if(this.presentationEvents.length>128)this.presentationEvents.splice(0,this.presentationEvents.length-128);
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const hp=e.hp,was=e.status,souls=this.state.souls,critical=!!ctx.critical||!!source?.concealed;
  const result=damage.call(this,e,n,source,ctx),actual=Math.max(0,hp-e.hp);
  if(actual){this.present(critical?'crit':'hit',{entityId:e.id,x:e.x,y:e.y,floorId:e.floorId,n:actual,
   faction:e.faction,boss:!!e.boss,melee:!!source&&this.range(source)<3,dx:e.x-(source?.x??e.x-1),dy:e.y-(source?.y??e.y)});
  }
  if(was==='active'&&e.status!=='active'){
   this.present('down',{entityId:e.id,x:e.x,y:e.y,floorId:e.floorId,bone:e.family==='bone',boss:!!e.boss,elite:e.elite,
    lastHero:e.faction==='hero'&&!e.ownerId&&!this.state.entities.some(a=>a.faction==='hero'&&!a.ownerId&&a.status==='active')});
  }
  if(this.state.souls>souls)this.present('loot',{x:e.x,y:e.y,floorId:e.floorId,n:this.state.souls-souls,resource:'souls'});
  return result;
 };
 const heal=P.heal;P.heal=function(e,...args){const hp=e.hp,result=heal.call(this,e,...args),n=e.hp-hp;
  if(n>0)this.present('heal',{entityId:e.id,x:e.x,y:e.y,floorId:e.floorId,n});return result;
 };
 const event=P.event;P.event=function(type,data={}){const result=event.call(this,type,data);
  if(type==='boss')this.present('boss',data);return result;
 };
 const start=P.start;P.start=function(){const result=start.call(this);if(result.ok)this.present('wave',{
  wave:this.state.wave,count:this.state.encounter.mainCount});return result;
 };
 const transfer=P.transfer;P.transfer=function(item,owner){const result=transfer.call(this,item,owner);
  if(result&&item.type==='gold')this.present('loot',{x:owner.x,y:owner.y,floorId:owner.floorId,n:item.value,resource:'gold'});return result;
 };
}
