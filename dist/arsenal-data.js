import {SPECIES,CARDS} from './data.js';
import {KITS} from './catalog.js';
import {ITEMS,FAVORITES,PACKS} from './expansion.js';

// Every body/weapon below uses an unchanged frame from the same 0x72 v1.7 pack.
export const NEW_MONSTERS={
 imp:{name:'Tiểu Quỷ Ném Lửa',sprite:'imp',hp:55,attack:12,speed:2.7,range:4.5,capacity:5,magic:true,brain:42,role:'ranged',skills:['S06','A01','B02','C06'],passives:['P07','P03'],rooms:['darkaltar','mana'],weapon:'W05'},
 chort:{name:'Quỷ Sừng',sprite:'chort',hp:155,attack:18,speed:2.1,range:1.5,capacity:6,magic:false,brain:45,role:'tank',skills:['C01','B03','A03','S08'],passives:['P01','P41'],rooms:['barracks','guard'],weapon:'W09'},
 wogol:{name:'Quỷ Wogol',sprite:'wogol',hp:115,attack:16,speed:2.7,range:1.4,capacity:6,magic:false,brain:58,role:'skirmisher',skills:['S09','B02','S07','C03'],passives:['P03','P17'],rooms:['darkaltar','spyroom'],weapon:'W08'},
 orc:{name:'Orc Chiến Binh',sprite:'orc_warrior',hp:145,attack:17,speed:1.9,range:1.5,capacity:6,magic:false,brain:48,role:'tank',skills:['C01','B01','S08','A07'],passives:['P01','P41'],rooms:['forge','barracks'],weapon:'W07'},
 orcShaman:{name:'Orc Tế Sư',sprite:'orc_shaman',hp:100,attack:11,speed:2,range:5,capacity:6,magic:true,brain:78,role:'support',skills:['H01','B08','H04','A05'],passives:['P32','P07'],rooms:['mana','darkaltar'],weapon:'W06'},
 maskedOrc:{name:'Orc Đao Phủ',sprite:'masked_orc',hp:135,attack:22,speed:1.8,range:1.6,capacity:6,magic:false,brain:62,role:'skirmisher',skills:['S09','S08','B03','C07'],passives:['P03','P41'],rooms:['forge','stonevault'],weapon:'W09'},
 lizard:{name:'Thằn Lằn Giáo Thủ',sprite:'lizard_m',hp:90,attack:13,speed:2.5,range:1.4,capacity:6,magic:false,brain:67,role:'tank',skills:['C01','S02','C09','B03'],passives:['P41','P07'],rooms:['guard','webnest'],weapon:'W10'},
 lizardArcher:{name:'Thằn Lằn Xạ Thủ',sprite:'lizard_f',hp:70,attack:11,speed:2.5,range:1.25,capacity:6,magic:false,brain:75,role:'ranged',skills:['S04','C04','B02','C06'],passives:['P07','P17'],rooms:['barracks','spyroom'],weapon:'W02'},
 zombie:{name:'Xác Sống',sprite:'tiny_zombie',hp:110,attack:10,speed:1.6,range:1.3,capacity:0,magic:false,brain:16,role:'skirmisher',skills:['S05','B05','S03','C03'],passives:['P01','P03'],rooms:['grave','poisonpool']},
 brute:{name:'Thi Khổng Lồ',sprite:'big_zombie',hp:240,attack:20,speed:1.3,range:1.7,capacity:0,magic:false,brain:22,role:'tank',skills:['C01','A03','B03','C09'],passives:['P01','P41'],rooms:['grave','stonevault'],slots:2,size:1.8}
};
for(const[id,d]of Object.entries(NEW_MONSTERS)){
 SPECIES[id]={...d};KITS[id]={role:d.role,skills:d.skills,passives:d.passives};FAVORITES[id]=d.rooms;
 CARDS.push({id:'contract-'+id,species:id,kind:'creature',name:d.name,category:'HỢP ĐỒNG',cost:35,resource:'mana',art:d.sprite+'_idle_anim_f0',description:`${d.role==='ranged'?'Tầm xa':d.role==='support'?'Hỗ trợ':'Cận chiến'} · ${d.hp} HP · Trí khôn nền ${d.brain}`,tone:d.magic?'violet':'green'});
}
SPECIES.archer={name:'Cung Thủ',sprite:'elf_f',hp:72,attack:12,speed:2.4,range:1.25,capacity:7,magic:false,brain:70,weapon:'W01'};
KITS.archer={role:'ranged',skills:['S04','C04','B02','C06'],passives:['P07','P17']};
export const MONSTER_HIRES=['goblin','skeleton','slime','shaman','mimic',...Object.keys(NEW_MONSTERS)];
const weapons=[
 ['W01','Trường Cung','weapon_bow',{reach:7,power:.08,attackSpeed:-.15,projectile:'arrow'},'Bắn xa 7 ô, nhịp chậm, cần đường bắn.'],
 ['W02','Đoản Cung','weapon_bow_2',{reach:5,attackSpeed:.25,power:-.1,projectile:'arrow'},'Bắn nhanh, tầm 5; đổi sát thương lấy cơ động.'],
 ['W03','Rìu Ném','weapon_throwing_axe',{reach:4.5,power:.2,attackSpeed:-.2,projectile:'axe'},'Rìu xoay tầm 4,5; sát thương cao, chậm.'],
 ['W04','Dao Phi','weapon_knife',{reach:4,power:-.12,attackSpeed:.35,projectile:'knife'},'Ném nhanh trong 4 ô; thích hợp đánh rồi lùi.'],
 ['W05','Trượng Hỏa Cầu','weapon_red_magic_staff',{reach:6,power:.15,burn:.2,projectile:'fire',hitEffect:'burn',hitValue:1},'Tầm 6, gây bỏng 2 giây; tốc độ vừa.'],
 ['W06','Trượng Băng','weapon_green_magic_staff',{reach:6,power:-.1,projectile:'frost',hitEffect:'slow',hitValue:.25},'Tầm 6; làm chậm 25% trong 2 giây.'],
 ['W07','Song Rìu','weapon_double_axe',{reach:1.6,power:.3,attackSpeed:-.2},'Hai lưỡi nặng: sát thương +30%, tốc đánh −20%.'],
 ['W08','Katana','weapon_katana',{reach:1.8,power:.12,attackSpeed:.15},'Cận chiến nhanh, tầm 1,8.'],
 ['W09','Chùy Gai','weapon_baton_with_spikes',{reach:1.7,power:.25,attackSpeed:-.15,effects:{armorPierce:.15}},'Phá giáp 15%, đánh chậm và nặng.'],
 ['W10','Trường Giáo','weapon_spear',{reach:2.8,power:.05,attackSpeed:-.05},'Đâm từ hàng hai ở tầm 2,8.'],
 ['W11','Kiếm Răng Cưa','weapon_saw_sword',{reach:1.6,power:.1,hitEffect:'bleed',hitValue:1},'Đòn thường gây chảy máu 2 giây.'],
 ['W12','Búa Chiến','weapon_hammer',{reach:1.5,power:.35,attackSpeed:-.3},'Sát thương +35%, tốc đánh −30%.']
];
for(const[id,name,art,stats,description]of weapons){
 ITEMS[id]={id,name,art,slot:'weapon',description,...stats};
 CARDS.push({id,kind:'item',name,category:'VŨ KHÍ',cost:0,resource:'mana',art,description,tone:'gold'});
}

PACKS.armory={name:'Gói Vũ Khí',cost:90,count:3,picks:1,description:'Lật 3 vũ khí cận chiến hoặc tầm xa, giữ 1.'};
