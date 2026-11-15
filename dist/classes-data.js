import {SPECIES} from './data.js';
import {registerSpecies} from './bestiary-data.js';
import './weapon-data.js';
export const CLASSES={
 ninja:['rogue',{name:'Ninja',sprite:'yd/chars/ninja',brain:70,mana:55,weapon:'W37',role:'scout',
  charms:['fearful','CH03'],skills:['B07','S10','S09','B02'],passives:['P43','P05']}],
 priestess:['priest',{name:'Nữ Tư Tế',sprite:'yd/chars/priestess',brain:75,mana:120,weapon:'W49',role:'support',
  charms:['camaraderie','CH34'],skills:['H01','H05','H04','H09'],passives:['PS55','P32']}],
 nun:['knight',{name:'Nữ Tu Võ Tăng',sprite:'yd/chars/nun',brain:60,mana:60,weapon:'W51',role:'skirmisher',
  charms:['guardian','CH10'],skills:['S03','C03','H07','H06'],passives:['P08','P06']}],
 arcaneArcher:['archer',{name:'Cung Thủ Ma Thuật',sprite:'yd/chars/arcane_archer',brain:72,mana:100,magic:true,
  weapon:'W31',role:'ranged',charms:['CH03','camaraderie'],skills:['S04','C04','A04','H09'],passives:['P42','P32']}],
 crossbowman:['archer',{name:'Nỏ Thủ',sprite:'yd/chars/crossbowman',brain:62,mana:60,weapon:'W52',role:'ranged',
  charms:['camaraderie','CH10'],skills:['S04','B06','C04','H09'],passives:['P42','P07']}]
};
for(const[id,[base,d]]of Object.entries(CLASSES))registerSpecies(id,base,d);
SPECIES.paladin.weapon='W53';SPECIES.berserker.weapon='W43';
SPECIES.knight.eliteSprite='yd/chars/knight_errant';
