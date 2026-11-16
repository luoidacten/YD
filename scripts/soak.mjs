import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {Game} from '../dist/simulation.js';

export function makeFixture(seed,wave=1){
 const g=new Game();Object.assign(g.state,{seed,worldSeed:seed,wave,gold:10000,mana:1000});
 const build=(id,col,row,floor=0)=>{
  const c=g.makeCard(id);g.state.deck.hand.push(c);g.state.mana=1000;
  const result=g.playCard(c.uid,18+col*36,16+row*30,floor);
  if(!result.ok)throw Error(result.message);return result.room;
 };
 const entry=build('entrance',0,1),guard=build('guard',1,1);
 if(seed%5===0){build('boss',2,1);build('arrival',0,1,1);build('guard',1,1,1);build('treasure',2,1,1)}
 else{build('treasure',2,1);if(seed%3===0)build('mana',1,0)}
 if(seed%5!==0){
  const pool=['goblin','skeleton','shaman','lizardArcher','orc'];
  for(let i=0;i<3;i++)if(!g.hire(guard.id,pool[(seed+i)%pool.length]))throw Error('Fixture hire rejected');
 }
 if(!g.placeKey(entry.x,entry.y,0).ok||g.layoutIssues().length)throw Error('Invalid fixture');
 return g;
}

export function runBattle(seed,wave=1){
 const g=makeFixture(seed,wave),tracking=new Map(),stuck=[];
 const result=g.start();if(!result.ok)throw Error(result.message);
 for(let step=0;step<30*482&&g.state.phase==='battle';step++){
  g.tick(1/30);const time=g.state.battleTime;
  for(const e of g.state.entities){
   if(e.status!=='active'){tracking.delete(e.id);continue}
   const tile=`${e.floorId}:${Math.round(e.x)},${Math.round(e.y)}`;
   const channel=[e.channel||0,e.chestChannel||0,e.rescueChannel||0,e.keyChannel||0,e.itemChannel||0,e.reloadChannel||0,e.trapChannel||0];
   const skill=JSON.stringify(e.skillCooldowns),prev=tracking.get(e.id);
   const active=e.strike>0||e.channelCast?.resolveAt>g.state.time||channel.some((n,i)=>n>0&&n>(prev?.channel[i]||0));
   const allowed=['guard','ambush'].includes(e.action);
   const progressed=!prev||allowed||tile!==prev.tile||active||e.cooldown>(prev.cooldown||0)||skill!==prev.skill;
   const last=progressed?time:prev.last;
   const reported=progressed?false:prev.reported;
   if(time-last>=15&&!allowed&&!reported){
    const issue={seed,wave,id:e.id,name:e.name,faction:e.faction,tile,action:e.action,time:+time.toFixed(3),target:e.target,
     path:e.path?.slice(0,4),scores:e.scores?.slice(0,3),
     detail:{hp:e.hp,mana:e.mana,statuses:e.statuses,decision:e.decision,cooldown:e.cooldown,
      traffic:e.trafficYield,gate:e.waitingGate,channelCast:e.channelCast,lastMovedAt:e.lastMovedAt,
      targetEntity:g.entity(typeof e.target==='string'?e.target:e.target?.targetId)&&
       {...Object.fromEntries(['x','y','floorId','status','hp'].map(k=>[k,g.entity(typeof e.target==='string'?e.target:e.target?.targetId)[k]]))}}};
    stuck.push(issue);
   }
   tracking.set(e.id,{tile,channel,cooldown:e.cooldown,skill,last,reported:reported||time-last>=15&&!allowed});
  }
 }
 const s=g.state,heroes=s.entities.filter(e=>e.faction==='hero'),monsters=s.entities.filter(e=>e.faction==='monster');
 const hash=createHash('sha256').update(g.serialize()).digest('hex');
 return{seed,wave,hash,result:s.phase,time:+s.battleTime.toFixed(3),escaped:heroes.filter(e=>e.status==='escaped').length,
  downed:heroes.filter(e=>e.status==='downed').length,dead:heroes.filter(e=>e.status==='dead').length,
  monstersDowned:monsters.filter(e=>e.status==='downed').length,limit:s.battleTime>=480,weaponMetrics:s.weaponMetrics,stuck};
}

export function summarize(battles){
 const times=battles.map(b=>b.time).sort((a,b)=>a-b);
 return{battles:battles.length,defenderWins:battles.filter(b=>b.result==='result').length,
  medianSeconds:times.length%2?times[Math.floor(times.length/2)]:(times[times.length/2-1]+times[times.length/2])/2,
  limitHits:battles.filter(b=>b.limit).length,stuckEpisodes:battles.reduce((n,b)=>n+b.stuck.length,0)};
}

async function main(){
 const args=process.argv.slice(2),get=(key,fallback)=>{const i=args.indexOf(key);return i<0?fallback:args[i+1]};
 const spec=get('--seeds','1-50'),range=spec.split('-').map(Number);
 const seeds=spec.includes(',')?spec.split(',').map(Number):Array.from({length:(range[1]||range[0])-range[0]+1},(_,i)=>range[0]+i);
 const waves=Number(get('--waves','3')),jobs=Number(get('--jobs','4')),tasks=seeds.flatMap(seed=>Array.from({length:waves},(_,i)=>({seed,wave:i+1})));
 const results=[];let next=0;
 await Promise.all(Array.from({length:Math.min(jobs,tasks.length)},async()=>{
  while(next<tasks.length){const task=tasks[next++];const r=await new Promise((resolve,reject)=>{
   const w=new Worker(new URL(import.meta.url),{workerData:task});w.once('message',resolve);w.once('error',reject);
   w.once('exit',code=>{if(code)reject(Error(`Worker exit ${code}`))});
  });results.push(r);if(results.length%5===0)console.log(`Soak ${results.length}/${tasks.length}`)}
 }));
 results.sort((a,b)=>a.seed-b.seed||a.wave-b.wave);const summary=summarize(results);
 const weapons=results.reduce((sum,b)=>{for(const[k,v]of Object.entries(b.weaponMetrics||{}))sum[k]=(sum[k]||0)+v;return sum},{});
 weapons.techniqueRate=(weapons.techniqueUses||0)/Math.max(1,(weapons.basicAttacks||0)+(weapons.techniqueUses||0));
 weapons.jamRate=weapons.jamAttempts?weapons.jams/weapons.jamAttempts:null;
 const report={weapons,schema:1,fixture:'seeded-independent-waves-v1',step:1/30,generatedAt:new Date().toISOString(),summary,battles:results};
 const output=get('--out','soak-report.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,1)+'\n');
 console.table({...summary,defenderWinRate:summary.defenderWins/summary.battles});
 if(args.includes('--compare')){
  const baseline=JSON.parse(fs.readFileSync(get('--compare',''),'utf8'));
  const mismatches=results.filter(b=>baseline.battles.find(a=>a.seed===b.seed&&a.wave===b.wave)?.hash!==b.hash);
  if(mismatches.length)throw Error(`${mismatches.length} seeded hash mismatches`);
  console.log(`Exact seeded hashes: ${results.length}/${results.length}`);
 }
 if(args.includes('--strict')&&(summary.limitHits||summary.stuckEpisodes))process.exitCode=1;
}
if(!isMainThread)parentPort.postMessage(runBattle(workerData.seed,workerData.wave));
else if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
