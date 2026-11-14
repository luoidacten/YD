import {SPECIES,center,distance} from './data.js';

// Perception records coordinates at observation time. Hidden entities are never
// chased through their live coordinates. A delayed local shout shares snapshots.
export function perceive(game,e){
 const s=game.state;e.seen??={};e.knownRooms??=[];e.visitedRooms??=[];e.personality??={aggression:1,teamwork:1};
 const visible=s.entities.filter(a=>a.id!==e.id&&a.status==='active'&&distance(e,a)<=8&&game.lineOfSight(e,a));
 const opponents=visible.filter(a=>a.faction!==e.faction),allies=visible.filter(a=>a.faction===e.faction);
 for(const a of opponents)e.seen[a.id]={x:a.x,y:a.y,time:s.time,source:'sight'};
 for(const ally of allies.filter(a=>distance(a,e)<5))for(const [id,m]of Object.entries(ally.seen||{}))if(s.time-m.time>=.35&&s.time-m.time<3&&(!e.seen[id]||e.seen[id].time<m.time))e.seen[id]={...m,source:'ally'};
 for(const [id,m]of Object.entries(e.seen))if(s.time-m.time>7)delete e.seen[id];
 for(const room of s.rooms){const p=center(room);if((distance(e,p)<=10&&game.lineOfSight(e,p))||e.faction==='monster'){if(!e.knownRooms.includes(room.id))e.knownRooms.push(room.id)}if(distance(e,p)<1&&!e.visitedRooms.includes(room.id))e.visitedRooms.push(room.id)}
 if(!s.treasure.carrier&&distance(e,s.treasure)<=8&&game.lineOfSight(e,s.treasure))e.treasureKnown={x:s.treasure.x,y:s.treasure.y,time:s.time};
 // Combat sounds reveal an approximate room, never an entity or its health.
 const noise=(s.noises||[]).filter(n=>s.time-n.time<6&&distance(e,n)<12).at(-1);
 if(noise&&(e.faction==='monster'||e.knownRooms.includes(noise.roomId)))e.heard={x:noise.x,y:noise.y,time:noise.time};
 e.visibleIds=opponents.map(a=>a.id);return{opponents,allies};
}

export function tacticalPosition(game,e,threat,mode){
 const candidates=[],s=game.state,range=mode==='cover'?5:4;
 for(let dy=-range;dy<=range;dy++)for(let dx=-range;dx<=range;dx++){
  const p={x:Math.round(e.x)+dx,y:Math.round(e.y)+dy},travel=distance(e,p);if(travel<.8||travel>range||!game.walkable(p.x,p.y))continue;
  const room=game.roomAt(p.x,p.y);if(e.faction==='hero'&&(!room||!e.knownRooms.includes(room.id)))continue;
  if(s.entities.some(a=>a.id!==e.id&&a.status==='active'&&(['cover','kite'].includes(a.action)&&a.target&&distance(a.target,p)<.8)))continue;
  if(s.entities.some(a=>a.id!==e.id&&a.status==='active'&&a.faction===e.faction&&distance(a,p)<.6))continue;
  const gap=distance(p,threat),los=game.lineOfSight(p,threat);if(mode==='cover'&&(los||gap<2.5))continue;if(mode==='kite'&&(!los||gap<3||gap>SPECIES[e.species].range+.6))continue;
  if(!game.path(e,p).length)continue;let walls=0;for(const [x,y]of [[1,0],[-1,0],[0,1],[0,-1]])if(!game.walkable(p.x+x,p.y+y))walls++;
  candidates.push({p,score:mode==='cover'?walls*.2-travel*.12+gap*.03:-Math.abs(gap-3.5)-travel*.12});
 }
 candidates.sort((a,b)=>b.score-a.score);return candidates[0]?.p;
}

export function tacticalDecide(game,e){
 const s=game.state,d=SPECIES[e.species],hero=e.faction==='hero',has=c=>e.charms.includes(c),ratio=e.hp/e.maxHp;
 const {opponents,allies}=perceive(game,e);const team=e.personality.teamwork*(has('camaraderie')?1.3:1);
 const targetValue=a=>1/(1+distance(e,a))+(has('opportunist')?(1-a.hp/a.maxHp)*.5:0)+allies.filter(b=>b.action==='attack'&&b.target===a.id).length*.08+(has('guardian')&&allies.some(b=>b.hp/b.maxHp<.45&&distance(a,b)<2)?.5:0);
 opponents.sort((a,b)=>targetValue(b)-targetValue(a));const enemy=opponents[0],near=!!enemy,injured=allies.find(a=>a.hp/a.maxHp<.5),candidates=[];
 const add=(action,score,target,reason)=>{if(score>0)candidates.push({action,score:Math.round(score*100)/100,target,reason})};
 if(near)add('attack',(.68+(has('violent')?.17:0)+(has('proud')?.12:0)+(has('guardian')&&injured?.14:0)+allies.filter(a=>a.action==='attack'&&a.target===enemy.id).length*.04)*e.personality.aggression,enemy.id,injured&&has('guardian')?'Chặn đối thủ đang đe dọa đồng đội':'Nhìn thấy đối thủ; cân nhắc khoảng cách và mục tiêu của đồng đội');
 if(e.potions>0&&ratio<.65&&!has('forsaken'))add('heal',1.6-ratio,null,'HP thấp và thuốc có thể hồi phục');
 if(e.species==='priest'&&e.mana>=12){const ally=allies.filter(a=>!a.charms.includes('forsaken')&&a.hp/a.maxHp<.65).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(ally)add('support',(1.25-ally.hp/ally.maxHp*.25)*team,ally.id,'Nhìn thấy đồng đội cần hồi phục; đủ 12 mana');}
 if(e.species==='priest'&&e.mana>=20){const down=s.entities.find(a=>a.faction===e.faction&&a.status==='downed'&&!a.rescued&&distance(e,a)<5&&game.lineOfSight(e,a));if(down&&!opponents.some(a=>distance(a,down)<3))add('rescue',1.05*team,down.id,'Đồng đội gục ngã ở vị trí có thể cứu, đủ 20 mana');}
 if(near&&d.range>=3&&e.mana>=5&&distance(e,enemy)<2.6){const p=tacticalPosition(game,e,enemy,'kite');if(p)add('kite',1.3,p,'Địch cận chiến áp sát; tìm vị trí còn đường bắn ở khoảng cách an toàn');}
 if(e.action==='cover'&&e.target&&s.time-e.actionSince<4&&(!e.coverArrivedAt||s.time-e.coverArrivedAt<1.3))add('cover',1.26,e.target,'Giữ chỗ nấp ít nhất 1,3 giây, tránh đổi ý liên tục');
 else if(near&&s.time>=(e.coverCooldown||0)&&ratio<.6&&(SPECIES[enemy.species].range>=3||opponents.length>allies.length+1)){const p=tacticalPosition(game,e,enemy,'cover');if(p)add('cover',1.05+(1-ratio)*.3,p,'Bị đe dọa, tìm ô đã biết bị tường che và chưa có ai giữ chỗ');}
 if(near&&opponents.length>allies.length+1&&allies.length){const ally=allies.filter(a=>distance(e,a)>2).sort((a,b)=>distance(e,a)-distance(e,b))[0];if(ally)add('regroup',.88*team,{x:Math.round(ally.x),y:Math.round(ally.y)},'Đang bị áp đảo, tập hợp với đồng đội nhìn thấy');}
 const recent=Object.entries(e.seen).filter(([id,m])=>!e.visibleIds.includes(id)&&s.time-m.time<7&&distance(e,m)>.7).sort((a,b)=>b[1].time-a[1].time)[0];
 if(!near&&recent)add('investigate',.48,{x:recent[1].x,y:recent[1].y},`Điều tra tọa độ cuối thấy, ký ức còn ${Math.max(0,7-(s.time-recent[1].time)).toFixed(1)} giây`);
 if(!near&&!recent&&e.heard&&s.time-e.heard.time<6&&distance(e,e.heard)>1)add('investigate',.46,{x:e.heard.x,y:e.heard.y},'Nghe tiếng giao chiến ở phòng gần đây, chưa biết danh tính hoặc HP đối thủ');
 if(hero){
  const entry=center(s.rooms.find(r=>r.type==='entrance')),carrying=s.treasure.carrier===e.id,filled=game.usedSlots(e)>=e.capacity;
  add('retreat',carrying?2.5:(ratio<.3?(has('fearful')?1.8:1.05):filled?.98:0)*(has('proud')?.3:1),entry,carrying?'Mang kho báu: ưu tiên thoát':'HP nguy hiểm hoặc túi đã đầy');
  const shop=s.rooms.find(r=>r.type==='shop'&&e.knownRooms.includes(r.id));if(shop&&ratio<.6&&e.gold>=20&&!has('forsaken'))add('shop',1.1-ratio,center(shop),'Biết cửa hàng, đủ vàng và có thể hồi phục');
  const lure=s.rooms.find(r=>r.type==='loot'&&r.loot>0&&e.knownRooms.includes(r.id));if(lure&&game.usedSlots(e)<e.capacity)add('lure',(has('greedy')?1.1:.52)*(has('camaraderie')&&injured?.4:1),lure.id,'Đã phát hiện kho vàng nhử còn vật phẩm');
  const loot=s.items.find(i=>!i.owner&&i.x!==null&&distance(i,e)<6&&game.lineOfSight(e,i));if(loot&&game.usedSlots(e)<e.capacity)add('loot',(has('greedy')?.98:.5)*(has('camaraderie')&&injured?.4:1),loot.id,'Vật phẩm trong tầm nhìn và túi còn chỗ');
  if(!carrying&&e.treasureKnown&&!s.treasure.carrier)add('treasure',.56,e.treasureKnown,'Đã phát hiện vị trí kho báu');
  const carrier=allies.find(a=>a.id===s.treasure.carrier);if(carrier&&!carrying)add('escort',.76,carrier.id,'Nhìn thấy đồng đội mang kho báu, hỗ trợ đường rút');
  const frontier=s.rooms.filter(r=>e.knownRooms.includes(r.id)&&!e.visitedRooms.includes(r.id)).sort((a,b)=>distance(center(a),e)-distance(center(b),e))[0];if(frontier&&!carrying)add('explore',.44,center(frontier),'Khám phá phòng vừa nhìn thấy qua lối nối');
  if(!near&&!frontier&&!e.treasureKnown&&!carrying)add('regroup',.3,entry,'Không còn hướng khám phá hợp lệ; tập hợp lại');
  if(s.battleTime>115)add('retreat',2.2,entry,'Hết thời gian thám hiểm');
 }else{
  const carrier=opponents.find(a=>a.id===s.treasure.carrier);if(carrier)add('attack',1.7,carrier.id,'Nhìn thấy kẻ địch đang mang kho báu');
  if(!s.treasure.carrier){const home=center(s.rooms.find(r=>r.type==='treasure'));if(distance(s.treasure,home)>1&&distance(e,s.treasure)<8&&game.lineOfSight(e,s.treasure))add('recover',1.6,{...s.treasure},'Nhìn thấy kho báu bị đánh rơi');}
  const loot=s.items.find(i=>!i.owner&&i.x!==null&&distance(i,e)<5&&game.lineOfSight(e,i));if(loot&&d.capacity>game.usedSlots(e))add('loot',has('greedy')?1.05:.42,loot.id,'Có thể thu hồi chiến lợi phẩm đang nhìn thấy');
  if(e.order==='retreat'||(has('fearful')&&ratio<.3&&near))add('guard',1.2,e.home,'Sợ hãi: rút về vị trí được phân công');add('guard',.25,e.home,'Giữ vị trí phòng thủ');
 }
 candidates.sort((a,b)=>b.score-a.score);e.scores=candidates.map(({target,...a})=>a);let pick=candidates[0];if(!pick){e.action='guard';e.target=e.home;e.decision=.4;return}
 const current=candidates.find(a=>a.action===e.action&&JSON.stringify(a.target)===JSON.stringify(e.target));
 if(current&&pick.score<2&&((s.time-e.actionSince<.7)||pick.score-current.score<.12))pick=current;
 if(e.action!==pick.action||JSON.stringify(e.target)!==JSON.stringify(pick.target)){e.path=[];e.pathEnd=null;e.teleport=0;e.channel=0;e.actionSince=s.time;if(pick.action==='cover'){e.coverCooldown=s.time+5.5;e.coverArrivedAt=0;}}
 e.action=pick.action;e.target=pick.target;e.decision=.3+game.random()*.2;
}
