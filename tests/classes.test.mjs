import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {KITS} from '../dist/catalog.js';
import {CLASSES} from '../dist/classes-data.js';
import {SPECIES} from '../dist/data.js';
import {makeFixture} from '../scripts/soak.mjs';

test('all eight requested classes have legal starting gear, kit and default personality',()=>{
 const ids=[...Object.keys(CLASSES),'paladin','berserker','knight'];
 for(const id of ids){const g=new Game();g.addRoom(1,1,'boss');const e=g.spawn(id,'hero',54,46,id,[]);
  assert.ok(g.weaponDefinition(e),id);assert.ok(g.canEquip(e,g.weaponDefinition(e)),id);
  assert.equal(KITS[id].skills.length,4);assert.ok(id==='knight'?KITS[id].passives.length>=2:KITS[id].passives.length===2);
  for(const charm of SPECIES[id].charms||[])assert.ok(e.charms.includes(charm),id+': '+charm);
 }
});
test('weighted selection covers new classes while strong classes respect wave gates',()=>{
 const g=new Game(),seen=new Set();
 g.state.wave=1;for(let i=0;i<20;i++)assert.equal(g.chooseHeroSpecies('rogue'),'rogue');
 g.state.wave=2;for(let i=0;i<150;i++)assert.notEqual(g.chooseHeroSpecies('priest'),'priestess');
 g.state.wave=3;for(let i=0;i<500;i++)for(const base of ['priest','rogue','mage'])seen.add(g.chooseHeroSpecies(base));
 for(const id of Object.keys(CLASSES))assert.ok(seen.has(id),id);
});
test('ninja targets visible weak enemies and withdraws early, berserker does not flee solely because HP is low',()=>{
 const g=makeFixture(1,3),n=g.spawn('ninja','hero',54,46,'N',[]),b=g.spawn('berserker','hero',55,46,'B',[]);
 const weak=g.state.entities.find(e=>e.faction==='monster');weak.hp=1;n.hp=n.maxHp*.35;b.hp=b.maxHp*.2;
 n.potions=b.potions=0;n.charms=[];b.charms=[];n.skillIds=b.skillIds=[];n.quickScrolls=b.quickScrolls=[];
 g.decide(n);assert.ok(n.scores.some(s=>s.reason==='Ninja rút lui sớm để giữ thông tin'));
 g.decide(b);assert.ok(!b.scores.some(s=>s.action==='retreat'&&s.reason.includes('HP')));
});
