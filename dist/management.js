// v0.10 management between waves (CODEX_10 A–E): wave metrics + hero heatmap + summary report, Guild report preview,
// monster fatigue + mana upkeep, Book of Dark Arts research (souls), Infamy and between-wave events.
// Installed after rpg.js. Research effects are read ONLY through researchMods(); fatigue/infamy/next-wave factors are
// applied once, in this module's damage wrapper. Gameplay randomness uses Game.random() only (event draw at finish).
import {SPECIES,SETTINGS,ROOMS} from './data.js';
import {COUNTERS} from './rpg-data.js';

export const RESEARCH={
 architecture:{name:'Kiến Trúc',tiers:[
  ['Bẫy Tẩm Độc','Bẫy gây thêm 20% sát thương.'],['Mở Rộng Hầm','Mỗi phòng thêm 1 ô quân.'],
  ['Tường Dày','Quái nhận ít hơn 5% sát thương.'],['Đổi Địa Hình','Đổi địa hình tầng miễn phí.']]},
 legion:{name:'Quân Đoàn',tiers:[
  ['Hậu Cần','Phí duy trì giảm 25%.'],['Huấn Luyện','Quái nhận thêm 25% EXP.'],
  ['Băng Bó','Quái hồi thêm 25% HP sau mỗi đợt.'],['Hợp Đồng Rẻ','Giá thuê quái giảm 15%.']]},
 dark:{name:'Hắc Thuật',tiers:[
  ['Giếng Mana','Kho mana tối đa +25.'],['Uy Quyền','Hào quang Chủ phòng mạnh hơn 25%.'],
  ['Tìm Điểm Yếu','Quái đánh trúng điểm yếu của hero gây thêm 10%.'],['Mùa Gặt Hồn','Hồn nhận sau đợt +50%.']]},
};
export const RESEARCH_COST=[10,20,35,55];

export const EVENTS={
 merchant:{name:'Thương Nhân Bóng Tối',text:'Đổi 8 hồn lấy 120 vàng.',can:g=>g.state.souls>=8,
  apply:g=>{g.state.souls-=8;g.state.gold+=120}},
 cursegold:{name:'Lời Nguyền Vàng',text:'Nhận 150 vàng; đợt sau hero +1 cấp.',apply:g=>{g.state.gold+=150;g.nextWave().heroLevel+=1}},
 wanderer:{name:'Khách Lạ Gõ Cửa',text:'Nhận 45 mana và 3 hồn.',apply:g=>{g.state.mana=Math.min(g.manaCapacity(),g.state.mana+45);g.state.souls+=3}},
 guildrule:{name:'Công Hội Đổi Luật',text:'Đợt sau ít hơn 1 hero, nhưng hero +1 cấp và +20% HP.',
  apply:g=>{const n=g.nextWave();n.partyDelta-=1;n.heroLevel+=1;n.heroHp+=.2}},
 bloodmoon:{name:'Trăng Máu',text:'Đợt sau quái +15% sát thương, phí duy trì ×2.',apply:g=>{const n=g.nextWave();n.monsterPower+=.15;n.upkeepMul*=2}},
 tithe:{name:'Cống Nạp',text:'Trả 60 vàng để Tai tiếng −15.',can:g=>g.state.gold>=60,apply:g=>{g.state.gold-=60;g.addInfamy(-15)}},
};

export function installManagement(Game){
 const P=Game.prototype;
 P.mgmt=function(){
  return this.state.management??={research:{architecture:0,legion:0,dark:0},infamy:0,wave:null,last:null,history:[],
   events:[],nextWave:null,upkeepPaid:null};
 };
 P.researchMods=function(){
  const r=this.mgmt().research,a=r.architecture,l=r.legion,d=r.dark;
  return {trapDamage:a>=1?1.2:1,roomSlot:a>=2?1:0,monsterArmor:a>=3?.95:1,freeBiome:a>=4,
   upkeep:l>=1?.75:1,xp:l>=2?1.25:1,waveHeal:l>=3?.25:0,hire:l>=4?.85:1,
   manaCap:d>=1?25:0,aura:d>=2?1.25:1,weakness:d>=3?1.1:1,souls:d>=4?1.5:1};
 };
 P.nextWave=function(){return this.mgmt().nextWave??={heroLevel:0,partyDelta:0,heroHp:0,monsterPower:0,upkeepMul:1}};
 P.addInfamy=function(n){const m=this.mgmt();m.infamy=Math.max(0,Math.min(100,+(m.infamy+n).toFixed(2)))};
 P.infamyLevel=function(){return Math.floor(this.mgmt().infamy/35)};

 // ---- research ----
 P.researchCost=function(branch){const t=this.mgmt().research[branch];return t<4?RESEARCH_COST[t]:null};
 P.learnResearch=function(branch){
  if(!RESEARCH[branch])return {ok:false,message:'Không có nhánh này.'};
  if(this.state.phase==='battle')return {ok:false,message:'Chỉ nghiên cứu khi không giao chiến.'};
  const cost=this.researchCost(branch);if(cost===null)return {ok:false,message:'Đã học hết nhánh này.'};
  if(this.state.souls<cost)return {ok:false,message:`Cần ${cost} hồn.`};
  this.state.souls-=cost;const m=this.mgmt();m.research={...m.research,[branch]:m.research[branch]+1};
  this.log(`Sách Hắc Thuật: học ${RESEARCH[branch].tiers[m.research[branch]-1][0]}.`);return {ok:true};
 };
 const cap=P.manaCapacity;P.manaCapacity=function(){return cap.call(this)+this.researchMods().manaCap};
 const xp=P.gainXP;P.gainXP=function(e,n){return xp.call(this,e,n*this.researchMods().xp)};
 const roomCap=P.roomCapacity;P.roomCapacity=function(r){const n=roomCap.call(this,r);return r?n+this.researchMods().roomSlot:n};
 const price=P.hirePrice;P.hirePrice=function(...args){return Math.ceil(price.apply(this,args)*this.researchMods().hire)};
 const master=P.masterInfo;if(master)P.masterInfo=function(e){const i=master.call(this,e);return {...i,strength:i.strength*this.researchMods().aura}};
 const biome=P.setFloorBiome;if(biome)P.setFloorBiome=function(floorId,id){
  const s=this.state;if(!this.researchMods().freeBiome||!s.floorBiomes?.[floorId])return biome.call(this,floorId,id);
  const keep=s.floorBiomes;s.floorBiomes={...keep};delete s.floorBiomes[floorId];
  const r=biome.call(this,floorId,id);if(!r.ok)s.floorBiomes=keep;return r;
 };

 // ---- upkeep ----
 P.upkeepCost=function(){
  const n=this.state.entities.filter(e=>e.faction==='monster'&&!e.boss&&e.status!=='dead').reduce((s,e)=>s+((SPECIES[e.species]?.slots||1)>=2?2:1),0);
  return Math.ceil(n*this.researchMods().upkeep*(this.mgmt().nextWave?.upkeepMul||1));
 };
 P.payUpkeep=function(){
  const s=this.state,cost=this.upkeepCost(),leaving=[];
  if(s.mana>=cost){s.mana-=cost;this.mgmt().upkeepPaid={cost,leaving};return}
  const short=cost-s.mana;s.mana=0;
  const pool=s.entities.filter(e=>e.faction==='monster'&&!e.boss&&!e.isCommander&&e.status!=='dead')
   .sort((a,b)=>(a.maxHp+(SPECIES[a.species]?.attack||0)*4)-(b.maxHp+(SPECIES[b.species]?.attack||0)*4)||a.id.localeCompare(b.id));
  if(short>0&&pool.length){const e=pool.shift();leaving.push(e.name);   // one monster leaves per wave at most
   s.entities=s.entities.filter(a=>a.id!==e.id);for(const r of s.rooms)if(r.commanderId===e.id)r.commanderId=null}
  if(leaving.length)this.log(`Thiếu mana duy trì: ${leaving.join(', ')} bỏ đi.`,'warning');
  this.mgmt().upkeepPaid={cost,leaving};
 };
 P.restMonster=function(id){
  const e=this.entity(id);
  if(!e||e.faction!=='monster'||!this.canPrepare?.())return {ok:false,message:'Chỉ cho quái nghỉ khi chuẩn bị.'};
  if(!e.fatigue)return {ok:false,message:'Quái này không mệt.'};
  if(this.state.mana<10)return {ok:false,message:'Cần 10 mana để hồi sức.'};
  this.state.mana-=10;e.fatigue=0;return {ok:true};
 };

 // ---- metrics ----
 P.waveMetrics=function(){return this.mgmt().wave??={damageByRoom:{},damageByMonster:{},killsByMonster:{},trapDamage:0,heat:{},
  heroesDown:0,soulsAtStart:this.state.souls,exits:{}}};
 P.sampleHeat=function(){
  const w=this.waveMetrics();
  for(const e of this.state.entities)if(e.faction==='hero'&&!e.ownerId&&e.status==='active'){
   const k=e.floorId+':'+(Math.round(e.x)>>1)+':'+(Math.round(e.y)>>1);
   if(w.heat[k]!==undefined||Object.keys(w.heat).length<3000)w.heat[k]=(w.heat[k]||0)+1;
  }
 };

 // ---- the management damage step (fatigue, next-wave power, research armor/trap/weakness, metrics, infamy) ----
 const damage=P.damage;P.damage=function(e,n,source=null,ctx={}){
  if(e.status!=='active')return damage.call(this,e,n,source,ctx);
  const mods=this.researchMods(),nw=this.mgmt().nextWave;
  if(source?.faction==='monster'&&!ctx.secondary){
   n*=1-.08*(source.fatigue||0);n*=1+(nw?.monsterPower||0);
   if(mods.weakness>1&&e.faction==='hero'&&this.affinity?.(e,this.damageElement(source,ctx))>=1.15)n*=mods.weakness;
  }
  if(ctx.trap&&e.faction==='hero')n*=mods.trapDamage;
  if(e.faction==='monster')n*=mods.monsterArmor;
  const hp=e.hp,was=e.status,result=damage.call(this,e,n,source,ctx),dealt=Math.max(0,hp-e.hp);
  if(this.state.phase==='battle'&&dealt>0){
   const w=this.waveMetrics();
   if(e.faction==='hero'&&!e.ownerId){
    const room=this.roomAt(e.x,e.y,e.floorId);if(room)w.damageByRoom[room.id]=(w.damageByRoom[room.id]||0)+dealt;
    if(ctx.trap)w.trapDamage+=dealt;
    if(source?.faction==='monster'){w.damageByMonster[source.id]=(w.damageByMonster[source.id]||0)+dealt;source.foughtWave=this.state.wave}
    if(was==='active'&&e.status!=='active'){w.heroesDown++;this.addInfamy(3);
     if(source?.faction==='monster')w.killsByMonster[source.id]=(w.killsByMonster[source.id]||0)+1}
   }
   if(e.faction==='monster')e.foughtWave=this.state.wave;
  }
  return result;
 };

 const spawn=P.spawn;P.spawn=function(...args){
  const e=spawn.apply(this,args);
  if(e.faction==='hero'&&!e.ownerId&&this.state.phase==='battle'){
   const nw=this.mgmt().nextWave,lv=this.infamyLevel()+(nw?.heroLevel||0);
   if(lv)e.level=(e.level||1)+lv;
   if(nw?.heroHp){e.maxHp=Math.round(e.maxHp*(1+nw.heroHp));e.hp=e.maxHp}
  }
  return e;
 };
 const start=P.start;P.start=function(){
  const r=start.call(this);
  if(r?.ok){const m=this.mgmt();m.wave=null;this.waveMetrics();
   const delta=m.nextWave?.partyDelta||0,q=this.state.encounter?.spawnQueue;
   if(delta<0&&q)for(let i=0;i<-delta&&q.filter(x=>!x.reinforcement).length>1;i++){q.pop();this.state.encounter.mainCount--}}
  return r;
 };
 const tick=P.tick;P.tick=function(dt){
  const r=tick.call(this,dt);
  if(this.state.phase==='battle'){this.heatClock=(this.heatClock||0)+dt;if(this.heatClock>=.5){this.heatClock-=.5;this.sampleHeat()}}
  return r;
 };
 const finish=P.finish;P.finish=function(){
  if(this.state.phase!=='battle')return finish.call(this);
  const s=this.state,m=this.mgmt(),w=this.waveMetrics(),mods=this.researchMods();
  const escaped=s.entities.filter(e=>e.faction==='hero'&&!e.ownerId&&e.status==='escaped');
  for(const e of escaped){const room=this.roomAt(e.x,e.y,e.floorId);const k=room?.type||'?';w.exits[k]=(w.exits[k]||0)+1}
  const result=finish.call(this);
  // rewards scaled by infamy and research (after the base finish computed its own)
  const bonus=Math.round((90+s.wave*20)*m.infamy/200);if(bonus)s.gold+=bonus;
  const gained=Math.max(0,s.souls-w.soulsAtStart);if(mods.souls>1)s.souls+=Math.round(gained*(mods.souls-1));
  this.addInfamy(-5*escaped.length);
  for(const e of s.entities)if(e.faction==='monster'&&e.status==='active'){
   if(mods.waveHeal)this.heal(e,e.maxHp*mods.waveHeal);
   e.fatigue=e.foughtWave===s.wave?Math.min(3,(e.fatigue||0)+1):Math.max(0,(e.fatigue||0)-1);
  }
  m.nextWave=null;
  this.payUpkeep();
  // summary
  const top=Object.entries(w.damageByRoom).sort((a,b)=>b[1]-a[1]).slice(0,3)
   .map(([id,v])=>({id,name:ROOMS[s.rooms.find(r=>r.id===id)?.type]?.name||'Phòng',floorId:s.rooms.find(r=>r.id===id)?.floorId??0,damage:Math.round(v)}));
  const score=id=>(w.damageByMonster[id]||0)+(w.killsByMonster[id]||0)*40;
  const mvpId=Object.keys({...w.damageByMonster,...w.killsByMonster}).sort((a,b)=>score(b)-score(a)||a.localeCompare(b))[0];
  const mvp=mvpId?this.entity(mvpId):null;
  m.last={wave:s.wave,heroesDown:w.heroesDown,escaped:escaped.length,trapDamage:Math.round(w.trapDamage),topRooms:top,
   mvp:mvp?{id:mvp.id,name:mvp.name,species:mvp.species,damage:Math.round(w.damageByMonster[mvp.id]||0),kills:w.killsByMonster[mvp.id]||0}:null,
   heat:w.heat,exits:w.exits,infamyBonus:bonus,upkeep:m.upkeepPaid,infamy:m.infamy};
  m.history.unshift({wave:s.wave,down:w.heroesDown,escaped:escaped.length});m.history.length=Math.min(8,m.history.length);
  // events: draw 3 distinct offers
  const ids=Object.keys(EVENTS);m.events=[];
  while(m.events.length<3&&ids.length)m.events.push(ids.splice(Math.floor(this.random()*ids.length),1)[0]);
  m.wave=null;
  return result;
 };
 P.chooseEvent=function(id){
  const m=this.mgmt();if(!m.events.includes(id))return {ok:false,message:'Sự kiện không còn.'};
  const ev=EVENTS[id];if(ev.can&&!ev.can(this))return {ok:false,message:'Chưa đủ điều kiện.'};
  ev.apply(this);m.events=[];this.log(`Sự kiện: ${ev.name}.`);return {ok:true};
 };
 P.skipEvents=function(){this.mgmt().events=[]};

 // ---- Guild report (prediction only: nothing rolled ahead of time) ----
 P.guildReport=function(){
  const s=this.state,m=this.mgmt(),nw=m.nextWave||{},spy=s.rooms.some(r=>r.type==='spyroom'&&this.roomOperational?.(r));
  const count=Math.max(1,Math.min(SETTINGS.mainPartyMax,SETTINGS.mainParty+(s.wave-1)*2)+(nw.partyDelta||0));
  const base=['knight','rogue','mage','priest'],lore=s.guildLore||{score:{},veterans:[]},top=this.topLesson?.();
  return {wave:s.wave,count,classes:Array.from({length:count},(_,i)=>base[i%4]),lesson:top?{id:top[0],score:top[1],...COUNTERS[top[0]]}:null,
   veterans:lore.veterans?.length||0,infamy:m.infamy,levelBonus:this.infamyLevel()+(nw.heroLevel||0),nextWave:nw,spy,
   scores:spy?Object.entries(lore.score||{}).sort((a,b)=>b[1]-a[1]).slice(0,5):null,upkeep:this.upkeepCost()};
 };
}
