// v0.9 biomes (CODEX_09 core): each floor has a biome that changes its tiles AND its rules.
// Offers are derived from worldSeed (no gameplay RNG). Rules are read through biomeRules(floorId) only.
import {SPECIES} from './data.js';

export const BIOMES={
 dungeon:{name:'Hầm Đá Cổ',rule:'Không có luật riêng.',element:{},home:[]},
 forest:{name:'Rừng Cổ',rule:'Rễ cây làm hero chậm 10%. Độc +15%, lửa +15%.',element:{poison:1.15,fire:1.15},heroSlow:.1,
  home:['druid','treant','harpy','werewolf']},
 cave:{name:'Hang Đá',rule:'Bóng tối: tầm nhìn mọi phe −30%. Sét +20%.',element:{lightning:1.2},vision:.7,
  home:['gargoyle','kobold','spider_queen','warden']},
 ice:{name:'Hầm Băng',rule:'Băng +30%, lửa −20%. Đẩy lùi xa thêm 1 ô.',element:{ice:1.3,fire:.8},knock:1,
  home:['frost_witch','iceZombie']},
 lava:{name:'Lò Dung Nham',rule:'Lửa +30%, băng −20%. Hero bị bỏng nhẹ mỗi 6 giây.',element:{fire:1.3,ice:.8},burn:6,
  home:['inferno','salamander','imp','orc_warlord']},
 swamp:{name:'Đầm Lầy',rule:'Độc +30%. Hero chậm 15%.',element:{poison:1.3},heroSlow:.15,home:['naga','scorpion','giant_rat']},
 crypt:{name:'Hầm Mộ',rule:'Quái họ Xương +10% HP. Thánh +15%, bóng tối +15%.',element:{holy:1.15,shadow:1.15},boneHp:.1,
  home:['necro_lord','bone_king','death_knight']},
};
const IDS=Object.keys(BIOMES).filter(id=>id!=='dungeon');

export function installBiomes(Game){
 const P=Game.prototype;
 P.floorBiome=function(floorId){return this.state.floorBiomes?.[floorId]||'dungeon'};
 P.biomeRules=function(floorId){const id=this.floorBiome(floorId),b=BIOMES[id];return {id,...b,homeBosses:b.home}};
 P.biomeOffers=function(floorId){
  // two distinct biomes from the world seed: stable across loads, no Game.random() consumed
  const seed=((this.state.worldSeed||1)*2654435761+floorId*40503)>>>0,a=seed%IDS.length,b=(a+1+(seed>>>8)%(IDS.length-1))%IDS.length;
  return ['dungeon',IDS[a],IDS[b]];
 };
 P.setFloorBiome=function(floorId,id){
  if(!this.canPrepare?.())return {ok:false,message:'Chỉ đổi địa hình khi đang chuẩn bị.'};
  if(!this.biomeOffers(floorId).includes(id))return {ok:false,message:'Địa hình này không có ở tầng.'};
  if(this.floorBiome(floorId)===id)return {ok:true};
  const s=this.state,changed=!!s.floorBiomes?.[floorId],cost=changed?40:0;
  if(s.gold<cost)return {ok:false,message:`Cần ${cost} vàng để đổi địa hình.`};
  s.gold-=cost;s.floorBiomes={...(s.floorBiomes||{}),[floorId]:id};
  this.navRevision=(this.navRevision||0)+1;this.log(`Tầng ${floorId+1} hóa thành ${BIOMES[id].name}.`);
  return {ok:true};
 };
 P.biomeElement=function(floorId,element){return BIOMES[this.floorBiome(floorId)]?.element?.[element]||1};
 const vision=P.vision;P.vision=function(e){return vision.call(this,e)*(BIOMES[this.floorBiome(e.floorId)]?.vision||1)};
 P.biomePulse=function(){
  for(const e of this.state.entities){
   if(e.status!=='active')continue;const b=BIOMES[this.floorBiome(e.floorId)];
   if(e.faction==='hero'&&!e.ownerId&&b.heroSlow&&!this.effect(e,'slow'))this.applyStatus(e,'slow',1.5,b.heroSlow,null);
   if(e.faction==='hero'&&!e.ownerId&&b.burn&&Math.floor(this.state.time)%b.burn===0&&!this.effect(e,'burn'))this.applyStatus(e,'burn',2,1,null);
   if(b.boneHp&&e.faction==='monster'&&(e.family==='bone'||SPECIES[e.species]?.family==='bone')&&e.biomeHpWave!==this.state.wave){
    e.biomeHpWave=this.state.wave;const ratio=e.hp/e.maxHp;e.maxHp=Math.round(e.maxHp*(1+b.boneHp));e.hp=e.maxHp*ratio;
   }
  }
 };
}
