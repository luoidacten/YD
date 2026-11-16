import {Game} from './simulation.js';
import {Painter} from './painter.js';
import {SPECIES} from './data.js';
import {ITEMS} from './expansion.js';
import {ART_SIZE} from './art-metadata.js';
import {weaponSummary,equipControl} from './weapon-ui.js';
const canvas=document.querySelector('#art-canvas'),mini=document.querySelector('#art-mini');
let game,painter,units,scene,hold=false,lastPulse=-1,frames=0,renderTotal=0,measureStart=performance.now();
const config={heroes04:[['paladin','assassin','pyromancer','frost_mage','berserker'],['goblin','skeleton']],
 monsters04:[['knight','mage'],['ghost','spider','rock_golem','eyeball','bat','fire_elemental','mushroom','cube_slime']],
 fx04:[['pyromancer','paladin'],['rock_golem']],heroes05:[['ninja','priestess','crossbowman'],['minotaur','troll']],
 monsters05:[['knight','dwarfMiner'],['minotaur','troll','werewolf','lich']],equipment05:[[],['zombie']],
 companions06:[['beastmaster','hunter','druid'],['skeleton_guard','skeleton_archer']],
 necro06:[['knight','mage'],['necro_lord','skeleton_archer','skeleton_guard']],
 bones06:[['paladin'],['bone_king','bone_giant','skeleton_knight','skeleton_mage','bone_hound','ember_skeleton']]};
async function load(name){
 const ready=document.querySelector('#scene-ready');ready.dataset.ready='false';ready.textContent='Đang nạp asset…';
 scene=name;game=new Game();game.state.wave=3;game.addRoom(1,1,'boss');game.state.props=[];game.state.keyQuest.locked=false;game.rebuild();
 units=[];
 if(name==='combat08'){
  game.addRoom(0,1,'entrance');game.addRoom(2,1,'treasure');game.rebuild();
  for(let i=0;i<20;i++)units.push(game.spawn(i<10?'knight':'goblin',i<10?'hero':'monster',
   50+(i%5)*1.5,42+Math.floor(i/5)*2,'Combat '+(i+1),[],{roomId:game.state.rooms[0].id}));
  game.state.phase='battle';game.state.encounter={spawnQueue:[],reinforcements:[],spawnTimer:999};
 }else if(name==='performance'){
  for(let i=0;i<60;i++)units.push(game.spawn(i%2?'skeleton':'goblin',i%2?'hero':'monster',
   47+i%10*1.6,41+Math.floor(i/10)*1.7,'Render '+(i+1),[]));
 }else for(const [row,ids]of config[name].entries())for(const [i,id]of ids.entries()){
  const e=game.spawn(id,row===0?'hero':'monster',46+i*3.2,43+row*6,SPECIES[id].name,[]);units.push(e);
 }
 for(const e of units){e.hp=e.maxHp=10000;e.mana=e.maxMana=1000;e.lastDamaged=-100;e.quality='common';
  e.charms=e.charms.filter(id=>id!=='forsaken');e.visibleIds=units.filter(a=>a.faction!==e.faction).map(a=>a.id)}
 if(name==='companions06'){game.setBearForm(units.find(e=>e.species==='druid'),true);
  units.push(...game.state.entities.filter(e=>e.ownerId))}
 painter=new Painter(canvas,mini,game);painter.camera={x:54,y:46,tile:32};painter.setFogMode('all');painter.selected=units[0]?.id;
 if(name==='equipment05'){
  const e=units[0],offered={id:'proposed-gun',definitionId:'W39'};
  document.querySelector('#art-info').innerHTML=`<h2>${e.name}</h2>${weaponSummary(game,e)}<p>Đang đề nghị: ${ITEMS.W39.name}</p>`+equipControl(game,e,offered);
 }else document.querySelector('#art-info').innerHTML='<h2>'+({heroes04:'Đoàn hero mới',monsters04:'Quái mới',fx04:'Hỏa cầu + chữa lành',
  heroes05:'Ninja · Tư tế · Nỏ thủ',monsters05:'Minotaur · Troll',performance:'Render benchmark',
  companions06:'Sói · Chim Ưng · Dạng Gấu',necro06:'Kẻ Chiêu Hồn và vệ binh',bones06:'Vua Xương và quân đoàn',combat08:'20 đơn vị · ×4 gameplay'})[name]+'</h2>'+
  units.slice(0,12).map(e=>`<p>${e.name} · ${game.weaponDefinition(e)?.name||'Đòn bẩm sinh'}</p>`).join('');
 lastPulse=-1;frames=0;renderTotal=0;measureStart=performance.now();
 const current=painter,names=new Set(['wall_top_mid','wall_mid','wall_left','wall_right','column',
  'wall_banner_yellow','wall_banner_red','floor_stairs','skull']);
 for(let f=1;f<=8;f++)names.add('floor_'+f);
 for(const e of units){const d=SPECIES[e.species];
  for(let f=0;f<4;f++)names.add(painter.bodySprite({...e,lastDamaged:-100},f));
  for(const key of Object.keys(ART_SIZE))if(key.startsWith('yd/attack/'+d.sprite.split('/').at(-1)+'_'))names.add(key);
  const w=game.weaponDefinition(e),off=game.offhandDefinition(e);if(w)names.add(w.art);if(off)names.add(off.art);
 }
 for(const key of Object.keys(ART_SIZE))if(key.startsWith('yd/fx/'))names.add(key);
 await Promise.all([...names].map(name=>new Promise(resolve=>{const im=current.image(name);
  if(im.complete)resolve();else{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true})}
 })));
 if(current!==painter)return;applyHold();painter.draw(0);ready.dataset.ready='true';ready.textContent='Asset đã nạp · '+scene;
}
for(const button of document.querySelectorAll('[data-scene]'))button.onclick=()=>load(button.dataset.scene);
document.querySelector('#hold-pose').onclick=()=>{hold=!hold;document.querySelector('#hold-pose').setAttribute('aria-pressed',String(hold));applyHold();painter.draw(0)};
function applyHold(){
 if(!hold)return;for(const e of units)game.recordAttack(e,scene==='fx04'?units.find(a=>a.faction!==e.faction):null);
 painter.captureAttacks();for(const pose of painter.attackPoses.values())pose.started=painter.time-.16;
 if(scene==='fx04')for(const f of painter.projectiles)f.born=painter.time-.15;
}
load('heroes04');let previous=performance.now();
function frame(now){
 const dt=Math.min(.1,(now-previous)/1000);previous=now;game.state.time+=dt;
 if(scene==='combat08')for(let i=0;i<4;i++)game.tick(1/30);
 if(scene!=='combat08'&&game.state.time-lastPulse>.45){
  lastPulse=game.state.time;
  if(scene==='performance')for(let i=0;i<40;i++)game.visualCue(['heal','poison','frost','holy'][i%4],units[i]);
  else if(scene!=='equipment05')for(const e of units){
   const target=units.find(a=>a.faction!==e.faction);if(!target)continue;
   e.hp=e.maxHp;e.statuses=e.statuses.filter(s=>s.permanent);e.lastDamaged=-100;e.cooldown=0;e.action='attack';e.target=target.id;e.decision=100;
   game.act(e,1/30);
  }
  if(scene==='fx04'){const paladin=units.find(e=>e.species==='paladin');paladin.hp=paladin.maxHp*.5;game.heal(paladin,50)}
 }
 game.effects=game.effects.filter(f=>(f.life-=dt)>0);
 const begin=performance.now();applyHold();painter.draw(dt);
 if(hold)for(const e of units){const pose=painter.attackPoses.get(e.id);if(pose)pose.started=painter.time-.16}
 renderTotal+=performance.now()-begin;frames++;
 if(frames%30===0){
  const seconds=(now-measureStart)/1000;
  document.querySelector('#perf-data').textContent=JSON.stringify({mode:scene==='performance'?'render-only':'art fixture',
   entities:units.length,activeFx:painter.renderedFx||0,seconds:+seconds.toFixed(2),fps:+(frames/seconds).toFixed(1),
   meanRenderMs:+(renderTotal/frames).toFixed(2),attackFrameHold:hold},null,1);
 }
 requestAnimationFrame(frame);
}requestAnimationFrame(frame);

document.querySelector('#perf-burst').onclick=()=>{
 if(!['performance','combat08'].includes(scene))return;
 const start=performance.now();let maxFx=0;
 for(let f=0;f<120;f++){
  if(scene==='combat08')for(let i=0;i<4;i++)game.tick(1/30);
  else for(let i=0;i<40;i++)game.visualCue(['heal','poison','frost','holy'][i%4],units[i]);
  painter.draw(1/60);maxFx=Math.max(maxFx,painter.renderedFx||0);
  painter.ctx.getImageData(0,0,1,1);
 }
 const ms=performance.now()-start;
 document.querySelector('#burst-data').textContent=JSON.stringify({mode:'synchronous-render-throughput-with-readback',
  entities:units.length,activeFx:maxFx,frames:120,elapsedMs:+ms.toFixed(2),fps:+(120000/ms).toFixed(1),
  includesAI:scene==='combat08',speed:scene==='combat08'?4:1},null,1);
};
