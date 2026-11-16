// Title screen (v0.1.0): pixel logo + menu over a live "attract mode" battle that plays itself behind the menu.
// The attract game is a separate Game + Painter: it never reads or writes the player's save, never touches the main game.
import {Game} from './simulation.js';
import {Painter} from './painter.js';

export const VERSION='0.3.0';
const SCENES=[
 {biome:'crypt',boss:'necro_lord',guards:['skeleton_guard','skeleton_archer','skeleton_mage']},
 {biome:'cave',boss:'spider_queen',guards:['kobold','gargoyle','spider']},
 {biome:'lava',boss:'orc_warlord',guards:['orc','imp','salamander']},
 {biome:'forest',boss:'bone_king',guards:['werewolf','harpy','mushroom']},
 {biome:'ice',boss:'frost_witch',guards:['iceZombie','skeleton_knight','naga']},
 {biome:'dungeon',boss:'warden',guards:['minotaur','gnoll','troll']},
];

export function buildAttract(round){
 const sc=SCENES[round%SCENES.length],seed=101+round*17;
 const g=new Game();Object.assign(g.state,{wave:3+round%3,gold:5000,mana:5000,seed,worldSeed:seed});
 const entry=g.addRoom(0,1,'entrance'),guard=g.addRoom(1,1,'guard'),boss=g.addRoom(2,1,'boss');
 g.addRoom(2,0,'treasure');g.state.props=[];g.rebuild();g.placeKey(entry.x,entry.y,0);
 g.state.floorBiomes={0:sc.biome,1:sc.biome};
 try{g.hireFloorBoss(0,sc.boss,{legacy:true})}catch{}
 for(const id of sc.guards)try{g.hire(guard.id,id)}catch{}
 if(!g.start()?.ok){try{g.hireFloorBoss(0,'necro_lord',{legacy:true})}catch{}g.start()}
 return {g,focus:boss};
}

export function installTitle({onContinue,onNewRun,onHelp,onCredits,onSettings,hasSave}){
 const root=document.createElement('div');root.id='title-screen';
 root.innerHTML=`<canvas id="title-bg" aria-hidden="true"></canvas><canvas id="title-mini" hidden></canvas><div class="title-shade"></div>
 <div class="title-panel"><img class="title-sigil" src="assets/ui/hud/sigil.png" alt="">
  <h1 class="title-logo">YOUR DUNGEON?</h1><p class="title-sub">Hầm ngục của bạn · Ai sẽ sống sót?</p>
  <nav class="title-menu">
   ${hasSave?'<button class="primary" data-title="continue">▶ Tiếp tục</button>':''}
   <button class="${hasSave?'':'primary'}" data-title="new">✦ Run mới</button>
   <button data-title="help">? Hướng dẫn</button><button data-title="settings">⚙ Cài đặt</button>
   <button data-title="credits">♥ Ghi công</button></nav>
  <p class="title-version">v${VERSION} · Bầy Xác Sống & Quân Vương Quốc</p></div>
 <p class="title-hint">Trận đấu phía sau là AI tự chơi · Nhấn Enter để vào</p>`;
 document.body.append(root);
 const canvas=root.querySelector('#title-bg'),mini=root.querySelector('#title-mini');
 let round=0,{g,focus}=buildAttract(round),painter=new Painter(canvas,mini,g),time=0,acc=0,last=performance.now(),open=true;
 const frame0=()=>{painter.camera={x:focus.x+6,y:focus.y,tile:34}};frame0();
 function loop(now){
  if(!open)return;const dt=Math.min(.1,(now-last)/1000);last=now;
  if(!document.hidden){
   acc+=dt;let steps=0;while(acc>=1/30&&steps++<6){g.tick(1/30);acc-=1/30}
   time+=dt;
   // follow the fight: heroes that currently see an enemy, else all heroes, else the boss room
   const heroes=g.state.entities.filter(e=>e.faction==='hero'&&!e.ownerId&&e.status==='active'&&e.floorId===0);
   const fighting=heroes.filter(e=>e.visibleIds?.length),pick=fighting.length?fighting:heroes;
   const avg=pick.length?{x:pick.reduce((s,e)=>s+e.x,0)/pick.length,y:pick.reduce((s,e)=>s+e.y,0)/pick.length}:focus;
   const target={x:avg.x+6,y:avg.y};   // keep the action right of the menu panel
   painter.camera.x+=(target.x+Math.sin(time*.2)*3-painter.camera.x)*Math.min(1,dt*.8);
   painter.camera.y+=(target.y-painter.camera.y)*Math.min(1,dt*.8);
   if(g.state.phase!=='battle'||time>150){round++;({g,focus}=buildAttract(round));painter=new Painter(canvas,mini,g);frame0();time=0}
   g.events?.splice(0);painter.draw(dt);
  }
  requestAnimationFrame(loop);
 }
 requestAnimationFrame(loop);
 const close=()=>{open=false;root.classList.add('closing');setTimeout(()=>root.remove(),260)};
 const actions={continue:()=>{close();onContinue()},new:()=>{if(onNewRun()!==false)close()},help:onHelp,settings:onSettings,credits:onCredits};
 root.addEventListener('click',e=>{const b=e.target.closest('[data-title]');if(b)actions[b.dataset.title]?.()});
 const key=e=>{if(!open){document.removeEventListener('keydown',key);return}
  if(e.key==='Enter'){e.preventDefault();(hasSave?actions.continue:actions.new)()}};
 document.addEventListener('keydown',key);
 return {isOpen:()=>open,close};
}
