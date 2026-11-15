import fs from 'node:fs';
const failures=[];
for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.js'))){
 const lines=fs.readFileSync(`dist/${name}`,'utf8').split(/\r?\n/);
 lines.forEach((line,i)=>{if(line.length>220)failures.push(`${name}:${i+1}: ${line.length} columns`)});
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
else console.log('dist JS: all lines <= 220 columns');
