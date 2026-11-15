export const safeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function equipControl(game,e,item){
 const reason=game.equipIssue(e,item),disabled=reason||!game.canPrepare();
 return `<button data-equip="${safeText(item.id)}" ${disabled?'disabled':''} title="${safeText(reason||'Trang bị')}">Trang bị</button>`+
  (reason?`<small class="equip-reason">${safeText(reason)}</small>`:'');
}
export function weaponSummary(game,e){
 const w=game.weaponDefinition(e),shield=game.offhandDefinition(e),p=w?game.proficiency(e,w.family):0;
 return `<div class="weapon-summary"><b>Vũ khí · Trí khôn ${game.brain(e)}</b><p>${safeText(w?.name||'Tay không')} · `+
  `${safeText(w?.family||'không')} · Thông thạo ${p}/3 · Hệ số ×${game.weaponFactor(e).toFixed(2)}</p>`+
  `<p>Kỹ thuật: ${safeText(game.weaponTechnique(e)?.name||'Chưa đủ điều kiện')} · Tay phụ: ${safeText(shield?.name||'Trống')}</p></div>`;
}
