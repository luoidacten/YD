// v0.3 — difficulty presets + custom values, stored per run in state.difficulty; required rooms cost no mana.
// Every factor is read through game.difficulty(); the hero multipliers are applied once at hero spawn (kingdom.js).
import {CARDS} from './data.js';

export const REQUIRED_ROOMS=['entrance','treasure','boss','arrival'];
for(const id of REQUIRED_ROOMS){const c=CARDS.find(c=>c.id===id&&c.kind==='room');if(c)c.cost=0}

export const DIFFICULTY_FIELDS={
 heroHp:{name:'Máu mạo hiểm giả',min:.5,max:2.5,step:.05,unit:'×'},
 heroPower:{name:'Sát thương mạo hiểm giả',min:.5,max:2.5,step:.05,unit:'×'},
 party:{name:'Số mạo hiểm giả mỗi đợt',min:.5,max:2.5,step:.05,unit:'×'},
 gold:{name:'Thưởng vàng sau đợt',min:.25,max:3,step:.05,unit:'×'},
 startGold:{name:'Vàng khởi đầu',min:150,max:2000,step:10,unit:''},
 startMana:{name:'Mana khởi đầu',min:20,max:600,step:10,unit:''},
};
export const DIFFICULTY_PRESETS={
 easy:{name:'Dễ',text:'Học luật chơi, đoàn mỏng và yếu.',heroHp:.85,heroPower:.85,party:.75,gold:1.25,startGold:600,startMana:200},
 normal:{name:'Thường',text:'Cân bằng mặc định.',heroHp:1.15,heroPower:1.1,party:1,gold:1,startGold:420,startMana:120},
 hard:{name:'Khó',text:'Đoàn đông và lì hơn, ít tài nguyên.',heroHp:1.35,heroPower:1.25,party:1.25,gold:.9,startGold:360,startMana:100},
 nightmare:{name:'Ác Mộng',text:'Dành cho chủ hầm ngục thực thụ.',heroHp:1.6,heroPower:1.4,party:1.5,gold:.8,startGold:320,startMana:80},
};
const clamp=(k,v)=>{const f=DIFFICULTY_FIELDS[k];return Math.min(f.max,Math.max(f.min,Number(v)))};

export function installDifficulty(Game){
 const P=Game.prototype;
 P.difficulty=function(){
  const d=this.state.difficulty;
  return {...DIFFICULTY_PRESETS.normal,...(d?.preset&&d.preset!=='custom'?DIFFICULTY_PRESETS[d.preset]:{}),...(d?.custom||{}),preset:d?.preset||'normal'};
 };
 P.freshRun=function(){const s=this.state;return s.phase==='prepare'&&s.wave===1&&!s.rooms.length};
 P.setDifficulty=function(preset,custom=null){
  if(preset!=='custom'&&!DIFFICULTY_PRESETS[preset])return {ok:false,message:'Không có mức độ khó này.'};
  if(this.state.phase==='battle')return {ok:false,message:'Đổi độ khó khi không giao chiến.'};
  const values=preset==='custom'?Object.fromEntries(Object.keys(DIFFICULTY_FIELDS).map(k=>[k,clamp(k,custom?.[k]??this.difficulty()[k])])):null;
  this.state.difficulty={preset,custom:values};
  const d=this.difficulty();
  if(this.freshRun()){this.state.gold=d.startGold;this.state.mana=Math.min(this.manaCapacity?.()??d.startMana,d.startMana)}
  this.log(`Độ khó: ${preset==='custom'?'Tùy chỉnh':DIFFICULTY_PRESETS[preset].name}${this.freshRun()?'':' (áp dụng từ đợt sau)'}.`);
  return {ok:true};
 };
 // required rooms are free: refund the base 5 mana after a successful build
 const build=P.build;P.build=function(col,row,type,floorId){
  const free=REQUIRED_ROOMS.includes(type),mana=this.state.mana;
  if(free&&this.state.mana<5){this.state.mana+=5;const r=build.call(this,col,row,type,floorId);this.state.mana=mana;return r}
  const r=build.call(this,col,row,type,floorId);
  if(free&&r?.ok)this.state.mana=mana;
  return r;
 };
 // party size: scale the main party once when the expedition starts (no randomness)
 const start=P.start;P.start=function(){
  const r=start.call(this);if(!r?.ok)return r;
  const enc=this.state.encounter,main=enc.spawnQueue.filter(u=>!u.reinforcement),want=Math.max(1,Math.round(main.length*this.difficulty().party));
  const bases=['knight','rogue','mage','priest'],names=['Arden','Brina','Corin','Delia','Eamon','Faye','Galen','Hilde'];
  for(let i=main.length;i<want;i++){enc.spawnQueue.push({species:bases[i%4],name:names[i%8]+' (thêm)',squadId:'main-'+Math.floor(i/4),elite:false,reinforcement:false});enc.mainCount++}
  for(let i=main.length;i>want;i--){const k=enc.spawnQueue.lastIndexOf(main[i-1]);if(k>=0){enc.spawnQueue.splice(k,1);enc.mainCount--}}
  return r;
 };
 const finish=P.finish;P.finish=function(){
  const was=this.state.phase,r=finish.call(this);
  if(was==='battle'&&this.state.phase==='result'){const g=this.difficulty().gold;
   if(g!==1){const base=90+this.state.wave*20,extra=Math.round(base*(g-1));this.state.gold=Math.max(0,this.state.gold+extra);
    if(this.state.result)this.state.result.reward=(this.state.result.reward||0)+extra}}
  return r;
 };
}
