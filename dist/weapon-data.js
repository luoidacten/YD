import {SPECIES} from './data.js';
import {ITEMS} from './expansion.js';
import {registerWeapon} from './bestiary-data.js';

export const FAMILY_TECHNIQUE={blade:'B03',katana:'S10',axe:'S02',blunt:'C03',polearm:'C09',
 bow:'S04',crossbow:'S04',gun:'S04',thrown:'S03',bomb:'SK55',shield:'B04',staff:'A01',wand:'C04',holy:'H06',exotic:'C10'};
const families=['bow','bow','thrown','thrown','staff','staff','axe','katana','blunt','polearm','blade','blunt',
 'blade','blade','blade','axe','axe','blunt','blade','blade','blade','blade','crossbow','polearm','polearm','blunt',
 'wand','staff','blade','axe'];
for(let n=1;n<=30;n++){
 const d=ITEMS['W'+String(n).padStart(2,'0')],family=families[n-1];
 Object.assign(d,{family,hands:['bow','crossbow','staff','polearm'].includes(family)?2:1,
  req:{brain:['staff','wand'].includes(family)?35:family==='crossbow'?35:15,technique:45},
  strict:false,technique:FAMILY_TECHNIQUE[family]});
}
for(const[id,family]of Object.entries({I01:'blade',I02:'blade',I03:'bow',I04:'crossbow',I05:'staff',I06:'staff'}))
 Object.assign(ITEMS[id],{family,hands:['bow','crossbow','staff'].includes(family)?2:1,
  req:{brain:family==='staff'?35:15,technique:45},strict:false,technique:FAMILY_TECHNIQUE[family]});
export const NEW_WEAPONS=[
 ['W31','Cung Ma Thuật','magic_bow','bow',2,55,65,{reach:7,power:.15,projectile:'curse',magic:true}],
 ['W32','Khiên Tròn','shield_round','shield',1,10,30,{slot:'offhand',shieldBlock:.5,armor:.1}],
 ['W33','Khiên Tháp','shield_tower','shield',1,20,40,{slot:'offhand',shieldBlock:.75,speed:-.1}],
 ['W34','Kích','halberd','polearm',2,30,50,{reach:3,power:.2,attackSpeed:-.1}],
 ['W35','Bom Đen',null,'bomb',1,25,45,{slot:null,kind:'bomb',charges:3,channel:.4,reach:6}],
 ['W36','Bom Lửa','fire_bomb','bomb',1,35,55,{slot:null,kind:'bomb',charges:2,channel:.5,reach:6,fireBomb:true}],
 ['W37','Phi Tiêu Sao','shuriken','thrown',1,40,60,{reach:5,attackSpeed:.25,projectile:'knife'}],
 ['W38','Kunai','kunai','thrown',1,35,55,{reach:4.5,hitEffect:'bleed',projectile:'knife'}],
 ['W39','Súng Hỏa Mai Ngắn','pistol','gun',1,50,65,{reach:6,power:.4,projectile:'bullet',reload:1.2,strict:true}],
 ['W40','Súng Trường Hỏa Mai','musket','gun',2,60,75,{reach:9,power:.7,projectile:'bullet',reload:1.8,strict:true}],
 ['W41','Súng Loa Kèn','blunderbuss','gun',2,45,60,{reach:4,power:.55,projectile:'bullet',reload:1.6,strict:true,technique:'A07'}],
 ['W42','Đại Pháo Tay','hand_cannon','gun',2,55,70,{reach:6,power:.8,projectile:'bullet',reload:2,strict:true}],
 ['W43','Đại Kiếm','greatsword','blade',2,20,40,{reach:2,power:.35,attackSpeed:-.2}],
 ['W44','Kiếm Liễu','rapier','blade',1,45,60,{reach:1.8,effects:{armorPierce:.2}}],
 ['W45','Lưỡi Liềm','kama','exotic',1,35,55,{reach:1.5,hitEffect:'bleed',technique:'S07'}],
 ['W46','Vòng Phi','chakram','thrown',1,50,65,{reach:5.5,projectile:'knife'}],
 ['W47','Roi Da','whip','exotic',1,40,60,{reach:3,technique:'C10'}],
 ['W48','Thánh Thư','holy_tome','holy',1,60,70,{reach:5,projectile:'holy',strict:true,healing:.15}],
 ['W49','Trượng Thánh','holy_staff','holy',2,45,60,{reach:5.5,projectile:'holy',healing:.2}],
 ['W50','Quạt Chiến','war_fan','exotic',1,55,70,{reach:2,power:.1,technique:'C09'}],
 ['W51','Côn Nhị Khúc','nunchaku','exotic',1,45,65,{reach:1.5,attackSpeed:.3,technique:'S03'}],
 ['W52','Nỏ Liên Châu','repeating_crossbow','crossbow',2,55,70,{reach:7,attackSpeed:.15,projectile:'arrow',strict:true}],
 ['W53','Chùy Thánh','holy_mace','blunt',1,25,45,{reach:1.6,power:.15,technique:'H06'}]
];
for(const[id,name,art,family,hands,brain,technique,stats]of NEW_WEAPONS){
 registerWeapon(id,name,art?'yd/weapons/weapon_'+art:'bomb_f0',{
  family,hands,req:{brain,technique},strict:false,technique:FAMILY_TECHNIQUE[family],...stats},
  `${family} · Trí khôn ${brain} · Kỹ thuật ${technique} · ${stats.slot==='offhand'?'Tay phụ':hands+' tay'}`);
}
export const PROFICIENCY={
 ninja:{blade:2,exotic:2,katana:3,thrown:3,gun:0,holy:0,shield:0},
 paladin:{blade:2,blunt:2,shield:3,holy:3,gun:0,thrown:0},
 priestess:{staff:2,holy:3,blade:0,axe:0,gun:0,bomb:0},
 nun:{holy:2,blunt:2,exotic:3,gun:0,bomb:0},
 berserker:{blade:2,shield:2,axe:3,blunt:3,bow:0,crossbow:0,holy:0,staff:0},
 knight:{polearm:2,blunt:2,blade:3,shield:3,gun:0},
 arcaneArcher:{thrown:2,staff:2,bow:3,blunt:0,axe:0,shield:0},
 crossbowman:{gun:2,bomb:2,crossbow:3,holy:0,staff:0},
 archer:{bow:3,crossbow:2,thrown:2},rogue:{blade:2,thrown:2,katana:2,exotic:2},
 assassin:{blade:3,katana:3,thrown:2},mage:{staff:3,wand:2},priest:{holy:3,staff:2},
 frost_mage:{staff:3,wand:2},pyromancer:{staff:3,bomb:2},
 dwarfMiner:{axe:3,blunt:2,gun:2},dwarfSmith:{blunt:3,axe:2,gun:2},
 shieldmaiden:{blade:3,shield:3,polearm:2},angelHerald:{holy:3,staff:2}
};
export const ROLE_PROFICIENCY={tank:{blade:2,blunt:2,polearm:2,shield:2},
 skirmisher:{blade:2,axe:2,thrown:2},ambusher:{katana:2,blade:2,thrown:2},
 ranged:{bow:2,crossbow:2,staff:2,wand:2},support:{staff:2,wand:2,holy:2}};
SPECIES.zombie.brain=16;SPECIES.slime.brain=8;
