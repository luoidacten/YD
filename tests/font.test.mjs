import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFont,fontCoverage} from '../scripts/build-font.mjs';
test('pixel TrueType contains all supplied glyphs, valid offsets, and a whole-file checksum',()=>{
 const report=buildFont(),b=fs.readFileSync('dist/assets/ui/font/ydpixel.ttf');
 assert.equal(report.glyphs,215);assert.equal(report.checksum,0xb1b0afba);assert.equal(b.readUInt32BE(0),0x10000);
 const tables=new Map();for(let i=0;i<b.readUInt16BE(4);i++){const p=12+i*16,tag=b.toString('ascii',p,p+4),offset=b.readUInt32BE(p+8),length=b.readUInt32BE(p+12);
  assert.ok(offset+length<=b.length,tag);tables.set(tag,b.subarray(offset,offset+length))}
 assert.equal(tables.get('head').readUInt16BE(18),896);assert.equal(tables.get('maxp').readUInt16BE(4),215);
 const cmap=tables.get('cmap'),start=cmap.readUInt32BE(8);assert.equal(cmap.readUInt16BE(start),4);
 assert.ok(fontCoverage());
});
