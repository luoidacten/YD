import {Game} from './simulation.js';
import {Painter} from './painter.js';
import {SPECIES} from './data.js';
const game=new Game();game.state.wave=3;game.addRoom(1,1,'boss');game.state.props=[];
game.state.keyQuest.locked=false;game.rebuild();
const ids=['shieldmaiden','dwarfMiner','dwarfSmith','angelHerald','iceZombie','muddy','swampy','pumpkin'];
const units=ids.map((id,i)=>game.spawn(id,i<4?'hero':'monster',45+i%4*6,43+Math.floor(i/4)*7,SPECIES[id].name,[]));
for(const [i,id]of ['W13','W18','W22'].entries())game.equipItem(units[i],game.createItem(id,units[i]));
const painter=new Painter(document.querySelector('#review-canvas'),document.querySelector('#review-mini'),game);
painter.camera={x:54,y:46,tile:32};painter.setFogMode('all');let selected=units[0];
document.querySelector('#review-units').innerHTML=units.map(e=>`<button data-id="${e.id}">${e.name}</button>`).join('');
function info(){painter.selected=selected.id;document.querySelector('#review-info').textContent=
 `${selected.name} · ${game.weaponDefinition(selected)?.name||'Đòn bẩm sinh'} · Tầm ${game.range(selected)} · ${selected.hp}/${selected.maxHp} HP`;}
for(const button of document.querySelectorAll('[data-id]'))button.onclick=()=>{selected=game.entity(button.dataset.id);info()};
document.querySelector('#review-hit').onclick=()=>{selected.lastDamaged=game.state.time};
document.querySelector('#review-move').onclick=()=>{for(const e of units)e.moving=!e.moving};
info();let previous=performance.now();function frame(now){const dt=Math.min(.1,(now-previous)/1000);previous=now;
 game.state.time+=dt;painter.draw(dt);requestAnimationFrame(frame)}requestAnimationFrame(frame);
