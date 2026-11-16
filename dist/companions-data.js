import {registerSpecies} from './bestiary-data.js';
import {PROFICIENCY} from './weapon-data.js';
export const COMPANION_CLASSES={
 beastmaster:['knight',{name:'Thuần Thú Sư',sprite:'yd/chars/beastmaster',brain:65,hp:95,mana:65,weapon:'W47',role:'skirmisher',
  charms:['camaraderie','fearful'],skills:['C09','B08','B01','H01'],passives:['P34','P05']}],
 druid:['mage',{name:'Druid',sprite:'yd/chars/druid',brain:80,hp:85,mana:110,weapon:'W28',role:'support',
  charms:['camaraderie','CH15'],skills:['C02','H03','H05','B04'],passives:['P32','P37']}],
 hunter:['archer',{name:'Thợ Săn',sprite:'yd/chars/hunter',brain:75,hp:80,mana:70,weapon:'W02',role:'ranged',
  charms:['CH03','CH10'],skills:['B06','C02','S04','SK57'],passives:['P07','P42']}]
};
for(const[id,[base,d]]of Object.entries(COMPANION_CLASSES))registerSpecies(id,base,d);
registerSpecies('wolf_pet','goblin',{name:'Sói Đồng Hành',sprite:'yd/monsters/wolf_pet',hp:60,attack:9,speed:3.4,
 brain:40,range:1.3,capacity:0,role:'companion',skills:[],passives:[],magic:false,weapon:null});
registerSpecies('hawk','goblin',{name:'Chim Ưng',sprite:'yd/monsters/hawk',hp:40,attack:0,speed:3.8,
 brain:60,range:0,capacity:0,role:'companion',skills:[],passives:[],magic:false,weapon:null});
Object.assign(PROFICIENCY,{beastmaster:{exotic:3,polearm:2,axe:2},druid:{staff:3,exotic:3},
 hunter:{bow:3,crossbow:3,blade:2,thrown:2}});
