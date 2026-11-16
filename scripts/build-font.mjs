import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
// Minimal TrueType writer: each source pixel becomes one clockwise square contour.
const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16BE(n&65535);return b};
const i16=n=>{const b=Buffer.alloc(2);b.writeInt16BE(n);return b};
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n>>>0);return b};
const cat=parts=>Buffer.concat(parts),pad=b=>cat([b,Buffer.alloc((4-b.length%4)%4)]);
function checksum(bytes){const b=pad(bytes);let n=0;for(let i=0;i<b.length;i+=4)n=(n+b.readUInt32BE(i))>>>0;return n}
function glyph(d,baseline){
 const points=d.px.flatMap(([x,y])=>[[x*64,(baseline-y-1)*64],[x*64,(baseline-y)*64],[(x+1)*64,(baseline-y)*64],[(x+1)*64,(baseline-y-1)*64]]);
 if(!points.length)return Buffer.alloc(0);
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),parts=[i16(d.px.length),i16(Math.min(...xs)),i16(Math.min(...ys)),i16(Math.max(...xs)),i16(Math.max(...ys))];
 parts.push(...d.px.map((_,i)=>u16(i*4+3)),u16(0),Buffer.alloc(points.length,1));
 for(let axis=0;axis<2;axis++){let previous=0;for(const p of points){parts.push(i16(p[axis]-previous));previous=p[axis]}}
 return pad(cat(parts));
}
export function buildFont(){
 const source=JSON.parse(fs.readFileSync('dist/assets/ui/font/ydpixel.json','utf8')),
  entries=Object.entries(source.glyphs).sort(([a],[b])=>a.codePointAt(0)-b.codePointAt(0));
 const defs=[{w:5,px:[[0,0],[4,0],[0,6],[4,6]]},...entries.map(([,d])=>d)],n=defs.length,units=14*64,
  outlines=defs.map(d=>glyph(d,source.baseline)),offsets=[0];
 for(const b of outlines)offsets.push(offsets.at(-1)+b.length);
 const head=Buffer.alloc(54);head.writeUInt32BE(0x00010000);head.writeUInt32BE(0x00010000,4);head.writeUInt32BE(0x5f0f3cf5,12);
 head.writeUInt16BE(11,16);head.writeUInt16BE(units,18);head.writeInt16BE(-64,36);head.writeInt16BE(-64,38);
 head.writeInt16BE(512,40);head.writeInt16BE(source.baseline*64,42);head.writeUInt16BE(8,46);head.writeInt16BE(2,48);head.writeInt16BE(1,50);
 const hhea=Buffer.alloc(36);hhea.writeUInt32BE(0x00010000);hhea.writeInt16BE(source.baseline*64,4);hhea.writeInt16BE(-64,6);
 hhea.writeUInt16BE(576,10);hhea.writeInt16BE(-64,12);hhea.writeInt16BE(512,16);hhea.writeInt16BE(1,18);hhea.writeUInt16BE(n,34);
 const maxp=Buffer.alloc(32);maxp.writeUInt32BE(0x00010000);maxp.writeUInt16BE(n,4);
 maxp.writeUInt16BE(Math.max(...defs.map(d=>d.px.length*4)),6);maxp.writeUInt16BE(Math.max(...defs.map(d=>d.px.length)),8);maxp.writeUInt16BE(1,14);
 const segment=entries.length+1,search=2**Math.floor(Math.log2(segment)),format=cat([u16(4),u16(16+segment*8),u16(0),u16(segment*2),
  u16(search*2),u16(Math.log2(search)),u16(segment*2-search*2),...entries.map(([c])=>u16(c.codePointAt(0))),u16(65535),u16(0),
  ...entries.map(([c])=>u16(c.codePointAt(0))),u16(65535),...entries.map(([c],i)=>u16(i+1-c.codePointAt(0))),u16(1),...Array.from({length:segment},()=>u16(0))]);
 const cmap=cat([u16(0),u16(1),u16(3),u16(1),u32(12),format]);
 const names=['YD Pixel','Regular','YD Pixel 1.0','YD Pixel','Version 1.0','YD-Pixel'],nameData=[],nameRecords=[];
 let offset=0;for(let i=0;i<names.length;i++){const b=Buffer.from(names[i],'utf16le');b.swap16();nameData.push(b);
  nameRecords.push(cat([u16(3),u16(1),u16(0x409),u16(i+1),u16(b.length),u16(offset)]));offset+=b.length}
 const name=cat([u16(0),u16(names.length),u16(6+12*names.length),...nameRecords,...nameData]);
 const os=Buffer.alloc(78);os.writeInt16BE(384,2);os.writeUInt16BE(400,4);os.writeUInt16BE(5,6);os.writeInt16BE(64,10);os.writeInt16BE(64,12);
 os.writeUInt32BE(1,42);os.write('YD  ',58);os.writeUInt16BE(64,62);os.writeUInt16BE(32,64);os.writeUInt16BE(0x1ef9,66);
 os.writeInt16BE(source.baseline*64,68);os.writeInt16BE(-64,70);os.writeUInt16BE(source.baseline*64,74);os.writeUInt16BE(64,76);
 const post=Buffer.alloc(32);post.writeUInt32BE(0x00030000);post.writeInt16BE(-64,8);post.writeInt16BE(64,10);
 const tables={'OS/2':os,cmap,glyf:cat(outlines),head,hhea,hmtx:cat(defs.flatMap(d=>[u16((d.w+source.spacing)*64),i16(Math.min(0,...d.px.map(p=>p[0]))*64)])),
  loca:cat(offsets.map(u32)),maxp,name,post},tags=Object.keys(tables).sort(),count=tags.length,power=2**Math.floor(Math.log2(count));
 const directory=[u32(0x00010000),u16(count),u16(power*16),u16(Math.log2(power)),u16(count*16-power*16)],contents=[];
 offset=12+count*16;let headOffset=0;
 for(const tag of tags){const b=tables[tag];directory.push(Buffer.from(tag),u32(checksum(b)),u32(offset),u32(b.length));contents.push(pad(b));
  if(tag==='head')headOffset=offset;offset+=pad(b).length}
 const font=cat([...directory,...contents]);font.writeUInt32BE((0xb1b0afba-checksum(font))>>>0,headOffset+8);
 fs.writeFileSync('dist/assets/ui/font/ydpixel.ttf',font);return{glyphs:n,bytes:font.length,checksum:checksum(font)};
}
export function fontCoverage(){
 const glyphs=JSON.parse(fs.readFileSync('dist/assets/ui/font/ydpixel.json','utf8')).glyphs,missing=new Set();
 for(const file of fs.readdirSync('dist').filter(f=>f.endsWith('.js')||f.endsWith('.html')))
  for(const c of fs.readFileSync('dist/'+file,'utf8').normalize('NFC'))if(/\p{Script=Latin}/u.test(c)&&/\p{L}/u.test(c)&&!glyphs[c])missing.add(c);
 if(missing.size)throw Error('Missing UI Latin/Vietnamese glyphs: '+[...missing].join(' '));return true;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){fontCoverage();console.log(buildFont())}
