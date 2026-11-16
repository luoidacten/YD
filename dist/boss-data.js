import {SPECIES} from './data.js';
import {STATUS} from './catalog.js';
import {registerSpecies} from './bestiary-data.js';
import './species-data.js';
const move=(id,name,kind,phase,stats={})=>({id,name,kind,phase,cd:18,windup:1,radius:3,range:8,damage:0,...stats});
export const BOSS_POOL={
 warden:{id:'warden',name:'Titan',species:'warden',sprite:'ogre',floors:[0,1],style:'juggernaut',hireCost:300,hp:640,attack:17,
  seals:[{id:'vitality',name:'Thân Đá',description:'Quái và công trình tầng +15% HP'}],skills:[
   move('titan_slam','Đập Đất','circle',0,{radius:4,damage:32,self:true}),
   move('titan_sweep','Quét Ngang','line',0,{width:1.5,damage:28}),
   move('titan_rock','Ném Tảng','circle',1,{radius:2.5,damage:32,target:'farthest'}),
   move('titan_stone','Thân Đá','aura',2,{effect:'fortify',value:.4,duration:4,cd:30})]},
 inferno:{id:'inferno',name:'Ác Ma',species:'lord',sprite:'big_demon',floors:[1],style:'zoner',hireCost:400,hp:760,attack:20,
  seals:[{id:'fireTraps',name:'Hỏa Ấn',description:'Bẫy gây burn'},{id:'burnResist',name:'Máu Lửa',description:'Quái giảm nửa thời gian burn'}],skills:[
   move('inferno_rain','Mưa Lửa','circle',0,{radius:2,damage:18,effect:'burn',value:1,duration:3,count:3}),
   move('inferno_ring','Vòng Lửa','circle',0,{radius:3.5,damage:28,self:true,effect:'burn',duration:3}),
   move('inferno_imps','Triệu Imp','summon',1,{units:['imp','imp']}),
   move('inferno_burst','Bùng Nổ','circle',2,{radius:6,damage:45,windup:1.8,self:true,cd:30})]},
 necro_lord:{id:'necro_lord',name:'Kẻ Chiêu Hồn',species:'necro_lord',sprite:'yd/monsters/necro_lord',floors:[0,1],
  style:'summoner',hireCost:330,hp:590,attack:12,seals:[
   {id:'boneRevive',name:'Chiêu Hồn',description:'Quái xương hồi sinh một lần sau 8s'},
   {id:'soulHarvest',name:'Thu Hồn',description:'Hero gục cho hồn ×1,5'}],skills:[
   move('necro_bones','Triệu Hồi Xương','summon',0,{units:['skeleton','skeleton_archer']}),
   move('necro_drain','Hút Hồn','beam',0,{range:6,width:.65,damage:8,duration:3,drain:true}),
   move('necro_curse','Nguyền Suy Nhược','circle',1,{radius:3,effect:'curse',value:.25,duration:6}),
   move('necro_ritual','Đại Lễ Chiêu Hồn','resurrect',2,{once:true,cd:999})]},
 spider_queen:{id:'spider_queen',name:'Nữ Hoàng Nhện',species:'spider_queen',sprite:'yd/monsters/spider_queen',floors:[0,1],
  style:'ambusher',hireCost:300,hp:560,attack:16,seals:[
   {id:'webDoors',name:'Cửa Tơ',description:'Hero qua cửa lần đầu bị chậm 30% / 3s'},
   {id:'spiderSpeed',name:'Đàn Nhện',description:'Nhện tầng +20% tốc độ'}],skills:[
   move('spider_web','Phun Tơ','cone',0,{range:5,radius:5,angle:Math.PI/3,effect:'slow',value:.4,duration:3}),
   move('spider_fang','Nanh Độc','circle',0,{radius:1.8,self:true,damage:18,effect:'poison',value:2,duration:4}),
   move('spider_eggs','Đẻ Trứng','eggs',1,{count:2}),
   move('spider_leap','Vồ Mồi','leap',2,{range:8,radius:1.5,damage:30,target:'weakest',windup:1.2})]},
 frost_witch:{id:'frost_witch',name:'Phù Thủy Băng Giá',species:'frost_witch',sprite:'yd/monsters/frost_witch',floors:[0,1],
  style:'controller',hireCost:330,hp:550,attack:11,seals:[
   {id:'coldFloor',name:'Hàn Khí',description:'Hero tầng −10% tốc độ'},
   {id:'iceShield',name:'Khiên Băng',description:'Quái nhận khiên 15 HP đầu trận'},
   {id:'trapSlow',name:'Bẫy Lạnh',description:'Bẫy làm chậm thêm 1s'}],skills:[
   move('frost_fan','Mũi Băng','cone',0,{range:7,radius:7,angle:Math.PI/9,damage:24,effect:'slow',value:.25,duration:2}),
   move('frost_pillar','Băng Trụ','line',0,{width:1,damage:15,effect:'rooted',duration:1.5}),
   move('frost_storm','Bão Tuyết','zone',1,{radius:3,damage:5,effect:'slow',value:.5,duration:5}),
   move('frost_armor','Giáp Băng','aura',2,{effect:'shield',value:40,duration:6,target:'ally',cd:25})]},
 orc_warlord:{id:'orc_warlord',name:'Đại Tướng Orc',species:'orc_warlord',sprite:'yd/monsters/orc_warlord',floors:[0,1],
  style:'commander',hireCost:300,hp:670,attack:19,seals:[{id:'warCry',name:'Chiến Ý',description:'Quái +10% sát thương; Orc/Goblin không bỏ chạy'}],skills:[
   move('orc_spin','Rìu Xoáy','circle',0,{self:true,radius:2.5,damage:30}),
   move('orc_charge','Xung Phong','line',0,{range:7,width:1,damage:24,push:2,charge:true}),
   move('orc_order','Hiệu Lệnh','aura',1,{effect:'power',value:.2,duration:8,target:'allies'}),
   move('orc_duel','Thách Đấu','taunt',2,{duration:4,value:2,cd:25})]},
 death_knight:{id:'death_knight',name:'Hắc Kỵ Sĩ Tử Thần',species:'death_knight',sprite:'yd/monsters/death_knight',floors:[1],
  style:'duelist',hireCost:370,hp:700,attack:22,seals:[{id:'vampire',name:'Huyết Ấn',description:'Quái hút máu 10% sát thương gây ra'}],skills:[
   move('death_rune','Chém Rune','cone',0,{radius:3,range:3,angle:Math.PI/2,damage:30,effect:'slow',value:.3,duration:2}),
   move('death_dash','Xung Kích Bóng Tối','line',0,{range:6,width:1,damage:26,charge:true}),
   move('death_shield','Lá Chắn Tử Thần','aura',1,{effect:'shield',value:60,duration:6}),
   move('death_execute','Hành Quyết','leap',2,{radius:1.5,range:8,damage:60,target:'weakest',windup:1.2,execute:true})]},
 bone_king:{id:'bone_king',name:'Vua Xương',species:'bone_king',sprite:'yd/monsters/bone_king',floors:[0,1],
  style:'warlord-summoner',hireCost:340,hp:630,attack:16,seals:[
   {id:'boneHire',name:'Vương Lệnh',description:'Thuê quái xương giảm 25%'},{id:'boneArmor',name:'Cốt Giáp',description:'Quái xương +3 giáp'}],skills:[
   move('king_rally','Gậy Triệu Tập','summon',0,{units:['skeleton_guard','skeleton_archer']}),
   move('king_order','Mệnh Lệnh Hoàng Gia','aura',0,{effect:'power',value:.25,duration:6,target:'bones',haste:.25}),
   move('king_throne','Ngai Xương','summon',1,{units:['bone_giant'],once:true}),
   move('king_judge','Phán Quyết','circle',2,{radius:5,damage:40,effect:'curse',value:.25,duration:6,windup:1.6})]}
};
SPECIES.warden.name='Titan';SPECIES.lord.name='Ác Ma';
for(const d of Object.values(BOSS_POOL))if(!['warden','inferno'].includes(d.id))registerSpecies(d.species,'warden',{
 name:d.name,sprite:d.sprite,hp:d.hp,attack:d.attack,range:['summoner','controller'].includes(d.style)?5:2,
 magic:['summoner','controller','zoner'].includes(d.style),capacity:0,brain:90,role:d.style==='ambusher'?'ambusher':'tank',
 skills:[],passives:['P08','P04'],bossOnly:true,slots:4});
STATUS.curse={id:'curse',name:'Suy Nhược',symbol:'▽',bad:true,color:'#b8a4ce',description:'Giảm 25% sát thương trực tiếp trong thời hạn.'};
