// v0.11 — Zombie family: 10 variants + the Zombie King floor boss.
// Tanky, revive 1–2 times unless the killing blow was fire (or they were burning), regenerate to full very fast out of
// combat, can wear gear, and are dumb (often idle) without a commander, elite or zombie leader in the room.
// Revives go through reviveAlly + room quota. No Game.random(): "dumbness" uses a deterministic hash.
import {SPECIES,distance} from './data.js';
import {registerSpecies} from './bestiary-data.js';
import {PROFICIENCY} from './weapon-data.js';
import {BOSS_POOL} from './boss-data.js';
import {FAMILY_AFFINITY,SPECIES_ELEMENT} from './rpg-data.js';

export const ZOMBIES={
 zombie_shambler:{name:'Xác Sống',hp:130,attack:9,brain:8,role:'tank',speed:1.2,revives:1,capacity:4,
  skills:['S01','C01','B03','S07'],passives:['P04','P01'],rooms:['grave','guard']},
 zombie_runner:{name:'Xác Chạy',hp:75,attack:11,brain:10,role:'skirmisher',speed:3,revives:1,capacity:3,
  skills:['S03','S07','B02','C09'],passives:['P05','P15'],rooms:['grave','guard']},
 zombie_spitter:{name:'Xác Phun Axit',hp:85,attack:9,brain:12,role:'ranged',range:5,magic:true,revives:1,capacity:3,
  skills:['S05','A05','C02','H09'],passives:['P42','P07'],rooms:['grave','poisonpool']},
 zombie_armored:{name:'Xác Giáp Sắt',hp:170,attack:10,brain:14,role:'tank',revives:1,weapon:'W14',capacity:6,
  skills:['C01','B03','S08','H06'],passives:['P04','P41'],rooms:['guard','barracks']},
 zombie_miner:{name:'Xác Thợ Mỏ',hp:115,attack:13,brain:18,role:'skirmisher',revives:1,weapon:'W24',capacity:5,
  skills:['C03','S02','B01','C09'],passives:['P05','P12'],rooms:['forge','guard']},
 zombie_crawler:{name:'Xác Bò',hp:62,attack:11,brain:8,role:'ambusher',speed:2.6,revives:2,capacity:2,
  skills:['S10','S07','B07','S03'],passives:['P38','P15'],rooms:['grave','trap']},
 zombie_brute:{name:'Xác Khổng Lồ',hp:320,attack:18,brain:8,slots:2,role:'tank',speed:1.3,revives:2,capacity:4,hireCost:120,
  skills:['A03','C01','B03','C09'],passives:['P04','P01'],rooms:['grave','boss']},
 zombie_bloater:{name:'Xác Trương Phình',hp:230,attack:9,brain:5,slots:2,role:'tank',speed:1.1,revives:0,capacity:2,hireCost:95,
  bloat:true,skills:['C01','A05','B03','S05'],passives:['P04','P01'],rooms:['poisonpool','grave']},
 zombie_plague:{name:'Xác Dịch Hạch',hp:250,attack:13,brain:10,slots:2,role:'support',speed:1.2,revives:1,capacity:4,hireCost:110,
  plague:true,skills:['A05','C08','B05','S05'],passives:['P32','P02'],rooms:['poisonpool','darkaltar']},
 zombie_knight:{name:'Hiệp Sĩ Xác Sống',hp:190,attack:15,brain:42,role:'tank',revives:1,weapon:'W43',capacity:6,hireCost:120,
  leader:true,skills:['S08','C01','B08','C09'],passives:['P04','P22'],rooms:['guard','boss']},
};
for(const[id,d]of Object.entries(ZOMBIES))registerSpecies(id,'zombie',{...d,sprite:'yd/monsters/'+id,family:'zombie',undead:true,
 immune:['poison']},true);
registerSpecies('zombie_king','zombie',{name:'Vua Xác Sống',sprite:'yd/monsters/zombie_king',hp:820,attack:18,brain:55,slots:4,
 role:'tank',speed:1.3,revives:2,family:'zombie',undead:true,immune:['poison'],leader:true,
 skills:['A03','C01','B08','C09'],passives:['P04','P22'],rooms:['boss']});
FAMILY_AFFINITY.zombie={fire:1.6,holy:1.3,ice:.85,poison:.2,physical:.9};
SPECIES_ELEMENT.zombie_spitter='poison';
Object.assign(PROFICIENCY,{zombie_armored:{blade:2,shield:1},zombie_miner:{blunt:2,axe:2},zombie_knight:{blade:3,polearm:2},
 zombie_shambler:{blunt:1,blade:1},zombie_brute:{blunt:2}});

const move=(id,name,kind,phase,stats={})=>({id,name,kind,phase,cd:18,windup:1,radius:3,range:8,damage:0,...stats});
BOSS_POOL.zombie_king={id:'zombie_king',name:'Vua Xác Sống',species:'zombie_king',sprite:'yd/monsters/zombie_king',floors:[0,1],
 style:'commander',hireCost:360,hp:820,attack:18,seals:[
  {id:'plagueRise',name:'Dịch Bất Tử',description:'Zombie trên tầng hồi sinh thêm 1 lần'},
  {id:'rotRegen',name:'Thịt Thối Liền',description:'Zombie hồi máu nhanh gấp đôi'}],skills:[
  move('zk_horde','Gọi Bầy Xác','summon',0,{units:['zombie_shambler','zombie_runner']}),
  move('zk_slam','Đập Thối Rữa','circle',0,{radius:3,damage:30,self:true,effect:'poison',duration:4}),
  move('zk_charge','Lao Xác','line',1,{width:1.5,damage:30}),
  move('zk_feast','Tiệc Xác Thối','aura',2,{effect:'fortify',value:.35,duration:5,cd:28})]};

const isZombie=e=>e&&(e.family==='zombie'||SPECIES[e.species]?.family==='zombie');
const hash=(s,n)=>{let h=n|0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return (h>>>0)%100};

export function installZombies(Game){
 const P=Game.prototype;
 P.zombieKingOnFloor=function(f){return this.state.entities.some(e=>e.species==='zombie_king'&&e.status==='active'&&e.floorId===f)};
 const spawn=P.spawn;P.spawn=function(...args){
  const e=spawn.apply(this,args);
  if(isZombie(e)){e.family='zombie';e.zombieRevives=SPECIES[e.species].revives??1}
  return e;
 };
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  const zombie=isZombie(e),was=e.status;
  if(zombie&&was==='active'){e.lastHitElement=this.damageElement?.(source,ctx)||'physical';e.lastHitTime=this.state.time}
  const r=damage.call(this,e,n,source,ctx);
  if(zombie&&was==='active'&&e.status==='downed')this.zombieDown(e,source);
  return r;
 };
 P.zombieDown=function(e,source){
  const s=this.state,d=SPECIES[e.species];
  if(d.bloat){
   for(const a of s.entities)if(a.status==='active'&&a.floorId===e.floorId&&a.id!==e.id&&distance(a,e)<=2.5)
    this.damage(a,a.faction==='hero'?28:14,null,{secondary:true,element:'poison'});
   s.hazards.push({id:this.id('gas'),type:'poison',x:e.x,y:e.y,floorId:e.floorId,radius:2.5,until:s.time+6,tick:0});
   this.effects.push({x:e.x,y:e.y,floorId:e.floorId,radius:2.5,blast:true,life:.6,color:'#97da3f'});
   this.log(`${e.name} nổ tung thành mây độc!`,'warning');return;
  }
  const burnt=e.lastHitElement==='fire'||this.effect(e,'burn');
  const extra=this.zombieKingOnFloor(e.floorId)&&e.species!=='zombie_king'&&!e.kingBonusUsed?1:0;
  if(extra){e.zombieRevives=(e.zombieRevives||0)+1;e.kingBonusUsed=true}
  if(burnt){e.zombieRevives=0;this.effects.push({x:e.x,y:e.y,floorId:e.floorId,text:'CHÁY RỤI',color:'#ee8e2e',life:1});return}
  if((e.zombieRevives||0)<=0)return;
  e.zombieRevives--;s.zombieRise??=[];s.zombieRise.push({id:e.id,at:s.time+5});
  this.effects.push({x:e.x,y:e.y,floorId:e.floorId,text:'SẼ ĐỨNG DẬY',color:'#97da3f',life:1});
 };
 const tick=P.tick;P.tick=function(dt){
  const r=tick.call(this,dt),s=this.state;
  if(s.zombieRise?.length){
   const keep=[];
   for(const z of s.zombieRise){
    const e=this.entity(z.id);if(!e||e.status!=='downed')continue;
    if(s.time<z.at){keep.push(z);continue}
    if(this.effect(e,'burn')){continue}
    if(this.reviveAlly(e,e,.6)){e.hp=e.maxHp*.6;this.effects.push({x:e.x,y:e.y,floorId:e.floorId,text:'HỒI SINH',color:'#97da3f',life:1});
     this.log(`${e.name} lại đứng dậy!`,'warning')}
   }
   s.zombieRise=keep;
  }
  // very fast regeneration out of combat (3s without damage, not burning); doubled by the Zombie King's seal
  for(const e of s.entities){
   if(e.status!=='active'||!isZombie(e)||e.hp>=e.maxHp||this.effect(e,'burn'))continue;
   if(s.time-(e.lastDamaged??-100)<3)continue;
   const rate=.15*(this.zombieKingOnFloor(e.floorId)?2:1);
   e.hp=Math.min(e.maxHp,e.hp+e.maxHp*rate*dt);
  }
  // plague zombies: poison pulse every 2s on heroes nearby
  this.plagueClock=(this.plagueClock||0)+dt;
  if(this.plagueClock>=2){this.plagueClock-=2;
   for(const e of s.entities)if(e.status==='active'&&SPECIES[e.species]?.plague)
    for(const a of s.entities)if(a.status==='active'&&a.faction==='hero'&&a.floorId===e.floorId&&distance(a,e)<=2.5)
     this.applyStatus(a,'poison',3,1,e)}
  return r;
 };
 P.zombieLed=function(e){
  return this.state.entities.some(a=>a.status==='active'&&a.faction==='monster'&&a.floorId===e.floorId&&a.id!==e.id&&
   a.roomId===e.roomId&&(a.elite||a.isCommander&&(a.intelligence??0)>=35||SPECIES[a.species]?.leader));
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);
  if(!isZombie(e)||SPECIES[e.species]?.leader||e.elite)return;
  if(this.zombieLed(e))return;
  // dumb without leadership: in ~40% of 2-second windows it just stands and groans
  if(hash(e.id,Math.floor(this.state.time/2))<40&&!context.enemies?.some(a=>distance(a,e)<2))
   context.add('guard',2.4,{x:e.x,y:e.y,floorId:e.floorId},'Xác sống lơ ngơ vì không có kẻ chỉ huy');
 };
}
