const DEFAULTS={shake:true,numbers:true,hitstop:true};
export function loadPresentationSettings(storage,reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
 let saved={};try{storage??=globalThis.localStorage;saved=JSON.parse(storage?.getItem('yd-presentation')||'{}')}catch{}
 const settings={...DEFAULTS,...saved};if(reduced){settings.shake=false;settings.hitstop=false}return settings;
}
export function savePresentationSettings(settings,storage){try{storage??=globalThis.localStorage;storage?.setItem('yd-presentation',JSON.stringify(settings))}catch{}}
export function installCombatFx(Painter){
 const P=Painter.prototype;
 P.capturePresentation=function(delta){
  this.fxClock=(this.fxClock||0)+delta;this.presentationSettings??=loadPresentationSettings();
  if(this.presentationGame!==this.game){this.presentationGame=this.game;this.lastPresentation=0;this.combatFx=[];this.hitFlashes=new Map();this.downPoses=new Map()}
  for(const event of this.game.presentationEvents||[])if(event.id>this.lastPresentation){
   this.lastPresentation=event.id;if(event.floorId!==undefined&&event.floorId!==this.floor)continue;
   const age=this.fxClock,eventType=event.type;
   if(['hit','crit','heal'].includes(eventType)){
    if(eventType!=='heal'){this.hitFlashes.set(event.entityId,{until:age+2/60,dx:event.dx,dy:event.dy});
     this.combatFx.push({...event,born:age,kind:eventType==='crit'?'crit':event.melee?'slash':'hit_spark',life:.3});
     if((eventType==='crit'||event.boss)&&this.presentationSettings.hitstop)this.hitStopUntil=age+.05;
    }else this.combatFx.push({...event,born:age,kind:'heal',life:.4});
    if(this.presentationSettings.numbers){const merge=this.combatFx.find(f=>f.kind==='number'&&f.entityId===event.entityId&&
      f.numberType===eventType&&age-f.born<=.2);
     if(merge)merge.n+=event.n;else this.combatFx.push({...event,born:age,kind:'number',numberType:eventType,life:.6,
      side:(this.numberSequence=(this.numberSequence||0)+1)%2?4:-4});
    }
   }
   if(eventType==='down'){
    this.combatFx.push({...event,born:age,kind:event.bone?'bone_chips':'death_puff',life:.4});this.downPoses.set(event.entityId,age);
    if(event.boss||event.elite)this.shakeUntil=age+.2;if(event.lastHero)this.slowRenderUntil=age+.4;
   }
   if(eventType==='boss')this.shakeUntil=age+.2;
   if(eventType==='loot')for(let i=0;i<Math.min(6,Math.max(3,Math.ceil(event.n)));i++)
    this.combatFx.push({...event,born:age,kind:'loot',life:.5,side:i-2});
   if(eventType==='wave')this.waveBanner={...event,born:age};
  }
  this.combatFx=this.combatFx.filter(f=>this.fxClock-f.born<f.life).slice(-64);
  for(const[id,flash]of this.hitFlashes)if(flash.until<this.fxClock)this.hitFlashes.delete(id);
  for(const[id,born]of this.downPoses)if(this.fxClock-born>.3)this.downPoses.delete(id);
 };
 P.presentationImage=function(name){
  this.presentationImages??={};if(!this.presentationImages[name]){const im=new Image();im.src='assets/ui/kit/'+name+'.png';this.presentationImages[name]=im}
  return this.presentationImages[name];
 };
 P.drawDigits=function(f){
  const crit=f.numberType==='crit',heal=f.numberType==='heal',type=crit?'crit':heal?'heal':f.faction==='hero'?'hurt':'dmg',im=this.presentationImage('digits_'+type);
  if(!im.complete||!im.naturalWidth)return;
  const text=(heal?'+':'')+Math.round(f.n)+(crit?'!':''),scale=crit?3:2,p=this.point(f.x,f.y-1),age=this.fxClock-f.born;
  const c=this.ctx,y=Math.round(p.y)-Math.floor(age/.12)*2,x=Math.round(p.x)+f.side-text.length*8*scale/2;
  c.save();c.globalAlpha=age<.4?1:age<.5?.66:.33;c.imageSmoothingEnabled=false;
  for(let i=0;i<text.length;i++){const index='0123456789!+'.indexOf(text[i]);if(index>=0)c.drawImage(im,index*8,0,8,12,x+i*8*scale,y,8*scale,12*scale)}c.restore();
 };
 P.drawCombatFx=function(){
  this.renderedCombatFx=0;
  if(this.hudCtx)this.hudCtx.clearRect(0,0,this.hudCanvas.width,this.hudCanvas.height);
  for(const f of this.combatFx||[]){
   if(f.floorId!==this.floor||this.visibleTiles&&!this.visibleTiles[Math.round(f.y)*148+Math.round(f.x)])continue;
   if(f.kind==='number'){this.drawDigits(f);this.renderedCombatFx++;continue}
   const age=this.fxClock-f.born;
   if(f.kind==='loot'){
    const p=this.point(f.x,f.y),target=this.hudTargets?.[f.resource]||{x:this.canvas.width-60,y:0},t=Math.min(1,age/.5);
    if(this.hudCtx){p.x+=this.hudOrigin.x;p.y+=this.hudOrigin.y}
    const x=p.x+(target.x-p.x)*t,y=p.y+(target.y-p.y)*t-Math.sin(t*Math.PI)*(32+f.side*4),im=this.image(f.resource==='souls'?'skull':'coin_anim_f0');
    if(im.complete&&im.naturalWidth)(this.hudCtx||this.ctx).drawImage(im,Math.round(x)+f.side*4,Math.round(y),16,16);
   }else if(this.level!=='overview')this.nativeSprite(`yd/fx/${f.kind}_anim_f${Math.min(3,Math.floor(age/.075))}`,f.x,f.y-.7,false,'center');
   this.renderedCombatFx++;
  }
  if(this.waveBanner&&this.fxClock-this.waveBanner.born<1.8){const c=this.ctx,w=this.canvas.width;
   c.save();c.fillStyle='#21181eee';c.fillRect(Math.round(w/2-220),80,440,48);c.font='28px "YD Pixel",monospace';c.textAlign='center';c.fillStyle='#ffd25c';
   c.fillText(`ĐỢT ${this.waveBanner.wave} · ${this.waveBanner.count} MẠO HIỂM GIẢ`,w/2,112);c.restore();
  }
 };
 P.drawPixelTelegraph=function(t){
  const frame=Math.floor(this.time*8)%2,im=this.image('yd/fx/telegraph_anim_f'+frame);if(!im.complete||!im.naturalWidth)return false;
  const minX=Math.floor(Math.min(t.x,t.tx??t.x)-(t.radius||t.width||1)),maxX=Math.ceil(Math.max(t.x,t.tx??t.x)+(t.radius||t.width||1)),
   minY=Math.floor(Math.min(t.y,t.ty??t.y)-(t.radius||t.width||1)),maxY=Math.ceil(Math.max(t.y,t.ty??t.y)+(t.radius||t.width||1)),c=this.ctx,tile=this.bounds.tile;
  const inside=(x,y)=>this.game.inDanger({x,y,floorId:t.floorId},t);
  c.save();c.imageSmoothingEnabled=false;c.globalAlpha=.8;
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(inside(x,y)){
   const p=this.point(x-.5,y-.5);c.drawImage(im,Math.round(p.x),Math.round(p.y),Math.ceil(tile),Math.ceil(tile));
   c.strokeStyle=frame?'#ffd25c':'#e99540';c.lineWidth=2;
   for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(!inside(x+dx,y+dy)){
    c.beginPath();if(dx){const px=p.x+(dx>0?tile:0);c.moveTo(px,p.y);c.lineTo(px,p.y+tile)}
    else{const py=p.y+(dy>0?tile:0);c.moveTo(p.x,py);c.lineTo(p.x+tile,py)}c.stroke();
   }
  }c.restore();return true;
 };
}
