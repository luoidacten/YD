// v0.11 — Kingdom army (elite, smart heroes), Guild offensives (Raid / Assault / end-game Purge) and squad tactics that
// read the environment like a player: spot and dismantle turrets, sniff out traps once the Guild learned about them,
// kill the room master first to break its aura. Offensive draws use Game.random() at finish; nothing is pre-rolled.
import {SPECIES,distance} from './data.js';
import {registerSpecies} from './bestiary-data.js';
import {TRAP_PLUS} from './traps-plus.js';

export const KINGDOM={
 royal_guard:{base:'knight',name:'Vệ Binh Hoàng Gia',hp:190,attack:15,brain:75,role:'tank',weapon:'W14',offhand:'W32',
  skills:['C01','B10','S08','H06'],passives:['P04','P41']},
 royal_archer:{base:'archer',name:'Xạ Thủ Hoàng Gia',hp:110,attack:15,brain:80,role:'ranged',range:7,weapon:'W52',
  skills:['A11','S04','C04','A02'],passives:['P42','P07']},
 royal_mage:{base:'mage',name:'Pháp Sư Hoàng Gia',hp:95,attack:16,brain:85,role:'ranged',magic:true,range:6,
  skills:['A13','A01','C05','B04'],passives:['P32','P02']},
 royal_cleric:{base:'priest',name:'Giáo Sĩ Hoàng Gia',hp:105,attack:9,brain:85,role:'support',magic:true,range:5,
  skills:['H02','H01','H05','A17'],passives:['P32','P02']},
 royal_captain:{base:'knight',name:'Đội Trưởng Hoàng Gia',hp:240,attack:19,brain:90,role:'tank',weapon:'W43',
  skills:['B08','B09','A12','C01'],passives:['P22','P04']},
};
for(const[id,d]of Object.entries(KINGDOM))registerSpecies(id,d.base,{...d,sprite:'yd/chars/'+id,kingdom:true});

export const OFFENSIVES={
 raid:{name:'Cuộc Đột Kích',text:'Công hội tung thêm 2 đợt nhỏ trong trận.',waves:[[45,3],[90,3]],kingdom:0},
 assault:{name:'Cuộc Tiến Công',text:'Đoàn chính đông hơn và 3 đợt lớn có quân Vương Quốc.',waves:[[40,4],[80,5],[120,5]],kingdom:.4,mainBonus:.5},
 purge:{name:'Càn Quét',text:'Cuối game: quân Vương Quốc tinh nhuệ tràn vào thành 5 đợt cực đông.',waves:[[30,6],[60,6],[90,7],[120,7],[150,8]],
  kingdom:.8,mainBonus:1,elite:true},
};
export const PURGE_WAVE=10;
const BASES=['knight','rogue','mage','priest'],ROYAL=['royal_guard','royal_archer','royal_mage','royal_cleric'];
const NAMES=['Aldric','Brienne','Cassian','Dara','Edric','Fiona','Gareth','Helena','Ivor','Jora','Kael','Lysa'];

export function installKingdom(Game){
 const P=Game.prototype;
 P.offensiveFor=function(wave){
  const m=this.mgmt();if(m.nextOffensive?.wave===wave)return m.nextOffensive.type;
  return wave>=PURGE_WAVE&&(wave-PURGE_WAVE)%5===0?'purge':null;
 };
 const finish=P.finish;P.finish=function(){
  const s=this.state,enc=s.encounter;
  if(s.phase==='battle'&&enc?.extraWaves?.some(w=>!w.released)){        // a later offensive wave is still coming: release it now
   const w=enc.extraWaves.find(w=>!w.released);this.releaseWave(w);return;
  }
  const result=finish.call(this);
  if(s.phase==='result'||s.phase==='gameover'){
   const next=s.wave+1,m=this.mgmt();let type=null;
   if(next>=PURGE_WAVE&&(next-PURGE_WAVE)%5===0)type='purge';
   else if(next>=6&&this.random()<.2)type='assault';
   else if(next>=3&&this.random()<.3)type='raid';
   m.nextOffensive=type?{wave:next,type}:null;
   if(type)this.log(`Tình báo: Công hội chuẩn bị ${OFFENSIVES[type].name} ở đợt ${next}!`,'warning');
   if(s.wave>=PURGE_WAVE&&enc?.offensive==='purge'&&s.phase==='result'){m.purgesSurvived=(m.purgesSurvived||0)+1;
    this.log('Hầm ngục đã đứng vững trước Càn Quét!','warning')}
  }
  return result;
 };
 P.unitFor=function(type,i,squad,elite){
  const o=OFFENSIVES[type],royal=this.random()<o.kingdom;
  const species=royal?(i===0&&type!=='raid'?'royal_captain':ROYAL[i%ROYAL.length]):BASES[i%4];
  return {species,name:NAMES[(i+squad.length*3)%NAMES.length]+(royal?' · Vương Quốc':''),squadId:squad,elite:!!elite||royal&&i===0,reinforcement:false};
 };
 P.releaseWave=function(w){
  const enc=this.state.encounter;w.released=true;
  enc.spawnQueue.push(...w.units);enc.mainCount+=w.units.length;
  this.log(`${OFFENSIVES[enc.offensive].name}: đợt ${w.index+1} gồm ${w.units.length} người tràn vào!`,'warning');
  this.present?.('wave',{wave:this.state.wave,count:w.units.length,offensive:enc.offensive});
 };
 const start=P.start;P.start=function(){
  const r=start.call(this);if(!r?.ok)return r;
  const s=this.state,type=this.offensiveFor(s.wave);if(!type)return r;
  const o=OFFENSIVES[type],enc=s.encounter;enc.offensive=type;
  if(o.mainBonus){const base=enc.spawnQueue.filter(u=>!u.reinforcement).length,add=Math.round(base*o.mainBonus);
   for(let i=0;i<add;i++)enc.spawnQueue.push(this.unitFor(type,i,'main-x'+Math.floor(i/4),o.elite));enc.mainCount+=add}
  enc.extraWaves=o.waves.map(([at,n],index)=>({at,index,released:false,
   units:Array.from({length:n},(_,i)=>this.unitFor(type,i,`${type}-${index}`,o.elite))}));
  this.log(`${o.name}! ${o.text}`,'warning');
  return r;
 };
 const spawn=P.spawn;P.spawn=function(...args){
  const e=spawn.apply(this,args),k=KINGDOM[e.species];
  if(k&&e.faction==='hero'){
   e.intelligence=Math.max(e.intelligence||0,k.brain);e.kingdom=true;if(e.species==='royal_captain')e.leadership=100;
   for(const id of [k.weapon,k.offhand].filter(Boolean))try{const item=this.createItem(id,e);if(item)this.equipItem(e,item)}catch{}
  }
  return e;
 };

 // ---- tick: release scheduled waves, environment awareness ----
 const tick=P.tick;P.tick=function(dt){
  const r=tick.call(this,dt),s=this.state,enc=s.encounter;
  if(s.phase==='battle'&&enc?.extraWaves){
   if(s.battleTime>480)for(const w of enc.extraWaves)w.released=true;            // battle limit: cancel the rest
   for(const w of enc.extraWaves)if(!w.released&&s.battleTime>=w.at)this.releaseWave(w);
  }
  if(s.phase==='battle'){this.senseClock=(this.senseClock||0)+dt;if(this.senseClock>=1){this.senseClock-=1;this.heroSense()}}
  return r;
 };
 P.heroSense=function(){
  const s=this.state;
  for(const e of s.entities){
   if(e.status!=='active'||e.faction!=='hero'||e.ownerId)continue;
   const smart=(e.intelligence??40)>=60||e.kingdom,wise=e.trapWise||SPECIES[e.species]?.trapExpert;
   for(const t of s.traps){
    if(t.disabled||t.floorId!==e.floorId||e.knownTraps?.includes(t.id))continue;
    const turret=t.plus&&['turret','totem','aura'].includes(TRAP_PLUS[t.type]?.kind);
    if(turret&&distance(e,t)<=(this.vision?.(e)||8)&&this.lineOfSight(e,t)||wise&&distance(e,t)<=(smart?3.5:2.5))
     (e.knownTraps??=[]).push(t.id);
   }
  }
 };
 const choices=P.extendChoices;P.extendChoices=function(e,context){
  choices.call(this,e,context);
  if(e.faction!=='hero'||e.ownerId)return;
  const {enemies,add}=context,smart=(e.intelligence??40)>=60||e.kingdom;
  // 1) dismantle known turrets / totems when nobody is in our face
  if((smart||e.trapWise)&&!enemies?.some(a=>distance(a,e)<3.5)){
   const t=this.state.traps.filter(t=>!t.disabled&&t.plus&&t.floorId===e.floorId&&e.knownTraps?.includes(t.id)&&
    ['turret','totem','aura'].includes(TRAP_PLUS[t.type]?.kind)&&distance(t,e)<10).sort((a,b)=>distance(a,e)-distance(b,e))[0];
   if(t)add('disarm',1.22,t.id,`Phá ${TRAP_PLUS[t.type].name} trước khi tiến vào`);
  }
  // 2) break the aura: the room master dies first
  if(smart&&enemies?.length){const m=enemies.find(a=>a.isCommander);
   if(m)add('attack',1.15,m.id,`Hạ ${m.name} để phá hào quang Chủ phòng`)}
  // 3) burn zombies so they stay down
  if(enemies?.some(a=>a.family==='zombie'&&a.status==='active')&&smart){
   const z=enemies.filter(a=>a.family==='zombie').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
   if(z&&this.damageElement?.(e,{})==='fire')add('attack',1.14,z.id,'Đốt xác sống để chúng không đứng dậy')}
 };
 // guild report shows the upcoming offensive
 const report=P.guildReport;P.guildReport=function(){
  const r=report.call(this),type=this.offensiveFor(this.state.wave);
  return {...r,offensive:type?{type,...OFFENSIVES[type]}:null,purgeWave:PURGE_WAVE};
 };
}
