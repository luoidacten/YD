// Difficulty picker (pixel HUD): presets + custom sliders. Pure HTML builder + a small binder.
import {DIFFICULTY_PRESETS,DIFFICULTY_FIELDS} from './difficulty.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(k,v)=>DIFFICULTY_FIELDS[k].unit==='×'?`×${Number(v).toFixed(2)}`:String(Math.round(v));

export function difficultyHTML(game){
 const d=game.difficulty(),fresh=game.freshRun();
 return `<div class="difficulty"><span class="eyebrow">ĐỘ KHÓ</span><h2>Chọn độ khó cho run này</h2>
 <p class="mg-muted">${fresh?'Vàng và mana khởi đầu áp dụng ngay.':'Áp dụng từ đợt sau; vàng/mana khởi đầu chỉ dùng cho run mới.'}</p>
 <div class="diff-presets">${Object.entries(DIFFICULTY_PRESETS).map(([id,p])=>
  `<button data-diff-preset="${id}" class="${d.preset===id?'active':''}"><b>${esc(p.name)}</b><small>${esc(p.text)}</small></button>`).join('')}
  <button data-diff-preset="custom" class="${d.preset==='custom'?'active':''}"><b>Tùy chỉnh</b><small>Tự chỉnh từng thông số bên dưới.</small></button></div>
 <div class="diff-fields">${Object.entries(DIFFICULTY_FIELDS).map(([k,f])=>`<label class="diff-field"><span>${esc(f.name)}</span>
  <input type="range" data-diff-field="${k}" min="${f.min}" max="${f.max}" step="${f.step}" value="${d[k]}">
  <b data-diff-value="${k}">${fmt(k,d[k])}</b></label>`).join('')}</div>
 <div class="result-actions"><button class="primary" data-diff-apply>Áp dụng</button><button class="secondary" data-diff-close>Đóng</button></div></div>`;
}

export function bindDifficulty(root,game,{onDone,toast}){
 let preset=game.difficulty().preset;
 const values=()=>Object.fromEntries([...root.querySelectorAll('[data-diff-field]')].map(i=>[i.dataset.diffField,Number(i.value)]));
 const mark=()=>root.querySelectorAll('[data-diff-preset]').forEach(b=>b.classList.toggle('active',b.dataset.diffPreset===preset));
 root.querySelectorAll('[data-diff-preset]').forEach(b=>b.onclick=()=>{
  preset=b.dataset.diffPreset;mark();
  if(preset!=='custom'){const p=DIFFICULTY_PRESETS[preset];
   for(const i of root.querySelectorAll('[data-diff-field]')){i.value=p[i.dataset.diffField];
    root.querySelector(`[data-diff-value="${i.dataset.diffField}"]`).textContent=fmt(i.dataset.diffField,p[i.dataset.diffField])}}
 });
 root.querySelectorAll('[data-diff-field]').forEach(i=>i.oninput=()=>{
  preset='custom';mark();root.querySelector(`[data-diff-value="${i.dataset.diffField}"]`).textContent=fmt(i.dataset.diffField,i.value);
 });
 root.querySelector('[data-diff-apply]').onclick=()=>{const r=game.setDifficulty(preset,preset==='custom'?values():null);
  toast(r.ok?'Đã đặt độ khó.':r.message);if(r.ok)onDone(true)};
 root.querySelector('[data-diff-close]').onclick=()=>onDone(false);
}
