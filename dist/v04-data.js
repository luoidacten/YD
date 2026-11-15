import {SPECIES,CARDS} from './data.js';
import {KITS} from './catalog.js';
import {ITEMS,FAVORITES} from './expansion.js';
import {NEW_MONSTERS,MONSTER_HIRES} from './arsenal-data.js';

export const EXTRA_WEAPONS=[
 ['W13','Kiếm Gỉ','weapon_rusty_sword',
  {reach:1.5,power:-.1,procEffect:'brittle',procDuration:2},
  'Sát thương −10%; làm giòn mục tiêu 2s để đồng đội khai thác (+15% sát thương nhận).'],
 ['W14','Kiếm Thường','weapon_regular_sword',{reach:1.5},'Vũ khí chuẩn, không đổi chỉ số.'],
 ['W15','Song Kiếm','weapon_duel_sword',
  {reach:1.5,attackSpeed:.3,power:-.15},'Tốc đánh +30%, sát thương −15%; duy trì áp lực và hiệu ứng trúng đòn.'],
 ['W16','Rìu Tay','weapon_axe',
  {reach:1.5,power:.15,effects:{armorPierce:.1}},'Sát thương +15%, xuyên giáp 10%; đối phó giáp nhẹ.'],
 ['W17','Đại Rìu Chiến','weapon_waraxe',
  {reach:1.9,power:.3,attackSpeed:-.25,effects:{sunder:.5}},'Đánh chậm, nặng; bào thêm 50% sát thương vào khiên.'],
 ['W18','Chùy','weapon_mace',
  {reach:1.5,procEffect:'stun',procDuration:.4,procChance:.15},'Mỗi đòn thường có 15% xác suất seeded gây choáng 0,4s.'],
 ['W19','Dao Phay','weapon_cleaver',
  {reach:1.5,attackSpeed:.1,procEffect:'bleed',procDuration:1},'Đánh nhanh +10%, gây chảy máu ngắn 1s.'],
 ['W20','Mã Tấu','weapon_machete',
  {reach:1.6,hamperedBonus:.35},'Đòn thường +35% sát thương khi mục tiêu đang chậm hoặc bị trói.'],
 ['W21','Kiếm Hoa Lệ','weapon_lavish_sword',
  {reach:1.5,power:.2,goldBonus:.25,rare:true},'Hiếm: sát thương +20%; vàng nhặt được +25% một lần mỗi món.'],
 ['W22','Kiếm Thần Tốc','weapon_anime_sword',
  {reach:2.2,attackSpeed:.1,comboEvery:3,rare:true},'Hiếm: mỗi đòn thường thứ ba nhận tăng tốc 20% trong 1,5s.']
];
for(const[id,name,art,stats,description]of EXTRA_WEAPONS){
 ITEMS[id]={id,name,art,slot:'weapon',description,...stats};
 CARDS.push({id,name,art,description,kind:'item',category:'VŨ KHÍ',cost:0,
  resource:'mana',tone:'gold',rare:!!stats.rare});
}

export const EXTRA_HEROES={
 shieldmaiden:{
  name:'Nữ Kỵ Sĩ',sprite:'knight_f',hp:120,attack:12,speed:2.1,range:1.4,capacity:7,
  magic:false,brain:75,role:'tank',weapon:'W14',charms:['guardian','camaraderie'],
  skills:['C01','B10','H06','S01'],passives:['P41','P01']
 },
 dwarfMiner:{
  name:'Thợ Mỏ Người Lùn',sprite:'dwarf_m',hp:95,attack:13,speed:2,range:1.4,capacity:9,
  magic:false,mana:45,brain:80,role:'scout',weapon:'W16',trapExpert:true,
  charms:['CH03','CH10'],skills:['SK57','SK52','B06','C04'],passives:['P07','PS56']
 },
 dwarfSmith:{
  name:'Thợ Rèn Người Lùn',sprite:'dwarf_f',hp:105,attack:12,speed:1.9,range:1.4,capacity:8,
  magic:false,mana:75,brain:80,role:'support',weapon:'W18',charms:['camaraderie','CH19'],
  skills:['H01','B08','SK53','H04'],passives:['P32','PS54']
 },
 angelHerald:{
  name:'Sứ Giả Thiên Sứ',sprite:'angel',hp:85,attack:10,speed:2.3,range:5,capacity:8,
  magic:true,brain:90,role:'support',weapon:'W06',charms:['camaraderie','CH34'],
  skills:['H01','H02','SK56','H04'],passives:['PS55','P32']
 }
};
const monsters={
 iceZombie:{
  name:'Xác Sống Băng',sprite:'ice_zombie',animation:'single',hp:135,attack:12,
  speed:1.45,range:1.4,capacity:0,magic:false,brain:24,role:'skirmisher',
  innateEffect:'slow',innateValue:.25,skills:['C02','B03','S03','C09'],
  passives:['P01','P07'],rooms:['grave','icehall']
 },
 muddy:{
  name:'Bùn Hộ Vệ',sprite:'muddy',animation:'single',hp:165,attack:10,
  speed:1.5,range:1.4,capacity:0,magic:false,brain:30,role:'tank',slots:1,
  skills:['C01','B04','B03','C03'],passives:['P01','P22'],rooms:['guard','herbgarden']
 },
 swampy:{
  name:'Đầm Lầy Độc',sprite:'swampy',animation:'single',hp:95,attack:11,
  speed:1.9,range:1.4,capacity:0,magic:false,brain:44,role:'skirmisher',innateEffect:'poison',
  skills:['S05','A05','B05','C02'],passives:['P03','P07'],rooms:['poisonpool','grave']
 },
 pumpkin:{
  name:'Quỷ Bí Ngô',sprite:'pumpkin_dude',hp:75,attack:15,speed:2.1,range:1.4,
  capacity:0,magic:false,brain:48,role:'ambusher',eventMonster:true,
  skills:['S10','A08','C08','B01'],passives:['P17','P03'],rooms:['mimic','darkaltar']
 }
};
export const EXTRA_MONSTERS=monsters;
for(const[id,d]of Object.entries({...EXTRA_HEROES,...monsters})){
 SPECIES[id]={...d};KITS[id]={role:d.role,skills:d.skills,passives:d.passives};
 if(monsters[id]){
  NEW_MONSTERS[id]=d;MONSTER_HIRES.push(id);FAVORITES[id]=d.rooms;
  CARDS.push({id:'contract-'+id,species:id,kind:'creature',name:d.name,
   category:d.eventMonster?'HỢP ĐỒNG SỰ KIỆN':'HỢP ĐỒNG',cost:35,resource:'mana',
   art:d.sprite+(d.animation==='single'?'_anim_f0':'_idle_anim_f0'),
   description:d.eventMonster?'Hiếm ở Chợ phiên; nổ một lần khi gục, gây hại cả hai phe.':
    `${d.hp} HP · ${d.role} · Giữ phòng được phân công`,tone:'green'});
 }
}
