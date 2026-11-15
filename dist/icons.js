let manifest={};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function setIconManifest(value){manifest=value||{}}
export function iconAsset(group,id){return manifest[group]?.[id]||null}
export async function loadIcons({disabled=false}={}){
 manifest={};if(disabled)return manifest;
 try{
  const response=await fetch('assets/ui/manifest.json');if(!response.ok)return manifest;
  const parsed=await response.json();
  for(const[group,entries]of Object.entries(parsed))for(const[id,entry]of Object.entries(entries)){
   if(entry.src!==`assets/ui/${group}/${id}.png`||!['hud','status','room','card'].includes(group))continue;
   (manifest[group]??={})[id]=entry;
  }
 }catch{/* Empty or unfinished director assets keep the existing glyphs. */}
 return manifest;
}
export function icon(group,id,fallbackText){
 const asset=iconAsset(group,id);
 return asset?`<img class="px-icon" src="${escape(asset.src)}" width="16" height="16" alt="" aria-hidden="true">`:
  `<span class="px-icon-fallback">${escape(fallbackText)}</span>`;
}
export function roomIcon(id,fallbackSprite){
 return iconAsset('room',id)?icon('room',id,''):
  `<img src="assets/frames/${escape(fallbackSprite)}.png" alt="">`;
}
export function cardFrame(tone){
 const asset=iconAsset('card','frame_'+tone);
 return asset?` style="border-image: url('${escape(asset.src)}') 6 / 6px / 0 stretch;"`:'';
}
export function hydrateIcons(root=document){
 for(const node of root.querySelectorAll('[data-px-id]')){
  const group=node.dataset.pxGroup||'hud',id=node.dataset.pxId;
  node.innerHTML=node.dataset.pxSprite&&!iconAsset(group,id)?
   `<img src="assets/frames/${escape(node.dataset.pxSprite)}.png" alt="${escape(node.dataset.pxAlt)}">`:
   icon(group,id,node.dataset.pxFallback||'');
 }
}
