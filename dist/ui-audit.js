export function auditUI(root=document){
 const surface=root.querySelector('dialog[open]')||root.body;
 const issues=[],textBoxes=[],elements=[surface,...surface.querySelectorAll('*')];
 const label=e=>e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+[...e.classList].join('.');
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);
  if(!r.width||!r.height||s.visibility==='hidden'||s.display==='none'||e.closest('[data-qa]'))return false;
  const details=e.closest('details');if(details&&!details.open&&!e.closest('summary'))return false;
  for(let a=e.parentElement;a;a=a.parentElement){const style=getComputedStyle(a),box=a.getBoundingClientRect();
   if(/auto|scroll|hidden|clip/.test(style.overflow+style.overflowY+style.overflowX)&&
    (r.bottom<box.top||r.top>box.bottom||r.right<box.left||r.left>box.right))return false;
  }return true;
 };
 for(const e of elements){
  if(!visible(e))continue;
  const direct=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());if(!direct.length)continue;
  const style=getComputedStyle(e),text=direct.map(n=>n.textContent.trim()).join(' '),id=label(e);
  if(parseFloat(style.fontSize)<14)issues.push({kind:'small-font',id,text,size:style.fontSize});
  const deliberate=/auto|scroll/.test(style.overflow+style.overflowY+style.overflowX)||
   (style.textOverflow==='ellipsis'||parseInt(style.webkitLineClamp)>0)&&!!e.closest('[title]');
  if(!deliberate&&(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1))
   issues.push({kind:'overflow',id,text,size:[e.clientWidth,e.clientHeight],scroll:[e.scrollWidth,e.scrollHeight]});
  for(const node of direct){const range=document.createRange();range.selectNodeContents(node);
   for(const r of range.getClientRects())if(r.width&&r.height)textBoxes.push({id,text,x:r.x,y:r.y,w:r.width,h:r.height,element:e});
  }
 }
 for(let i=0;i<textBoxes.length;i++)for(let j=i+1;j<textBoxes.length;j++){
  const a=textBoxes[i],b=textBoxes[j];if(a.element===b.element||a.element.contains(b.element)||b.element.contains(a.element))continue;
  const w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
  if(w>2&&h>2)issues.push({kind:'overlap',a:a.id,b:b.id,text:[a.text,b.text],intersection:[Math.round(w),Math.round(h)]});
 }
 const map=root.querySelector('#viewport')?.getBoundingClientRect();
 return{viewport:[innerWidth,innerHeight],mapShare:map?+(map.width*map.height/(innerWidth*innerHeight)).toFixed(4):null,
  documentOverflow:document.documentElement.scrollWidth>innerWidth+1,issues};
}
