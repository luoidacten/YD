import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {makeFixture} from '../scripts/soak.mjs';
function fixture(id){const g=new Game(),r=g.addRoom(1,1,'guard');g.state.props=[];g.rebuild();
 const owner=g.spawn(id,'hero',54,46,id,[]),pet=g.state.entities.find(e=>e.ownerId===owner.id);return{g,r,owner,pet}}
test('companions preserve owner ID through save, cannot loot or join squads, and do not report as adventurers',()=>{
 const {g,owner,pet}=fixture('beastmaster');assert.equal(pet.species,'wolf_pet');assert.equal(pet.maxHp,60);
 const item=g.createItem('IT21');assert.equal(g.transfer(item,pet),false);assert.equal(g.escape(pet),false);
 assert.equal(pet.squadId,null);assert.equal(g.isAdventurer(pet),false);assert.equal(g.isAdventurer(owner),true);
 const loaded=new Game(JSON.parse(g.serialize()));assert.equal(loaded.entity(pet.id).ownerId,owner.id);
 assert.equal(loaded.state.entities.filter(e=>e.ownerId===owner.id).length,1);
});
test('a living pet cannot keep a finished expedition alive or earn a guild report',()=>{
 const g=makeFixture(1),result=g.start();assert.ok(result.ok);g.state.encounter.spawnQueue=[];g.state.encounter.reinforcements=[];
 const owner=g.spawn('beastmaster','hero',18,46,'Owner',[]),pet=g.state.entities.find(e=>e.ownerId===owner.id);
 owner.status='dead';g.tick(1/30);assert.equal(g.state.phase,'result');assert.ok(!g.state.reports.some(r=>r.species==='wolf_pet'));
 assert.ok(pet.ownerId);
});
test('wolf follows its owner, attacks the owner target, guards a downed owner then leaves after ten seconds',()=>{
 const {g,owner,pet}=fixture('beastmaster');pet.x=49;pet.y=46;const x=pet.x;
 for(let i=0;i<60;i++){g.state.time+=1/30;g.act(pet,1/30)}assert.ok(pet.x>x);
 const m=g.spawn('goblin','monster',55,46,'Enemy',[]);owner.target=m.id;pet.x=54.5;pet.y=46;const hp=m.hp;
 g.act(pet,1/30);assert.ok(m.hp<hp);owner.status='downed';g.act(pet,1/30);assert.equal(pet.action,'guard');
 g.state.time+=10.1;g.act(pet,1/30);assert.equal(pet.status,'escaped');
});
test('hawk shares radius-six snapshots and known traps without revealing another floor or distant enemy',()=>{
 const {g,owner,pet}=fixture('hunter'),near=g.spawn('gargoyle','monster',57,46,'Hidden',[]),
  far=g.spawn('gargoyle','monster',65,46,'Far',[]),other=g.spawn('gargoyle','monster',55,46,'Other',[],{floorId:1});
 near.concealed=far.concealed=other.concealed=true;
 g.state.traps.push({id:'near',x:55,y:46,floorId:0},{id:'far',x:65,y:46,floorId:0},{id:'other',x:55,y:46,floorId:1});
 g.hawkReveal(owner);assert.ok(owner.knownTraps.includes('near'));assert.equal(owner.knownTraps.length,1);
 assert.equal(owner.seen[near.id].source,'hawk');assert.ok(!owner.seen[far.id]&&!owner.seen[other.id]);
 assert.equal(near.concealed,false);assert.ok(far.concealed&&other.concealed);const hp=near.hp;
 owner.target=near.id;g.act(pet,1/30);assert.equal(near.hp,hp);
});
test('druid bear form preserves HP ratio, species and save, suppresses spells and ends after ten seconds',()=>{
 const {g,owner}=fixture('druid'),max=owner.maxHp;owner.hp=max*.4;
 assert.ok(g.setBearForm(owner,true));assert.equal(owner.maxHp,Math.round(max*1.6));assert.ok(Math.abs(owner.hp/owner.maxHp-.4)<.001);
 assert.equal(owner.species,'druid');assert.equal(g.range(owner),1.6);assert.equal(g.usesMagicAttack(owner),false);
 assert.deepEqual(g.activeSkills(owner),[]);assert.equal(g.castSkill(owner,'H03',owner.id),false);
 const saved=new Game(JSON.parse(g.serialize()));assert.equal(saved.entity(owner.id).bearForm,true);
 g.state.time=10;g.act(owner,0);assert.equal(owner.bearForm,false);assert.equal(owner.maxHp,max);assert.equal(owner.bearReadyAt,25);
});
test('new classes enter weighted main and reinforcement selection and hunter traps use shared construction',()=>{
 const g=new Game(),seen=new Set();g.state.wave=3;
 for(let i=0;i<500;i++)for(const base of ['knight','rogue','mage'])seen.add(g.chooseHeroSpecies(base));
 for(const id of ['beastmaster','hunter','druid'])assert.ok(seen.has(id));
 const f=fixture('hunter');f.owner.action='hunter-trap';f.owner.target={x:56,y:46,floorId:0};f.owner.lastDamaged=-100;
 for(let i=0;i<26;i++){f.g.state.time+=1/30;f.g.act(f.owner,1/30)}
 const trap=f.g.state.traps[0];assert.ok(trap.rootTrap);assert.equal(trap.affectsFaction,'monster');assert.ok(f.owner.knownTraps.includes(trap.id));
});
