// Inspector parts for the v0.9 RPG layer: elements (strong/weak), blood caster, room-master aura + upgrade paths,
// and what the Guild has learned. Pure HTML builders; all text short enough for the pixel HUD (CODEX_07 rules).
import {ELEMENTS,MASTER_AURA,MASTER_PATHS,COUNTERS} from './rpg-data.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chip=([el,m],cls)=>`<span class="el-chip ${cls}" style="--el:${ELEMENTS[el].color}" title="${esc(ELEMENTS[el].name)} ×${m.toFixed(2)}">${esc(ELEMENTS[el].name)}</span>`;

export function rpgInspector(game,e){
 const {strong,weak}=game.affinityList(e),parts=[];
 parts.push(`<div class="part rpg-elements"><div class="part-title">ĐIỂM MẠNH · ĐIỂM YẾU</div>
  <div class="el-row"><span>Kháng</span>${strong.length?strong.map(x=>chip(x,'strong')).join(''):'<i>—</i>'}</div>
  <div class="el-row"><span>Yếu</span>${weak.length?weak.map(x=>chip(x,'weak')).join(''):'<i>—</i>'}</div>
  ${game.bloodRate(e)?'<p class="rpg-note">Dùng máu thay mana để thi triển kỹ năng.</p>':''}
  ${e.veteran?'<p class="rpg-note">Kẻ Sống Sót: quay lại mạnh hơn.</p>':''}</div>`);
 if(e.faction==='monster'&&e.isCommander){
  const info=game.masterInfo(e),reach=[...game.roomNeighbors(game.state.rooms.find(r=>r.commanderId===e.id)||{id:null},info.depth).keys()].length;
  parts.push(`<div class="part rpg-master"><div class="part-title">CHỦ PHÒNG · HÀO QUANG</div>
   <p>${info.auras.map(a=>`<b>${MASTER_AURA[a].icon} ${esc(MASTER_AURA[a].name)}</b>`).join(' · ')}</p>
   <div class="info-row"><span>Hiệu lực / phạm vi</span><b>×${info.strength.toFixed(1)} · ${reach} phòng</b></div>
   ${info.picks&&game.canPrepare?.()?`<p class="rpg-note">Tiến hóa hào quang: còn ${info.picks} lựa chọn</p><div class="master-paths">${
    Object.entries(MASTER_PATHS).map(([id,p])=>`<button data-master-path="${id}" title="${esc(p.description)}">${esc(p.name)}</button>`).join('')}</div>`
    :info.picks?`<p class="rpg-note">Còn ${info.picks} lựa chọn tiến hóa (chọn khi chuẩn bị).</p>`:'<p class="rpg-note">Lên cấp để tiến hóa hào quang.</p>'}
  </div>`);
 }
 if(e.faction==='hero'&&!e.ownerId)parts.unshift(squadHTML(game,e));
 return parts.join('');
}

const ROLE={tank:'Hộ vệ',ranged:'Tầm xa',support:'Hỗ trợ',scout:'Trinh sát',skirmisher:'Xung kích',ambusher:'Phục kích'};
export function squadHTML(game,e){
 const q=game.squadInfo?.(e);if(!q)return '';
 return `<div class="part squad-panel"><div class="part-title">TỔ ĐỘI · ${q.members.length} NGƯỜI</div>
  <p class="rpg-note">${esc(q.mode)}</p>${q.members.map(a=>`<div class="squad-row ${a.id===e.id?'me':''}" data-select="${a.id}">
   <span title="${esc(a.name)}">${a.id===q.leaderId?'★ ':''}${esc(a.name)}</span><small>${esc(ROLE[a.role]||a.role||'')}</small>
   <i><b style="width:${Math.round(100*Math.max(0,a.hp)/a.maxHp)}%"></b></i></div>`).join('')}</div>`;
}
export function guildLessonsHTML(game){
 const lore=game.state.guildLore;if(!lore?.lessons?.length)return '';
 return `<div class="part"><div class="part-title">CÔNG HỘI ĐÃ HỌC</div>${lore.lessons.slice(0,3).map(l=>
  `<p class="rpg-note">Đợt ${l.wave}: ${esc(COUNTERS[l.lesson]?.name||l.lesson)}</p>`).join('')}</div>`;
}
