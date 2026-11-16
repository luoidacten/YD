import {SPECIES,distance} from './data.js';
import {choosePosition} from './ai.js';
import './classes-data.js';

export function installClasses(Game){
 const P=Game.prototype;
 P.setupClass=function(e){
  if(e.classKit)return;e.classKit=true;
  if(e.species==='crossbowman'&&this.random()<.35)this.equipItem(e,this.createItem('W39',e));
  const extras={ninja:['W08'],paladin:['W33'],crossbowman:['W35','W39']};
  for(const id of extras[e.species]||[]){
   if(this.state.items.some(i=>i.owner===e.id&&i.definitionId===id))continue;
   const item=this.createItem(id,e);if(id==='W33')this.equipItem(e,item);
  }
 };
 const spawn=P.spawn;P.spawn=function(...args){const e=spawn.apply(this,args);this.setupClass(e);return e};
 const setup=P.setupLair;P.setupLair=function(){setup.call(this);for(const e of this.state.entities)this.setupClass(e)};
 const choose=P.chooseHeroSpecies;P.chooseHeroSpecies=function(base){
  const wave=this.state.wave;
  if(wave>=2){
   const pool=['rogue','archer'].includes(base)?[['ninja',1],['crossbowman',1]]:
    base==='priest'?[['nun',1],['priestess',wave>=3?1:0]]:
     base==='mage'&&wave>=3?[['arcaneArcher',1]]:[];
   if(pool.length&&this.random()<.28)return this.pickWeighted(pool);
  }
  return choose.call(this,base);
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);const {enemies,allies,locked,add}=context;
  if(e.species==='ninja'&&enemies.length){
   const weak=enemies.reduce((a,b)=>a.hp/a.maxHp<b.hp/b.maxHp?a:b);
   add('attack',1.12,weak.id,'Ninja nhắm đối thủ yếu đang thấy');
   if(!locked&&e.hp/e.maxHp<.42)add('retreat',1.9,e.home,'Ninja rút lui sớm để giữ thông tin');
  }
  if(e.species==='priestess'&&enemies.length&&distance(e,enemies[0])<4){
   const p=choosePosition(this,e,enemies[0],'kite');if(p)add('kite',1.18,p,'Tư tế giữ hàng sau, chừa đường cho hộ vệ');
  }
  if(e.species==='crossbowman'&&enemies.length){
   const enemy=enemies[0],guard=allies.find(a=>this.offhandDefinition(a)&&distance(a,e)<6);
   if(guard){
    const dx=guard.x-enemy.x,dy=guard.y-enemy.y,n=Math.hypot(dx,dy)||1;
    const p={x:guard.x+dx/n*1.6,y:guard.y+dy/n*1.6,floorId:e.floorId};
    if(distance(e,p)>.5&&this.walkable(p.x,p.y,p.floorId,e)&&this.lineOfSight(p,enemy)&&
     distance(p,enemy)<=this.range(e)&&this.path(e,p).length&&!allies.some(a=>distance(a,p)<.8))
     add('regroup',.98,p,'Nỏ thủ đứng sau khiên đồng đội và giữ đường bắn');
   }
  }
 };
}
