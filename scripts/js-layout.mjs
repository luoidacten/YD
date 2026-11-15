// Dependency-free lexical layout only. Does not rename, reorder, or rewrite expressions.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

function lex(source,start=0,stopBrace=false){
 const out=[];let i=start,depth=0,space='';
 const push=(kind,value)=>{out.push({kind,value,space});space=''};
 while(i<source.length){
  const c=source[i],rest=source.slice(i);
  if(/\s/.test(c)){space+=c;i++;continue}
  if(stopBrace&&c==='}'&&depth===0)return{tokens:out,end:i+1};
  if(rest.startsWith('//')){const end=source.indexOf('\n',i);push('comment',source.slice(i,end<0?source.length:end));i=end<0?source.length:end;continue}
  if(rest.startsWith('/*')){const end=source.indexOf('*/',i+2);if(end<0)throw Error('Unclosed comment');push('comment',source.slice(i,end+2));i=end+2;continue}
  if(c==='"'||c==="'"){
   let j=i+1;for(;j<source.length;j++){if(source[j]==='\\'){j++;continue}if(source[j]===c){j++;break}}
   push('literal',source.slice(i,j));i=j;continue;
  }
  if(c==='`'){
   const parts=[];let raw='`';i++;
   while(i<source.length){
    if(source[i]==='\\'){raw+=source.slice(i,i+2);i+=2;continue}
    if(source[i]==='`'){raw+='`';i++;parts.push(raw);break}
    if(source[i]==='$'&&source[i+1]==='{'){
     parts.push(raw+'${');raw='';const expression=lex(source,i+2,true);parts.push(expression.tokens);i=expression.end;raw='}';continue;
    }
    raw+=source[i++];
   }
   push('template',parts);continue;
  }
  const prev=out.filter(t=>t.kind!=='comment').at(-1)?.value;
  const regex=c==='/'&&(!prev||['(','[','{','=',':',',',';','!','&&','||','??','?','=>','return','throw','case'].includes(prev));
  if(regex){let j=i+1,inClass=false;for(;j<source.length;j++){if(source[j]==='\\'){j++;continue}if(source[j]==='[')inClass=true;if(source[j]===']')inClass=false;if(source[j]==='/'&&!inClass){j++;while(/[a-z]/i.test(source[j]||'')&&j<source.length)j++;break}}push('regex',source.slice(i,j));i=j;continue}
  const id=rest.match(/^[$\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*/u);
  if(id){push('word',id[0]);i+=id[0].length;continue}
  const number=rest.match(/^(?:0[xbo][\da-f]+n?|(?:\d*\.\d+|\d+\.?\d*)(?:e[+-]?\d+)?n?)/i);
  if(number){push('word',number[0]);i+=number[0].length;continue}
  const op=rest.match(/^(?:===|!==|\*\*=|>>>|>>=|<<=|=>|\?\.|\?\?=?|&&=?|\|\|=?|==|!=|<=|>=|\+\+|--|\+=|-=|\*=|\/=|\*\*|<<|>>|\.\.\.)/);
  const value=op?.[0]||c;push('punct',value);if(c==='{')depth++;if(c==='}')depth--;i+=value.length;
 }
 return{tokens:out,end:i};
}

function wrapRaw(raw,width=150){
 raw=raw.replace(/\\\r?\n/g,'');
 let out='',column=0,slashes=0;
 let index=0;for(const c of raw){index+=c.length;
  out+=c;column=c==='\n'?0:column+1;slashes=c==='\\'?slashes+1:0;
  if(index<raw.length-2&&column>=width&&slashes%2===0&&c!=='\r'){out+='\\\n';column=0}
 }
 return out;
}
function format(tokens){
 let out='',line='',indent=0,previous='';
 const flush=()=>{if(line.trim())out+=' '.repeat(Math.max(0,indent))+line.trim()+'\n';line=''};
 for(const t of tokens){
  let value=t.kind==='template'?t.value.map(p=>Array.isArray(p)?'\n'+format(p).trimEnd()+'\n':wrapRaw(p)).join(''):t.kind==='literal'?wrapRaw(t.value):t.value;
  if(t.space.includes('\n')||['return','throw'].includes(value))flush();
  if(value==='}') {flush();indent=Math.max(0,indent-1)}
  if(line.length+value.length>185&&!['return','throw','yield','break','continue'].includes(previous)&&!['=>','++','--'].includes(value))flush();
  // Preserve each original inter-token separator. Added separators are only whitespace.
  const separator=line&&t.space?' ':'';
  line+=separator+value;
  if(value==='{'){flush();indent++}
  else if([';',',','}'].includes(value)||t.kind==='comment')flush();
  previous=t.value;
 }
 flush();return out;
}
function fingerprint(tokens){return tokens.map(t=>t.kind==='template'?['template',t.value.map(p=>Array.isArray(p)?fingerprint(p):p.replace(/\\\r?\n/g,''))]:[t.kind,(t.kind==='comment'?t.value.trimEnd():t.value).replace(/\\\r?\n/g,'')])}
export function formatJS(source){
 const before=lex(source).tokens,formatted=format(before),after=lex(formatted).tokens;
 const hash=t=>createHash('sha256').update(JSON.stringify(fingerprint(t))).digest('hex');
 if(hash(before)!==hash(after)){const a=fingerprint(before),b=fingerprint(after),i=a.findIndex((x,i)=>JSON.stringify(x)!==JSON.stringify(b[i]));throw Error('Token preservation failed at '+i+': '+JSON.stringify(a.slice(i,i+3))+' / '+JSON.stringify(b.slice(i,i+3)))}
 return formatted;
}
if(process.argv.includes('--write'))for(const name of fs.readdirSync('dist').filter(n=>n.endsWith('.js'))){
 const file=path.join('dist',name),source=fs.readFileSync(file,'utf8');fs.writeFileSync(file,formatJS(source));
}
