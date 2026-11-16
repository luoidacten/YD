import {ART_SIZE} from './art-metadata.js';
import {installCombatFx} from './combat-fx.js';
import {FX_KINDS} from './bestiary-data.js';
import {iconAsset} from './icons.js';
import {
 STATUS
}
from './catalog.js';
import {
 CHEST_TIERS
}
from './room-life.js';
import {
 WIDTH,
 HEIGHT,
 ROOMS,
 SPECIES,
 COLS,
 ROWS,
 center,
 bounds,
 contains,
 distance
}
from './data.js';
export class Painter {
 constructor(canvas,
 minimap,
 game){
  this.canvas=canvas;
  this.mini=minimap;
  this.ctx=canvas.getContext('2d');
  this.game=game;
  this.images={
  }
  ;
  this.pixelProps={
  }
  ;
  this.camera={
   x:54,
   y:46,
   tile:32
  }
  ;
  this.bounds={
   x:0,
   y:0,
   tile:32
  }
  ;
  this.selected=null;
  this.card=null;
  this.hover=null;
  this.gridVisible=false;
  this.time=0;
  this.floor=game.state.currentFloor||0;
  this.fogMode='all';
 }
 tile(name){const b=this.game.floorBiome?.(this.floor);return b&&b!=='dungeon'?'yd/tiles/'+b+'/'+name:name}
 image(name){
  if(!this.images[name]){
   const im=new Image();
   im.src=`assets/frames/${
name
}.png`;
   this.images[name]=im
  }
  return this.images[name]
 }
 uiIcon(group,id,x,y,size=16){
  const asset=iconAsset(group,id);if(!asset)return false;
  const key=group+':'+id;
  if(!this.images[key]){const im=new Image();im.src=asset.src;this.images[key]=im}
  const im=this.images[key];if(!im.complete||!im.naturalWidth)return false;
  const p=this.point(x,y),c=this.ctx;c.imageSmoothingEnabled=false;
  c.drawImage(im,Math.round(p.x-size/2),Math.round(p.y-size/2),size,size);return true;
 }
 get level(){
  return this.camera.tile<10?'overview':this.camera.tile<23?'tactical':'detail'
 }
 resize(canvas){
  const r=canvas.getBoundingClientRect(),
  dpr=1; // Pixel art uses integer CSS pixels; avoid fractional high-DPI oversampling.
  if(canvas.width!==Math.round(r.width*dpr)||canvas.height!==Math.round(r.height*dpr)){
   canvas.width=Math.round(r.width*dpr);
   canvas.height=Math.round(r.height*dpr)
  }
  const c=canvas.getContext('2d');
  c.setTransform(dpr,
  0,
  0,
  dpr,
  0,
  0);
  c.imageSmoothingEnabled=false;
  return{
   w:r.width,
   h:r.height,
   c
  }
 }
 point(x,
 y){
  return{
   x:this.bounds.x+x*this.bounds.tile,
   y:this.bounds.y+y*this.bounds.tile
  }
 }
 rect(x,
 y,
 w,
 h,
 color){
  const p=this.point(x,
  y);
  this.ctx.fillStyle=color;
  this.ctx.fillRect(Math.round(p.x),
  Math.round(p.y),
  Math.ceil(w*this.bounds.tile),
  Math.ceil(h*this.bounds.tile))
 }
 stroke(x,
 y,
 w,
 h,
 color,
 width=1){
  const p=this.point(x,
  y),
  c=this.ctx;
  c.strokeStyle=color;
  c.lineWidth=width;
  c.strokeRect(Math.round(p.x)+.5,
  Math.round(p.y)+.5,
  Math.round(w*this.bounds.tile),
  Math.round(h*this.bounds.tile))
 }
 sprite(name,
 x,
 y,
 w=1,
 h=1,
 flip=false,
 alpha=1){
  const im=typeof name==='string'?this.image(name):name;
  if(!im||im instanceof Image&&(!im.complete||!im.naturalWidth))return;
  const c=this.ctx,
  p=this.point(x,
  y),
  t=this.bounds.tile;
  c.save();
  c.globalAlpha=alpha;
  c.translate(Math.round(p.x),
  Math.round(p.y));
  if(flip){
   c.translate(Math.round(w*t),
   0);
   c.scale(-1,
   1)
  }
  c.drawImage(im,
  0,
  0,
  Math.round(w*t),
  Math.round(h*t));
  c.restore()
 }
 label(text,
 x,
 y,
 color='#d2cab7',
 size=12){
  const c=this.ctx,
  p=this.point(x,
  y);
  c.font=`${size>=20?28:14}px "YD Pixel",Consolas,monospace`;
  c.textAlign='center';
  this.labelRects??=[];
  const width=c.measureText(text).width,height=size>=20?28:14;
  let box={x:p.x-width/2,y:p.y-height,w:width,h:height};
  for(let attempt=0;attempt<6&&this.labelRects.some(r=>Math.min(r.x+r.w,box.x+box.w)-Math.max(r.x,box.x)>2&&
   Math.min(r.y+r.h,box.y+box.h)-Math.max(r.y,box.y)>2);attempt++){p.y-=8;box.y-=8}
  this.labelRects.push(box);c.strokeStyle='#120e12';c.lineWidth=2;c.strokeText(text,p.x,p.y);
  c.fillStyle='#0b1010';
  c.fillText(text,
  p.x+1,
  p.y+1);
  c.fillStyle=color;
  c.fillText(text,
  p.x,
  p.y)
 }
 hit(clientX,
 clientY){
  const r=this.canvas.getBoundingClientRect();
  return{
   x:(clientX-r.left-this.bounds.x)/this.bounds.tile,
   y:(clientY-r.top-this.bounds.y)/this.bounds.tile,
   floorId:this.floor
  }
 }
 zoom(factor,
 clientX,
 clientY){
  const r=this.canvas.getBoundingClientRect(),
  before=clientX===undefined?null:this.hit(clientX,
  clientY);
  this.camera.tile=Math.max(4,
  Math.min(64,
  this.camera.tile*factor));
  if(before){
   this.camera.x=before.x-(clientX-r.left-r.width/2)/this.camera.tile;
   this.camera.y=before.y-(clientY-r.top-r.height/2)/this.camera.tile
  }
 }
 focus(room,
 detail=false){
  if(!room){
   this.fit();
   return
  }
  this.floor=room.floorId;
  this.game.state.currentFloor=room.floorId;
  this.camera.x=room.x;
  this.camera.y=room.y;
  const r=this.canvas.getBoundingClientRect();
  this.camera.tile=detail?32:Math.max(19,
  Math.min(36,
  (r.width-60)/(room.w+2),
  (r.height-65)/(room.h+2)))
 }
 fit(){
  const rooms=this.game.rooms(this.floor),
  r=this.canvas.getBoundingClientRect();
  if(!rooms.length){
   this.camera={
    x:72,
    y:46,
    tile:Math.max(4,
    Math.min((r.width-30)/145,
    (r.height-50)/92))
   }
   ;
   return
  }
  const bs=rooms.map(bounds),
  left=Math.min(...bs.map(b=>b.x))-4,
  top=Math.min(...bs.map(b=>b.y))-5,
  right=Math.max(...bs.map(b=>b.x+b.w))+4,
  bottom=Math.max(...bs.map(b=>b.y+b.h))+5;
  this.camera.x=(left+right)/2;
  this.camera.y=(top+bottom)/2;
  this.camera.tile=Math.min((r.width-30)/(right-left),
  (r.height-50)/(bottom-top))
 }
 setScale(tile){
  this.camera.tile=tile
 }
 propSprite(type){
  if(this.pixelProps[type])return this.pixelProps[type];
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=16;
  const c=canvas.getContext('2d');
  const fill=(x,
  y,
  w,
  h,
  color)=>{
   c.fillStyle=color;
   c.fillRect(x,
   y,
   w,
   h)
  }
  ;
  fill(4,
  0,
  8,
  1,
  '#18191a');
  fill(2,
  1,
  12,
  13,
  '#18191a');
  fill(3,
  14,
  10,
  1,
  '#18191a');
  fill(3,
  2,
  10,
  11,
  '#74533c');
  fill(5,
  2,
  2,
  11,
  '#926d4a');
  fill(10,
  2,
  2,
  11,
  '#503c30');
  fill(3,
  3,
  10,
  2,
  '#b4aa88');
  fill(2,
  10,
  12,
  2,
  '#9a9073');
  fill(4,
  1,
  8,
  2,
  '#b8905c');
  fill(5,
  1,
  6,
  1,
  '#d2b177');
  const accent=type==='explosive'?'#c45448':type==='poison'?'#7cb650':type==='water'?'#5babbc':'#cba56a';
  fill(6,
  6,
  4,
  3,
  accent);
  if(type==='explosive'){
   fill(7,
   5,
   2,
   6,
   '#e29162');
   fill(5,
   7,
   6,
   2,
   '#e29162')
  }
  if(type==='poison'){
   fill(6,
   6,
   1,
   1,
   '#e1e5b1');
   fill(9,
   6,
   1,
   1,
   '#e1e5b1');
   fill(7,
   8,
   2,
   1,
   '#233826')
  }
  this.pixelProps[type]=canvas;
  return canvas
 }
 renderProp(p){
  const c=this.ctx,
  point=this.point(p.x,
  p.y);
  if(p.destroyed){
   for(let i=0;
   i<4;
   i++)this.rect(p.x-.4+(i%2)*.5,
   p.y-.25+Math.floor(i/2)*.35,
   .18,
   .1,
   '#77614a77');
   return
  }
  c.fillStyle='#050a0a55';
  c.beginPath();
  c.ellipse(point.x,
  point.y+this.bounds.tile*.3,
  this.bounds.tile*.52,
  this.bounds.tile*.22,
  0,
  0,
  Math.PI*2);
  c.fill();
  if(p.custom){                                                         // player-built walls
   if(p.type==='wall'){this.sprite(this.tile('wall_top_mid'),p.x-.5,p.y-1.4,1,1);this.sprite(this.tile('wall_mid'),p.x-.5,p.y-.5,1,1)}
   else this.sprite(p.type==='wood'?'crate':'yd/tiles/walls/'+p.type,p.x-.5,p.y-.6,1,1);
   if(p.hp<p.maxHp&&p.maxHp<999){this.rect(p.x-.4,p.y-.85,.8,.08,'#202425');this.rect(p.x-.4,p.y-.85,.8*p.hp/p.maxHp,.08,'#caa16f')}
   if(this.wallEditor?.roomId===p.roomId)this.stroke(p.x-.5,p.y-.5,1,1,'#facb3e');
   return;
  }
  if(p.type==='pillar')this.sprite('column',
  p.x-.5,
  p.y-1.5,
  1,
  2);
  else if(p.type==='crate')this.sprite('crate',
  p.x-.5,
  p.y-.6,
  1,
  1);
  else this.sprite(this.propSprite(p.type),
  p.x-.5,
  p.y-.65,
  1,
  1);
  if(this.selected===p.id)this.stroke(p.x-.6,
  p.y-.85,
  1.2,
  1.4,
  '#dec48a');
  if(p.hp<p.maxHp){
   this.rect(p.x-.4,
   p.y-.85,
   .8,
   .08,
   '#202425');
   this.rect(p.x-.4,
   p.y-.85,
   .8*p.hp/p.maxHp,
   .08,
   '#caa16f')
  }
 }
 ground(room){
  const c=this.ctx,
  b=bounds(room),
  t=this.bounds.tile,
  level=this.level,
  p=center(room),
  def=ROOMS[room.type];
  if(level==='overview'){
   this.rect(b.x-.5,
   b.y-.5,
   b.w,
   b.h,
   '#444e49');
   this.rect(b.x+.4,
   b.y+.5,
   b.w-1.8,
   b.h-1.7,
   room.type==='boss'||room.type==='treasure'?'#463635':'#252e2d');
   this.stroke(b.x-.5,
   b.y-.5,
   b.w,
   b.h,
   room.sealed?'#d47761':this.selected===room.id?'#e1bf7a':'#78847a',
   this.selected===room.id?2:1);
   if(!this.uiIcon('room',room.type,p.x,p.y,32))this.sprite(def.icon,
   p.x-1.7,
   p.y-2.2,
   3.4,
   3.4);
   const count=this.game.roomMonsters(room).length;
   this.label(count?`${
count
} quân`:'Trống',
   p.x,
   p.y+3.5,
   '#aab7a7',
   11);
   this.label(def.name,
   p.x,
   b.y+b.h+1.8,
   def.color,
   11);
   return
  }
  // North faces and perimeter masonry use the same 0x72 tiles as the sprites.
  for(let x=b.x;
  x<b.x+b.w;
  x++){
   if(!this.game.terrain[this.floor][b.y]?.[x]){
    this.sprite(this.tile('wall_top_mid'),
    x-.5,
    b.y-1);
    this.sprite(this.tile('wall_mid'),
    x-.5,
    b.y)
   }
   if(!this.game.terrain[this.floor][b.y+b.h-1]?.[x])this.sprite(this.tile('wall_top_mid'),
   x-.5,
   b.y+b.h-1)
  }
  for(let y=b.y+1;
  y<b.y+b.h-1;
  y++)for(const x of[b.x,
  b.x+b.w-1])if(!this.game.terrain[this.floor][y]?.[x])this.sprite(x===b.x?'wall_left':'wall_right',
  x-.5,
  y-.5);
  this.stroke(b.x-.5,
  b.y-.6,
  b.w,
  b.h+.1,
  this.selected===room.id?'#d7b47d':'#8a817847',
  this.selected===room.id?1.5:1);
  if(room.type==='boss'||room.type==='treasure'){
   this.rect(p.x-3,
   p.y-6,
   6,
   12,
   room.type==='boss'?'#7c3f402d':'#644b752b');
   for(let i=-5;
   i<=5;
   i+=2)this.rect(p.x-3,
   p.y+i,
   6,
   .07,
   '#bfa27942');
   for(const dx of[-6,
   6])this.sprite('column',
   p.x+dx-.5,
   p.y-5,
   1,
   2)
  }
  const count=Math.max(2,
  Math.floor(b.w/7));
  for(let i=0;
  i<count;
  i++){
   const x=b.x+3+i*(b.w-6)/Math.max(1,
   count-1);
   this.sprite(`wall_banner_${
room.type==='treasure'?'blue':room.type==='boss'?'yellow':room.type==='grave'?'green':'red'
}`,
   x-.5,
   b.y);
   const q=this.point(x,
   b.y+1),
   grad=c.createRadialGradient(q.x,
   q.y,
   0,
   q.x,
   q.y,
   t*3);
   grad.addColorStop(0,
   '#edac4c27');
   grad.addColorStop(1,
   '#edac4c00');
   c.fillStyle=grad;
   c.fillRect(q.x-t*3,
   q.y-t*3,
   t*6,
   t*6);
   this.rect(x-.12,
   b.y+.5,
   .24,
   .25,
   '#cf873d');
   this.rect(x-.06,
   b.y+.4-Math.sin(this.time*8+i)*.08,
   .12,
   .25,
   '#ffdaa0')
  }
  if(room.stairs){
   this.sprite('floor_stairs',
   p.x+4,
   p.y-1,
   2,
   2);
   if(room.type==='boss'&&this.game.roomMonsters(room).length){
    this.stroke(p.x+3.7,
    p.y-1.3,
    2.6,
    2.6,
    '#cf806a');
    this.label('KHÓA',
    p.x+5,
    p.y+2.1,
    '#cba69b',
    9)
   }
  }
  if(level==='detail'){
   if(room.type==='entrance')this.sprite('floor_stairs',
   p.x-1,
   p.y-1,
   2,
   2);
   if(room.type==='mana'){
    const f=Math.floor(this.time*4)%3;
    this.sprite('wall_fountain_top_1',
    p.x-.5,
    b.y);
    this.sprite('wall_fountain_mid_blue_anim_f'+f,
    p.x-.5,
    b.y+1);
    this.sprite('wall_fountain_basin_blue_anim_f'+f,
    p.x-.5,
    b.y+2)
   }
   if(room.type==='shop'){
    for(let i=-2;
    i<=2;
    i++)this.sprite('crate',
    p.x+i-.5,
    p.y-3);
    this.sprite('doc_idle_anim_f'+Math.floor(this.time*5)%4,
    p.x-.5,
    p.y-1.5,
    1,
    1.5)
   }
   if(room.type==='grave')for(const dx of[-4,
   4])for(const dy of[-3,
   3])this.sprite('skull',
   p.x+dx-.35,
   p.y+dy-.35,
   .7,
   .7);
  }
  for(const p of room.wallDecorations||[]){
   if(!p.requiresDestroyed||room.buildingHp<=0)this.sprite(p.art,p.x,p.y);
  }
  if(level==='detail')this.drawFacility(room);
  if(t<18||this.selected===room.id)this.label(def.name.toUpperCase(),
  p.x,
  b.y+b.h+1.1,
  def.color,
  10);
 }
 floorLayer(){
  const terrain=this.game.terrain[this.floor],seed=this.game.state.worldSeed;
  const key=this.floor+':'+seed+':'+this.level+':'+(this.game.floorBiome?.(this.floor)||'dungeon');   // terrain identity is checked separately; props do not invalidate the floor
  if(this.floorCache?.game===this.game&&this.floorCache.terrain===terrain&&this.floorCache.key===key)return this.floorCache.canvas;
  const images=Array.from({length:8},(_,i)=>this.image(this.tile('floor_'+(i+1))));
  if(images.some(im=>!im.complete||!im.naturalWidth))return null;
  const canvas=document.createElement('canvas');canvas.width=WIDTH*16;canvas.height=HEIGHT*16;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   if(terrain?.[y]?.[x]){
    const hash=(x*13+y*71+seed)%29,index=hash<20?1:2+hash%7;
    c.drawImage(images[index-1],x*16,y*16,16,16);
    if(!terrain[y-1]?.[x]){c.fillStyle='#050c1099';c.fillRect(x*16,y*16,16,2)}
    if(hash===2&&this.level==='detail'){c.fillStyle='#71827a22';c.fillRect(x*16+4,y*16+10,3,1)}
   }else if((x*17+y*13)%29===0){c.fillStyle='#29333466';c.fillRect(x*16+8,y*16+8,3,1)}
  }
  this.floorCache={game:this.game,terrain,key,canvas};return canvas;
 }
 nativeSprite(name,x,y,flip=false,anchor='feet'){
  const im=this.image(name);if(!im.complete||!im.naturalWidth)return;
  const scale=Math.max(1,Math.round(this.bounds.tile/16)),p=this.point(x,y),c=this.ctx;
  const w=im.naturalWidth*scale,h=im.naturalHeight*scale;
  c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(p.x),Math.round(p.y));
  if(flip)c.scale(-1,1);c.drawImage(im,-Math.round(w/2),anchor==='center'?-Math.round(h/2):-h,w,h);c.restore();
 }
 fxSprite(kind){
  const mapped={fire:'fireball',revive:'holy',stun:'lightning'}[kind]||kind;
  return FX_KINDS.includes(mapped)?Array.from({length:4},(_,f)=>`yd/fx/fx_${mapped}_anim_f${f}`):null;
 }
 drawFx(){
  this.fx??=[];this.lastVisualEvent??=0;
  for(const cue of this.game.visualEvents||[])if(cue.id>this.lastVisualEvent){
   this.fx.push({...cue,expires:this.time+.5});this.lastVisualEvent=cue.id;
  }
  this.fx=this.fx.filter(f=>f.expires>this.time).slice(-40);
  this.renderedFx=0;if(this.level==='overview')return;
  const shields=this.game.state.entities.filter(e=>e.status==='active'&&e.floorId===this.floor&&
   this.game.effect(e,'shield')&&this.isUnitVisible(e)).map(e=>({...e,kind:'shield'}));
  const effects=this.fxBudget>0?[...shields,...this.fx].slice(-this.fxBudget):[];this.renderedFx=0;
  for(const f of effects){
   if(f.floorId!==this.floor||this.visibleTiles&&!this.visibleTiles[Math.round(f.y)*WIDTH+Math.round(f.x)])continue;
   const frames=this.fxSprite(f.kind);if(!frames)continue;
   this.nativeSprite(frames[Math.floor(this.time*8)%4],f.x,f.y-.7,false,'center');this.renderedFx++;
  }
 }
 captureAttacks(){
  if(this.visualGame!==this.game){
   this.visualGame=this.game;this.lastAttackEvent=0;this.lastVisualEvent=0;
   this.attackPoses=new Map();this.projectiles=[];this.fx=[];
  }
  this.attackPoses??=new Map();this.projectiles??=[];this.lastAttackEvent??=0;
  for(const event of this.game.attackEvents||[])if(event.id>this.lastAttackEvent){
   this.attackPoses.set(event.entityId,{...event,started:this.time});this.lastAttackEvent=event.id;
   if(event.projectile==='bomb'||event.projectile&&!this.game.state.projectiles)this.projectiles.push({...event,born:this.time});
  }
  for(const[id,pose]of this.attackPoses)if(this.time-pose.started>=.3)this.attackPoses.delete(id);
  this.projectiles=this.projectiles.filter(f=>this.time-f.born<.45).slice(-40);
 }
 attackFrame(e){
  const pose=this.attackPoses?.get(e.id);
  return pose&&this.time-pose.started<.3?Math.min(3,(pose.startFrame||0)+Math.floor((this.time-pose.started)/.075)):-1;
 }
 bodySprite(e,frame){
  const d=SPECIES[e.species],sprite=e.bearForm?'yd/monsters/druid_bear':e.elite&&d.eliteSprite?d.eliteSprite:d.sprite;
  if(e.boss&&e.bossWindupUntil>this.game.state.time){
   const cast=`yd/attack/${sprite.split('/').at(-1)}_attack_anim_f1`;if(ART_SIZE[cast])return cast;
  }
  const hit=['knight_m','knight_f','elf_m','elf_f','lizard_m','lizard_f','dwarf_m','dwarf_f','wizzard_m','wizzard_f'];
  if(this.game.state.time-(e.lastDamaged??-100)<.15&&(hit.includes(sprite)||ART_SIZE[sprite+'_hit_anim_f0']))
   return sprite+'_hit_anim_f0';
  if(e.species==='mimic')return 'chest_mimic_open_anim_f'+(e.disguised?0:frame%3);
  const attack=this.attackFrame(e),base=sprite.split('/').at(-1),name=`yd/attack/${base}_attack_anim_f${Math.max(0,attack)}`;
  if(attack>=0&&ART_SIZE[name])return name;
  if(['slime','shaman'].includes(e.species)||d.animation==='single')return sprite+'_anim_f'+(attack>=0?0:frame);
  return sprite+'_'+(e.moving&&attack<0?'run':'idle')+'_anim_f'+(attack>=0?0:frame);
 }
 drawWeapon(e,weapon,offhand=false){
  // Held at the hand (not the shoulder), grip as pivot, never taller than ~1 tile so it does not tower over the 16px body.
  const pose=this.attackPoses?.get(e.id),f=this.attackFrame(e),w=!offhand&&pose?.weapon||weapon;
  if(!w)return;const family=w.family,throwing=['thrown','bomb'].includes(family);
  if(throwing&&f>=2)return;
  const im=this.image(w.art);if(!im.complete||!im.naturalWidth)return;
  const c=this.ctx,tile=this.bounds.tile,scale=Math.max(1,Math.round(tile/16));
  const aimed=['gun','crossbow'].includes(family),bow=family==='bow',shield=offhand||family==='shield';
  const maxH=tile*(shield?.7:bow?1:.95),k=Math.min(1,maxH/(im.naturalHeight*scale));
  const W=Math.max(1,Math.round(im.naturalWidth*scale*k)),H=Math.max(1,Math.round(im.naturalHeight*scale*k));
  const side=(e.flip?-1:1)*(offhand?-1:1),p=this.point(e.x+side*(shield?.3:.35),e.y-(shield?.15:.2));
  c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(p.x),Math.round(p.y));if(e.flip)c.scale(-1,1);
  if(shield){c.drawImage(im,-Math.round(W/2),-Math.round(H/2),W,H);c.restore();return}
  if(aimed){c.rotate(Math.PI/2);if(f===1)c.translate(0,scale)}                 // gun / crossbow point forward, recoil
  else if(bow){if(f===1)c.translate(-scale,0)}                                  // bow held upright, draw back on release
  else c.rotate((f>=0?[-60,-20,20,60][f]:-15)*Math.PI/180);                     // melee: slight lean, swing on attack
  if(throwing&&f===1)c.translate(scale,0);
  const gripY=aimed||bow?Math.round(H/2):Math.round(H*.75);                     // centred for ranged, grip near the bottom for melee
  c.drawImage(im,-Math.round(W/2),-gripY,W,H);c.restore();
 }


 entity(e){
  const c=this.ctx,
  t=this.bounds.tile,
  point=this.point(e.x,
  e.y);
  if(e.status==='escaped'||e.status==='surrendered'||!this.isUnitVisible(e))return;
  if(e.status==='downed'||e.status==='dead'){
   const death=this.downPoses?.get(e.id),age=this.fxClock-death;
   if(death!==undefined&&age<.3){c.save();c.globalAlpha=[1,.66,.33][Math.min(2,Math.floor(age/.1))];
    const sprite=this.bodySprite(e,0);if(sprite.startsWith('yd/'))this.nativeSprite(sprite,e.x,e.y+.35,e.flip);
    else this.sprite(sprite,e.x-.5,e.y-1.15,1,1.5,e.flip);c.restore()}
   if(this.level!=='overview')this.sprite('skull',
   e.x-.3,
   e.y-.2,
   .6,
   .6,
   false,
   e.status==='dead'?.25:.65);
   if(e.status==='downed'&&e.bleedOutAt)this.label(Math.max(0,
   Math.ceil(e.bleedOutAt-this.game.state.time))+'s',
   e.x,
   e.y-.65,
   '#d8a47e',
   10);
   if(e.rescueProgress>0){
    this.rect(e.x-.6,
    e.y+.45,
    1.2,
    .12,
    '#25372b');
    this.rect(e.x-.6,
    e.y+.45,
    1.2*e.rescueProgress,
    .12,
    '#a1c78a')
   }
   return
  }
  if(this.level==='overview'){
   c.fillStyle=e.faction==='hero'?'#e0c693':e.boss?'#d27f69':'#96b08a';
   c.beginPath();
   c.arc(point.x,
   point.y,
   e.boss?4:2.2,
   0,
   Math.PI*2);
   c.fill();
   return
  }
  const big=!!e.boss,
  size=big?e.boss==='warden'?2.7:3:(SPECIES[e.species].size||1),
  aspect=big||SPECIES[e.species].size||['angelHerald','iceZombie','muddy','swampy','slime',
  'mimic',
  'imp',
  'wogol',
  'zombie'].includes(e.species)?1:1.5;
  const f=Math.floor(this.time*6)%4,
  def=SPECIES[e.species],
  sprite=this.bodySprite(e,f);
  c.fillStyle='#02070977';
  c.beginPath();
  c.ellipse(point.x,
  point.y+t*.18,
  t*size*.4,
  t*size*.18,
  0,
  0,
  Math.PI*2);
  c.fill();
  if(this.selected===e.id||e.elite||e.boss){
   c.strokeStyle=this.selected===e.id?'#f0d49b':e.faction==='hero'?'#d4b367':'#9da7ca';
   c.lineWidth=e.elite?1.8:1;
   c.beginPath();
   c.ellipse(point.x,
   point.y+t*.16,
   t*size*.55,
   t*size*.25,
   0,
   0,
   Math.PI*2);
   c.stroke()
  }
  c.save();
  c.filter=SPECIES[e.species].sprite.startsWith('yd/')?'none':
   e.variant==='frost'?'hue-rotate(125deg) saturate(.75)':e.variant==='fire'?'sepia(.5) saturate(1.3)':e.variant==='shadow'?'hue-rotate(220deg)':e.variant==='poison'?
  'hue-rotate(40deg)':'none';
  const flash=this.hitFlashes?.get(e.id);
  if(flash){c.filter='brightness(0) invert(1)';const length=Math.hypot(flash.dx,flash.dy)||1;
   c.translate(Math.round(flash.dx/length),Math.round(flash.dy/length))}
  if(sprite.startsWith('yd/'))this.nativeSprite(sprite,e.x,e.y+.35,e.flip);
  else this.sprite(sprite,
  e.x-size/2+(e.strike?Math.sin(e.strike*20)*.13:0),
  e.y-size*aspect+.35,
  size,
  size*aspect,
  e.flip);
  c.restore();
  const weapon=this.game.weaponDefinition(e);
  if(weapon&&!e.disguised&&this.level==='detail')this.drawWeapon(e,weapon);
  const offhand=this.game.offhandDefinition(e);
  if(offhand&&!e.disguised&&this.level!=='overview')this.drawWeapon(e,offhand,true);

  if(e.variantColor){
   c.strokeStyle=e.variantColor;
   c.lineWidth=1.5;
   c.beginPath();
   c.ellipse(point.x,
   point.y+t*.2,
   t*size*.5,
   t*size*.2,
   0,
   0,
   Math.PI*2);
   c.stroke()
  }
  if(e.evolutionStyle==='guard')this.sprite('weapon_knight_sword',
  e.x-.8,
  e.y-1.5,
  .4,
  1.4);
  if(e.elite||e.evolution)this.sprite('weapon_golden_sword',
  e.x+.3,
  e.y-1.2,
  .35,
  1);
  if(e.boss)this.sprite('weapon_big_hammer',
  e.x+1,
  e.y-1.8,
  .8,
  1.7);
  if(e.hp<e.maxHp||e.boss||this.selected===e.id){
   const bar=big?3:1.15;
   this.rect(e.x-bar/2,
   e.y-size*aspect-.05,
   bar,
   .12,
   '#111719');
   this.rect(e.x-bar/2,
   e.y-size*aspect-.05,
   bar*e.hp/e.maxHp,
   .12,
   e.faction==='hero'?'#d2b27e':'#93b08b')
  }
  if(e.isCommander)this.label('◆',
  e.x,
  e.y-size*aspect-.9,
  '#e6c47e',
  12);
  if(e.boss||this.selected===e.id)this.label(e.name,
  e.x,
  e.y-size*aspect-.35,
  e.elite?'#e9c67e':'#dfd9c4',
  e.boss?12:11);
  const statuses=e.statuses.filter(s=>s.permanent||s.until>this.game.state.time);
  if(statuses.some(s=>s.type==='shield')){
   c.strokeStyle='#a8cbe6aa';
   c.lineWidth=1;
   c.beginPath();
   c.ellipse(point.x,
   point.y-t*.6,
   t*size*.7,
   t*size,
   0,
   0,
   Math.PI*2);
   c.stroke()
  }
  for(let i=0;
  i<Math.min(3,
  statuses.length);
  i++){
   const d=STATUS[statuses[i].type];
   if(d&&!this.uiIcon('status',statuses[i].type,e.x+(i-1)*.45,e.y-size*aspect-.65,8))this.label(d.symbol,
   e.x+(i-1)*.45,
   e.y-size*aspect-.65,
   d.color||'#d3d8b2',
   10)
  }
  if(e.channel)this.label(e.action==='disarm'?'GỠ BẪY':'CỨU HỘ',
  e.x,
  e.y-2,
  '#b2d3b3',
  10);
  if(e.teleport>0)this.label('DỊCH CHUYỂN '+Math.ceil(3-e.teleport)+'s',
  e.x,
  e.y-2.3,
  '#b8b4ef',
  10);
 }
 draw(delta){
  delta=Math.max(0,Number(delta)||0);
  this.labelRects=[];
  this.capturePresentation(delta);
  if(this.presentationSettings.hitstop&&this.fxClock<this.hitStopUntil)return;
  this.time+=delta*(this.fxClock<this.slowRenderUntil?.3:1);
  this.captureAttacks();
  this.fxBudget=Math.min(40,Math.max(0,64-this.combatFx.length));
  const{
   w,
   h,
   c
  }
  =this.resize(this.canvas),
  tile=this.camera.tile;
  this.bounds={
   tile,
   x:Math.round(w/2-this.camera.x*tile),
   y:Math.round(h/2-this.camera.y*tile)
  }
  ;
  if(this.presentationSettings.shake&&this.fxClock<this.shakeUntil){
   const step=Math.floor(this.fxClock*60);this.bounds.x+=step%2?3:-3;this.bounds.y+=step%3?2:-2;
  }
  this.updateFog();
  c.fillStyle='#10181b';
  c.fillRect(0,
  0,
  w,
  h);
  const minX=Math.max(0,
  Math.floor(-this.bounds.x/tile)-2),
  maxX=Math.min(WIDTH-1,
  Math.ceil((w-this.bounds.x)/tile)+2),
  minY=Math.max(0,
  Math.floor(-this.bounds.y/tile)-2),
  maxY=Math.min(HEIGHT-1,
  Math.ceil((h-this.bounds.y)/tile)+2),
  s=this.game.state,
  level=this.level,
  rooms=this.game.rooms(this.floor),
  frame=((Math.floor(this.time*5)%4)+4)%4;
  if(level==='overview'){
   for(const co of this.game.corridors.filter(co=>co.floorId===this.floor)){
    this.rect(co.x-.5,
    co.y-.5,
    co.w,
    co.h,
    '#39433f');
    this.stroke(co.x-.5,
    co.y-.5,
    co.w,
    co.h,
    '#62716a55')
   }
  }
  else{
   const layer=this.useFloorCache===false?null:this.floorLayer();
   if(layer){const p=this.point(-.5,-.5);c.drawImage(layer,Math.round(p.x),Math.round(p.y),
    Math.round(WIDTH*tile),Math.round(HEIGHT*tile));}
   else for(let y=minY;
   y<=maxY;
   y++)for(let x=minX;
   x<=maxX;
   x++)if(this.game.terrain[this.floor]?.[y]?.[x]){
    const hash=(x*13+y*71+s.worldSeed)%29,
    index=hash<20?1:2+hash%7;
    this.sprite(this.tile('floor_'+index),
    x-.5,
    y-.5);
    if(!this.game.terrain[this.floor]?.[y-1]?.[x])this.rect(x-.5,
    y-.5,
    1,
    .13,
    '#050c1099');
    if(hash===2&&level==='detail')this.rect(x-.28,
    y+.1,
    .18,
    .04,
    '#71827a22')
   }
   else if((x*17+y*13)%29===0)this.rect(x,
   y,
   .2,
   .09,
   '#29333466')
  }
  for(const r of rooms){
   const b=bounds(r);
   if(b.x>maxX||b.y>maxY||b.x+b.w<minX||b.y+b.h<minY)continue;
   this.ground(r)
  }
  if(this.card?.kind==='room')for(let row=0;
  row<ROWS;
  row++)for(let col=0;
  col<COLS;
  col++){
   if(rooms.some(r=>r.col===col&&r.row===row)||rooms.length&&!rooms.some(r=>Math.abs(r.col-col)+Math.abs(r.row-row)===1))continue;
   const p=center({
    col,
    row
   }
   ),
   hover=this.hover&&Math.abs(this.hover.x-p.x)<15&&Math.abs(this.hover.y-p.y)<12;
   this.rect(p.x-8,
   p.y-7,
   17,
   15,
   hover?'#c4ac6133':'#c4ac6110');
   c.setLineDash([5,
   7]);
   this.stroke(p.x-8.5,
   p.y-7.5,
   17,
   15,
   hover?'#d7bb7c':'#6f795b');
   c.setLineDash([]);
   this.label('+',
   p.x,
   p.y+1,
   '#c2b279',
   24)
  }
  if(!rooms.length&&!this.card){
   this.label('BẢN THIẾT KẾ TRỐNG',
   72,
   40,
   '#d6bc83',
   18);
   this.label('Chọn thẻ phòng để bắt đầu bố trí. Bạn tự đặt cả cổng vào và phòng rương.',
   72,
   47,
   '#aab79e',
   12)
  }
  for(const p of s.props.filter(p=>p.floorId===this.floor&&['wall',
  'pit'].includes(p.type))){
   if(p.type==='pit'){
    this.rect(p.x-.5,
    p.y-.5,
    1,
    1,
    '#060d16');
    this.rect(p.x-.5,
    p.y-.5,
    1,
    .12,
    '#7c7762');
    this.rect(p.x-.5,
    p.y-.38,
    .12,
    .88,
    '#3a4246')
   }
   else if(level==='overview'){
    this.rect(p.x-.5,
    p.y-.5,
    1,
    1,
    '#89917f')
   }
   else{
    this.sprite(this.tile('wall_mid'),
    p.x-.5,
    p.y-.5);
    this.sprite(this.tile('wall_top_mid'),
    p.x-.5,
    p.y-1)
   }
  }
  if(level!=='overview')this.drawMasterDecor(s);
  if(this.wallEditor&&this.wallHover&&this.wallHover.floorId===this.floor){
   const h=this.wallHover,room=s.rooms.find(r=>r.id===this.wallEditor.roomId),x=Math.round(h.x),y=Math.round(h.y);
   const issue=this.wallEditor.type==='erase'?null:room&&this.game.wallIssue(room,x,y,this.wallEditor.type);
   this.rect(x-.5,y-.5,1,1,issue?'#da4e3866':'#facb3e55');this.stroke(x-.5,y-.5,1,1,issue?'#da4e38':'#facb3e');
   if(issue)this.label(issue,x,y-1,'#f78697',11);
  }
  if(level!=='overview')for(const t of s.traps.filter(t=>t.floorId===this.floor)){
   if(t.plus&&!t.disabled){if(!t.spent&&(t.revealed||this.fogMode==='all'))this.nativeSprite('yd/traps/trap_'+t.type,t.x,t.y+.45,false,'feet');continue}
   if(t.disabled){
    this.rect(t.x-.3,
    t.y-.3,
    .6,
    .6,
    '#57766744');
    continue
   }
   if(t.type==='spikes')this.sprite(`floor_spikes_anim_f${
t.windup>0||t.cooldown>4?2:0
}`,
   t.x-.5,
   t.y-.5,
   1,
   1,
   false,
   t.revealed?.95:.6);
   else{
    this.rect(t.x-.43,
    t.y-.43,
    .86,
    .86,
    t.type==='frost'?'#417c9366':'#aa725566');
    this.sprite(t.type==='frost'?'flask_blue':'weapon_arrow',
    t.x-.28,
    t.y-.4,
    .55,
    .8,
    false,
    t.revealed?1:.6)
   }
   if(t.windup>0)this.stroke(t.x-1,
   t.y-1,
   2,
   2,
   '#eeb16c',
   2);
   if(this.selected===t.id)this.stroke(t.x-.7,
   t.y-.7,
   1.4,
   1.4,
   '#e8c790')
  }
  for(const hzd of s.hazards.filter(a=>a.floorId===this.floor)){
   const p=this.point(hzd.x,
   hzd.y);
   c.fillStyle=hzd.type==='poison'?'#8eb35e37':'#d58d5137';
   c.beginPath();
   c.arc(p.x,
   p.y,
   hzd.radius*tile,
   0,
   Math.PI*2);
   c.fill();
   if(level==='detail')for(let i=0;
   i<14;
   i++){
    const angle=i*2.4+this.time*.3,
    r=(i%5)/5*hzd.radius;
    this.rect(hzd.x+Math.cos(angle)*r,
    hzd.y+Math.sin(angle)*r-Math.sin(this.time+i)*.3,
    .12,
    .12,
    hzd.type==='poison'?'#a1c36e77':'#e9ad6888')
   }
  }
  if(level!=='overview'){
   for(const item of s.items.filter(i=>!i.owner&&i.floorId===this.floor&&i.x!==null))this.sprite('coin_anim_f'+frame,
   item.x-.3,
   item.y-.3,
   .6,
   .6);
   const carrier=this.game.entity(s.treasure.carrier),
   treasure=carrier||s.treasure;
   if(this.game.state.rooms.some(r=>r.type==='treasure')&&treasure.floorId===this.floor)this.sprite('chest_full_open_anim_f2',
   treasure.x-.6,
   treasure.y-(carrier?2.6:.7),
   1.2,
   1.2)
  }
  for(const r of rooms)if(r.rewardChest){
   const chest=r.rewardChest,
   tier=CHEST_TIERS[chest.tier-1];
   if(level==='overview')this.rect(chest.x-.6,
   chest.y-.5,
   1.2,
   1,
   tier.color);
   else{
    this.sprite(chest.opened?'chest_empty_open_anim_f2':'chest_full_open_anim_f0',
    chest.x-.65,
    chest.y-.8,
    1.3,
    1.3);
    this.stroke(chest.x-.7,
    chest.y-.8,
    1.4,
    1.35,
    tier.color);
    this.label(['I',
    'II',
    'III',
    'IV',
    'V'][chest.tier-1],
    chest.x,
    chest.y-1.1,
    tier.color,
    11)
   }
  }
  const objects=[...s.entities.filter(e=>e.floorId===this.floor).map(e=>({
   kind:'entity',
   obj:e
  }
  )),
  ...(level==='detail'?s.props.filter(p=>p.floorId===this.floor&&!['wall',
  'pit'].includes(p.type)).map(p=>({
   kind:'prop',
   obj:p
  }
  )):[])].filter(o=>o.obj.x>=minX-3&&o.obj.x<=maxX+3&&o.obj.y>=minY-3&&o.obj.y<=maxY+3).sort((a,
  b)=>a.obj.y-b.obj.y);
  for(const o of objects)o.kind==='entity'?this.entity(o.obj):this.renderProp(o.obj);
  if(level==='tactical')for(const p of s.props.filter(p=>!p.destroyed&&p.floorId===this.floor&&!['wall',
  'pit'].includes(p.type)))this.rect(p.x-.35,
  p.y-.35,
  .7,
  .7,
  p.type==='pillar'?'#879484':p.type==='explosive'?'#b16953':p.type==='poison'?'#82a265':'#72604d');
  for(const room of rooms)if(room.sealed||room.sealAt!==null)for(const door of room.doors){
   const closed=room.sealed,
   progress=closed?1:Math.max(0,
   1-(room.sealAt-s.time)/1.2),
   x=door.x-.5-(door.axis==='y'?1:0),
   y=door.y-.5-(door.axis==='x'?1:0),
   gw=door.axis==='y'?3:1,
   gh=door.axis==='x'?3:1;
   this.rect(x,
   y,
   gw,
   gh,
   closed?'#703f39dd':'#bf805044');
   if(level!=='overview'){
    for(let i=0;
    i<6;
    i++)if(door.axis==='y')this.rect(x+i*.5,
    y,
    .16,
    progress,
    '#cba384');
    else this.rect(x,
    y+i*.5,
    progress,
    .16,
    '#cba384');
    this.stroke(x,
    y,
    gw,
    gh,
    '#db9272',
    1.5)
   }
  }
  for(const t of s.telegraphs.filter(a=>a.floorId===this.floor)){
   if(this.drawPixelTelegraph(t))continue;
   const p=this.point(t.x,
   t.y),
   progress=(s.time-t.createdAt)/(t.resolveAt-t.createdAt);
   c.strokeStyle='#eda983';
   c.fillStyle='#d16a573b';
   c.lineWidth=2;
   if(t.type==='cone'){
    const angle=Math.atan2(t.ty-t.y,
    t.tx-t.x);
    c.beginPath();
    c.moveTo(p.x,
    p.y);
    c.arc(p.x,
    p.y,
    t.radius*tile,
    angle-Math.PI/3,
    angle+Math.PI/3);
    c.closePath();
    c.fill();
    c.stroke()
   }
   else if(t.type==='circle'){
    c.beginPath();
    c.arc(p.x,
    p.y,
    t.radius*tile,
    0,
    Math.PI*2);
    c.fill();
    c.stroke();
    c.beginPath();
    c.arc(p.x,
    p.y,
    t.radius*tile*progress,
    0,
    Math.PI*2);
    c.stroke()
   }
   else{
    const q=this.point(t.tx,
    t.ty);
    c.lineWidth=t.width*2*tile;
    c.strokeStyle='#dc855a55';
    c.beginPath();
    c.moveTo(p.x,
    p.y);
    c.lineTo(q.x,
    q.y);
    c.stroke();
    c.lineWidth=2;
    c.strokeStyle='#efba85';
    c.stroke()
   }
   this.label('NÉ',
   t.x,
   t.y,
   '#f3d4ad',
   11)
  }
  if(this.gridVisible&&level!=='overview'){
   c.strokeStyle='#bdd0c51c';
   c.lineWidth=.5;
   for(let y=minY;
   y<=maxY;
   y++)for(let x=minX;
   x<=maxX;
   x++)if(this.game.terrain[this.floor]?.[y]?.[x]){
    const p=this.point(x-.5,
    y-.5);
    c.strokeRect(p.x,
    p.y,
    tile,
    tile)
   }
   const e=this.game.entity(this.selected);
   if(e?.floorId===this.floor&&e.path.length){
    c.strokeStyle='#b6dfd1';
    c.lineWidth=1.5;
    c.beginPath();
    let p=this.point(e.x,
    e.y);
    c.moveTo(p.x,
    p.y);
    for(const q of e.path){
     p=this.point(q.x,
     q.y);
     c.lineTo(p.x,
     p.y)
    }
    c.stroke()
   }
  }
  for(const f of this.game.effects.filter(f=>f.floorId===this.floor)){
   if(f.projectile){
    if(!f.source)this.drawProjectile(f)
   }
   else if(f.beam){
    const p=this.point(f.x,
    f.y-.5),
    q=this.point(f.tx,
    f.ty-.5);
    c.strokeStyle=f.color;
    c.lineWidth=2;
    c.beginPath();
    c.moveTo(p.x,
    p.y);
    c.lineTo(q.x,
    q.y);
    c.stroke()
   }
   else if(f.blast){
    const p=this.point(f.x,
    f.y);
    c.strokeStyle=f.color;
    c.lineWidth=2;
    c.globalAlpha=Math.min(1,
    f.life*2);
    c.beginPath();
    c.arc(p.x,
    p.y,
    (f.radius||2)*tile*(1.1-f.life),
    0,
    Math.PI*2);
    c.stroke();
    c.globalAlpha=1
   }
   else if(level==='detail')this.label(f.text,
   f.x,
   f.y-1.5-(1-f.life),
   f.color,
   12)
  }
  for(const p of s.projectiles||[]){
   if(p.floorId!==this.floor||this.visibleTiles&&!this.visibleTiles[Math.round(p.y)*WIDTH+Math.round(p.x)])continue;
   this.drawProjectile({x:p.x,y:p.y+.3,tx:p.x,ty:p.y+.3,life:0,maxLife:1,projectile:p.kind==='bolt'?'arrow':p.kind,vx:p.vx,vy:p.vy});
  }
  for(const f of this.projectiles){
   if(f.floorId!==this.floor||this.visibleTiles&&!this.visibleTiles[Math.round(f.y)*WIDTH+Math.round(f.x)])continue;
   const throwing=['knife','axe','bomb'].includes(f.projectile),delay=throwing?.15:0,age=this.time-f.born-delay;
   if(age<0||age>.3)continue;this.drawProjectile({...f,life:.3-age,maxLife:.3});
  }
  this.drawFx();
  this.drawCombatFx();
  this.drawSpeech(s);
  const key=s.keyQuest;
  if(key?.locked){
   const holder=this.game.entity(key.owner),
   p=holder||key;
   if(key.placed&&p.floorId===this.floor&&(this.fogMode==='all'||holder&&this.isUnitVisible(holder)||!holder&&this.visibleTiles?.[Math.round(p.y)*WIDTH+Math.round(p.x)])){
    this.label('⚿',
    p.x,
    p.y-(holder?2:.4),
    '#f2d78b',
    20)
   }
   const core=rooms.find(r=>r.type==='treasure');
   if(core)for(const d of core.doors){
    const x=d.x-.5-(d.axis==='y'?1:0),
    y=d.y-.5-(d.axis==='x'?1:0);
    this.rect(x,
    y,
    d.axis==='y'?3:1,
    d.axis==='x'?3:1,
    '#ab8149cc');
    this.label('⚿',
    d.x,
    d.y,
    '#f4dfae',
    16)
   }
  }
  const coreRoom=rooms.find(r=>r.type==='treasure');
  if(key&&coreRoom&&level!=='overview')for(const [i,d]of coreRoom.doors.entries()){
   this.sprite(key.locked?'lever_left':'lever_right',d.x+1,d.y-1);
   this.sprite('button_'+(i%2?'red':'blue')+'_'+(key.locked?'up':'down'),d.x+1,d.y);
  }
  const gradient=c.createRadialGradient(w/2,
  h/2,
  Math.min(w,
  h)*.35,
  w/2,
  h/2,
  Math.max(w,
  h)*.7);
  gradient.addColorStop(0,
  '#03090c00');
  gradient.addColorStop(1,
  '#03090c66');
  c.fillStyle=gradient;
  c.fillRect(0,
  0,
  w,
  h);
  this.drawFog(minX,
  maxX,
  minY,
  maxY);
  this.drawMini();
 }
 drawSpeech(s){
  // pixel parchment bubbles over talking adventurers (presentation only)
  const speech=this.game.speech;if(!speech?.size||this.level==='overview')return;
  const c=this.ctx,t=this.bounds.tile,size=Math.max(14,Math.round(t*.45/7)*7);
  c.save();c.font=`${size}px "YD Pixel", Consolas, monospace`;c.textBaseline='middle';c.imageSmoothingEnabled=false;
  for(const[id,sp]of speech){
   if(sp.until<=s.time){speech.delete(id);continue}
   const e=this.game.entity(id);if(!e||e.floorId!==this.floor||e.status!=='active'||!this.isUnitVisible?.(e))continue;
   const p=this.point(e.x,e.y-1.95),w=Math.ceil(c.measureText(sp.text).width)+12,h=size+10;
   const x=Math.round(p.x-w/2),y=Math.round(p.y-h);
   c.fillStyle='#222222';c.fillRect(x-2,y-2,w+4,h+4);c.fillStyle='#e2b694';c.fillRect(x,y,w,h);
   c.fillStyle='#d3bfa9';c.fillRect(x,y+h-3,w,3);
   c.fillStyle='#222222';c.fillRect(Math.round(p.x)-3,y+h+2,6,4);c.fillStyle='#e2b694';c.fillRect(Math.round(p.x)-1,y+h,2,4);
   c.fillStyle='#38262d';c.fillText(sp.text,x+6,y+h/2);
  }
  c.restore();
 }
 drawMasterDecor(s){
  // Render-only decor for rooms with a living room master: rug + throne at the north side, aura banners on the wall.
  for(const r of s.rooms){
   if(r.floorId!==this.floor)continue;const m=this.game.entity(r.commanderId);
   if(!m||m.status!=='active'||!m.isCommander||!this.game.masterInfo)continue;
   const top=r.y-r.h/2,info=this.game.masterInfo(m);
   this.nativeSprite('yd/tiles/master/master_rug',r.x,top+3.6,false,'feet');
   this.nativeSprite('yd/tiles/master/master_throne',r.x,top+2.6,false,'feet');
   const colors={power:'red',fortify:'blue',haste:'green',regen:'green',focus:'purple'};
   info.auras.slice(0,3).forEach((a,i)=>{const dx=[-3,3,-6][i];
    this.nativeSprite('yd/tiles/master/master_banner_'+(colors[a]||'red'),r.x+dx,top+1.4,false,'feet')});
  }
 }
 drawProjectile(f){
  const t=this.bounds.tile,
  progress=Math.max(0,
  Math.min(1,
  1-f.life/(f.maxLife||.3))),
  x=f.x+(f.tx-f.x)*progress,
  y=f.y+(f.ty-f.y)*progress-.5,
  c=this.ctx;
  if(f.projectile==='bullet'){this.rect(x-.12,y-.04,.24,.08,'#f0d594');return}
  if(f.projectile==='bomb'){this.nativeSprite('bomb_f0',x,y-Math.sin(progress*Math.PI)*1.5,false,'center');return}
  const frames=this.fxSprite(f.projectile);
  if(frames&&this.level!=='overview'){
   if(this.fxBudget<=0)return;this.fxBudget--;
   this.nativeSprite(frames[Math.floor(this.time*8)%4],x,y,false,'center');return;
  }
  if(['fire',
  'frost',
  'curse',
  'magic'].includes(f.projectile)){
   const color=f.projectile==='fire'?'#f5b36e':f.projectile==='frost'?'#9bdef4':'#bda9ef';
   this.rect(x-.15,
   y-.15,
   .3,
   .3,
   color);
   this.rect(x-.08,
   y-.08,
   .16,
   .16,
   '#f6ecc9');
   return
  }
  const im=this.image(f.projectile==='axe'?'weapon_throwing_axe':f.projectile==='knife'?'weapon_knife':'weapon_arrow');
  if(!im.complete||!im.naturalWidth)return;
  const p=this.point(x,
  y);
  c.save();
  c.translate(Math.round(p.x),
  Math.round(p.y));
  c.rotate(Math.atan2(f.ty-f.y,
  f.tx-f.x)+Math.PI/2+(f.projectile==='axe'?progress*Math.PI*4:0));
  c.drawImage(im,
  -t*.2,
  -t*.5,
  t*.4,
  t);
  c.restore()
 }
 setFogMode(mode){
  this.fogMode=mode==='selected'?'selected':'all';
  this.fogKey=null;
  this.updateFog();
 }
 updateFog(){
  const selected=this.game.entity(this.selected);
  if(this.fogMode!=='selected'||!selected||selected.floorId!==this.floor){
   this.visibleTiles=null;
   this.remembered=null;
   this.observers=[];
   this.viewerFaction=null;
   this.fogKey=null;
   this.lastFogTime=-Infinity;
   return
  }
  const sources=selected.status==='active'?[selected]:[];
  this.observers=sources;
  this.viewerFaction=selected.faction;
  const key=`${
this.floor
}:selected:${
selected.id
}`,
  revision=`${
this.game.navRevision
}:${
selected.status
}`;
  if(this.visibleTiles&&this.time-(this.lastFogTime??-Infinity)<.25&&this.fogKey===key&&this.fogNav===revision)return;
  this.fogKey=key;
  this.fogNav=revision;
  this.lastFogTime=this.time;
  this.visibleTiles=new Uint8Array(WIDTH*HEIGHT);
  this.fogMemory??=new Map();
  if(!this.fogMemory.has(key))this.fogMemory.set(key,
  new Uint8Array(WIDTH*HEIGHT));
  this.remembered=this.fogMemory.get(key);
  for(const e of sources){
   const radius=this.game.vision(e);
   for(let y=Math.max(0,
   Math.floor(e.y-radius));
   y<=Math.min(HEIGHT-1,
   Math.ceil(e.y+radius));
   y++)for(let x=Math.max(0,
   Math.floor(e.x-radius));
   x<=Math.min(WIDTH-1,
   Math.ceil(e.x+radius));
   x++){
    if(distance(e,
    {
     x,
     y
    }
    )>radius||!this.game.terrain[this.floor][y][x])continue;
    if(this.game.lineOfSight(e,
    {
     x,
     y,
     floorId:this.floor
    }
    )){
     this.visibleTiles[y*WIDTH+x]=1;
     this.remembered[y*WIDTH+x]=1
    }
   }
  }
 }
 isUnitVisible(e){
  if(!this.visibleTiles)return true;
  const visible=!!this.visibleTiles[Math.round(e.y)*WIDTH+Math.round(e.x)];
  if(!visible)return false;
  if(e.faction!==this.viewerFaction&&e.disguised)return true;
  return e.faction===this.viewerFaction||this.observers?.some(a=>this.game.canSeeEnemy(a,
  e))
 }
 drawFog(minX,
 maxX,
 minY,
 maxY){
  if(!this.visibleTiles)return;
  for(let y=minY;
  y<=maxY;
  y++)for(let x=minX;
  x<=maxX;
  x++)if(this.game.terrain[this.floor][y]?.[x]&&!this.visibleTiles[y*WIDTH+x])this.rect(x-.5,
  y-.5,
  1,
  1,
  this.remembered?.[y*WIDTH+x]?'#07101692':'#071016c7')
 }
 drawFacility(room){
  const p=center(room),
  type=room.type,
  f=Math.floor(this.time*4)%3;
  if(['mana',
  'darkaltar',
  'oracle'].includes(type)){
   if(type==='oracle'){
    this.sprite('flask_big_yellow',
    p.x-.7,
    p.y-3.1,
    1.4,
    1.4);
    this.stroke(p.x-1,
    p.y-3.4,
    2,
    2,
    '#d8bf7b66')
   }
   else if(type==='darkaltar'){
    this.sprite('wall_fountain_mid_red_anim_f'+f,
    p.x-.5,
    p.y-3);
    this.sprite('wall_fountain_basin_red_anim_f'+f,
    p.x-.5,
    p.y-2);
    this.sprite('skull',
    p.x-.3,
    p.y-2.8,
    .6,
    .6)
   }
  }
  if(type==='forge'){
   this.sprite('crate',
   p.x-.7,
   p.y-2.5,
   1.4,
   1.1);
   this.sprite('weapon_big_hammer',
   p.x-.4,
   p.y-4.3,
   .8,
   1.8)
  }
  if(type==='poisonpool'){
   for(let y=-3;
   y<=0;
   y++)for(let x=-2;
   x<=2;
   x++)this.rect(p.x+x-.5,
   p.y+y-.5,
   1,
   1,
   (x+y)%2?'#5b784677':'#82905177')
  }
  if(type==='library'){
   for(let x=-3;
   x<=3;
   x++){
    this.sprite('crate',
    p.x+x-.5,
    p.y-5);
    this.rect(p.x+x-.32,
    p.y-5.3,
    .15,
    .6,
    x%2?'#a6846c':'#78908b')
   }
  }
  if(type==='stonevault')for(const dx of[-4,
  4])this.sprite('column',
  p.x+dx-.5,
  p.y-4,
  1,
  2);
  if(type==='herbgarden')for(const dx of[-4,
  -2,
  2,
  4])for(const dy of[-3,
  3]){
   this.rect(p.x+dx-.5,
   p.y+dy-.3,
   1,
   .8,
   '#354d3777');
   this.sprite('flask_green',
   p.x+dx-.25,
   p.y+dy-.6,
   .5,
   .8)
  }
  if(type==='spyroom'){
   this.sprite('crate',
   p.x-.8,
   p.y-2.5,
   1.6,
   1.2);
   this.rect(p.x-.45,
   p.y-2.6,
   .9,
   .7,
   '#b8ac83');
   this.sprite('elf_f_idle_anim_f'+Math.floor(this.time*5)%4,
   p.x-2,
   p.y-2,
   1,
   1.5)
  }
  if(type==='webnest'){
   const c=this.ctx;
   c.strokeStyle='#b8c6c44a';
   c.lineWidth=1;
   const q=this.point(p.x,
   p.y-2);
   for(let i=0;
   i<8;
   i++){
    const a=i*Math.PI/4,
    z=this.point(p.x+Math.cos(a)*4,
    p.y-2+Math.sin(a)*4);
    c.beginPath();
    c.moveTo(q.x,
    q.y);
    c.lineTo(z.x,
    z.y);
    c.stroke()
   }
  }
  const building={
   x:p.x,
   y:p.y-2
  }
  ;
  if(room.buildingHp<room.buildingMaxHp){
   this.rect(building.x-1,
   building.y-1.1,
   2,
   .12,
   '#18232a');
   this.rect(building.x-1,
   building.y-1.1,
   2*room.buildingHp/room.buildingMaxHp,
   .12,
   room.owner==='dungeon'?'#96b389':'#d39c78')
  }
  if(room.owner!=='dungeon')this.label(room.buildingHp?'BỊ CHIẾM':'CÔNG TRÌNH BỊ PHÁ',
  p.x,
  p.y-3.6,
  '#de9e85',
  11)
 }
 drawMini(){
  const{
   w,
   h,
   c
  }
  =this.resize(this.mini);
  const scale=Math.min(w/WIDTH,
  h/HEIGHT),
  ox=(w-WIDTH*scale)/2,
  oy=(h-HEIGHT*scale)/2;
  c.fillStyle='#111b20e8';
  c.fillRect(0,
  0,
  w,
  h);
  for(const co of this.game.corridors.filter(c=>c.floorId===this.floor)){
   c.fillStyle='#425553';
   c.fillRect(ox+co.x*scale,
   oy+co.y*scale,
   co.w*scale,
   co.h*scale)
  }
  for(const r of this.game.rooms(this.floor)){
   const b=bounds(r);
   c.fillStyle=r.owner!=='dungeon'?'#9e6755':r.sealed?'#9e6755':r.type==='boss'||r.type==='treasure'?'#8c7653':'#657e73';
   c.fillRect(ox+b.x*scale,
   oy+b.y*scale,
   b.w*scale,
   b.h*scale)
  }
  for(const e of this.game.state.entities.filter(e=>e.status==='active'&&e.floorId===this.floor&&this.isUnitVisible(e))){
   c.fillStyle=e.faction==='hero'?'#ffe4a6':e.boss?'#ee9271':'#a3c4bb';
   c.fillRect(ox+e.x*scale-1,
   oy+e.y*scale-1,
   e.boss?3:2,
   e.boss?3:2)
  }
  const r=this.canvas.getBoundingClientRect();
  c.strokeStyle='#d8c398';
  c.lineWidth=1;
  c.strokeRect(ox+(this.camera.x-r.width/this.camera.tile/2)*scale,
  oy+(this.camera.y-r.height/this.camera.tile/2)*scale,
  r.width/this.camera.tile*scale,
  r.height/this.camera.tile*scale);
  this.miniBounds={
   scale,
   ox,
   oy
  }
 }
 miniHit(x,
 y){
  const r=this.mini.getBoundingClientRect(),
  b=this.miniBounds;
  this.camera.x=(x-r.left-b.ox)/b.scale;
  this.camera.y=(y-r.top-b.oy)/b.scale
 }
}

installCombatFx(Painter);
