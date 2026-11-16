import fs from 'node:fs';
import path from 'node:path';
import {inflateSync} from 'node:zlib';

export function inspectPNG(bytes){
 if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Not PNG');
 let width,height,depth,color,transparency=Buffer.alloc(0),data=[];
 for(let offset=8;offset<bytes.length;){
  const length=bytes.readUInt32BE(offset),kind=bytes.toString('ascii',offset+4,offset+8);
  const chunk=bytes.subarray(offset+8,offset+8+length);offset+=length+12;
  if(kind==='IHDR'){width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);depth=chunk[8];color=chunk[9];
   if(chunk[12]!==0)throw Error('Interlaced icons are unsupported')}
  if(kind==='IDAT')data.push(chunk);
  if(kind==='tRNS')transparency=chunk;
 }
 if(depth!==8)throw Error(`Expected 8-bit PNG, got ${depth}`);
 const channels=({0:1,2:3,3:1,4:2,6:4})[color];if(!channels)throw Error(`Unsupported PNG color ${color}`);
 const raw=inflateSync(Buffer.concat(data)),stride=width*channels,pixels=Buffer.alloc(height*stride);
 if(raw.length!==height*(stride+1))throw Error('Invalid PNG scanlines');
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c};
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)];if(filter>4)throw Error(`Invalid PNG filter ${filter}`);
  for(let x=0;x<stride;x++){
   const a=x>=channels?pixels[y*stride+x-channels]:0,b=y?pixels[(y-1)*stride+x]:0;
   const c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;
   const predictor=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];
   pixels[y*stride+x]=(raw[y*(stride+1)+1+x]+predictor)&255;
  }
 }
 const alpha=[];
 for(let i=0;i<width*height;i++){
  if(color===6)alpha.push(pixels[i*4+3]);else if(color===4)alpha.push(pixels[i*2+1]);
  else if(color===3)alpha.push(transparency[pixels[i]]??255);
  else if(color===2&&transparency.length===6)alpha.push(
   pixels[i*3]===transparency.readUInt16BE(0)&&pixels[i*3+1]===transparency.readUInt16BE(2)&&
   pixels[i*3+2]===transparency.readUInt16BE(4)?0:255);
  else if(color===0&&transparency.length===2)alpha.push(pixels[i]===transparency.readUInt16BE(0)?0:255);
  else alpha.push(255);
 }
 return{width,height,alpha};
}
export function validateIcon(file,size,group){
 const png=inspectPNG(fs.readFileSync(file));
 const expected=group==='card'?[48,64]:size;
 if(!expected||png.width!==expected[0]||png.height!==expected[1])throw Error(`${file}: invalid dimensions ${png.width}x${png.height}`);
 if(group!=='card'&&!([8,16].includes(png.width)&&png.width===png.height)||['hud','room'].includes(group)&&png.width!==16)
  throw Error(`${file}: invalid pixel icon size`);
 if(png.alpha.some(a=>a!==0&&a!==255))throw Error(`${file}: alpha must be 0 or 255`);
 return{width:png.width,height:png.height};
}
export function buildIconManifest(root=process.cwd()){
 const source=path.join(root,'art/ICON-MANIFEST.json');
 const contract=fs.existsSync(source)?JSON.parse(fs.readFileSync(source,'utf8')):{};
 const manifest={};
 for(const group of ['hud','status','room','card']){
  manifest[group]={};
  for(const[id,entry]of Object.entries(contract[group]||{})){
   if(entry.status!=='done')continue;
   if(!/^[a-zA-Z0-9_-]+$/.test(id))throw Error(`Unsafe icon ID ${id}`);
   const relative=`assets/ui/${group}/${id}.png`,file=path.join(root,'dist',relative);
   if(entry.file){
    if(!/^ui\/kit\/[a-zA-Z0-9_-]+\.png$/.test(entry.file))throw Error('Unsafe icon source: '+entry.file);
    const source=path.join(root,'dist/assets',entry.file);
    if(!fs.existsSync(source))throw Error('Approved kit source missing: '+entry.file);
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(source,file);
   }
   if(!fs.existsSync(file))throw Error(`Approved icon missing: ${relative}`);
   manifest[group][id]={src:relative,...validateIcon(file,entry.size,group)};
  }
 }
 fs.mkdirSync(path.join(root,'dist/assets/ui'),{recursive:true});
 fs.writeFileSync(path.join(root,'dist/assets/ui/manifest.json'),JSON.stringify(manifest,null,1)+'\n');
 return manifest;
}
