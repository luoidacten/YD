import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {SKILLS} from '../dist/catalog.js';
import {NEW_AOE} from '../dist/rpg-data.js';

function demo(){const g=new Game();g.addRoom(1,1,'guard');g.addRoom(2,1,'guard');return g}
const room=(g,type='guard')=>g.state.rooms.find(r=>r.type===type&&r.floorId===0);
function fixture(){const g=demo();Object.assign(g.state,{entities:[],items:[],props:[],traps:[],telegraphs:[],hazards:[],noises:[],squads:[],time:1,projectiles:[]});g.rebuild();return g}
function unit(g,species='goblin',faction='monster',x,y){const r=room(g);x??=r.x-3;y??=r.y;
 const e=g.spawn(species,faction,x,y,species,[],{floorId:0,roomId:r.id});
 Object.assign(e,{charms:[],passiveIds:[],statuses:[],inventory:[],gearSlots:{},quickScrolls:[],equipment:null,hp:100,maxHp:100,
  qualityPower:1,variant:'normal',elite:false,decision:0,personality:{aggression:1,teamwork:1},order:'guard',concealed:false});return e}

test('20 AoE skills exist and the 10 new ones have telegraph configs',()=>{
 const aoe=Object.values(SKILLS).filter(k=>k.kind==='aoe');
 assert.equal(aoe.length,20);
 for(const[id]of NEW_AOE){assert.equal(SKILLS[id].kind,'aoe');assert.ok(SKILLS[id].radius>0&&SKILLS[id].windup>0,id)}
});

test('element affinity multiplies damage once: weakness, resistance and Guild wards',()=>{
 const g=fixture(),src=unit(g,'goblin','monster'),slime=unit(g,'iceZombie','monster');
 slime.faction='hero';
 const hit=ctx=>{slime.hp=100;slime.statuses=[];g.damage(slime,10,src,ctx);return +(100-slime.hp).toFixed(3)};
 const base=hit({skill:'A02'});                                         // physical, neutral for iceZombie
 assert.ok(Math.abs(hit({skill:'A01'})-base*1.5)<1e-6,'fire ×1.5');
 assert.ok(Math.abs(hit({skill:'A04'})-base*.3)<1e-6,'ice ×0.3');
 slime.wards={fire:.4};assert.ok(Math.abs(hit({skill:'A01'})-base*1.5*.6)<1e-6,'ward 40%');
 assert.ok(Math.abs(hit({skill:'A01',secondary:true})-hit({skill:'A02',secondary:true}))<1e-6,'ticks untouched');
});

test('every species gets a mana pool and blood casters pay skills with HP',()=>{
 const g=fixture(),w=g.spawn('berserker','hero',10,10,'B',[],{floorId:0});
 assert.ok(w.maxMana>0);
 const k=SKILLS[w.skillIds.find(id=>SKILLS[id]?.mana>0)];assert.ok(k,'berserker has a costed skill');
 const enemy=unit(g,'goblin','monster',w.x+1,w.y);w.statuses=[];w.hp=w.maxHp;const mana=w.mana,hp=w.hp;
 w.skillCooldowns={};assert.equal(g.skillAvailable(w,k),true);
 g.castSkill(w,k.id,k.kind==='buff'?w.id:enemy.id);
 assert.equal(w.mana,mana,'blood caster keeps mana');assert.ok(w.hp<hp,'blood caster pays HP');
});

test('ranged hits become real projectiles that travel, hit the first enemy and can be dodged',()=>{
 const g=fixture();g.state.phase='battle';
 const archer=unit(g,'archer','hero'),a=unit(g,'goblin','monster',archer.x+6,archer.y);
 archer.action='attack';archer.target=a.id;
 g.damage(a,10,archer);
 assert.equal(a.hp,100,'no instant damage');assert.equal(g.state.projectiles.length,1);
 for(let i=0;i<30&&g.state.projectiles.length;i++)g.updateProjectiles(1/30);
 assert.ok(a.hp<100,'projectile arrived');
 // dodge: target steps aside before arrival
 const b=unit(g,'goblin','monster',archer.x+7,archer.y);g.damage(b,10,archer);b.y+=3;
 for(let i=0;i<40&&g.state.projectiles.length;i++)g.updateProjectiles(1/30);
 assert.equal(b.hp,100,'moved target dodged');
 // save keeps projectiles
 g.damage(a,5,archer);const copy=JSON.parse(g.serialize());assert.equal(copy.projectiles?.length??copy.state?.projectiles?.length,1);
});

test('multi-impact and knock-back AoE resolve through the telegraph system',()=>{
 const g=fixture();g.state.phase='battle';
 const mage=unit(g,'pyromancer','hero'),t=unit(g,'goblin','monster',mage.x+4,mage.y);
 mage.skillIds=['A14'];mage.skillCooldowns={};mage.mana=100;
 assert.ok(g.castSkill(mage,'A14',t.id));
 assert.equal(g.state.telegraphs.filter(x=>x.skill==='A14').length,3);
 const tank=unit(g,'minotaur','monster'),h=unit(g,'goblin','hero',tank.x+1.5,tank.y);
 tank.skillCooldowns={};tank.mana=100;assert.ok(g.castSkill(tank,'A19',h.id));
 const x=h.x;g.state.time+=1;g.resolveWorld(1/30);assert.ok(h.x>x+.4,'pushed away');
});

test('room master aura reaches its room and neighbours; evolution paths are player choices',()=>{
 const g=fixture(),r=room(g);const m=unit(g,'orc','monster');m.isCommander=true;r.commanderId=m.id;m.level=3;
 const friend=unit(g,'goblin','monster');g.state.phase='battle';g.updateMasterAuras();
 assert.ok(g.effect(friend,'fortify')||g.effect(friend,'power')||g.effect(friend,'haste'));
 g.state.phase='prepare';
 assert.equal(g.masterInfo(m).picks,2);
 assert.ok(g.chooseMasterPath(m.id,'far').ok);assert.ok(g.chooseMasterPath(m.id,'varied').ok);
 assert.equal(g.chooseMasterPath(m.id,'strong').ok,false,'no picks left');
 const info=g.masterInfo(m);assert.equal(info.depth,2);assert.equal(info.auras.length,2);
});

test('the Guild learns from losses and counters the top cause next time',()=>{
 const g=fixture();g.state.phase='battle';
 for(let i=0;i<4;i++){const h=unit(g,'knight','hero');const src=unit(g,'imp','monster');g.damage(h,500,src,{skill:'A01'})}
 assert.equal(g.topLesson()[0],'fire');
 const hero=unit(g,'knight','hero');g.prepareHero(hero);assert.ok(hero.wards.fire>0);
});
