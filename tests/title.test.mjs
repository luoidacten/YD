import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAttract,VERSION} from '../dist/title.js';

test('attract mode builds all six scenes as real battles that run without errors',()=>{
 assert.match(VERSION,/^\d+\.\d+\.\d+$/);
 for(let round=0;round<6;round++){
  const {g}=buildAttract(round);
  assert.equal(g.state.phase,'battle',`scene ${round} starts a battle`);
  assert.ok(g.state.entities.some(e=>e.boss),`scene ${round} has a floor boss`);
  for(let i=0;i<30*20;i++)g.tick(1/30);
  assert.ok(['battle','result','gameover'].includes(g.state.phase));
 }
});
