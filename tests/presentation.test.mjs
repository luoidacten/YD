import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {Painter} from '../dist/painter.js';
import {bossPickerHTML} from '../dist/boss-picker.js';
import {loadPresentationSettings,savePresentationSettings} from '../dist/combat-fx.js';
import {makeFixture} from '../scripts/soak.mjs';
test('presentation queue, merging, hitstop and reduced motion never mutate a serialized simulation',()=>{
 const g=makeFixture(2),e=g.state.entities[0],before=g.serialize(),p=Object.assign(Object.create(Painter.prototype),{game:g,floor:0,time:0});
 g.present('hit',{entityId:e.id,x:e.x,y:e.y,floorId:0,n:10,boss:true});g.present('hit',{entityId:e.id,x:e.x,y:e.y,floorId:0,n:5});
 p.capturePresentation(.01);assert.equal(p.combatFx.filter(f=>f.kind==='number').length,1);
 assert.equal(p.combatFx.find(f=>f.kind==='number').n,15);assert.ok(p.hitStopUntil>p.fxClock);assert.equal(g.serialize(),before);
 for(let i=0;i<200;i++)g.present('hit',{entityId:'different'+i,floorId:0,n:1});p.capturePresentation(.01);
 assert.ok(g.presentationEvents.length<=128&&p.combatFx.length<=64);assert.equal(g.serialize(),before);
 const reduced=loadPresentationSettings({getItem:()=>'{"shake":true,"hitstop":true}'},true);
 assert.equal(reduced.shake,false);assert.equal(reduced.hitstop,false);
 assert.doesNotThrow(()=>loadPresentationSettings({getItem(){throw Error('denied')}},false));
 assert.doesNotThrow(()=>savePresentationSettings({}, {setItem(){throw Error('denied')}}));
});
test('actual damage, downing and healing emit measured values without changing gameplay results',()=>{
 const save=makeFixture(3).serialize(),a=new Game(JSON.parse(save)),b=new Game(JSON.parse(save)),ea=a.state.entities[0],eb=b.entity(ea.id);
 b.present=()=>{};a.damage(ea,5);b.damage(eb,5);a.heal(ea,3);b.heal(eb,3);assert.equal(a.serialize(),b.serialize());
 a.damage(ea,100000);b.damage(eb,100000);assert.equal(a.serialize(),b.serialize());assert.ok(a.presentationEvents.some(e=>e.type==='down'));
});
test('boss picker renders three supplied cards, four phased skills each, seals and unaffordable disabled actions',()=>{
 const g=new Game();g.addRoom(1,1,'boss');g.state.gold=0;const html=bossPickerHTML(g,0);
 assert.equal((html.match(/data-boss-choice=/g)||[]).length,3);assert.equal((html.match(/data-boss-skill=/g)||[]).length,12);
 assert.equal((html.match(/class="boss-idle boss-idle-/g)||[]).length,12);assert.ok(html.includes('Thiếu '));assert.ok(!html.includes('undefined'));
});
