import {ART_SIZE} from './art-metadata.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STYLES={juggernaut:'Áp sát · chịu đòn',zoner:'Kiểm soát vùng',summoner:'Triệu hồi · giữ xa',ambusher:'Ẩn nấp · vồ mồi',
 controller:'Khống chế · giữ xa',commander:'Chỉ huy đội hình',duelist:'Đấu tay đôi','warlord-summoner':'Chỉ huy quân xương'};
const kit=name=>'assets/ui/kit/'+name+'.png';
export function bossSkillText(k){return `${k.name} · ${k.damage||0} sát thương · bán kính ${k.radius||0} · tầm ${k.range} · CD ${k.cd}s · báo trước ${k.windup}s`}
export function bossPickerHTML(game,floorId){
 const record=game.state.floorBoss[floorId],offers=game.floorBossOffers(floorId),home=game.biomeRules?.(floorId)?.homeBosses||[];
 return `<h2 class="boss-pick-title">CHỌN TẦNG CHỦ · TẦNG ${floorId+1}</h2>
 <p class="boss-pick-sub">Boss canh tầng và ban Ấn cho mọi phòng. ← → chọn thẻ · Enter xác nhận · R đổi bộ</p>
 <div class="floor-boss-grid">${offers.map((d,index)=>{
  const size=ART_SIZE[d.sprite+'_idle_anim_f0']||[32,32],cost=game.floorBossCost(floorId,d.id);
  return `<article class="floor-boss-card ${index===0?'focused':''}" data-boss-index="${index}">
   <div class="boss-portrait">${Array.from({length:4},(_,f)=>`<img class="boss-idle boss-idle-${f}" src="assets/frames/${d.sprite}_idle_anim_f${f}.png"
    style="width:${size[0]*2}px;height:${size[1]*2}px" alt="${f===0?esc(d.name):''}">`).join('')}</div>
   <h3 title="${esc(d.name)}">${esc(d.name)}</h3><p class="boss-style" title="${esc(STYLES[d.style])}">${esc(STYLES[d.style])}</p>
   <div class="boss-moves">${d.skills.map(k=>{const kind={eggs:'summon',resurrect:'summon',zone:'circle',charge:'line'}[k.kind]||k.kind;
    return `<button class="boss-skill" data-boss-skill="${d.id}:${k.id}" title="${esc(bossSkillText(k))}">
     <img src="${kit('skill_'+kind)}" alt=""><span>${esc(k.name)}</span><small>${k.phase?'GĐ'+(k.phase+1):''}</small></button>`}).join('')}</div>
   <div class="boss-seals">${d.seals.map(x=>`<p title="${esc(x.name+': '+x.description)}"><img src="${kit('seal')}" alt=""><span>${esc(x.description)}</span></p>`).join('')}
    ${home.includes(d.id)?'<b class="home-tag">ĐẤT NHÀ · Ấn +10%</b>':''}</div>
   <button class="primary" data-boss-choice="${d.id}" ${game.state.gold<cost?'disabled':''}
    title="${game.state.gold<cost?'Thiếu '+(cost-game.state.gold)+' vàng':'Chọn '+esc(d.name)}">CHỌN · ${cost}</button>
   <div class="boss-skill-detail" role="tooltip" hidden></div></article>`;
 }).join('')}</div><div class="actions boss-pick-actions"><button id="reroll-floor-boss" ${record.rerolled||game.state.gold<50?'disabled':''}>
 ${record.rerolled?'ĐÃ ĐỔI BỘ':'ĐỔI BỘ · 50 VÀNG (1 lần)'}</button><button id="boss-menu">Menu · Esc</button></div>`;
}
