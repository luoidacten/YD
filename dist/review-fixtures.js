import {Game} from './simulation.js';
// Explicit developer preview only. It never imports or writes a player's save.
export function createReviewGame(scene){
 const g=new Game();Object.assign(g.state,{wave:3,gold:900,mana:1000,seed:17,worldSeed:17});
 const entry=g.addRoom(0,1,'entrance'),guard=g.addRoom(1,1,'guard'),bossRoom=g.addRoom(2,1,'boss');
 g.addRoom(2,0,'treasure');g.state.props=[];g.rebuild();g.placeKey(entry.x,entry.y,0);
 if(scene!=='boss'){
  g.hireFloorBoss(0,'necro_lord',{legacy:true});
  for(const id of ['skeleton_guard','skeleton_archer'])g.hire(guard.id,id);
 }
 if(['battle','result'].includes(scene)){
  g.start();for(let i=0;i<30*22;i++)g.tick(1/30);
  if(scene==='result'){
   g.state.encounter.spawnQueue=[];g.state.encounter.reinforcements=[];
   for(const e of g.state.entities.filter(e=>e.faction==='hero')){e.status='dead';e.hp=0}g.finish();
  }
  g.state.paused=true;
 }
 return g;
}
