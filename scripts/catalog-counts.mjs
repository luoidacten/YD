import '../dist/simulation.js';
import {SKILLS,PASSIVES,STATUS} from '../dist/catalog.js';
import {ITEMS,QUALITIES,VARIANTS,PACKS} from '../dist/expansion.js';
import {SPECIES,ROOMS,CHARMS} from '../dist/data.js';
export const catalogCounts={skills:Object.keys(SKILLS).length,passives:Object.keys(PASSIVES).length,
 effects:Object.keys(STATUS).length,charms:Object.keys(CHARMS).length,rooms:Object.keys(ROOMS).length,
 items:Object.keys(ITEMS).length,weapons:Object.values(ITEMS).filter(i=>i.slot==='weapon').length,
 species:Object.keys(SPECIES).length,qualities:QUALITIES.length,variants:Object.keys(VARIANTS).length,
 packs:Object.keys(PACKS).length};
if(process.argv[1]?.endsWith('catalog-counts.mjs'))console.log(JSON.stringify(catalogCounts,null,1));
