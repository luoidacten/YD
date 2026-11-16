import {rpgInspector} from './rpg-ui.js';
import {BOSS_POOL} from './boss-data.js';
import {createReviewGame} from './review-fixtures.js';
import {auditUI} from './ui-audit.js';
import {bossPickerHTML,bossSkillText} from './boss-picker.js';
import {loadPresentationSettings,savePresentationSettings} from './combat-fx.js';
import {equipControl,weaponSummary} from './weapon-ui.js';
import {loadIcons,hydrateIcons,icon,roomIcon,cardFrame} from './icons.js';
import {
 Game
}
from './simulation.js';
import {
 Painter
}
from './painter.js';
import {
 Sound
}
from './audio.js';
import {
 CHEST_TIERS
}
from './room-life.js';
import {
 MONSTER_HIRES
}
from './arsenal-data.js';
import {
 CARDS,
 ROOMS,
 SPECIES,
 CHARMS,
 center,
 distance
}
from './data.js';
import {
 SKILLS,
 PASSIVES,
 STATUS
}
from './catalog.js';
import {
 ITEMS,
 QUALITIES,
 VARIANTS,
 PACKS,
 FATES
}
from './expansion.js';
await loadIcons({disabled:new URLSearchParams(location.search).get('icons')==='off'});
hydrateIcons();
const $=q=>document.querySelector(q),
$$=q=>[...document.querySelectorAll(q)],
esc=s=>String(s??'').replace(/[&<>"']/g,
c=>({
 '&':'&amp;',
 '<':'&lt;',
 '>':'&gt;',
 '"':'&quot;',
 "'":'&#39;'
}
[c]));
const sandbox=new URLSearchParams(location.search).get('sandbox')==='1',
reviewScene=new URLSearchParams(location.search).get('review'),
key=sandbox?'your-dungeon-sandbox-v03':'your-dungeon-v2';
let game,
loadedOld=false;
try{
 const latest=reviewScene?null:localStorage.getItem(key),
 old=sandbox||reviewScene?null:localStorage.getItem('your-dungeon-v1');
 loadedOld=!latest&&!!old;
 game=reviewScene?createReviewGame(reviewScene):new Game(JSON.parse(latest||old||'null'))
}
catch{
 game=new Game()
}
const sound=new Sound();
let painter=new Painter($('#game'),
$('#minimap'),
game),
selection=game.rooms(game.state.currentFloor||0).find(r=>r.type==='guard')?.id,
chosen=null,
filter='all',
relocating=null,
lastResult=null,
lastPhase=game.state.phase,
toastTimer,
lastCards='',
lastRooms='',
lastLog='',
modalMode=null,
placingKey=false;
const keys=new Set();
painter.selected=selection;
painter.setFogMode('all');
const actionNames={
 patrol:'Đi tuần / tản ra',
 'open-chest':'Mở rương dọn phòng',
 'rescue-potion':'Dùng thuốc hồi sinh',
 'drag-body':'Kéo đồng đội',
 'guard-body':'Canh người gục',
 'take-key':'Tìm và nhặt chìa',
 'unlock-core':'Mở cổng phòng rương',
 guard:'Giữ phòng',
 ambush:'Chờ phục kích',
 attack:'Giao chiến',
 heal:'Dùng thuốc',
 support:'Hỗ trợ hồi máu',
 rescue:'Cứu đồng đội',
 cover:'Nấp sau vật cản',
 kite:'Giữ tuyến sau',
 regroup:'Tập hợp đội hình',
 explore:'Khám phá',
 investigate:'Kiểm tra dấu vết',
 dodge:'Né nguy hiểm',
 disarm:'Gỡ bẫy',
 barrel:'Đánh thùng nguy hiểm',
 down:'Xuống tầng sâu',
 up:'Lên tầng trên',
 retreat:'Rút lui',
 treasure:'Lấy kho báu',
 recover:'Thu hồi kho báu',
 loot:'Nhặt chiến lợi phẩm',
 shop:'Mua thuốc',
 skill:'Dùng kỹ năng',
 stunned:'Bị choáng',
 quickScroll:'Cuộn siêu tốc',
 capture:'Chiếm công trình',
 sabotage:'Phá công trình',
 wait:'Chờ tổ đội',
 item:'Dùng vật phẩm'
}
;
const roleNames={
 tank:'Tuyến trước · giữ aggro',
 ranged:'Tầm xa · giữ vị trí',
 support:'Hỗ trợ · cứu hộ',
 scout:'Trinh sát · thu tin',
 ambusher:'Phục kích',
 skirmisher:'Đột kích'
}
;
function portrait(e){
 if(SPECIES[e.species].animation==='single')return SPECIES[e.species].sprite+'_anim_f0';
 return e.species==='slime'?'tiny_slug_anim_f0':e.species==='shaman'?'necromancer_anim_f0':e.species==='mimic'?'chest_mimic_open_anim_f2':`${
SPECIES[e.species].sprite
}_idle_anim_f0`
}
function toast(text){
 $('#toast').textContent=text;
 $('#toast').classList.add('visible');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),
 3600)
}
function save(quiet=true){
 if(reviewScene)return;
 try{
  localStorage.setItem(key,
  game.serialize());
  if(!quiet)toast('Đã lưu tiến trình, bài và bố trí ngẫu nhiên.')
 }
 catch{
  toast('Bộ nhớ trình duyệt không khả dụng.')
 }
}
function modal(html,
mode=null){
 modalMode=mode;
 $('#close-modal').hidden=mode==='floor-boss';$('#modal').classList.toggle('boss-picker',mode==='floor-boss');
 $('#modal-content').innerHTML=html;
 hydrateIcons($('#modal-content'));
 if(!$('#modal').open)$('#modal').showModal()
}
function closeModal(){
 if(modalMode==='floor-boss'){showMenu();return}
 modalMode=null;
 $('#modal').close()
}
$('#close-modal').onclick=closeModal;
$('#modal').addEventListener('cancel',e=>{if(modalMode==='floor-boss'){e.preventDefault();showMenu()}else modalMode=null});
$('#modal').addEventListener('click',
event=>{
 if(event.target===$('#modal')){
  const r=event.target.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal()
 }
}
);
function clearCard(){
 placingKey=false;
 chosen=null;
 painter.card=null;
 relocating=null;
 $('#cancel').hidden=true;
 lastCards='';
 renderCards()
}
function renderCards(){
 const deck=game.state.deck,
 sig=JSON.stringify([deck.hand,
 chosen?.uid,
 filter,game.state.gold,game.state.mana,game.state.souls,
 deck.activeFate]);
 if(sig===lastCards)
 return;
 lastCards=sig;
 const list=deck.hand.map(c=>({
  ...c,
  def:CARDS.find(d=>d.id===c.definitionId)
 }
 )).filter(c=>c.def&&(filter==='all'||c.def.kind===filter));
 $('#cards').innerHTML=
 `<button class="card pack-button" id="open-packs" title="Mua gói bài, không mua trực tiếp phòng"><img src="assets/frames/chest_full_open_anim_f2.png" \
alt=""><span class="card-name">Mở gói bài</span><span class="card-cost">80+ <small>vàng</small></span></button>`
 +list.map(c=>
 `<button class="card ${
c.def.tone
} ${
chosen?.uid===c.uid?'selected':''
}" data-kind="${c.def.kind}" data-card="${
c.uid
}" title="${
esc(c.def.name+" · "+c.def.description)
}" aria-pressed="${
chosen?.uid===c.uid
}"><img src="assets/frames/${
c.def.art
}.png" alt=""><span class="card-name">${
esc(c.def.name)
}</span><span class="card-cost">${
c.def.cost
} <small>${
c.def.resource==='mana'?'mana':c.def.resource==='souls'?'hồn':'vàng'
}${
c.quality?` · ${
QUALITIES[c.quality].name
}`:''
}</small></span></button>`
 ).join('');
 $('#open-packs').onclick=showPacks;
 for(const img of $$('#cards img')){const fit=()=>{const scale=Math.max(1,Math.floor(Math.min(48/img.naturalWidth,48/img.naturalHeight)));
  img.style.width=img.naturalWidth*scale+'px';img.style.height=img.naturalHeight*scale+'px';
  img.style.left=(104-img.naturalWidth*scale)/2+'px';};if(img.complete&&img.naturalWidth)fit();else img.onload=fit}
 for(const button of $$('[data-card]')){const card=list.find(c=>c.uid===button.dataset.card);
  button.classList.toggle('unaffordable',(game.state[card.def.resource]||0)<card.def.cost)}
 $$('[data-card]').forEach(b=>b.onclick=()=>{
  if(!game.canPrepare()){
   toast('Dùng bài khi chuẩn bị, không tạm dừng.');
   return
  }
  const card=deck.hand.find(c=>c.uid===b.dataset.card),
  def=CARDS.find(d=>d.id===card.definitionId);
  chosen=chosen?.uid===card.uid?null:{
   ...card,
   ...def,
   uid:card.uid
  }
  ;
  painter.card=chosen;
  $('#cancel').hidden=!chosen;
  $('#deck-hint').textContent=chosen?chosen.kind==='room'?'Chọn ô phòng viền nét đứt':chosen.kind==='upgrade'||chosen.kind==='item'?'Chọn một cư dân':'Chọn nền phòng hoặc hành lang':
  'Chọn thẻ → chọn vị trí';
  if(chosen?.kind==='room')painter.fit();
  lastCards='';
  renderCards();
  sound.play('ui-click')
 }
 )
}
$('#cancel').onclick=clearCard;
$$('[data-filter]').forEach(b=>b.onclick=()=>{
 filter=b.dataset.filter;
 $$('[data-filter]').forEach(a=>a.classList.toggle('active',
 a===b));
 lastCards='';
 renderCards()
}
);
function setFogMode(mode){
 painter.setFogMode(mode);
 $('#fog').value=painter.fogMode;
 renderInspector()
}
function setFloor(f){
 setFogMode('all');
 painter.floor=f;
 game.state.currentFloor=f;
 const room=game.rooms(f).find(r=>r.type==='guard')||game.rooms(f)[0];
 if(!relocating){
  selection=room?.id;
  painter.selected=selection;
  painter.focus(room)
 }
 lastRooms='';
 update();
 save()
}
$$('[data-floor]').forEach(b=>b.onclick=()=>setFloor(Number(b.dataset.floor)));
function select(id,
focus=false){
 selection=id;
 if(id)document.body.classList.add("inspector-open");
 painter.selected=id;
 painter.updateFog();
 const e=game.entity(id),
 room=game.state.rooms.find(r=>r.id===id);
 if(focus){
  if(room)painter.focus(room);
  else if(e){
   painter.floor=e.floorId;
   game.state.currentFloor=e.floorId;
   painter.camera.x=e.x;
   painter.camera.y=e.y;
   painter.camera.tile=32
  }
 }
 lastRooms='';
 renderInspector();
 if(innerWidth<960)modal(inspectorHTML(),
 'inspect')
}
function meter(label,
value,
max,
mana=false){
 return`<div class="meter-label"><span>${
label
}</span><b>${
Math.ceil(value)
} / ${
Math.ceil(max)
}</b></div><div class="meter ${
mana?'mana':''
}"><i style="width:${
Math.max(0,
Math.min(100,
value/max*100))
}%"></i></div>`
}
function inspectorHTML(){
 const s=game.state,
 e=game.entity(selection),
 r=s.rooms.find(r=>r.id===selection),
 prop=s.props.find(p=>p.id===selection),
 trap=s.traps.find(t=>t.id===selection);
 if(e){
  const quality=QUALITIES.find(q=>q.id===e.quality)||QUALITIES[0],
  variant=VARIANTS[e.variant]||VARIANTS.normal,
  skill=typeof e.target==='object'&&e.target?.skillId?SKILLS[e.target.skillId]:null,
  current=e.scores.find(c=>c.action===e.action);
  if(e.faction==='hero'&&painter.fogMode!=='all'&&painter.isUnitVisible&&!painter.isUnitVisible(e)&&!s.oracle?.entries.some(a=>a.id===e.id))
  return`<div class="entity-title"><h2>Đã mất dấu</h2></div><p class="description">Không có tầm nhìn hiện tại. Trí nhớ không tiết lộ vị trí, HP hoặc đồ mới củ\
a đối thủ.</p>`
  ;
  return`<div class="portrait"><img src="assets/frames/${
portrait(e)
}.png" alt="${
esc(e.name)
}"><span>LV. ${
e.level
}</span></div><div class="entity-title"><h2>${
esc(e.name)
}</h2>${
e.boss?'<span class="badge">BOSS</span>':e.isCommander?'<span class="badge">CHỈ HUY PHÒNG</span>':e.isLeader?'<span class="badge">LEADER</span>':''
}</div><div class="entity-sub">${
esc(e.evolution||SPECIES[e.species].name)
} · <span style="color:${
quality.color
}">${
quality.name
}</span>${
e.variant!=='normal'?' · '+variant.name:''
}${
e.status!=='active'?' · '+(e.status==='downed'?'Đang gục':e.status==='dead'?'Đã chết':'Đã rời đi'):''
}</div>${
weaponSummary(game,e)+(e.boss?`<div class="part"><b>Ấn Tầng ${e.floorId+1}</b><p>${
 (BOSS_POOL[e.floorBossId||e.boss]?.seals||[]).map(x=>esc(x.name+': '+x.description)).join('<br>')
 }</p><span>${game.floorSeals(e.floorId)&&e.status==='active'?'Đang hoạt động':'Đã vỡ'}</span></div>`:'')+
 (chosen?.def.kind==='item'&&ITEMS[chosen.def.id]?.family?`<p class="equip-reason">${esc(game.equipIssue(e,ITEMS[chosen.def.id]))}</p>`:'')+
 rpgInspector(game,e)+hearts(e)+meter('Sinh lực',
e.hp,
e.maxHp)
}${
e.maxMana?meter('Mana',
e.mana,
e.maxMana,
true):''
}<div class="role-line">${
roleNames[e.role]||'Cá thể độc lập'
} · Tầng ${
e.floorId+1
}${
e.faction==='monster'?' · Giữ phòng':''
}</div><div class="status-list" style="margin-top:9px">${
e.statuses.filter(a=>a.permanent||a.until>s.time).map(a=>
`<span class="status ${
STATUS[a.type]?.bad?'bad':''
}" title="${
esc(STATUS[a.type]?.description||STATUS[a.type]?.name)
}">${
icon('status',a.type,STATUS[a.type]?.symbol||'✧')
} ${
STATUS[a.type]?.name||a.type
} ${
a.permanent?'∞':Math.ceil(a.until-s.time)+'s'
}</span>`
).join('')
}</div><div class="part"><div class="part-title">CHARM · CÁ TÍNH</div><div class="charm-list">${
e.charms.map(id=>{
 const d=CHARMS[id];
 return d?`<span class="charm ${
d.type
}" title="${
esc(d.description)
}">${
d.symbol
} ${
esc(d.name)
}</span>`:''
}
).join('')
}</div></div><div class="part"><div class="part-title">UTILITY AI</div><div class="ai-action"><span class="dot"></span>${
e.status==='active'?skill?skill.name:actionNames[e.action]||e.action:'Không hoạt động'
}</div><div class="ai-reason">${
esc(current?.reason||'Đang chờ diễn biến. Các tầng vẫn mô phỏng độc lập camera.')
}</div>${
e.scores.slice(0,
4).map(a=>
`<div class="utility ${
a.action===e.action?'selected':''
}"><span>${
actionNames[a.action]||a.action
}</span><i><b style="width:${
Math.min(100,
a.score/3.5*100)
}%"></b></i><span>${
a.score.toFixed(2)
}</span></div>`
).join('')
}<div class="info-row"><span>Vũ khí / tầm đánh</span><b>${
esc(game.weaponDefinition(e)?.name||e.equipment?.name||'Bẩm sinh')
} · ${
game.range(e).toFixed(1)
} ô</b></div><div class="info-row"><span>Trí khôn / chỉ huy</span><b>${
e.intelligence
} / ${
e.isCommander?'Chỉ huy':'Thành viên'
}</b></div>${
e.status==='downed'?
`<p class="notice">Đang gục · ${
e.bleedOutAt?Math.max(0,
Math.ceil(e.bleedOutAt-s.time))+' giây để cứu':'chờ cứu/hồi sinh'
} · ${
Math.round((e.rescueProgress||0)*100)
}% cứu hộ</p>`:
''
}<div class="info-row"><span>Tầm nhìn / ký ức địch</span><b>${
e.visibleIds?.length||0
} / ${
Object.keys(e.seen).length
}</b></div></div><div class="part"><div class="part-title">KỸ NĂNG ĐANG MỞ</div>${
(e.boss?BOSS_POOL[e.floorBossId||e.boss]?.skills||[]:game.activeSkills(e)).map(k=>
`<div class="skill-row"><span>✦</span><div><b>${
k.name
}</b><small>${
esc(k.description)
} · ${
Math.max(0,
Math.ceil((e.skillCooldowns[k.id]||0)-s.time))
}s hồi</small></div></div>`).
join(
'')
}</div><div class="part"><div class="part-title">NỘI TẠI</div>${
e.passiveIds.map(id=>PASSIVES[id]).filter(Boolean).map(p=>`<div class="skill-row"><span>◇</span><div><b>${
p.name
}</b><small>${
esc(p.description)
}</small></div></div>`).join('')
}</div><div class="part"><div class="part-title">TÚI ĐỒ · PHÒNG YÊU THÍCH</div><div class="info-row"><span>Đã dùng</span><b>${
game.usedSlots(e)
} / ${
e.capacity
} ô</b></div>${
Object.values(e.gearSlots).map(id=>s.items.find(i=>i.id===id)).filter(Boolean).map(i=>`<div class="info-row"><span>${
esc(i.name)
}</span><b>Đang trang bị <button data-unequip="${ITEMS[i.definitionId].slot}" ${!game.canPrepare()?'disabled':''}>Cất</button></b></div>`).join('')
}${
e.inventory.map(id=>s.items.find(i=>i.id===id)).filter(Boolean).map(i=>
`<div class="info-row"><span>${
esc(i.name)
}</span><b>${
ITEMS[i.definitionId]?.slot&&e.faction==='monster'&&e.status==='active'?equipControl(game,e,i):(i.charges||1)+' lượt'
}</b></div>`
).join('')
}<div class="info-row"><span>Thuốc / cuộn siêu tốc</span><b>${
e.potions
} / ${
e.quickScrolls.length
}</b></div><p class="description">Ưa thích: ${
e.favoriteRooms.map(id=>ROOMS[id]?.name).join(', ')
}${
game.favorite(e)?'<br><b>Đang nhận cộng hưởng phòng.</b>':''
}</p><div class="actions">${
e.faction==='monster'&&e.status==='active'?(s.phase==='battle'?
`<button data-action="heal" ${
s.mana<15||e.hp>=e.maxHp||e.charms.includes('forsaken')||s.paused?'disabled':''
}>✦ Hồi 40 HP · 15 mana</button>`:!e.boss?
`<button data-action="relocate" ${
!game.canPrepare()?'disabled':''
}>⌖ Đổi phòng</button><button data-action="ambush" ${
!game.canPrepare()?'disabled':''
}>${
e.order==='ambush'?'Đang phục kích':'Lệnh phục kích'
}</button>`
:''):''
}${
e.faction==='monster'&&e.status==='downed'?`<button data-action="revive" ${
!game.canPrepare()?'disabled':''
}>Hồi sinh · ${
e.boss?20:5
} hồn</button>`:''
}${
e.faction==='monster'&&e.status==='active'&&s.brewedPotions>0?`<button data-action="give-potion">Cấp thuốc · Còn ${
s.brewedPotions
}</button>`:''
}${
e.status==='active'?`<button data-action="view-pov">◉ Góc nhìn nhân vật</button>`:''
}<button data-action="focus">⌖ Nhìn gần</button></div></div>`
 }
 if(r){
  const d=ROOMS[r.type],
  monsters=game.roomMonsters(r);
  return`<div class="portrait">${roomIcon(r.type,d.icon)}<span>PHÒNG LV. ${
r.level
}</span></div><div class="entity-title"><h2>${
esc(d.name)
}</h2></div><div class="entity-sub">${
r.w-2
}×${
r.h-2
} ô nền · ${
r.sealed?'CỬA ĐANG KHÓA':r.sealAt?'CỬA ĐANG ĐÓNG':'Cửa đang mở'
}</div><p class="description">${
esc(d.description)
}</p>${
meter('Công trình',
r.buildingHp,
r.buildingMaxHp)
}<div class="info-row"><span>Quyền kiểm soát</span><b style="color:${
r.owner==='dungeon'?'#abc79b':'#e0a087'
}">${
r.owner==='dungeon'?'Hầm ngục':'Mạo hiểm giả'
}</b></div><div class="info-row"><span>Sức chứa phòng</span><b>${
game.roomSlotsUsed(r)
} / ${
game.roomCapacity(r)
} ô quân</b></div><div class="info-row"><span>Chỉ huy</span><b>${
esc(game.entity(r.commanderId)?.name||'Chưa có')
}</b></div><div class="info-row"><span>Quái còn chiến đấu</span><b>${
monsters.length
}</b></div><div class="info-row"><span>Rương dọn phòng</span><b>${
r.rewardChest?CHEST_TIERS[r.rewardChest.tier-1].name+' · '+(r.rewardChest.opened?'Đã mở':'Chưa mở'):'Xuất hiện khi dọn sạch'
}</b></div><div class="info-row"><span>Seed bố trí</span><b>${
r.layoutSeed
}</b></div>${
r.owner!=='dungeon'?'<div class="notice">Bố trí cư dân vào phòng đã sạch kẻ địch để chiếm lại. Công trình bị phá cần sửa sau khi tái chiếm.</div>':''
}<div class="actions"><button data-action="focus">⌖ Nhìn gần</button><button data-action="upgrade-room" ${
!game.canPrepare()||!game.roomOperational(r)||r.level>=3?'disabled':''
}>Nâng cấp · ${
r.level*80
} vàng</button><button data-action="repair-room" ${
!game.canPrepare()||r.owner!=='dungeon'||r.buildingHp>=r.buildingMaxHp?'disabled':''
}>Sửa · ${
game.repairCost()
} vàng</button><button data-action="hire">♟ Tuyển cư dân</button><button data-action="place-key" ${
!game.canPrepare()?'disabled':''
}>⚿ Đặt chìa khóa</button><button data-action="remove-room" ${
!game.canPrepare()||s.entities.some(e=>e.faction==='monster'&&e.roomId===r.id)?'disabled':''
}>Tháo phòng · trả blueprint</button></div><div class="part"><div class="part-title">CƯ DÂN GIỮ PHÒNG</div>${
s.entities.filter(e=>e.roomId===r.id&&e.faction==='monster').map(e=>
`<button class="list-row" data-select="${
e.id
}"><img src="assets/frames/${
portrait(e)
}.png" alt=""><div><b>${
esc(e.name)
}</b><small>${
roleNames[e.role]
} · Lv.${
e.level
}</small></div><span>${
Math.ceil(e.hp)
} HP</span></button>`
).join('')||'<p class="empty">Chưa có cư dân được phân công.</p>'
}</div>`
 }
 if(prop)
 return`<div class="entity-title"><h2>${
{
 explosive:'Thùng nổ',
 poison:'Thùng độc',
 water:'Thùng nước',
 wood:'Thùng gỗ',
 crate:'Hòm gỗ',
 pillar:'Cột đá',
 wall:'Tường đá',
 pit:'Vực sâu'
}
[prop.type]
}</h2></div><p class="description">${
prop.type==='pit'?'Vực chặn đi bộ, không chắn tầm nhìn hoặc đòn tầm xa.':prop.type==='wall'?'Tường chặn di chuyển và tầm nhìn. Không thể phá; đường đi bộ luôn có lối vòng.':prop.type===
'explosive'?'Nổ bán kính 3,2 ô, 38 sát thương, kích hoạt dây chuyền. Cả hai phe đều bị ảnh hưởng.':prop.type==='poison'?'Khí độc tồn tại 6 giây, ảnh hưởng cả đồng minh và kẻ địch.':prop
.type==='water'?'Phá thùng để dập lửa và xóa vùng độc gần đó.':'Vật cản ảnh hưởng tầm nhìn và tìm đường; hòm/thùng có thể bị phá, cột là vật cản cố định.'
}</p>${
meter(prop.destroyed?'Đã bị phá':'Độ bền',
Math.max(0,
prop.hp),
prop.maxHp)
}`
 ;
 if(trap)
 return`<div class="entity-title"><h2>${
{
 spikes:'Gai',
 dart:'Phi tiêu',
 frost:'Ấn chú băng'
}
[trap.type]
}</h2></div><p class="description">${
trap.corridorId?'Bẫy hành lang':'Bẫy trong phòng'
} · ${
trap.disabled?'Đã vô hiệu':trap.revealed?'Đã lộ':'Ẩn với kẻ xâm nhập'
}. AI chỉ tính bẫy vào đường đi sau khi thực sự phát hiện.</p><div class="info-row"><span>Hồi bẫy</span><b>${
trap.cooldown.toFixed(1)
}s</b></div>`
 ;
 return'<p class="empty">Chọn phòng, cư dân, vật thể hoặc bẫy để xem thông tin.</p>'
}
function renderInspector(){
 const html=inspectorHTML();
 $('#inspector').innerHTML=html;
 if(modalMode==='inspect'&&$('#modal').open)$('#modal-content').innerHTML=html
}
function inspectorClick(event){
 const path=event.target.closest('[data-master-path]');
 if(path){const result=game.chooseMasterPath(selection,path.dataset.masterPath);toast(result.ok?'Đã tiến hóa hào quang chủ phòng.':result.message);if(result.ok){save();update()}return}
 const remove=event.target.closest('[data-unequip]');
 if(remove){const e=game.entity(selection);
  if(game.canPrepare()&&e?.faction==='monster'&&game.unequipItem(e,remove.dataset.unequip)){save();update()}return;
 }
 const gear=event.target.closest('[data-equip]');
 if(gear){
  const e=game.entity(selection),
  item=game.state.items.find(i=>i.id===gear.dataset.equip);
  if(game.canPrepare()&&e?.faction==='monster'&&e.status==='active'&&item?.owner===e.id&&game.useItem(e,
  item.id)){
   save();
   update()
  }
  return
 }
 const selectButton=event.target.closest('[data-select]');
 if(selectButton){
  select(selectButton.dataset.select,
  true);
  return
 }
 const button=event.target.closest('[data-action]');
 if(!button)
 return;
 const action=button.dataset.action,
 e=game.entity(selection),
 room=game.state.rooms.find(r=>r.id===selection);
 if(action==='place-key'){
  beginKeyPlacement();
  return
 }
 if(action==='remove-room'){
  if(game.removeRoom(selection)){
   selection=painter.selected=null;
   painter.fit();
   lastCards=lastRooms='';
  }
  else toast('Phòng phải trống cư dân trước khi tháo.');
  save();
  update();
  return
 }
 if(action==='view-pov'&&e&&e.status==='active'){
  painter.floor=e.floorId;
  game.state.currentFloor=e.floorId;
  painter.camera.x=e.x;
  painter.camera.y=e.y;
  setFogMode('selected');
  closeModal()
 }
 if(action==='give-potion'){
  if(!game.givePotion(selection))toast('Không còn thuốc hoặc túi đã đầy.')
 }
 if(action==='heal'){
  if(!game.spell(selection))toast('Không thể hồi phục lúc này.')
 }
 if(action==='revive'){
  if(!game.revive(selection))toast('Không đủ linh hồn hoặc chưa thể hồi sinh.')
 }
 if(action==='relocate'){
  relocating=selection;
  chosen=null;
  painter.card=null;
  closeModal();
  toast('Chọn nền phòng mới. Có thể đổi tầng trước khi bố trí.')
 }
 if(action==='ambush'&&e&&game.canPrepare()){
  e.order=e.order==='ambush'?'guard':'ambush';
  e.concealed=e.order==='ambush'
 }
 if(action==='focus'){
  if(room)painter.focus(room,
  true);
  else if(e){
   painter.floor=e.floorId;
   painter.camera.x=e.x;
   painter.camera.y=e.y;
   painter.camera.tile=40
  }
  closeModal()
 }
 if(action==='upgrade-room'&&!game.upgradeRoom(selection))toast('Không thể nâng cấp phòng.');
 if(action==='repair-room'&&!game.repairRoom(selection))toast('Không thể sửa phòng.');
 if(action==='hire')showRecruit();
 save();
 update()
}
$('#inspector').addEventListener('click',
inspectorClick);
$('#modal-content').addEventListener('click',
inspectorClick);
function showPacks(){
 if(game.state.deck.pendingPack){
  showOpenPack();
  return
 }
 modal(
 `<span class="eyebrow">BÀN TAY CỦA ĐỊNH MỆNH</span><h2>Những gì nằm sau lá bài.</h2><p>Mua gói, chọn lá giữ lại, rồi dùng thẻ trên bản đồ. Phòng cần 5\
 mana để xây từ bản thiết kế.</p><div class="pack-grid">${
Object.entries(PACKS).map(([id,
p])=>
`<button class="pack-card" data-pack="${
id
}" ${
!game.canPrepare()||game.state.gold<p.cost||game.state.deck.activeFate?.id==='F09'?'disabled':''
}><div class="pack-art"><img src="assets/frames/${
id==='contracts'?'goblin_idle_anim_f0':id==='mystery'?'chest_mimic_open_anim_f2':'chest_full_open_anim_f2'
}.png" alt=""></div><b>${
p.name
}</b><span>${
p.description
}</span><strong>${
p.cost
} vàng</strong></button>`
).join('')
}</div>${
game.state.deck.activeFate?.id==='F09'?'<div class="notice">Vận Mệnh Đảo Chiều: màn này không được mua gói mới.</div>':''
}<div class="actions"><button id="hire-from-packs">Thuê theo loài / hợp đồng ngẫu nhiên ↗</button></div>`
 ,
 'packs');
 $$('[data-pack]').forEach(b=>b.onclick=()=>{
  if(game.buyPack(b.dataset.pack)){
   save();
   showOpenPack();
   update()
  }
  else toast('Chưa thể mua gói. Hãy bỏ pause nếu đang chuẩn bị.')
 }
 );
 $('#hire-from-packs').onclick=showRecruit
}
function showOpenPack(){
 const p=game.state.deck.pendingPack;
 if(!p)
 return;
 modal(
 `<span class="eyebrow">GÓI ĐANG MỞ · LƯU KẾT QUẢ THEO SEED</span><h2>Chọn ${
p.picks-p.chosen.length
} lá để giữ.</h2><div class="pack-grid open-pack">${
p.cards.map(c=>{
 const d=CARDS.find(a=>a.id===c.definitionId);
 return`<button class="pack-card ${
p.chosen.includes(c.uid)?'picked':''
}"${cardFrame(d.tone)} data-keep="${
c.uid
}" ${
p.chosen.includes(c.uid)?'disabled':''
}><div class="pack-art"><img src="assets/frames/${
d.art
}.png" alt=""></div><b>${
d.name
}</b><span>${
esc(d.description)
}</span>${
c.quality!==null?`<strong style="color:${
QUALITIES[c.quality].color
}">${
QUALITIES[c.quality].name
} · ${
VARIANTS[c.variant].name
}</strong>`:
'<strong>Bản thiết kế / vật phẩm</strong>'
}</button>`
}
).join('')
}</div><p>Những lá đã lật được giữ nguyên khi lưu/tải. Đóng bảng không tạo lại kết quả.</p>`
 ,
 'pack-open');
 $$('[data-keep]').forEach(b=>b.onclick=()=>{
  game.choosePackCard(b.dataset.keep);
  save();
  if(game.state.deck.pendingPack)showOpenPack();
  else{
   closeModal();
   toast('Bài đã vào tay. Chọn thẻ để sử dụng.')
  }
  lastCards='';
  update()
 }
 )
}
function showFates(){
 const deck=game.state.deck;
 modal(
 `<span class="eyebrow">GIAO ƯỚC CHO CUỘC THÁM HIỂM KẾ TIẾP</span><h2>Không có món quà nào miễn phí.</h2><p>Chọn một thẻ định mệnh trước khi bước sang \
màn mới.</p><div class="pack-grid">${
deck.fateChoices.map(id=>{
 const f=FATES[id];
 return`<button class="pack-card fate" data-fate="${
id
}"><span class="fate-sigil">${
['◇',
'♜',
'✦'][Number(id.slice(1))%3]
}</span><b>${
f.name
}</b><span>${
esc(f.description)
}</span><em>${
esc(f.counter)
}</em></button>`
}
).join('')
}</div>`
 ,
 'fate');
 $$('[data-fate]').forEach(b=>b.onclick=()=>{
  if(game.chooseFate(b.dataset.fate)){
   game.next();
   save();
   closeModal();
   lastResult=null;
   lastCards='';
   update();
   if(game.state.deck.pendingPack)showOpenPack()
  }
 }
 )
}
function showResult(){
 const r=game.state.result;
 if(!r)
 return;
 modal(
 `<div class="result"><span class="eyebrow">THÁM HIỂM ${
game.state.wave
} · ${
r.lost?'KẾT THÚC RUN':'HOÀN THÀNH'
}</span><br><img src="assets/frames/${
r.lost?'skull':'chest_full_open_anim_f2'
}.png" alt=""><h2>${
esc(r.title)
}</h2><p>${
esc(r.description)
}</p>${
!r.lost?
`<div class="result-stats"><div><strong>+${
r.reward
}</strong><small>Vàng thưởng</small></div><div><strong>${
r.recovered
}</strong><small>Vàng thu hồi</small></div></div><p>Người thoát mang tin về Công hội. Công trình bị chiếm/phá vẫn giữ trạng thái; hãy kiểm tra trước m\
àn sau.</p>`
:''
}<div class="result-actions"><button id="continue" class="primary">${
r.lost?'Run mới ↻':'Chọn thẻ định mệnh ↗'
}</button><button id="inspect-result" class="secondary">Xem hầm ngục</button></div></div>`
 ,
 'result');
 $('#continue').onclick=()=>{
  if(r.lost){
   reset();
   closeModal()
  }
  else showFates()
 }
 ;
 $('#inspect-result').onclick=closeModal
}
function reset(){
 game=new Game();
 accumulator=0;
 lastPhase=game.state.phase;
 painter.fogMemory=new Map();
 painter.card=null;
 painter.game=game;
 setFogMode('all');
 painter.floor=0;
 painter.selected=selection=game.rooms(0).find(r=>r.type==='guard')?.id;
 game.on(update);
 clearCard();
 lastResult=null;
 lastCards=lastRooms=lastLog='';
 requestAnimationFrame(()=>painter.focus(game.state.rooms.find(r=>r.id===selection)));
 save();
 update()
}
function showRecruit(){
 const hireMultiplier=game.state.deck.activeFate?.id==='F02'?1.5:1,
 fixedCost=Math.ceil(75*hireMultiplier),
 randomCost=Math.ceil(110*hireMultiplier);
 const controlled=game.state.rooms.filter(r=>r.owner==='dungeon');
 modal(
 `<span class="eyebrow">GIAO ƯỚC CƯ DÂN</span><h2>Không ai hoàn toàn giống ai.</h2><p>Thuê theo loài: ${
fixedCost
} vàng, chủ yếu phẩm chất thường. Hợp đồng ngẫu nhiên: ${
randomCost
} vàng, cơ hội phẩm chất cao hơn; loài và biến thể không được chọn trước.</p><label class="description">Phòng được phân công <select id="hire-room">${
controlled.map(r=>
`<option value="${
r.id
}" ${
r.id===selection?'selected':''
}>T${
r.floorId+1
} · ${
ROOMS[r.type].name
} · ${
game.roomSlotsUsed(r)
}/${
game.roomCapacity(r)
} ô</option>`).join
('')
}</select></label><div class="hire-grid">${
[...MONSTER_HIRES,
'warden',
'lord'].map(id=>
`<button class="list-row" data-hire="${
id
}" ${game.canHireSpecies(id)?'':'disabled title="Chỉ xuất hiện tại Chợ phiên"'}><img src="assets/frames/${
portrait({species:id})
}.png" alt=""><b>${
SPECIES[id].name
}</b><span>${
id==='warden'?300:id==='lord'?400:fixedCost
}G</span></button>`
).join('')
}</div><button id="random-hire" class="primary">Hợp đồng ngẫu nhiên · ${
randomCost
}G</button><p>${
QUALITIES.map(q=>`<span style="color:${
q.color
}">${
q.name
}</span>`).join(' → ')
}</p><div class="notice">Quái luôn giữ trong phòng được phân công khi chiến đấu. Đổi phòng trước trận để chiếm lại công trình đã mất.</div>`
 ,
 'recruit');
 $$('[data-hire]').forEach(b=>b.onclick=()=>hire(b.dataset.hire));
 $('#random-hire').onclick=()=>hire(null);
 function hire(species){
  if(['warden','lord'].includes(species)){const r=game.state.rooms.find(r=>r.id===$('#hire-room').value);
   if(r){showFloorBosses(r.floorId);return;}
  }
  const e=game.hire($('#hire-room').value,
  species);
  if(!e)toast('Không đủ vàng, không có chỗ, hoặc đang tạm dừng.');
  else{
   select(e.id,
   true);
   save();
   update();
   toast('Đã ký hợp đồng với '+e.name);
   closeModal()
  }
 }
}
function roster(){
 modal(
 `<span class="eyebrow">NHỮNG CÁ THỂ GIỮ HẦM NGỤC</span><h2>Cư dân & phân công</h2><div class="actions"><button id="recruit-roster" class="primary">Thu\
ê cư dân</button></div>${
game.state.entities.filter(e=>e.faction==='monster').map(e=>
`<button class="list-row" data-roster="${
e.id
}"><img src="assets/frames/${
portrait(e)
}.png" alt=""><div><b>${
esc(e.name)
}</b><small>Tầng ${
e.floorId+1
} · ${
roleNames[e.role]
} · ${
QUALITIES.find(q=>q.id===e.quality)?.name
}</small></div><span>${
Math.ceil(e.hp)
} / ${
e.maxHp
}</span></button>`
).join('')
}`
 ,
 'roster');
 $$('[data-roster]').forEach(b=>b.onclick=()=>{
  closeModal();
  select(b.dataset.roster,
  true)
 }
 );
 $('#recruit-roster').onclick=showRecruit
}
function showGuild(){
 modal(
 `<span class="eyebrow">BÁO CÁO CÓ NGUỒN, CÓ ĐỘ TRỄ</span><h2>Hồ sơ Công hội</h2><p>Người bị hạ không tự truyền sơ đồ ra ngoài. Chỉ người thoát thực sự\
 mang được kiến thức của mình trở về.</p>${
game.state.world.intel.slice(-10).reverse().map(i=>
`<div class="rumor"><b>${
esc(i.name)
} · Màn ${
i.wave
} · ${
i.confidence
}</b><small>${
i.rooms.length
} phòng / ${
i.traps.length
} bẫy · ${
i.source
}</small><small>${
i.rooms.map(r=>`T${
r.floorId+1
} ${
esc(r.name)
}`).join(' · ')
}</small></div>`
).join('')||'<p class="empty">Chưa có người thoát mang tin.</p>'
}<h3>Những người đã tiến vào</h3>${
game.state.reports.slice(-16).reverse().map(r=>
`<div class="list-row"><div><b>${
esc(r.name)
}</b><small>${
SPECIES[r.species]?.name
} · Lv.${
r.level
} · Màn ${
r.wave
}</small></div><span>${
r.survived?'Đã thoát':'Không trở về'
}</span></div>`
).join('')
}`
 ,
 'guild')
}
function showWorld(){
 const s=game.state,
 w=s.world;
 modal(
 `<span class="eyebrow">NGÀY ${
w.day
} · NGOÀI MIỆNG HẦM NGỤC</span><h2>Thế giới vẫn đang chuyển động.</h2><div class="world-grid"><div class="world-card"><small>THỜI TIẾT & ĐƯỜNG SÁ</sma\
ll><b>${
w.weather
}</b><p>${
w.road
}. Mưa làm viện binh đến trễ; sương giảm tầm nhìn.</p></div><div class="world-card"><small>TÌNH TRẠNG KHU VỰC</small><b>${
w.event
}</b><p>Chiến tranh tăng pháp sư thay tuyến trước; dịch sốt tăng người hỗ trợ; chợ phiên bổ sung thuốc.</p></div><div class="world-card"><small>CÔNG H\
ỘI</small><b>${
w.guildPressure
} báo cáo</b><p>Chỉ dùng tin đã mang về; vị trí mới xây và viện binh chưa xuất hiện vẫn chưa được biết chắc.</p></div></div><h3>Gián điệp & Con Mắt Th\
ần</h3><p>Gián điệp giả dạng thương nhân khảo sát đoàn chính. Mimic là cư dân giả rương trong hầm ngục; hai chức năng riêng.</p><div class="actions"><\
button id="spy-buy" ${
!game.canPrepare()?'disabled':''
}>Cử gián điệp · 80G</button><button id="eye-buy" ${
!game.canPrepare()?'disabled':''
}>Mua Mắt Thần · 60G</button><button id="eye-use" ${
s.mana<20||!s.oracleCharges&&!s.rooms.some(r=>r.type==='oracle'&&game.roomOperational(r))||s.oracle?.until>s.time?'disabled':''
}>Soi túi kẻ đang tấn công · 20 mana</button></div><p>${
w.spy?.state==='pending'?'Gián điệp đang đi dò tin; đóng bảng để thời gian tiếp tục.':esc(w.spy?.report||'Chưa có báo cáo gián điệp.')
} · Mắt Thần dự trữ: ${
s.oracleCharges
}</p>${
s.oracle&&s.oracle.until>s.time?
`<div class="notice">${
s.oracle.entries.map(e=>
`<b>${
esc(e.name)
}</b>: ${
e.equipment.map(esc).join(', ')
} · túi ${
e.items.map(esc).join(', ')||'trống'
} · thuốc ${
e.potions
} · cuộn ${
e.scrolls.length
}`).join(
'<br>')||'Chưa có kẻ tấn công đang hoạt động. Không tiết lộ quân chưa xuất hiện.'
}</div>`
:''
}<h3>Lời đồn đang lan</h3>${
w.rumors.slice(0,
10).map(r=>`<div class="rumor"><b>${
esc(r.title)
}</b><small>Ngày ${
r.day
} · ${
r.confidence
}</small><p>${
esc(r.text)
}</p></div>`).join('')
}${
s.deck.activeFate?`<div class="notice">Định mệnh hiện tại: <b>${
s.deck.activeFate.name
}</b><br>${
s.deck.activeFate.description
}<br>${
s.deck.activeFate.counter
}</div>`:''
}`
 ,
 'world');
 $('#spy-buy').onclick=()=>{
  toast(game.buySpy()?'Gián điệp lên đường; báo cáo về sau 20 giây mô phỏng.':'Chưa thể cử gián điệp.');
  save();
  showWorld()
 }
 ;
 $('#eye-buy').onclick=()=>{
  toast(game.buyOracle()?'Đã mua một Con Mắt Thần.':'Chưa thể mua.');
  save();
  showWorld()
 }
 ;
 $('#eye-use').onclick=()=>{
  toast(game.useOracle()?'Đã ghi nhận đồ của những kẻ đang tấn công.':'Cần Mắt Thần hoặc Điện Con Mắt, 20 mana; không kích hoạt trùng.');
  save();
  showWorld()
 }
}
function catalog(){
 modal(
 `<span class="eyebrow">NỘI DUNG DÙNG CHUNG CHO CẢ HAI PHE</span><h2>Bách khoa hầm ngục</h2><div class="catalog-toolbar"><select id="catalog-type"><opt\
ion value="skills">${
Object.keys(SKILLS).length
} kỹ năng</option><option value="passives">${
Object.keys(PASSIVES).length
} nội tại</option><option value="effects">${
Object.keys(STATUS).length
} hiệu ứng</option><option value="charms">${
Object.keys(CHARMS).length
} Charm</option><option value="rooms">${
Object.keys(ROOMS).length
} phòng</option><option value="items">${
Object.keys(ITEMS).length
} vật phẩm</option><option value="species">${
Object.keys(SPECIES).length
} loài / vai trò</option></select><input id="catalog-search" placeholder="Tìm theo tên hoặc tác dụng…" aria-label="Tìm bách khoa"></div><p>Các hiệu ứn\
g dùng handler chung; mỗi cá thể chỉ mở một số chiêu theo loài, cấp, trang bị và tiến hóa. Thông số đang ở giai đoạn cân bằng.</p><div id="catalog-lis\
t" class="catalog-grid"></div>`
 ,
 'catalog');
 function draw(){
  const source={
   skills:SKILLS,
   passives:PASSIVES,
   effects:STATUS,
   charms:CHARMS,
   rooms:ROOMS,
   items:ITEMS,
   species:SPECIES
  }
  [$('#catalog-type').value],
  q=$('#catalog-search').value.toLowerCase();
  $('#catalog-list').innerHTML=Object.entries(source).filter(([id,
  d])=>`${
d.name
} ${
d.description||''
}`.toLowerCase().includes(q)).map(([id,
  d])=>
  `<div class="catalog-card">${
d.art||d.sprite?`<img class="catalog-icon" src="assets/frames/${
d.art||portrait({species:id})
}.png" alt="">`:""
}<b>${
esc(d.name)
}</b><small>${
id
}${
d.kind?' · '+d.kind:''
}</small><p>${
esc(d.description||(d.hp?`${
d.hp
} HP · ${
d.attack
} ATK · Tầm cơ bản ${
d.range
} ô`:'Hiệu ứng điều chỉnh hành động và chỉ số khi hoạt động.'))
}</p>${
d.counter?`<p>Đối sách / đánh đổi: ${
esc(d.counter)
}</p>`:''
}</div>`
  ).join('')
 }
 $('#catalog-type').onchange=draw;
 $('#catalog-search').oninput=draw;
 draw()
}
function beginKeyPlacement(){
 clearCard();
 placingKey=true;
 $('#cancel').hidden=false;
 closeModal();
 toast('Chọn nền đi tới được ngoài phòng rương, hoặc chọn quái giữ chìa.')
}
function showLayout(){
 const issues=game.layoutIssues(),
 k=game.state.keyQuest;
 modal(
 `<span class="eyebrow">TỰ THIẾT KẾ · CHỈ MỞ TRẬN KHI CÓ THỂ HOÀN THÀNH</span><h2>Bản thiết kế hầm ngục</h2><p>Đặt cổng vào tầng 1 và phòng rương ở tần\
g bạn muốn. Tầng 2 cần cặp cầu thang. Nối toàn bộ phòng bằng đường đi bộ. Mỗi quái thường chiếm 1 ô quân, quái lớn 2, boss 4.</p><div class="notice">${
issues.length?issues.map(esc).join('<br>'):'✓ Bố cục hợp lệ: có thể mở trận.'
}</div><p>Chìa: ${
!k.placed?'chưa đặt':k.owner?'do '+esc(game.entity(k.owner)?.name||'cư dân')+' giữ':'đã đặt trên nền tầng '+(k.floorId+1)
}. Hạ người giữ sẽ làm chìa rơi; AI phải nhìn thấy hoặc nhận tin rồi mới biết.</p><div class="actions"><button id="layout-key" ${
!game.canPrepare()?'disabled':''
}>⚿ Chọn nơi đặt chìa</button><button id="layout-fit">Xem toàn tầng</button></div><p>Tường chắn đi/nhìn/bắn. Vực chỉ chắn đi, bắn qua được. Nội thất t\
ự sinh theo mẫu có kiểm tra đường đi; quái, bẫy và thùng nguy hiểm do bạn bố trí.</p>`
 ,
 'layout');
 $('#layout-key').onclick=beginKeyPlacement;
 $('#layout-fit').onclick=()=>{
  painter.fit();
  closeModal()
 }
}
function help(){
 modal(
 `<span class="eyebrow">CHỦ NHÂN CỦA NHỮNG ĐẠI SẢNH</span><h2>Hầm ngục lớn hơn, quyết định rõ hơn.</h2><ol><li><b>Run mới trống hoàn toàn.</b> Tự đặt c\
ổng vào tầng 1 và phòng rương, nối các phòng. Nếu dùng tầng 2 cần Đại sảnh cầu thang tầng 1 và Bậc thang tầng 2. Đặt chìa trên nền ngoài phòng rương h\
oặc giao quái giữ; xem Bản thiết kế để kiểm tra. Không tự mở trận khi chưa sẵn sàng.</li><li><b>Mở gói bài</b>, chọn lá giữ lại. Dùng thẻ phòng lên ô \
nét đứt; tốn 5 mana để xây. Bẫy đặt được trong phòng và hành lang.</li><li><b>Thuê quái</b> ở bảng Cư dân, hoặc dùng hợp đồng trong tay. Chọn cư dân →\
 Đổi phòng trước trận. Quái giữ nguyên phòng trong chiến đấu.</li><li><b>Phòng có quái sẽ khóa</b> sau hoạt ảnh đóng cửa 1,2 giây khi kẻ xâm nhập vào;\
 quét sạch quái mới mở. Nếu mọi kẻ xâm nhập gục, phòng reset cửa.</li><li><b>Hai tầng hoạt động thật:</b> Tự đặt cặp cầu thang nếu dùng tầng sâu; thuê\
 boss trong đại sảnh hoặc phòng rương. Lấy kho báu chưa thua, mang ra khỏi cả hầm ngục mới thua.</li><li><b>Quan sát AI:</b> Leader, tanker, tầm xa và\
 hỗ trợ có quyết định riêng, LOS và trí nhớ. Có trinh sát, cuộn thoát, viện binh trễ và tin đồn.</li><li><b>Giữ công trình:</b> tế đàn bị chiếm/phá mấ\
t mana; phân quái vào phòng trống để tái chiếm, rồi sửa và nâng cấp.</li><li><b>Qua màn chọn định mệnh.</b> Thẻ có lợi và bất lợi, tác động màn kế. Bố\
 trí nội thất/bẫy theo seed và trạng thái phá hủy được lưu.</li></ol><p>Cuộn chuột zoom · kéo chuột phải hoặc WASD pan · nhấp đôi phòng để nhìn gần · \
1/2/3 chọn camera · Space pause · G lưới · Esc hủy thẻ. Bảng lớn và tab ẩn tạm giữ mô phỏng để bạn đọc.</p><div class="actions"><button id="help-layou\
t">Bản thiết kế / Đặt chìa</button><button id="help-packs">Mở gói bài</button><button id="help-roster">Cư dân</button><button id="help-world">Bên ngoà\
i</button><button id="new-run" class="secondary">Bắt đầu run mới</button></div><div class="notice">Bản v0.3 có hai tầng và các hệ thống mô tả ở đây; c\
hưa có campaign đầy đủ, điều khiển hành động trực tiếp hoặc thế giới NPC liên tục ngoài các sự kiện theo màn. Mã nguồn và các giới hạn nằm trong CODEX\
.md.</div>`
 ,
 'help');
 $('#help-layout').onclick=showLayout;
 $('#help-packs').onclick=showPacks;
 $('#help-roster').onclick=roster;
 $('#help-world').onclick=showWorld;
 $('#new-run').onclick=confirmReset
}
function update(){
 const s=game.state;
 painter.hudCanvas??=$('#presentation-overlay');painter.hudCtx??=painter.hudCanvas.getContext('2d');
 if(painter.hudCanvas.width!==innerWidth||painter.hudCanvas.height!==innerHeight){painter.hudCanvas.width=innerWidth;painter.hudCanvas.height=innerHeight}
 const mapRect=$('#game').getBoundingClientRect();painter.hudOrigin={x:mapRect.x,y:mapRect.y};painter.hudTargets={};
 for(const id of ['gold','souls']){const r=$('#'+id).getBoundingClientRect();painter.hudTargets[id]={x:r.x+r.width/2,y:r.y+r.height/2}}
 for(const [id,value]of [['gold',s.gold],['mana',s.mana],['souls',s.souls]]){
  const node=$('#'+id),next=Math.floor(value),before=Number(node.textContent);
  if(before!==next){node.classList.remove('value-up','value-down');void node.offsetWidth;
   node.classList.add(next>before?'value-up':'value-down');node.textContent=next}
 }
 $('#mana-cap').textContent='/'+game.manaCapacity();
 $('#wave').textContent=String(s.wave).padStart(2,
 '0');
 $('#resident-count').textContent=s.entities.filter(e=>e.faction==='monster').length;
 $('#report-count').textContent=s.reports.length;
 $('#phase').textContent=s.phase==='prepare'?'CHUẨN BỊ':s.phase==='battle'?'CUỘC THÁM HIỂM':'KẾT QUẢ';
 $('#headline').textContent=s.phase==='prepare'?'Tĩnh lặng trước giông bão':s.phase==='battle'?'Tiếng bước chân dưới đá':'Những câu chuyện được mang về';
 $('#headline').title=$('#headline').textContent;
 const time=Math.max(0,
 Math.ceil(s.phase==='battle'?s.battleTime:s.remaining));
 $('#clock-label').textContent=s.phase==='battle'?'ĐÃ THÁM HIỂM':s.manualStart?'BẢN THIẾT KẾ':'ĐOÀN ĐẾN SAU';
 $('#clock').textContent=String(Math.floor(time/60)).padStart(2,
 '0')+':'+String(time%60).padStart(2,
 '0');
 if(s.phase==='prepare'&&s.manualStart)$('#clock').textContent=game.layoutIssues().length?'CHƯA ĐỦ':'SẴN SÀNG';
 $('#start').textContent=s.phase==='battle'?'Đang phòng thủ':s.phase==='result'?'Chọn định mệnh':s.phase==='gameover'?'Run mới ↻':'Mở cổng ↗';
 $('#start').disabled=s.phase==='battle';
 $('#pause').innerHTML=icon('hud',s.paused?'resume':'pause',s.paused?'▶':'Ⅱ');
 $('#pause').classList.toggle('active',
 s.paused);
 $$('[data-speed]').forEach(b=>b.classList.toggle('active',
 s.speed===Number(b.dataset.speed)));
 $$('[data-floor]').forEach(b=>b.classList.toggle('active',
 Number(b.dataset.floor)===painter.floor));
 $('#floor-label').textContent=painter.floor===0?'TẦNG 01 / HẦM ĐÁ CỔ':'TẦNG 02 / VỰC SÂU AZRAKH';
 const carrying=!!s.treasure.carrier,
 army=s.entities.filter(e=>e.faction==='hero'&&e.status==='active').length;
 $('#battle-banner').textContent=carrying?'⚠ Kho báu đang bị mang đi!':s.phase==='battle'?`⚑ ${
army
} kẻ xâm nhập · Viện binh chưa rõ`:s.keyQuest?.locked?'⚿ Phòng rương đang khóa':
 '◇ Phòng rương đã mở';
 $('#battle-banner').classList.toggle('danger',
 carrying);
 $('#footer-status').textContent=s.paused?'Đang pause · nhấn Space để tiếp tục':chosen?'Đang chọn: '+chosen.name:s.deck.activeFate?'Định mệnh: '+s.deck.activeFate.name:
 'Bố trí phòng thủ · các phòng và cả hai tầng vẫn có đời sống riêng.';
 const lvl=painter.level;
 $('#lod-label').textContent=({
  overview:'BỐ CỤC',
  tactical:'CHIẾN THUẬT',
  detail:'CHI TIẾT'
 }
 )[lvl]+' · '+(painter.camera.tile/16).toFixed(1)+'×';
 $('#overview').classList.toggle('active',
 lvl==='overview');
 $('#tactical').classList.toggle('active',
 lvl==='tactical');
 $('#detail').classList.toggle('active',
 lvl==='detail');
 $("#rail-count").textContent=game.rooms(painter.floor).length+"/10";
 const rooms=game.rooms(painter.floor),
 signature=JSON.stringify([painter.floor,
 selection,
 rooms.map(r=>[r.id,
 r.sealed,
 r.owner,
 r.level])]);
 if(signature!==lastRooms){
  lastRooms=signature;
  $('#room-count').textContent=rooms.length+'/10';
  $('#room-list').innerHTML=rooms.map(r=>
  `<button class="room-button ${
selection===r.id?'active':''
} ${
r.sealed?'sealed':''
} ${
r.owner!=='dungeon'?'enemy':''
}" data-room="${
r.id
}" title="${
ROOMS[r.type].name
} · ${
r.w-2
}×${
r.h-2
} ô">${roomIcon(r.type,ROOMS[r.type].icon)}<span>${
ROOMS[r.type].name
}</span><i class="room-status"></i></button>`
  ).join('');
  $$('[data-room]').forEach(b=>b.onclick=()=>{
   select(b.dataset.room);
   painter.focus(s.rooms.find(r=>r.id===b.dataset.room))
  }
  )
 }
 if(s.logs[0]?.message!==lastLog){
  lastLog=s.logs[0]?.message;
  $('#logs').innerHTML=s.logs.slice(0,
  12).map(l=>`<div class="log ${
l.type
}"><small>${
String(Math.floor(l.time/60)).padStart(2,
'0')
}:${
String(l.time%60).padStart(2,
'0')
}</small>${
esc(l.message)
}</div>`).join('')
 }
 const boss=s.entities.find(e=>e.boss&&e.floorId===painter.floor&&e.status==='active'&&s.phase==='battle'&&painter.camera.x>e.x-20);
 $('#boss-bar').hidden=!boss;
 if(boss)$('#boss-bar').innerHTML=
 `<div><span>${
boss.name
} · Giai đoạn ${
boss.bossStage+1
}</span><span>${
Math.ceil(boss.hp)
} / ${
boss.maxHp
}</span></div><i><b style="width:${
boss.hp/boss.maxHp*100
}%"></b></i>`
 ;
 renderCards();
 renderInspector();
 if(s.phase==='prepare'&&!$('#modal').open&&game.pendingFloorBosses().length)showFloorBosses();
 if(s.phase!==lastPhase){
  lastPhase=s.phase;
  if(s.phase!=='prepare')clearCard();
  save()
 }
 if(s.result&&lastResult!==s.result){
  lastResult=s.result;
  showResult()
 }
}
$('#start').onclick=()=>{
 if(game.state.result){
  showResult();
  return
 }
 const result=game.start();
 if(!result.ok)toast(result.message);
 else{
  clearCard();
  save();
  update()
 }
}
;
$('#pause').onclick=()=>{
 if(['result',
 'gameover'].includes(game.state.phase))
 return;
 game.state.paused=!game.state.paused;
 save();
 update()
}
;
$$('[data-speed]').forEach(b=>b.onclick=()=>{
 game.state.speed=Number(b.dataset.speed);
 update()
}
);
$('#overview').onclick=()=>painter.fit();
$('#tactical').onclick=()=>painter.setScale(16);
$('#detail').onclick=()=>painter.setScale(32);
$('#zoom-in').onclick=()=>painter.zoom(1.2);
$('#zoom-out').onclick=()=>painter.zoom(1/1.2);
$('#grid').onclick=()=>{
 painter.gridVisible=!painter.gridVisible;
 $('#grid').classList.toggle('active',
 painter.gridVisible)
}
;
$('#fog').onchange=()=>{
 setFogMode($('#fog').value);
 if(painter.fogMode==='selected'&&!game.entity(selection))toast('Chọn một nhân vật để xem tầm nhìn và sương mù của họ.')
}
;
$('#fog-toggle').onclick=()=>{const open=$('#fog-options').hidden;$('#fog-options').hidden=!open;
 $('#fog-toggle').setAttribute('aria-expanded',String(open))};
for(const button of $$('[data-fog]'))button.onclick=()=>{
 setFogMode(button.dataset.fog);$('#fog-options').hidden=true;$('#fog-toggle').setAttribute('aria-expanded','false');
 $('#fog-toggle').textContent=button.dataset.fog==='all'?'Toàn cảnh':'Góc nhìn nhân vật';
};
$('#inspector-toggle').onclick=()=>{const open=document.body.classList.toggle('inspector-open');
 $('#inspector-toggle').setAttribute('aria-expanded',String(open))};
$('#minimap-toggle').onclick=()=>{const closed=$('.minimap-box').classList.toggle('collapsed');
 $('#minimap-toggle').textContent=closed?'+':'−';$('#minimap-toggle').setAttribute('aria-expanded',String(!closed))};
$('#audio').onclick=async()=>{
 const enabled=await sound.toggle();
 $('#audio').innerHTML=icon('hud',enabled?'audio_on':'audio_off','♪')+
  (enabled?' <span>Âm thanh bật</span>':' <span>Bật âm thanh</span>');
 $('#audio').setAttribute('aria-pressed',
 String(enabled))
}
;
$('#save').onclick=()=>save(false);
$('#menu').onclick=showMenu;
$('#reset').onclick=confirmReset;
$('#help').onclick=help;
$('#world').onclick=showWorld;
$('#layout').onclick=showLayout;
$('#catalog').onclick=catalog;
$('#residents').onclick=roster;
$('#guild').onclick=showGuild;
$('#credits').onclick=()=>modal(
'<span class="eyebrow">NGUỒN NỘI DUNG & GIẤY PHÉP</span><h2>Pixel fantasy, cùng một thế giới.</h2><p>Sprite/gạch: <a href="https://0x72.itch.io/dungeo\
ntileset-ii" target="_blank" rel="noreferrer">0x72 DungeonTileset II</a>, CC0. Thùng có dấu hiệu riêng được vẽ bằng các cụm pixel cùng bảng màu trong \
renderer.</p><p>10 hiệu ứng âm thanh CC0 từ <a href="https://kenney.nl/assets/rpg-audio" target="_blank" rel="noreferrer">Kenney RPG Audio</a> và <a h\
ref="https://kenney.nl/assets/digital-audio" target="_blank" rel="noreferrer">Digital Audio</a>. Âm lượng và số tiếng đồng thời bị giới hạn khi tăng t\
ốc. Chưa có nhạc nền.</p><p>Catalog được tham khảo qua ChatGPT web và triển khai local; game không gọi AI runtime. Không cần Gemini cho các asset hiện\
 tại vì bộ CC0 có sẵn đủ sprite.</p>'
,
'credits');
function clickMap(event){
 const p=painter.hit(event.clientX,
 event.clientY),
 s=game.state;
 const entity=s.entities.filter(e=>e.floorId===painter.floor&&!['escaped',
 'surrendered'].includes(e.status)&&distance(e,
 p)<(e.boss?1.6:1)).sort((a,
 b)=>distance(a,
 p)-distance(b,
 p))[0];
 if(placingKey){
  const result=game.placeKey(p.x,
  p.y,
  p.floorId,
  entity?.faction==='monster'?entity.id:null);
  if(result.ok){
   placingKey=false;
   $('#cancel').hidden=true;
   save();
   update();
   toast('Đã đặt chìa khóa.')
  }
  else toast(result.message);
  return
 }
 if(relocating){
  if(game.relocate(relocating,
  p.x,
  p.y,
  p.floorId)){
   toast('Đã phân công lại phòng. Cư dân sẽ giữ phòng này khi chiến đấu.');
   relocating=null;
   save();
   update()
  }
  else toast('Chọn nền phòng trống, không pause; boss giữ phòng cố định.');
  return
 }
 if(chosen){
  const result=game.playCard(chosen.uid,
  p.x,
  p.y,
  p.floorId,
  entity?.id);
  if(result.ok){
   if(result.entity)select(result.entity.id);
   toast('Đã sử dụng thẻ.');
   clearCard();
   save();
   update()
  }
  else toast(result.message||'Không thể dùng ở vị trí này.');
  return
 }
 if(entity){
  select(entity.id);
  return
 }
 const prop=s.props.find(o=>o.floorId===p.floorId&&!o.destroyed&&distance(o,
 p)<.7);
 if(prop){
  select(prop.id);
  return
 }
 const trap=s.traps.find(o=>o.floorId===p.floorId&&distance(o,
 p)<.6);
 if(trap){
  select(trap.id);
  return
 }
 const room=game.roomAt(p.x,
 p.y,
 p.floorId);
 if(room)select(room.id)
}
let drag=null;
const canvas=$('#game');
canvas.addEventListener('contextmenu',
e=>e.preventDefault());
canvas.addEventListener('pointerdown',
e=>{
 drag={
  x:e.clientX,
  y:e.clientY,
  startX:e.clientX,
  startY:e.clientY,
  button:e.button,
  moved:false
 }
 ;
 canvas.setPointerCapture(e.pointerId)
}
);
canvas.addEventListener('pointermove',
e=>{
 painter.hover=painter.hit(e.clientX,
 e.clientY);
 if(drag&&(drag.button===2||Math.hypot(e.clientX-drag.startX,
 e.clientY-drag.startY)>5)){
  painter.camera.x-=(e.clientX-drag.x)/painter.camera.tile;
  painter.camera.y-=(e.clientY-drag.y)/painter.camera.tile;
  drag.moved=true;
  drag.x=e.clientX;
  drag.y=e.clientY
 }
}
);
canvas.addEventListener('pointerup',
e=>{
 if(drag?.button===0&&!drag.moved)clickMap(e);
 drag=null
}
);
canvas.addEventListener('pointercancel',
()=>drag=null);
canvas.addEventListener('dblclick',
e=>{
 if(chosen)
 return;
 const p=painter.hit(e.clientX,
 e.clientY),
 r=game.roomAt(p.x,
 p.y,
 p.floorId);
 if(r)painter.focus(r,
 true)
}
);
canvas.addEventListener('wheel',
e=>{
 e.preventDefault();
 painter.zoom(e.deltaY<0?1.1:1/1.1,
 e.clientX,
 e.clientY)
}
,
{
 passive:false
}
);
$('#minimap').addEventListener('pointerdown',
e=>painter.miniHit(e.clientX,
e.clientY));
window.addEventListener('keydown',
e=>{
 if(modalMode==='floor-boss'){
  if(['ArrowLeft','ArrowRight','Enter','r','R','Escape'].includes(e.key))e.preventDefault();
  const cards=$$('.floor-boss-card'),current=Math.max(0,cards.findIndex(c=>c.classList.contains('focused')));
  if(['ArrowLeft','ArrowRight'].includes(e.key)){const next=(current+(e.key==='ArrowRight'?1:2))%3;
   cards.forEach((c,i)=>c.classList.toggle('focused',i===next));cards[next].querySelector('[data-boss-choice]').focus()}
  if(e.key==='Enter')cards[current].querySelector('[data-boss-choice]').click();
  if(e.key.toLowerCase()==='r')$('#reroll-floor-boss').click();if(e.key==='Escape')showMenu();return;
 }
 if(e.key==='Escape'&&!$('#modal').open&&!chosen&&!relocating&&!placingKey){
  e.preventDefault();
  showMenu();
  return
 }
 if($('#modal').open||['INPUT',
 'TEXTAREA',
 'SELECT'].includes(document.activeElement?.tagName))
 return;
 keys.add(e.key.toLowerCase());
 if(e.repeat)
 return;
 if(e.code==='Space'){
  e.preventDefault();
  $('#pause').click()
 }
 if(e.key==='Escape')clearCard();
 if(e.key.toLowerCase()==='g')$('#grid').click();
 if(e.key==='1')painter.fit();
 if(e.key==='2')painter.setScale(16);
 if(e.key==='3')painter.setScale(32)
}
);
window.addEventListener('keyup',
e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',
()=>keys.clear());
window.addEventListener('beforeunload',
()=>save());
game.on(update);
update();
if(reviewScene==='inspector'){const boss=game.state.entities.find(e=>e.boss);if(boss)select(boss.id,true)}
if(reviewScene==='battle')requestAnimationFrame(()=>{painter.focus(game.state.rooms.find(r=>r.type==='boss'),true);update()});
if(reviewScene){const qa=document.createElement('button');qa.textContent='QA: kiểm tra UI';qa.dataset.qa='true';
 qa.id='audit-ui';qa.style.cssText='position:fixed;bottom:0;right:0;z-index:99';
 const output=document.createElement('pre');output.id='ui-audit-report';output.hidden=true;output.dataset.qa='true';
 qa.onclick=()=>output.textContent=JSON.stringify(auditUI());
 document.addEventListener('keydown',e=>{if(e.key==='F9'){e.preventDefault();qa.click()}});document.body.append(qa,output)}
requestAnimationFrame(()=>{if(game.entity(selection))select(selection,true);
 else painter.focus(game.state.rooms.find(r=>r.id===selection)||game.rooms(0)[0])});
let previous=performance.now(),
accumulator=0,
ui=0,
autosave=0;
function frame(now){
 const dt=Math.min(.15,
 (now-previous)/1000);
 previous=now;
 const suspended=document.hidden||$('#modal').open&&modalMode!=='floor-boss';
 if(!suspended){
  accumulator+=dt*game.state.speed;
  let steps=0;
  while(accumulator>=1/30&&steps++<24){
   game.tick(1/30);
   accumulator-=1/30
  }
  if(steps>=24)accumulator=0;
  const step=dt*500/painter.camera.tile;
  if(keys.has('a')||keys.has('arrowleft'))painter.camera.x-=step;
  if(keys.has('d')||keys.has('arrowright'))painter.camera.x+=step;
  if(keys.has('w')||keys.has('arrowup'))painter.camera.y-=step;
  if(keys.has('s')||keys.has('arrowdown'))painter.camera.y+=step
 }
 else accumulator=0;
 painter.draw(dt);
 sound.consume(game.events.splice(0),
 painter.floor);
 ui+=dt;
 autosave+=dt;
 if(ui>.35){
  ui=0;
  update()
 }
 if(autosave>15){
  autosave=0;
  save()
 }
 requestAnimationFrame(frame)
}
requestAnimationFrame(frame);
if(loadedOld)toast('Đã giữ bản lưu v0.1 gốc và chuyển tiến trình sang bản đồ mới.');
function confirmReset(){
 modal(
 `<span class="eyebrow">RESET RUN</span><h2>Thiết kế lại từ đầu?</h2><p>Reset thay tiến trình hiện tại bằng một hầm ngục trống. Bạn sẽ tự đặt lại các p\
hòng, cư dân và chìa khóa.</p><div class="menu-actions"><button id="confirm-reset" class="primary">↻ Reset · Run mới</button><button id="cancel-reset"\
>Giữ run hiện tại</button></div>`
 ,
 'reset');
 $('#confirm-reset').onclick=()=>{
  reset();
  closeModal();
  toast('Run mới: chọn thẻ Cổng hầm ngục để bắt đầu.')
 }
 ;
 $('#cancel-reset').onclick=showMenu
}
function showMenu(){
 modal(
 `<div class="game-menu"><span class="eyebrow">YOUR DUNGEON?</span><h2>Menu hầm ngục</h2><p>Mô phỏng tạm dừng khi mở menu.</p><div class="menu-grid"><b\
utton id="menu-resume" class="primary">▶ Tiếp tục</button><button id="menu-save">${icon('hud','save','↓')} Lưu tiến trình</button><button id="menu-layout">${icon('hud','layout','▦')} Bản thiết kế</but\
ton><button id="menu-roster">♟ Cư dân / Tuyển quái</button><button id="menu-packs">▣ Gói bài</button><button id="menu-catalog">${icon('hud','catalog','✦')} Vũ khí & Bách khoa</b\
utton><button id="menu-world">${icon('hud','world','⚑')} Tình hình bên ngoài</button><button id="menu-help">${icon('hud','help','?')} Hướng dẫn</button><button id="menu-audio">♪ ${
sound.enabled?'Tắt':'Bật'
} âm thanh</button><button id="menu-reset" class="reset-menu">${icon('hud','reset','↻')} Reset run</button></div><small>Esc đóng menu · Space tạm dừng ngoài bản đồ</small></di\
v>`
 ,
 'menu');
 $('#menu-resume').onclick=closeModal;
 $('#menu-save').onclick=()=>save(false);
 $('#menu-layout').onclick=showLayout;
 $('#menu-roster').onclick=roster;
 $('#menu-packs').onclick=showPacks;
 $('#menu-catalog').onclick=catalog;
 $('#menu-world').onclick=showWorld;
 $('#menu-help').onclick=help;
 $('#menu-reset').onclick=confirmReset;
 $('#menu-audio').onclick=async()=>{
  $('#audio').click();
  closeModal()
 }
 const settings=loadPresentationSettings(),section=document.createElement('div');section.className='presentation-settings';
 section.innerHTML='<h3>Cảm giác đòn đánh</h3>'+Object.entries({shake:'Rung màn hình',numbers:'Số sát thương',hitstop:'Hit-stop'}).map(([id,label])=>
  `<button data-fx-setting="${id}" aria-pressed="${settings[id]}">${label}: ${settings[id]?'Bật':'Tắt'}</button>`).join('');
 $('#modal-content').append(section);for(const b of $$('[data-fx-setting]'))b.onclick=()=>{
  const key=b.dataset.fxSetting;settings[key]=!settings[key];savePresentationSettings(settings);painter.presentationSettings=loadPresentationSettings();
  b.setAttribute('aria-pressed',String(painter.presentationSettings[key]));b.textContent=b.textContent.split(':')[0]+': '+(painter.presentationSettings[key]?'Bật':'Tắt');
 };
}

function hearts(e){
 const ratio=Math.max(0,Math.min(1,e.hp/e.maxHp));
 const images=Array.from({length:5},(_,i)=>{
  const fill=ratio*5-i,frame=fill>=1?'full':fill>0?'half':'empty';
  return `<img src="assets/frames/ui_heart_${frame}.png" alt="">`;
 }).join('');
 return `<div class="health-hearts" aria-label="Sinh lực ${Math.round(ratio*100)}%">${images}</div>`;
}

function showFloorBosses(floorId=game.pendingFloorBosses()[0]){
 if(floorId===undefined||!game.floorBossRoom(floorId))return;
 const record=game.state.floorBoss[floorId];
 if(record?.id){toast('Tầng này đã có '+BOSS_POOL[record.id].name);return}
 const offers=game.floorBossOffers(floorId);
 modal(bossPickerHTML(game,floorId), 'floor-boss');

 for(const button of $$('[data-boss-choice]'))button.onclick=()=>{
  const e=game.hireFloorBoss(floorId,button.dataset.bossChoice);
  if(!e){toast('Chưa đủ vàng hoặc phòng không còn 4 ô quân.');return}
  modalMode=null;closeModal();save();update();
 };
 for(const button of $$('[data-boss-skill]'))button.onclick=()=>{
  const [boss,id]=button.dataset.bossSkill.split(':'),skill=BOSS_POOL[boss].skills.find(k=>k.id===id),box=button.closest('article').querySelector('.boss-skill-detail');
  box.textContent=bossSkillText(skill);box.hidden=!box.hidden;
 };
 $('#reroll-floor-boss').onclick=()=>{if(game.rerollFloorBosses(floorId)){save();showFloorBosses(floorId)}};
 for(const button of $$('[data-biome]'))button.onclick=()=>{const r=game.setFloorBiome(floorId,button.dataset.biome);if(!r.ok){toast(r.message);return}save();update();showFloorBosses(floorId)};
 $('#boss-menu').onclick=showMenu;
}
