import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game} from '../dist/simulation.js';
import {SPECIES,contains} from '../dist/data.js';
import {ITEMS} from '../dist/expansion.js';
import {KITS} from '../dist/catalog.js';
import {ART_HEROES,ART_MONSTERS,ART_WEAPONS,FX_KINDS} from '../dist/bestiary-data.js';
import {Painter} from '../dist/painter.js';
function fixture(){const g=new Game(),room=g.addRoom(1,1,'boss');g.state.props=[];g.rebuild();g.state.gold=10000;return{g,room}}

test('project bodies have full idle/run frames and every art hero has an existing four-skill kit',()=>{
 for(const [id,[,d]]of Object.entries({...ART_HEROES,...ART_MONSTERS})){
  for(const state of ['idle','run'])for(let f=0;f<4;f++)assert.ok(fs.existsSync(`dist/assets/frames/${d.sprite}_${state}_anim_f${f}.png`));
  assert.equal(KITS[id].skills.length,4);assert.equal(KITS[id].passives.length,2);
 }
});
test('W23–W30 equip through the existing ownership API at their declared reach',()=>{
 const {g}=fixture(),e=g.spawn('knight','hero',54,46,'test',[]);
 for(const [id]of ART_WEAPONS){const item=g.createItem(id,e);assert.ok(g.equipItem(e,item));assert.equal(g.range(e),ITEMS[id].reach)}
});
test('all project monsters can be hired, obey slots, and visually flying units cannot cross pits or walls',()=>{
 for(const id of Object.keys(ART_MONSTERS)){
  const {g,room}=fixture(),e=g.hire(room.id,id);assert.ok(e,id);assert.equal(g.unitSlots(e),SPECIES[id].slots||1);
  const tile={x:room.x+3,y:room.y,floorId:0};g.state.props.push({id:'pit',type:'pit',solid:true,...tile});g.rebuild();
  assert.equal(g.walkable(tile.x,tile.y,0,e),false);assert.equal(g.walkable(room.x+30,room.y,0,e),false);
  assert.ok(contains(room,e,1));
 }
});
test('art hero weighted selection preserves wave gates and kings charge their advertised hire price',()=>{
 const {g,room}=fixture();g.state.wave=1;for(let i=0;i<40;i++)assert.equal(g.chooseHeroSpecies('knight'),'knight');
 const seen=new Set();g.state.wave=3;for(let i=0;i<300;i++)for(const base of ['knight','rogue','mage'])seen.add(g.chooseHeroSpecies(base));
 for(const id of Object.keys(ART_HEROES))assert.ok(seen.has(id),id);
 const gold=g.state.gold;assert.ok(g.hire(room.id,'goblin_king'));assert.equal(gold-g.state.gold,190);
});
test('visual effects are transient, capped, and do not touch saved state or gameplay RNG',()=>{
 const {g}=fixture(),e=g.spawn('paladin','hero',54,46,'Paladin',[]),p=Object.create(Painter.prototype);
 const before=g.serialize();for(let i=0;i<60;i++)g.visualCue('heal',e);
 assert.equal(g.visualEvents.length,40);assert.equal(g.serialize(),before);
 for(const kind of FX_KINDS)assert.equal(p.fxSprite(kind).length,4);
 assert.equal(p.fxSprite('fire')[0],'yd/fx/fx_fireball_anim_f0');assert.equal(p.fxSprite('unknown'),null);
});
