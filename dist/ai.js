import {
 augmentChoices
}
from './systems.js';
import {
 SETTINGS,
 SPECIES,
 center,
 bounds,
 contains,
 distance
}
from './data.js';
export function perceive(game,
e){
 const s=game.state;
 e.seen??={
 }
 ;
 e.knownRooms??=[];
 e.visitedRooms??=[];
 e.knownTraps??=[];
 const visible=s.entities.filter(a=>a.id!==e.id&&a.status==='active'&&a.floorId===e.floorId&&game.canSeeEnemy(e,
 a)),
 enemies=visible.filter(a=>a.faction!==e.faction),
 allies=visible.filter(a=>a.faction===e.faction);
 for(const a of enemies)e.seen[a.id]={
  x:a.x,
  y:a.y,
  floorId:a.floorId,
  time:s.time,
  firstSeen:e.seen[a.id]?.firstSeen??s.time,
  source:'sight'
 }
 ;
 for(const a of allies.filter(a=>distance(a,
 e)<7)){
  for(const[id,
  m]of Object.entries(a.seen||{
  }
  ))if(m.floorId===e.floorId&&s.time-m.time>=.35&&s.time-m.time<3&&(!e.seen[id]||e.seen[id].time<m.time))e.seen[id]={
   ...m,
   source:'ally'
  }
  ;
  for(const id of a.knownTraps||[])if(!e.knownTraps.includes(id))e.knownTraps.push(id)
 }
 for(const[id,
 m]of Object.entries(e.seen))if(s.time-m.time>7||m.floorId!==e.floorId)delete e.seen[id];
 for(const r of game.rooms(e.floorId)){
  const b=bounds(r),
  nearest={
   x:Math.max(b.x+1,
   Math.min(e.x,
   b.x+b.w-2)),
   y:Math.max(b.y+1,
   Math.min(e.y,
   b.y+b.h-2)),
   floorId:e.floorId
  }
  ;
  if(e.faction==='monster'||(distance(e,
  nearest)<=SETTINGS.vision&&game.lineOfSight(e,
  nearest))){
   if(!e.knownRooms.includes(r.id))e.knownRooms.push(r.id)
  }
  if(contains(r,
  e,
  1)&&distance(e,
  r)<5&&!e.visitedRooms.includes(r.id))e.visitedRooms.push(r.id)
 }
 if(!s.treasure.carrier&&e.floorId===s.treasure.floorId&&distance(e,
 s.treasure)<SETTINGS.vision&&game.lineOfSight(e,
 s.treasure))e.treasureKnown={
  ...s.treasure,
  time:s.time
 }
 ;
 for(const t of s.traps){
  if(t.floorId!==e.floorId||t.disabled||e.knownTraps.includes(t.id))continue;
  const range=(e.species==='rogue'||SPECIES[e.species].trapExpert||e.elite?5:2.2)+(game.effect(e,
  'trapSense')?1:0);
  if(distance(e,
  t)>range||!game.lineOfSight(e,
  t))continue;
  if(t.revealed||game.random()<((e.species==='rogue'||SPECIES[e.species].trapExpert?.65:.18)+(game.effect(e,
  'trapSense')?.value||0)))e.knownTraps.push(t.id)
 }
 const heard=s.noises.filter(n=>n.floorId===e.floorId&&s.time-n.time<5&&distance(e,
 n)<SETTINGS.hearing).at(-1);
 if(heard)e.heard={
  ...heard
 }
 ;
 e.visibleIds=enemies.map(a=>a.id);
 return{
  enemies,
  allies
 }
 ;
}
export function choosePosition(game,
e,
threat,
mode='cover'){
 const choices=[],
 radius=mode==='dodge'?6:5;
 for(const r of [2,
 3.5,
 radius])for(let i=0;
 i<12;
 i++){
  const angle=i*Math.PI/6,
  p={
   x:Math.round(e.x+Math.cos(angle)*r),
   y:Math.round(e.y+Math.sin(angle)*r),
   floorId:e.floorId
  }
  ;
  if(!game.walkable(p.x,
  p.y,
  e.floorId,
  e)||distance(p,
  e)<.8)continue;
  if(game.state.entities.some(a=>a.id!==e.id&&a.status==='active'&&a.floorId===e.floorId&&((['cover',
  'dodge',
  'kite'].includes(a.action)&&a.target&&distance(p,
  a.target)<.8)||distance(a,
  p)<.55)))continue;
  const gap=distance(p,
  threat),
  los=game.lineOfSight(p,
  threat);
  if(mode==='cover'&&(los||gap<2.8))continue;
  if(mode==='kite'&&(!los||gap<3.7||gap>game.range(e)+.8))continue;
  if(mode==='dodge'&&game.state.telegraphs.some(t=>game.inDanger(p,
  t,
  .65)))continue;
  if(mode==='dodge'&&game.state.hazards.some(h=>h.floorId===p.floorId&&distance(p,
  h)<h.radius+.7))continue;
  if(!game.path(e,
  p).length)continue;
  choices.push({
   p,
   score:mode==='kite'?-Math.abs(gap-4.6)-distance(e,
   p)*.1:-distance(e,
   p)+(mode==='cover'?gap*.1:0)
  }
  )
 }
 choices.sort((a,
 b)=>b.score-a.score);
 return choices[0]?.p
}
function searchRoom(game,
e,
room){
 const b=bounds(room),
 points=[{
  x:room.x,
  y:room.y
 }
 ,
 {
  x:b.x+4,
  y:b.y+4
 }
 ,
 {
  x:b.x+b.w-5,
  y:b.y+4
 }
 ,
 {
  x:b.x+b.w-5,
  y:b.y+b.h-5
 }
 ,
 {
  x:b.x+4,
  y:b.y+b.h-5
 }
 ];
 e.searchIndex??=0;
 let p=points[e.searchIndex%points.length];
 if(distance(e,
 p)<1.2){
  e.searchIndex++;
  p=points[e.searchIndex%points.length]
 }
 return{
  ...p,
  floorId:e.floorId
 }
}
export function chooseAction(game,
e){
 const s=game.state,
 d={
  ...SPECIES[e.species],
  magic:game.usesMagicAttack(e),
  range:game.range(e)
 }
 ,
 hero=e.faction==='hero',
 has=c=>e.charms.includes(c),
 ratio=e.hp/e.maxHp,
 {
  enemies,
  allies
 }
 =perceive(game,
 e),
 room=game.roomAt(e.x,
 e.y,
 e.floorId),
 locked=hero?game.roomForHero(e):null,
 team=(e.personality?.teamwork||1)*(has('camaraderie')?1.3:1),
 candidates=[];
 const add=(action,
 score,
 target,
 reason)=>{
  if(action==='attack'&&!hero){
   const a=game.entity(target),reach=d.magic&&e.mana<5?1.4:d.range;
   if(a&&distance(e,a)>reach){
    const p=game.approach(e,a,Math.max(1.1,reach*.85));
    if(!p||distance(e,p)>.6&&!game.path(e,p).length)return;
   }
  }
  if(score>0)candidates.push({
   action,
   score:Math.round(score*100)/100,
   target,
   reason
  }
  )
 }
 ;
 const targetScore=a=>(e.passiveIds.includes('P41')&&allies.some(b=>b.hp/b.maxHp<.3&&distance(a,
 b)<4)?.6:0)+(e.threat?.[a.id]||0)*.008+(game.effect(e,
 'taunt')?.source===a.id?2:0)+1/(distance(e,
 a)+1)+(has('opportunist')?(1-a.hp/a.maxHp)*.6:0)+allies.filter(b=>b.action==='attack'&&b.target===a.id).length*.1+(has('guardian')&&allies.some(b=>b.hp/b.maxHp<.45&&distance(b,
 a)<3)?.5:0)+(a.id===s.treasure.carrier?.6:0);
 enemies.sort((a,
 b)=>targetScore(b)-targetScore(a));
 const enemy=enemies[0],
 injured=allies.find(a=>a.hp/a.maxHp<.55);
 const incoming=s.telegraphs.find(t=>game.inDanger(e,
 t,
 .6)&&((distance(e,
 t)<SETTINGS.vision&&game.lineOfSight(e,
 t))||game.roomAt(t.x,
 t.y,
 t.floorId)?.id===room?.id)),
 cloud=s.hazards.find(h=>h.floorId===e.floorId&&distance(e,
 h)<h.radius+.3);
 if(incoming||cloud){
  const p=choosePosition(game,
  e,
  incoming||cloud,
  'dodge');
  if(p)add('dodge',
  3.5,
  p,
  incoming?'Thấy chiêu boss đang báo trước, rời vùng sát thương':'Khí độc hoặc lửa ảnh hưởng cả hai phe, rời khu vực');
 }
 const warning=s.traps.find(t=>t.floorId===e.floorId&&t.windup>0&&distance(e,
 t)<3&&e.knownTraps.includes(t.id));
 if(hero&&warning){
  const p=choosePosition(game,
  e,
  warning,
  'dodge');
  if(p)add('dodge',
  3,
  p,
  'Bẫy đã lộ đang báo trước, né trước khi kích hoạt');
 }
 if(enemy)add('attack',
 (.7+(has('violent')?.15:0)+(has('proud')?.12:0)+(has('guardian')&&injured?.12:0)+allies.filter(a=>a.action==='attack'&&a.target===enemy.id).length*.025)*(e.personality?.aggression||1),
 enemy.id,
 has('guardian')&&injured?'Chặn đối thủ gần đồng đội bị thương':'Nhìn thấy đối thủ; cân nhắc hỗ trợ tập trung mục tiêu');
 if(e.potions>0&&ratio<(game.charmMod(e,
 'potionThreshold')||.62)&&!has('forsaken'))add('heal',
 1.65-ratio,
 null,
 'Có thuốc và có thể hồi HP');
 if(['priest',
 'shaman'].includes(e.species)&&e.mana>=12){
  const ally=allies.filter(a=>!a.charms.includes('forsaken')&&a.hp/a.maxHp<.65&&(!e.roomId||hero||a.roomId===e.roomId)).sort((a,
  b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  if(ally)add('support',
  (1.15+(1-ally.hp/ally.maxHp)*.15)*team,
  ally.id,
  'Đồng đội trong tầm nhìn cần hồi máu; đủ 12 mana');
 }
 if(['priest',
 'shaman'].includes(e.species)&&e.mana>=20){
  const ally=s.entities.find(a=>a.status==='downed'&&!a.rescued&&a.faction===e.faction&&a.floorId===e.floorId&&distance(e,
  a)<6&&game.lineOfSight(e,
  a)&&(hero||a.roomId===e.roomId));
  if(ally&&!enemies.some(a=>distance(a,
  ally)<3))add('rescue',
  1.05*team,
  ally.id,
  'Đồng đội có thể cứu, không có địch ngay cạnh, cần channel 2,5 giây');
 }
 if(enemy&&d.range>=4&&(!d.magic||e.mana>=5)&&distance(e,
 enemy)<3.5){
  const p=choosePosition(game,
  e,
  enemy,
  'kite');
  if(p)add('kite',
  1.35,
  p,
  'Giữ tầm đánh và đường bắn, tránh bị cận chiến áp sát');
 }
 if(e.action==='cover'&&e.target&&s.time-e.actionSince<4.5&&(!e.coverArrivedAt||s.time-e.coverArrivedAt<1.3))add('cover',
 1.25,
 e.target,
 'Giữ chỗ nấp tối thiểu 1,3 giây, không đổi ý liên tục');
 else if(enemy&&s.time>(e.coverCooldown||0)&&ratio<.6&&(SPECIES[enemy.species].range>=4||enemies.length>allies.length+1)){
  const p=choosePosition(game,
  e,
  enemy,
  'cover');
  if(p)add('cover',
  1.08+(1-ratio)*.25,
  p,
  'Tường hoặc vật cản che đường bắn, ô nấp chưa có ai giữ');
 }
 if(d.range>=4&&(!d.magic||e.mana>=5))for(const prop of s.props){
  if(prop.destroyed||!['explosive',
  'poison'].includes(prop.type)||prop.floorId!==e.floorId||distance(prop,
  e)>d.range||!game.lineOfSight(e,
  prop)||distance(prop,
  e)<3.7)continue;
  const hits=enemies.filter(a=>distance(a,
  prop)<3.1).length,
  friendly=allies.filter(a=>distance(a,
  prop)<3.5).length;
  if(hits>=2&&!friendly)add('barrel',
  1.1+hits*.1,
  prop.id,
  'Hai đối thủ gần thùng nguy hiểm, không thấy đồng minh trong vùng nổ');
 }
 if(hero&&(e.species==='rogue'||SPECIES[e.species].trapExpert||e.elite)){
  const trap=s.traps.find(t=>!t.disabled&&t.floorId===e.floorId&&e.knownTraps.includes(t.id)&&distance(t,
  e)<5&&game.lineOfSight(e,
  t));
  if(trap&&!enemies.some(a=>distance(a,
  e)<5))add('disarm',
  .96,
  trap.id,
  'Bẫy đã được phát hiện; có thời gian vô hiệu hóa');
 }
 const last=Object.entries(e.seen).filter(([id,
 m])=>!e.visibleIds.includes(id)&&s.time-m.time<7&&distance(e,
 m)>1).sort((a,
 b)=>b[1].time-a[1].time)[0];
 if(!enemy&&last){
  const p={
   x:last[1].x,
   y:last[1].y,
   floorId:e.floorId
  }
  ;
  if(hero||isInsideHome(game,
  e,
  p))add('investigate',
  .55,
  p,
  'Chỉ điều tra tọa độ cuối thấy, không biết vị trí mới sau góc khuất');
 }
 if(hero){
  const carrying=s.treasure.carrier===e.id,
  filled=game.usedSlots(e)>=e.capacity;
  if(!locked)add('retreat',
  carrying?2.5:(ratio<.28&&e.species!=='berserker'?(has('fearful')?1.8:1.1):filled?.95:0)*(has('proud')?.3:1),
  null,
  carrying?'Mang kho báu, trở về lối ra qua cầu thang':'Bị thương nặng hoặc túi đầy; cửa không bị khóa');
  if(locked&&!enemy)add('explore',
  .5,
  searchRoom(game,
  e,
  locked),
  'Cửa khóa: tìm quái còn lại bên trong phòng, không xuyên cửa');
  const lure=s.rooms.find(r=>r.floorId===e.floorId&&r.loot>0&&e.knownRooms.includes(r.id)&&!locked);
  if(lure&&!filled)add('lure',
  e.charms.includes('greedy')?.92:.5,
  lure.id,
  'Phát hiện rương hoặc kho vàng nhử');
  const loot=s.items.find(i=>!i.owner&&i.x!==null&&i.floorId===e.floorId&&
   game.usedSlots(e)+(i.slotCost||1)<=e.capacity&&distance(i,
  e)<9&&game.lineOfSight(e,
  i));
  if(loot&&!filled)add('loot',
  (has('greedy')?.92:.53)*(has('camaraderie')&&injured?.4:1),
  loot.id,
  'Chiến lợi phẩm trong tầm nhìn, túi còn chỗ');
  const shop=s.rooms.find(r=>r.type==='shop'&&r.floorId===e.floorId&&e.knownRooms.includes(r.id));
  if(shop&&!locked&&ratio<.6&&e.gold>=20&&!has('forsaken'))add('shop',
  1.1-ratio,
  center(shop),
  'Đã biết tiệm thuốc và còn đủ vàng');
  if(e.treasureKnown&&!s.treasure.carrier&&e.floorId===e.treasureKnown.floorId&&!filled)add('treasure',
  .65,
  e.treasureKnown,
  'Đã tận mắt phát hiện kho báu trung tâm');
  if(!locked&&!carrying&&e.floorId===0){
   const stair=s.rooms.find(r=>r.type==='boss');
   if(stair&&(s.treasure.floorId===1||e.needsKey)&&e.knownRooms.includes(stair.id)&&game.roomMonsters(stair).length===0)add('down',
   .68,
   null,
   'Hộ Môn và vệ binh đã bị đánh bại, cầu thang được mở');
  }
  if(!locked&&!carrying){
   const squad=s.entities.filter(a=>a.faction==='hero'&&a.status==='active'&&a.squadId===e.squadId&&a.floorId===e.floorId),
   leader=squad[0];
   if(leader&&leader!==e&&distance(e,
   leader)>5&&game.lineOfSight(e,
   leader))add('regroup',
   .6,
   {
    x:Math.round(leader.x)+(squad.indexOf(e)%2?1:-1),
    y:Math.round(leader.y),
    floorId:e.floorId
   }
   ,
   'Giữ gần tổ đội, tránh đi lẻ khi chưa giao chiến');
   if(!enemy){
    let destination=s.rooms.find(r=>r.id===e.destinationRoom&&r.floorId===e.floorId&&!e.visitedRooms.includes(r.id));
    if(!destination){
     const current=room||s.rooms.find(r=>r.floorId===e.floorId&&r.id===e.lastRoom);
     if(room)e.lastRoom=room.id;
     const choices=game.rooms(e.floorId).filter(r=>!e.visitedRooms.includes(r.id)&&(e.knownRooms.includes(r.id)||current&&Math.abs(current.col-r.col)+Math.abs(current.row-r.row)===1));
     choices.sort((a,
     b)=>(b.col-a.col)*20+distance(e,
     a)-distance(e,
     b));
     destination=choices[0];
     if(destination)e.destinationRoom=destination.id
    }
    if(destination)add('explore',
    .5,
    center(destination),
    'Theo cửa và hành lang đã thấy để khám phá phòng tiếp theo');
    else if(e.floorId===1&&!s.treasure.carrier)add('explore',
    .4,
    center(s.rooms.find(r=>r.type==='treasure')),
    'Tìm tiếp mục tiêu ở cuối tầng sâu');
   }
  }
  if(!locked&&s.battleTime>SETTINGS.battleLimit-150)add('retreat',
  2.3,
  null,
  'Thám hiểm kéo dài, cả đoàn rút về cổng');
 }
 else{
  const assigned=s.rooms.find(r=>r.id===e.roomId);
  if(!enemy&&e.heard&&s.time-e.heard.time<5&&assigned){
   const b=bounds(assigned),
   p={
    x:Math.max(b.x+2,
    Math.min(e.heard.x,
    b.x+b.w-3)),
    y:Math.max(b.y+2,
    Math.min(e.heard.y,
    b.y+b.h-3)),
    floorId:e.floorId
   }
   ;
   add('investigate',
   .4,
   p,
   'Nghe giao chiến nhưng vẫn giữ bên trong phòng được phân công');
  }
  if(!s.treasure.carrier&&s.treasure.floorId===e.floorId&&distance(e,
  s.treasure)<12&&game.lineOfSight(e,
  s.treasure)&&assigned&&contains(assigned,
  s.treasure,
  1)&&distance(s.treasure,
  center(s.rooms.find(r=>r.type==='treasure')))>1)add('recover',
  1.6,
  {
   ...s.treasure
  }
  ,
  'Kho báu bị đánh rơi trong phòng mình');
  add('guard',
  .25,
  e.home,
  'Giữ phòng được phân công, không đuổi ra hành lang');
 }
 augmentChoices(game,
 e,
 {
  enemies,
  allies,
  room,
  locked,
  add
 }
 );
 game.extendChoices(e,
 {
  enemies,
  allies,
  room,
  locked,
  add
 }
 );
 for(const c of candidates){
  if(c.action==='dodge')c.score*=1+game.charmMod(e,
  'dodge');
  if(['cover',
  'kite'].includes(c.action))c.score*=1+game.charmMod(e,
  'tactics');
  if(c.action==='regroup')c.score*=1+game.charmMod(e,
  'formation');
  if(c.action==='loot'&&e.passiveIds.includes('P44')&&(s.items.find(i=>i.id===c.target)?.value||0)>=30)c.score*=1.6;
  if(c.action==='rescue')c.score*=1+game.charmMod(e,
  'rescue');
 }
 if(!candidates.length&&hero&&!locked)add('retreat',
 .3,
 null,
 'Không còn mục tiêu khám phá nhìn thấy: quay về cổng thay vì đứng chờ vô hạn');
 if(!candidates.length)add('wait',
 .1,
 {
  x:e.x,
  y:e.y,
  floorId:e.floorId
 }
 ,
 'Chờ cửa mở hoặc cơ hội tiếp theo');
 candidates.sort((a,
 b)=>b.score-a.score);
 let pick=candidates[0];
 const current=candidates.find(a=>a.action===e.action&&JSON.stringify(a.target)===JSON.stringify(e.target));
 if(current&&pick.score<3&&((s.time-e.actionSince<.7)||pick.score-current.score<.12+game.charmMod(e,
 'hysteresis')))pick=current;
 e.scores=candidates.map(({
  target,
  ...a
 }
 )=>a);
 if(e.action!==pick.action||JSON.stringify(e.target)!==JSON.stringify(pick.target)){
  e.path=[];
  e.pathEnd=null;
  e.teleport=0;
  e.channel=0;
  e.actionSince=s.time;
  if(pick.action==='cover'){
   e.coverArrivedAt=null;
   e.coverCooldown=s.time+5.5
  }
 }
 e.action=pick.action;
 e.target=pick.target;
 e.decision=Math.max(.15,
 .3+game.random()*.2+game.charmMod(e,
 'reaction'));
}
function isInsideHome(game,
e,
p){
 const room=game.state.rooms.find(r=>r.id===e.roomId);
 return !room||contains(room,
 p,
 1)
}
