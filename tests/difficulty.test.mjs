import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {CARDS} from '../dist/data.js';
import {DIFFICULTY_PRESETS} from '../dist/difficulty.js';

test('required rooms are free of mana; other rooms still cost 5',()=>{
 for(const id of ['entrance','treasure','boss','arrival'])assert.equal(CARDS.find(c=>c.id===id).cost,0,id);
 const g=new Game();g.state.mana=0;
 const play=(id,col,row,floor=0)=>{let c=g.state.deck.hand.find(c=>c.definitionId===id);if(!c){c=g.makeCard(id);g.state.deck.hand.push(c)}
  return g.playCard(c.uid,18+col*36,16+row*30,floor)};
 assert.ok(play('entrance',0,1).ok,'entrance with 0 mana');assert.equal(g.state.mana,0);
 assert.ok(play('boss',1,1).ok,'stairs hall with 0 mana');assert.equal(g.state.mana,0);
 assert.equal(play('guard',2,1).ok,false,'a normal room still needs mana');
 g.state.mana=10;assert.ok(play('guard',2,1).ok);assert.equal(g.state.mana,5);
});

test('difficulty presets and custom values apply to a fresh run and to spawned heroes',()=>{
 const g=new Game();
 assert.equal(g.difficulty().preset,'normal');
 assert.ok(g.setDifficulty('easy').ok);assert.equal(g.state.gold,DIFFICULTY_PRESETS.easy.startGold);
 assert.ok(g.setDifficulty('custom',{heroHp:2,heroPower:2,party:1.5,gold:2,startGold:999,startMana:300}).ok);
 const d=g.difficulty();assert.equal(d.heroHp,2);assert.equal(g.state.gold,999);
 assert.equal(g.setDifficulty('custom',{heroHp:99}).ok,true);assert.equal(g.difficulty().heroHp,2.5,'clamped');
 g.state.phase='battle';const base=new Game();base.state.phase='battle';
 const a=base.spawn('knight','hero',10,10,'A',[],{floorId:0}),b=g.spawn('knight','hero',10,10,'B',[],{floorId:0});
 assert.ok(b.maxHp>a.maxHp,'tougher heroes on harder settings');
 assert.equal(g.setDifficulty('easy').ok,false,'no change mid-battle');
});
