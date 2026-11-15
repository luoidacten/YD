import {SPECIES,CARDS} from './data.js';
import {KITS} from './catalog.js';
import {ITEMS,FAVORITES} from './expansion.js';
import {NEW_MONSTERS,MONSTER_HIRES} from './arsenal-data.js';
import './v04-data.js';

export function registerSpecies(id,base,definition,monster=false){
 const d={...SPECIES[base],...definition};
 SPECIES[id]=d;KITS[id]={role:d.role,skills:d.skills,passives:d.passives};
 if(!monster)return;
 NEW_MONSTERS[id]=d;if(!MONSTER_HIRES.includes(id))MONSTER_HIRES.push(id);FAVORITES[id]=d.rooms;
 CARDS.push({id:'contract-'+id,species:id,name:d.name,kind:'creature',category:'HỢP ĐỒNG',
  rare:!!d.rare,cost:d.summonCost||35,resource:'mana',art:d.sprite+'_idle_anim_f0',tone:'green',
  description:`${d.hp} HP · ${d.slots||1} ô quân · ${d.role} · Trí khôn ${d.brain}`});
}
export function registerWeapon(id,name,art,stats,description){
 ITEMS[id]={id,name,art,slot:'weapon',...stats,description};
 CARDS.push({id,name,art,description,kind:'item',category:stats.slot==='offhand'?'KHIÊN':'VŨ KHÍ',
  cost:0,resource:'mana',tone:'gold',rare:!!stats.rare});
}
export const ART_HEROES={
 paladin:['knight',{name:'Thánh Kỵ Sĩ',sprite:'yd/chars/paladin',hp:118,attack:12,brain:55,mana:75,
  weapon:'W14',role:'tank',charms:['guardian','camaraderie'],skills:['C01','H01','H06','B10'],passives:['P41','P34']}],
 assassin:['rogue',{name:'Sát Thủ',sprite:'yd/chars/assassin',brain:76,mana:45,weapon:'W08',role:'scout',
  charms:['fearful','CH03'],skills:['B07','S10','S09','B02'],passives:['P43','P05']}],
 frost_mage:['mage',{name:'Pháp Sư Băng',sprite:'yd/chars/frost_mage',brain:76,weapon:'W28',role:'ranged',
  innateEffect:'slow',innateValue:.2,skills:['C02','A04','B04','H09'],passives:['P02','P32']}],
 pyromancer:['mage',{name:'Pháp Sư Lửa',sprite:'yd/chars/pyromancer',brain:74,weapon:'W05',role:'ranged',
  innateEffect:'burn',skills:['A01','A08','S06','H09'],passives:['P12','P32']}],
 berserker:['knight',{name:'Cuồng Chiến Binh',sprite:'yd/chars/berserker',brain:30,attack:17,weapon:'W07',
  role:'tank',charms:['violent','proud'],skills:['B01','S08','A07','C01'],passives:['P23','P40']}]
};
export const ART_MONSTERS={
 dark_knight:['warden',{name:'Hắc Kỵ Sĩ',sprite:'yd/chars/dark_knight',hp:210,attack:19,speed:1.7,
  brain:75,slots:2,capacity:6,role:'tank',weapon:'W24',rooms:['boss','guard'],hireCost:150,
  skills:['C01','B03','S08','C08'],passives:['P04','P41']}],
 goblin_king:['goblin',{name:'Vua Goblin',sprite:'yd/chars/goblin_king',hp:150,attack:16,brain:92,
  slots:2,capacity:6,mana:80,role:'support',weapon:'W29',rooms:['barracks','guard'],hireCost:190,summonCost:90,rare:true,
  skills:['B08','B09','C01','S01'],passives:['P34','P49']}],
 skeleton_king:['skeleton',{name:'Vua Xương',sprite:'yd/chars/skeleton_king',hp:175,attack:15,brain:85,
  slots:2,capacity:6,mana:90,role:'support',weapon:'W27',rooms:['grave','darkaltar'],hireCost:190,summonCost:90,rare:true,
  skills:['H05','B04','C04','H09'],passives:['P32','P34']}],
 ghost:['goblin',{name:'Bóng Ma',sprite:'yd/monsters/ghost',hp:50,attack:8,brain:40,mana:35,capacity:4,
  role:'ambusher',rooms:['grave','darkaltar'],skills:['B07','S10','C06','B02'],passives:['P38','P05']}],
 bat:['goblin',{name:'Dơi',sprite:'yd/monsters/bat',hp:38,attack:8,speed:3.2,brain:22,slots:1,capacity:2,
  role:'skirmisher',rooms:['spyroom','grave'],skills:['S10','C06','S03','B03'],passives:['P05','P24']}],
 fire_elemental:['shaman',{name:'Tinh Linh Lửa',sprite:'yd/monsters/fire_elemental',hp:90,attack:12,
  brain:60,range:5,capacity:5,magic:true,role:'ranged',weapon:'W05',innateEffect:'burn',rooms:['forge','darkaltar'],
  skills:['A01','S06','B04','H09'],passives:['P12','P32']}],
 eyeball:['shaman',{name:'Nhãn Quái',sprite:'yd/monsters/eyeball',hp:50,attack:6,brain:82,range:5,
  capacity:4,magic:true,role:'ranged',rooms:['oracle','spyroom'],skills:['B06','C04','C06','H09'],passives:['P07','P36']}],
 mushroom:['goblin',{name:'Nấm Độc',sprite:'yd/monsters/mushroom',hp:85,attack:9,brain:30,mana:35,
  capacity:3,role:'skirmisher',innateEffect:'poison',rooms:['poisonpool','herbgarden'],
  skills:['S05','A05','B03','C02'],passives:['P09','P37']}],
 spider:['goblin',{name:'Nhện Hang',sprite:'yd/monsters/spider',hp:60,attack:9,brain:38,capacity:3,
  speed:2.6,role:'skirmisher',innateEffect:'slow',innateValue:.2,rooms:['webnest'],
  skills:['C02','S05','S10','B03'],passives:['P15','P05']}],
 rock_golem:['warden',{name:'Thạch Nhân',sprite:'yd/monsters/rock_golem',hp:230,attack:18,brain:28,
  speed:1.2,slots:2,capacity:4,role:'tank',rooms:['stonevault','guard'],
  skills:['B03','C01','A03','C09'],passives:['P04','P22']}],
 cube_slime:['goblin',{name:'Slime Khối',sprite:'yd/monsters/cube_slime',hp:190,attack:10,brain:18,
  speed:1.3,capacity:2,role:'tank',rooms:['poisonpool','guard'],
  skills:['B03','S05','C09','C01'],passives:['P01','P21']}]
};
for(const[id,[base,d]]of Object.entries(ART_HEROES))registerSpecies(id,base,d);
for(const[id,[base,d]]of Object.entries(ART_MONSTERS))registerSpecies(id,base,d,true);
export const ART_WEAPONS=[
 ['W23','Nỏ','crossbow',{reach:6,power:.2,attackSpeed:-.3,projectile:'arrow'},'Nỏ nặng, bắn chậm ở tầm 6.'],
 ['W24','Lưỡi Hái','scythe',{reach:2.2,power:.2,hitEffect:'bleed'},'Tầm 2,2; chảy máu 2s.'],
 ['W25','Đinh Ba','trident',{reach:2.6,hitEffect:'slow',hitValue:.15},'Giữ hàng hai; làm chậm 15%.'],
 ['W26','Chùy Xích','flail',{reach:1.7,attackSpeed:-.2,effects:{armorPierce:.2}},'Xuyên giáp 20%, nhịp chậm.'],
 ['W27','Đũa Xương','bone_wand',{reach:5,projectile:'curse',hitEffect:'mark',hitValue:.15},'Đánh dấu mục tiêu; tầm 5.'],
 ['W28','Trượng Pha Lê','crystal_staff',{reach:6,projectile:'frost',hitEffect:'slow',hitValue:.2},'Băng làm chậm; tầm 6.'],
 ['W29','Mã Tấu Cong','scimitar',{reach:1.6,attackSpeed:.2},'Nhịp nhanh +20%; tầm 1,6.'],
 ['W30','Cuốc Chiến','war_pick',{reach:1.5,power:.1,effects:{armorPierce:.3}},'Xuyên giáp 30%, sát thương +10%.']
];
for(const[id,name,art,stats,description]of ART_WEAPONS)
 registerWeapon(id,name,'yd/weapons/weapon_'+art,stats,description);
export const FX_KINDS=['fireball','frost','lightning','heal','poison','shield','curse','holy'];
