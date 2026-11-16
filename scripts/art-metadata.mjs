import fs from 'node:fs';
import path from 'node:path';
export function writeArtMetadata(root=process.cwd()){
 const metadata={},scopes=['v05','v06'].map(v=>path.join(root,`tests/fixtures/art-scope-${v}.json`));
 const allowed=new Set(scopes.filter(f=>fs.existsSync(f)).flatMap(f=>Object.keys(JSON.parse(fs.readFileSync(f,'utf8')).frames)));
 function walk(dir){for(const name of fs.readdirSync(dir)){const file=path.join(dir,name);
  if(fs.statSync(file).isDirectory())walk(file);else if(name.endsWith('.png')){
   const bytes=fs.readFileSync(file),key=path.relative(path.join(root,'dist/assets/frames'),file).replaceAll('\\','/').slice(0,-4);
   if(!allowed||allowed.has(key))metadata[key]=[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
  }
 }}
 walk(path.join(root,'dist/assets/frames/yd'));
 const lines=Object.entries(metadata).sort(([a],[b])=>a.localeCompare(b)).map(([key,size])=>` ${JSON.stringify(key)}:${JSON.stringify(size)}`);
 fs.writeFileSync(path.join(root,'dist/art-metadata.js'),'// Generated from immutable project PNG headers by scripts/art-metadata.mjs.\nexport const ART_SIZE={\n'+lines.join(',\n')+'\n};\n');
 return metadata;
}
if(process.argv[1]?.endsWith('art-metadata.mjs'))console.log('Project PNG metadata:',Object.keys(writeArtMetadata()).length);
