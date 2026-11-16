// v0.4 — build your own room walls. Custom walls are state.props with `custom:true`, so pathing, sight, save and
// destruction reuse the existing prop systems.
// The 3 rules always stay completable:
//  1) door lanes and stair spots are reserved,
//  2) the room interior stays connected (world.connectedInterior),
//  3) at most half of the interior can be walled.
// Budget: each room level gives 4 free pieces; more cost gold per piece.
import {bounds,center,distance} from './data.js';
import {connectedInterior,distanceToStairs,tileKey} from './world.js';

export const WALL_TYPES={
 stone:{name:'Tường đá',prop:'wall',cost:12,text:'Chặn đi lại và tầm nhìn. Không phá được.'},
 wood:{name:'Tường gỗ',prop:'wood',cost:6,hp:60,text:'Chặn đi lại và tầm nhìn. Phá được (60 HP).'},
 hedge:{name:'Bụi rậm',prop:'hedge',cost:4,text:'Đi xuyên được (chậm 30%) nhưng che tầm nhìn.'},
 fence:{name:'Rào thấp',prop:'fence',cost:8,text:'Chặn đi lại, nhưng nhìn và bắn qua được.'},
};
export const WALL_TEMPLATES={
 pillars:{name:'Bốn cột',cells:(c,w,h)=>[[-1,-1],[1,-1],[-1,1],[1,1]].flatMap(([sx,sy])=>[[0,0],[1,0],[0,1],[1,1]]
  .map(([dx,dy])=>[c.x+sx*Math.floor(w/4)+dx,c.y+sy*Math.floor(h/4)+dy])),type:'stone'},
 cover:{name:'Ụ nấp',cells:(c,w,h)=>[-3,-2,2,3].flatMap(dx=>[[c.x+dx,c.y-Math.floor(h/4)],[c.x+dx,c.y+Math.floor(h/4)]]),type:'fence'},
 grove:{name:'Lùm cây',cells:(c,w,h)=>[[-1,-1],[1,-1],[-1,1],[1,1]].flatMap(([sx,sy])=>[[0,0],[1,0],[0,1]]
  .map(([dx,dy])=>[c.x+sx*(Math.floor(w/4)+1)+dx,c.y+sy*(Math.floor(h/4))+dy])),type:'hedge'},
};
const BLOCKING=new Set(['wall','wood','fence','pillar','crate','pit','explosive','poison']);

export function installWalls(Game){
 const P=Game.prototype;
 P.wallBudget=function(room){
  const b=bounds(room),interior=(b.w-2)*(b.h-2),used=this.state.props.filter(p=>p.custom&&p.roomId===room.id&&!p.destroyed).length;
  return {free:(room.level||1)*4,used,cap:Math.floor(interior/2),interior};
 };
 P.wallCost=function(room,type){const b=this.wallBudget(room);return b.used<b.free?0:WALL_TYPES[type].cost};
 P.wallIssue=function(room,x,y,type){
  const s=this.state,b=bounds(room),p=center(room),T=WALL_TYPES[type];
  if(!T)return 'Không có loại tường này.';
  if(!this.canPrepare())return 'Chỉ xây tường khi đang chuẩn bị.';
  if(room.owner&&room.owner!=='dungeon')return 'Phòng đang bị chiếm.';
  if(x<=b.x||x>=b.x+b.w-1||y<=b.y||y>=b.y+b.h-1)return 'Chỉ xây bên trong phòng.';
  if(Math.abs(x-p.x)<=1||Math.abs(y-p.y)<=1)return 'Không chặn lối đi giữa các cửa.';
  if(distanceToStairs(room,{x,y})<3)return 'Không chặn cầu thang.';
  if(s.props.some(q=>!q.destroyed&&q.floorId===room.floorId&&q.x===x&&q.y===y))return 'Ô này đã có vật cản.';
  if(s.traps.some(t=>t.floorId===room.floorId&&Math.round(t.x)===x&&Math.round(t.y)===y))return 'Ô này có bẫy.';
  if(s.entities.some(e=>e.status==='active'&&e.floorId===room.floorId&&Math.round(e.x)===x&&Math.round(e.y)===y))return 'Có cư dân đứng ở đây.';
  const bud=this.wallBudget(room);if(bud.used>=bud.cap)return `Đã đạt giới hạn ${bud.cap} ô (nửa phòng).`;
  if(s.gold<this.wallCost(room,type))return `Cần ${this.wallCost(room,type)} vàng.`;
  if(BLOCKING.has(T.prop)){
   const inside=q=>q.x>b.x&&q.x<b.x+b.w-1&&q.y>b.y&&q.y<b.y+b.h-1;
   const blocked=new Set(s.props.filter(q=>!q.destroyed&&q.floorId===room.floorId&&BLOCKING.has(q.type)&&inside(q)).map(q=>tileKey(q.x,q.y)));
   blocked.add(tileKey(x,y));if(!connectedInterior(room,blocked))return 'Sẽ cắt đôi phòng — phải giữ lối đi thông.';
  }
  return null;
 };
 P.placeWall=function(roomId,x,y,type){
  const room=this.state.rooms.find(r=>r.id===roomId);if(!room)return {ok:false,message:'Không có phòng.'};
  x=Math.round(x);y=Math.round(y);const issue=this.wallIssue(room,x,y,type);if(issue)return {ok:false,message:issue};
  const T=WALL_TYPES[type],cost=this.wallCost(room,type);this.state.gold-=cost;
  const prop={id:this.id('prop'),roomId:room.id,floorId:room.floorId,x,y,type:T.prop,custom:true,wallType:type,
   solid:T.prop!=='hedge',hp:T.hp||999,maxHp:T.hp||999,paid:cost};
  this.state.props.push(prop);this.indexProp(prop);
  this.present?.('build',{x,y,floorId:room.floorId});return {ok:true,prop,cost};
 };
 P.removeWall=function(propId){
  const p=this.state.props.find(q=>q.id===propId&&q.custom);if(!p)return {ok:false,message:'Chỉ gỡ được tường tự xây.'};
  if(!this.canPrepare())return {ok:false,message:'Chỉ gỡ tường khi đang chuẩn bị.'};
  this.state.props=this.state.props.filter(q=>q!==p);this.state.gold+=Math.floor((p.paid||0)/2);this.indexProp(p,true);
  return {ok:true};
 };
 P.applyWallTemplate=function(roomId,template){
  const room=this.state.rooms.find(r=>r.id===roomId),t=WALL_TEMPLATES[template];if(!room||!t)return {ok:false,message:'Không có mẫu.'};
  const b=bounds(room);let placed=0;
  for(const[x,y]of t.cells(center(room),b.w,b.h))if(this.placeWall(roomId,x,y,t.type).ok)placed++;
  return placed?{ok:true,placed}:{ok:false,message:'Không ô nào hợp lệ cho mẫu này.'};
 };
 // incremental index: no full rebuild, no floor-cache invalidation (smooth building)
 P.indexProp=function(p,remove=false){
  const k=`${p.floorId}:${tileKey(p.x,p.y)}`;
  this.hedgeTiles??=new Map();
  if(p.type==='hedge'){if(remove)this.hedgeTiles.delete(k);else this.hedgeTiles.set(k,p)}
  else if(p.solid){if(remove)this.propsByTile.delete(k);else this.propsByTile.set(k,p)}
  this.navRevision=(this.navRevision||0)+1;this.pathCache?.clear?.();
 };
 const rebuild=P.rebuild;P.rebuild=function(){
  const r=rebuild.apply(this,arguments);this.hedgeTiles=new Map();
  for(const p of this.state.props)if(p.type==='hedge'&&!p.destroyed)this.hedgeTiles.set(`${p.floorId}:${tileKey(p.x,p.y)}`,p);
  return r;
 };
 const sight=P.blocksSight;P.blocksSight=function(x,y,floorId=0){
  const k=`${floorId}:${tileKey(Math.round(x),Math.round(y))}`,prop=this.propsByTile?.get(k);
  if(prop?.type==='fence')return !this.terrain[floorId]?.[Math.round(y)]?.[Math.round(x)]||this.gates?.has(k);   // see/shoot over fences
  if(this.hedgeTiles?.has(k))return true;
  return sight.call(this,x,y,floorId);
 };
 const damageProp=P.damageProp;P.damageProp=function(prop,...args){
  const r=damageProp.call(this,prop,...args);if(prop?.destroyed&&prop.custom)this.log(`${WALL_TYPES[prop.wallType]?.name||'Tường'} bị phá!`);return r;
 };
 // hedges slow whoever walks through them
 const tick=P.tick;P.tick=function(dt){
  const r=tick.call(this,dt);
  if(this.state.phase==='battle'&&this.hedgeTiles?.size){this.hedgeClock=(this.hedgeClock||0)+dt;
   if(this.hedgeClock>=.5){this.hedgeClock-=.5;
    for(const e of this.state.entities)if(e.status==='active'&&this.hedgeTiles.has(`${e.floorId}:${tileKey(Math.round(e.x),Math.round(e.y))}`))
     this.applyStatus(e,'slow',.6,.3,null)}}
  return r;
 };
}
