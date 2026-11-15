import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {deflateSync} from 'node:zlib';
import {validateIcon,buildIconManifest} from '../scripts/icon-assets.mjs';
import {setIconManifest,icon,roomIcon,cardFrame,loadIcons} from '../dist/icons.js';

function crc(bytes){let c=0xffffffff;for(const n of bytes){c^=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1}return(c^0xffffffff)>>>0}
function chunk(name,data){const type=Buffer.from(name),b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);type.copy(b,4);data.copy(b,8);b.writeUInt32BE(crc(Buffer.concat([type,data])),b.length-4);return b}
function png(width,height,alpha=255){
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
 const raw=Buffer.alloc(height*(1+width*4));for(let y=0;y<height;y++)for(let x=0;x<width;x++)raw[y*(1+width*4)+1+x*4+3]=alpha;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
test('icon validation rejects 17x16 and alpha 128, accepts binary alpha at the agreed dimensions',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yd-icon-test-')),file=path.join(root,'test.png');
 try{
  fs.writeFileSync(file,png(17,16));assert.throws(()=>validateIcon(file,[16,16],'hud'),/dimensions/);
  fs.writeFileSync(file,png(16,16,128));assert.throws(()=>validateIcon(file,[16,16],'hud'),/alpha/);
  fs.writeFileSync(file,png(16,16,0));assert.equal(validateIcon(file,[16,16],'hud').width,16);
  fs.writeFileSync(file,png(8,8));assert.equal(validateIcon(file,[8,8],'status').width,8);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('the build publishes approved existing icons and never silently accepts a missing approved file',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yd-manifest-test-'));
 try{
  fs.mkdirSync(path.join(root,'art'));fs.mkdirSync(path.join(root,'dist/assets/ui/hud'),{recursive:true});
  fs.writeFileSync(path.join(root,'art/ICON-MANIFEST.json'),JSON.stringify({hud:{
   layout:{status:'done',size:[16,16]},menu:{status:'todo',size:[16,16]}}}));
  assert.throws(()=>buildIconManifest(root),/missing/);
  fs.writeFileSync(path.join(root,'dist/assets/ui/hud/layout.png'),png(16,16));
  const result=buildIconManifest(root);assert.deepEqual(Object.keys(result.hud),['layout']);
  const source=JSON.parse(fs.readFileSync(path.join(root,'art/ICON-MANIFEST.json')));
  assert.equal(source.hud.menu.status,'todo');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('missing HUD, room and card assets preserve the existing glyph, room sprite and border',async()=>{
 await loadIcons({disabled:true});assert.match(icon('hud','menu','☰'),/>☰<\/span>/);
 assert.match(icon('status','none','<'),/&lt;/);assert.match(roomIcon('guard','goblin_idle_anim_f0'),/frames\/goblin/);
 assert.equal(cardFrame('green'),'');setIconManifest({hud:{layout:{src:'assets/ui/hud/layout.png'}},
  card:{frame_green:{src:'assets/ui/card/frame_green.png'}}});
 assert.match(icon('hud','layout','▦'),/<img class="px-icon"/);assert.match(icon('hud','reset','↻'),/>↻<\/span>/);
 assert.match(cardFrame('green'),/border-image/);setIconManifest({});
});

test('canvas icons use nearest-neighbor drawing at integer pixel positions with an 8px status target',async()=>{
 const {Painter}=await import('../dist/painter.js'),calls=[],OriginalImage=globalThis.Image;
 try{
  globalThis.Image=class{complete=true;naturalWidth=8};
  setIconManifest({status:{slow:{src:'assets/ui/status/slow.png',width:8,height:8}}});
  const p={images:{},point:()=>({x:12.4,y:24.8}),ctx:{drawImage:(...a)=>calls.push(a)}};
  assert.equal(Painter.prototype.uiIcon.call(p,'status','slow',0,0,8),true);
  assert.deepEqual(calls[0].slice(1),[8,21,8,8]);assert.equal(p.ctx.imageSmoothingEnabled,false);
  assert.equal(Painter.prototype.uiIcon.call(p,'status','unknown',0,0,8),false);
 }finally{globalThis.Image=OriginalImage;setIconManifest({})}
});
