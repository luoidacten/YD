import {SPECIES} from './data.js';
import {registerSpecies} from './bestiary-data.js';
import {PROFICIENCY} from './weapon-data.js';
import './boss-data.js';
export const BONE_SPECIES={
 skeleton_archer:{name:'Cung Thủ Xương',hp:72,attack:10,brain:30,role:'ranged',weapon:'W01',capacity:5,
  skills:['S04','B06','C04','H09'],passives:['P42','P07'],rooms:['grave','guard']},
 skeleton_mage:{name:'Pháp Sư Xương',hp:68,attack:10,brain:55,role:'support',weapon:'W28',capacity:5,mana:90,magic:true,
  skills:['C02','C04','B04','H09'],passives:['P32','P02'],rooms:['grave','darkaltar']},
 skeleton_guard:{name:'Vệ Binh Xương',hp:105,attack:10,brain:25,role:'tank',weapon:'W14',offhand:'W32',capacity:6,
  skills:['C01','B03','S08','H06'],passives:['P04','P41'],rooms:['guard','barracks']},
 skeleton_knight:{name:'Kỵ Sĩ Xương',hp:155,attack:16,brain:40,slots:2,role:'tank',weapon:'W43',capacity:6,hireCost:110,
  skills:['S08','C01','B03','C09'],passives:['P04','P22'],rooms:['guard','boss']},
 ember_skeleton:{name:'Xương Lửa',hp:68,attack:12,brain:15,role:'skirmisher',capacity:0,innateEffect:'burn',
  skills:['S06','B01','S03','C09'],passives:['P12','P05'],rooms:['forge']},
 bone_hound:{name:'Chó Săn Xương',hp:58,attack:10,brain:20,role:'skirmisher',capacity:0,speed:2.9,innateEffect:'bleed',
  skills:['S07','S10','B01','C09'],passives:['P05','P15'],rooms:['grave']},
 bone_giant:{name:'Khổng Lồ Xương',hp:250,attack:19,brain:15,slots:3,role:'tank',capacity:0,speed:1.4,hireCost:140,
  skills:['A03','C01','B03','C09'],passives:['P04','P01'],rooms:['grave','boss']}
};
for(const[id,d]of Object.entries(BONE_SPECIES))registerSpecies(id,'skeleton',{
 ...d,sprite:'yd/monsters/'+id,family:'bone',undead:true,immune:['poison','bleed']},true);
for(const id of ['skeleton','skeleton_king','bone_king'])Object.assign(SPECIES[id],{
 family:'bone',undead:true,immune:['poison','bleed']});
Object.assign(PROFICIENCY,{skeleton_archer:{bow:2,crossbow:1},skeleton_mage:{staff:2,wand:2},
 skeleton_guard:{blade:2,shield:2},skeleton_knight:{blade:3,polearm:2}});
