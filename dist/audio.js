export class Sound {
 constructor(){
  this.enabled=false;
  this.last={
  }
  ;
  this.voices=[];
  this.clips={
  }
  ;
  for(const name of ['ui-click',
  'sword',
  'hit',
  'coin',
  'build',
  'trap',
  'boss',
  'magic',
  'heal',
  'reinforcement']){
   const clip=new Audio(`assets/audio/${
name
}.ogg`);
   clip.preload='auto';
   this.clips[name]=clip
  }
 }
 async toggle(){
  this.enabled=!this.enabled;
  if(this.enabled)await this.play('ui-click',
  true);
  else{
   for(const a of this.voices)a.pause();
   this.voices=[]
  }
  return this.enabled
 }
 async play(type,
 force=false){
  if(!this.enabled&&!force)return;
  const now=performance.now(),
  cooldown=['sword',
  'hit',
  'magic'].includes(type)?180:350;
  if(now-(this.last[type]||-1000)<cooldown)return;
  this.last[type]=now;
  this.voices=this.voices.filter(a=>!a.ended&&!a.paused);
  if(this.voices.length>=7)return;
  const base=this.clips[type];
  if(!base)return;
  const voice=base.cloneNode();
  voice.volume=['sword',
  'hit',
  'magic'].includes(type)?.18:type==='boss'?.18:.32;
  this.voices.push(voice);
  try{
   await voice.play()
  }
  catch{
  }
 }
 consume(events,
 floorId){
  if(!this.enabled)return;
  for(const e of events)if(e.floorId===undefined||e.floorId===floorId)this.play(e.type)
 }
}
