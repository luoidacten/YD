// v0.10 management screens (pixel HUD, CODEX_07 overflow rules): one hub with 4 tabs + the result add-on.
import {SPECIES} from './data.js';
import {RESEARCH,EVENTS} from './management.js';
import {COUNTERS} from './rpg-data.js';
import {WIDTH,HEIGHT} from './data.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NAMES={knight:'Hiệp sĩ',rogue:'Đạo tặc',mage:'Pháp sư',priest:'Tu sĩ'};
export const TABS=[['report','Báo cáo Công hội'],['summary','Tổng kết'],['legion','Quân đoàn'],['research','Sách Hắc Thuật']];

function eventLine(n){
 if(!n||!(n.monsterPower||n.partyDelta))return '';
 const power=n.monsterPower?'quái +'+Math.round(n.monsterPower*100)+'% ':'',party=n.partyDelta?'đoàn '+n.partyDelta+' hero':'';
 return `<p>Sự kiện: ${power}${party}</p>`;
}
function reportTab(g){
 const r=g.guildReport();
 return `<div class="mg-grid"><div class="mg-card"><b>Đợt ${r.wave} · ${r.count} mạo hiểm giả</b>
  <p class="mg-muted">Đội hình dự kiến (class gốc, Công hội có thể đổi sang class khắc chế):</p>
  <div class="mg-chips">${r.classes.map(c=>`<span class="mg-chip">${esc(NAMES[c]||c)}</span>`).join('')}</div></div>
  <div class="mg-card"><b>Công hội đã học</b>${r.lesson?`<p>${esc(r.lesson.name)} · mang ${esc(r.lesson.item||'chiến thuật khắc chế')}</p>
   <p class="mg-muted">Ưu tiên: ${esc((r.lesson.classes||[]).map(id=>SPECIES[id]?.name||id).join(', '))}</p>`:'<p class="mg-muted">Chưa rút ra bài học nào.</p>'}
   ${r.veterans?`<p>${r.veterans} Kẻ Sống Sót đang chờ báo thù.</p>`:''}</div>
  <div class="mg-card"><b>Tai tiếng ${Math.round(r.infamy)}/100</b><div class="mg-bar"><i style="width:${r.infamy}%"></i></div>
   <p class="mg-muted">Hero +${r.levelBonus} cấp · vàng thưởng +${Math.round(r.infamy/2)}%</p></div>
  <div class="mg-card"><b>Phí duy trì: ${r.upkeep} mana</b><p class="mg-muted">Trừ sau đợt. Thiếu mana thì quái yếu nhất bỏ đi.</p>
   ${eventLine(r.nextWave)}</div>
  ${r.spy?`<div class="mg-card mg-wide"><b>Gián điệp báo cáo</b>${r.scores.length?r.scores.map(([k,v])=>
   `<div class="mg-row"><span>${esc(COUNTERS[k]?.name||k)}</span><b>${v.toFixed(1)}</b></div>`).join('')
   :'<p class="mg-muted">Công hội chưa ghi nhận gì.</p>'}</div>`
   :'<p class="mg-muted mg-wide">Xây Phòng Gián Điệp để biết chi tiết Công hội đang tính gì.</p>'}</div>`;
}

function summaryTab(g){
 const l=g.mgmt().last;
 if(!l)return '<p class="mg-muted">Chưa có đợt nào kết thúc.</p>';
 return `<div class="mg-grid"><div class="mg-card"><b>Đợt ${l.wave}</b>
   <div class="mg-row"><span>Hero gục</span><b>${l.heroesDown}</b></div><div class="mg-row"><span>Hero thoát</span><b>${l.escaped}</b></div>
   <div class="mg-row"><span>Sát thương bẫy</span><b>${l.trapDamage}</b></div>
   <div class="mg-row"><span>Thưởng tai tiếng</span><b>+${l.infamyBonus} vàng</b></div>
   <div class="mg-row"><span>Duy trì</span><b>−${l.upkeep?.cost||0} mana</b></div>
   ${l.upkeep?.leaving?.length?`<p class="mg-warn">Bỏ đi: ${esc(l.upkeep.leaving.join(', '))}</p>`:''}</div>
  <div class="mg-card"><b>MVP</b>${l.mvp?`<p>${esc(l.mvp.name)}</p><p class="mg-muted">${l.mvp.damage} sát thương · ${l.mvp.kills} lần hạ</p>`:'<p class="mg-muted">—</p>'}
   <b>Phòng hiệu quả</b>${l.topRooms.length?l.topRooms.map(r=>`<div class="mg-row"><span>${esc(r.name)} · T${r.floorId+1}</span><b>${r.damage}</b></div>`).join(''):'<p class="mg-muted">—</p>'}</div>
  <div class="mg-card mg-wide"><b>Bản đồ nhiệt đường đi của hero</b><div class="mg-heat">
   <canvas id="heat-0" width="${WIDTH}" height="${HEIGHT}"></canvas><canvas id="heat-1" width="${WIDTH}" height="${HEIGHT}"></canvas></div>
   <p class="mg-muted">Tầng 1 · Tầng 2. Càng sáng: hero đi qua càng nhiều.</p></div></div>`;
}

function legionTab(g){
 const list=g.state.entities.filter(e=>e.faction==='monster'&&e.status!=='dead').sort((a,b)=>(a.floorId-b.floorId)||String(a.roomId).localeCompare(String(b.roomId))||a.id.localeCompare(b.id));
 return `<p class="mg-muted">Mệt mỏi: mỗi đợt tham chiến +1 (tối đa 3, mỗi mức −8% sát thương); đợt nghỉ −1. Hồi sức tốn 10 mana.</p>
 <div class="mg-table">${list.map(e=>`<div class="mg-tr"><span class="mg-name" title="${esc(e.name)}">${e.isCommander?'◆ ':''}${esc(e.name)}</span>
  <span>Lv ${e.level||1}</span><span>${Math.round(e.hp)}/${e.maxHp}</span><span class="${e.fatigue?'mg-warn':''}">Mệt ${e.fatigue||0}/3</span>
  <button data-rest="${e.id}" ${e.fatigue&&g.canPrepare?.()?'':'disabled'}>Hồi sức</button></div>`).join('')||'<p class="mg-muted">Chưa có quái.</p>'}</div>`;
}

function researchTab(g){
 const r=g.mgmt().research;
 return `<p class="mg-muted">Dùng hồn để học. Bậc sau cần bậc trước. Hồn hiện có: <b>${g.state.souls}</b></p><div class="mg-grid mg-tree">${
  Object.entries(RESEARCH).map(([id,b])=>`<div class="mg-card"><b>${esc(b.name)}</b>${b.tiers.map(([n,d],i)=>
   `<div class="mg-tier ${i<r[id]?'done':i===r[id]?'next':'locked'}" title="${esc(d)}"><span>${['I','II','III','IV'][i]}. ${esc(n)}</span><small>${esc(d)}</small></div>`).join('')}
   ${r[id]<4?`<button class="primary" data-research="${id}" ${g.state.souls<g.researchCost(id)?'disabled':''}>Học · ${g.researchCost(id)} hồn</button>`:'<p class="mg-muted">Đã thông thạo.</p>'}</div>`).join('')}</div>`;
}

export function managementHTML(g,tab='report'){
 const body={report:reportTab,summary:summaryTab,legion:legionTab,research:researchTab}[tab]||reportTab;
 return `<div class="management"><span class="eyebrow">QUẢN LÝ HẦM NGỤC</span><div class="mg-tabs">${TABS.map(([id,n])=>
  `<button data-mg-tab="${id}" class="${id===tab?'active':''}">${esc(n)}</button>`).join('')}</div><div class="mg-body">${body(g)}</div></div>`;
}

export function eventsHTML(g){
 const ids=g.mgmt().events;if(!ids?.length)return '';
 return `<div class="mg-events"><b>Sự kiện giữa đợt · chọn 1</b><div class="mg-grid">${ids.map(id=>{const ev=EVENTS[id],ok=!ev.can||ev.can(g);
  return `<button class="mg-event" data-event="${id}" ${ok?'':'disabled'} title="${esc(ev.text)}"><b>${esc(ev.name)}</b><small>${esc(ev.text)}</small></button>`}).join('')}
  </div><button data-event-skip class="secondary">Bỏ qua</button></div>`;
}

export function summaryMini(g){
 const l=g.mgmt().last;if(!l)return '';
 return `<div class="mg-mini"><span>Gục ${l.heroesDown} · Thoát ${l.escaped}</span>${l.mvp?`<span>MVP: ${esc(l.mvp.name)}</span>`:''}
  <span>Duy trì −${l.upkeep?.cost||0} mana</span><button data-open-management="summary">Xem tổng kết</button></div>`;
}

export function drawHeat(g,root){
 const l=g.mgmt().last;if(!l)return;
 for(const f of [0,1]){
  const cv=root.querySelector('#heat-'+f);if(!cv)continue;const c=cv.getContext('2d'),terrain=g.terrain[f];
  c.fillStyle='#100a0e';c.fillRect(0,0,WIDTH,HEIGHT);c.fillStyle='#3b3332';
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)if(terrain?.[y]?.[x])c.fillRect(x,y,1,1);
  const cells=Object.entries(l.heat).filter(([k])=>k.startsWith(f+':')),max=Math.max(1,...cells.map(([,v])=>v));
  const ramp=['#62232f','#9b1a0a','#da4e38','#ee8e2e','#facb3e'];
  for(const[k,v]of cells){const[,x,y]=k.split(':').map(Number);c.fillStyle=ramp[Math.min(4,Math.floor(v/max*4.99))];c.fillRect(x*2,y*2,2,2)}
 }
}
