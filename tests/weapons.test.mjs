import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/simulation.js';
import {ITEMS} from '../dist/expansion.js';
import {equipControl} from '../dist/weapon-ui.js';
function fixture(){const g=new Game(),room=g.addRoom(1,1,'boss');g.state.props=[];g.rebuild();return{g,room}}
function unit(g,species='goblin',faction='monster',x=54,y=46){
 const e=g.spawn(species,faction,x,y,species,[]);Object.assign(e,{intelligence:80,charms:[],passiveIds:[],skillIds:[],
  statuses:[],gearSlots:{offhand:null},inventory:[],equipment:null,potions:0,quickScrolls:[],capacity:30,hp:1000,maxHp:1000,
  qualityPower:1,decision:100,quality:'common',variant:'normal',favoriteRooms:[],personality:{aggression:1,teamwork:1}});
 g.state.items=g.state.items.filter(i=>i.owner!==e.id);return e;
}
test('weapon requirements distinguish prohibited families, strict brain and usable weapons with Vietnamese UI reasons',()=>{
 const {g}=fixture(),knight=unit(g,'knight','hero'),zombie=unit(g,'zombie');zombie.intelligence=16;
 assert.equal(g.canEquip(knight,ITEMS.W39),false);assert.match(g.equipIssue(knight,ITEMS.W39),/Class/);
 const gun=g.createItem('W39',zombie);assert.equal(g.canEquip(zombie,gun),false);
 assert.match(equipControl(g,zombie,gun),/Không đủ trí khôn/);assert.equal(g.equipItem(zombie,gun),false);
 assert.equal(g.canEquip(knight,ITEMS.W14),true);
});
test('proficiency factors are 0.7, 1, 1.1 and insufficient brain adds one 0.6 penalty',()=>{
 const {g}=fixture(),a=unit(g,'archer','hero'),b=unit(g,'rogue','hero'),c=unit(g,'knight','hero');
 assert.equal(g.weaponFactor(a,ITEMS.W14),.7);assert.equal(g.weaponFactor(b,ITEMS.W14),1);
 assert.equal(g.weaponFactor(c,ITEMS.W14),1.1);c.intelligence=1;assert.equal(g.weaponFactor(c,ITEMS.W14),.66);
});
test('offhand and two-handed weapons are mutually exclusive and saved without duplicating item ownership',()=>{
 const {g}=fixture(),e=unit(g,'knight','hero');g.equipItem(e,g.createItem('W14',e));const shield=g.createItem('W32',e);
 assert.ok(g.equipItem(e,shield));assert.equal(g.canEquip(e,ITEMS.W01),false);
 const saved=new Game(JSON.parse(g.serialize()));assert.equal(saved.entity(e.id).gearSlots.offhand,shield.id);
 assert.ok(g.unequipItem(e,'offhand'));assert.equal(shield.location,'bag');assert.ok(g.equipItem(e,g.createItem('W01',e)));
 assert.equal(g.canEquip(e,shield),false);
});
test('gun jams repeat exactly after restoring the seeded save and reloading interrupts on damage',()=>{
 const {g}=fixture(),e=unit(g,'goblin');g.equipItem(e,g.createItem('W39',e));const save=g.serialize();
 const attempts=game=>{const actor=game.entity(e.id),result=[];for(let i=0;i<100;i++){
  actor.gunState=null;result.push(game.jamGun(actor));}return result};
 const first=attempts(g);assert.deepEqual(first,attempts(new Game(JSON.parse(save))));
 assert.ok(first.filter(Boolean).length>5&&first.filter(Boolean).length<40);
 g.state.time=10;g.beginReload(e);g.reloadGun(e,.7);assert.equal(e.reloadChannel,.7);
 e.lastDamaged=10.5;g.state.time=10.5;g.reloadGun(e,.1);assert.equal(e.reloadChannel,.1);
 g.reloadGun(e,1.2);assert.equal(e.gunState.ready,true);
});
test('firing a gun uses LOS, starts reload and creates a noise without leaking targets through walls',()=>{
 const {g}=fixture(),e=unit(g,'dwarfMiner','hero',50),enemy=unit(g,'goblin','monster',56);
 g.equipItem(e,g.createItem('W39',e));e.action='attack';e.target=enemy.id;g.act(e,1/30);
 assert.ok(enemy.hp<1000);assert.equal(e.gunState.ready,false);assert.equal(g.metrics().shots,1);
 assert.ok(g.state.noises.some(n=>n.gun&&n.floorId===0));
 const hp=enemy.hp;for(let i=0;i<10;i++)g.act(e,1/30);assert.equal(enemy.hp,hp);
});
test('bomb consumes one charge and shares barrel friendly-fire and chain-once behavior',()=>{
 const {g}=fixture(),e=unit(g,'goblin','monster',51),ally=unit(g,'goblin','monster',55),enemy=unit(g,'knight','hero',56);
 e.intelligence=80;const bomb=g.createItem('W35',e);
 const barrel={id:'barrel',type:'explosive',hp:1,x:57,y:46,floorId:0};g.state.props.push(barrel);g.rebuild();
 assert.ok(g.throwBomb(e,bomb,enemy));assert.equal(bomb.charges,2);assert.ok(ally.hp<1000&&enemy.hp<1000);
 assert.equal(barrel.destroyed,true);const hp=enemy.hp;g.damageProp(barrel,100,e);assert.equal(enemy.hp,hp);
});
test('front-facing shield protects its carrier and an ally behind it but not a rear shot or AoE',()=>{
 const {g}=fixture(),guard=unit(g,'knight','hero',54),friend=unit(g,'knight','hero',53),enemy=unit(g,'goblin','monster',60);
 g.equipItem(guard,g.createItem('W32',guard));g.equipItem(enemy,g.createItem('W01',enemy));guard.flip=false;
 friend.seen[enemy.id]={x:60,y:46,floorId:0,time:g.state.time,firstSeen:-10};
 g.random=()=>.99;g.damage(friend,100,enemy);const front=1000-friend.hp;friend.hp=1000;
 enemy.x=48;g.damage(friend,100,enemy);const rear=1000-friend.hp;assert.ok(front<rear*.6);
 friend.hp=1000;enemy.x=60;g.damage(friend,100,enemy,{aoe:true});assert.ok(1000-friend.hp>front);
});
test('weapon techniques require both proficiency and brain; off-class upgrades remain in the bag',()=>{
 const {g}=fixture(),e=unit(g,'knight','hero');g.equipItem(e,g.createItem('W14',e));e.intelligence=44;
 assert.equal(g.weaponTechnique(e),null);e.intelligence=60;assert.ok(g.weaponTechnique(e));
 const gun=g.createItem('W39',e);assert.equal(g.itemUseful(e,gun,[]),false);assert.equal(gun.location,'bag');
});

test('physical firearms and crossbows remain physical on a spellcaster with no mana',()=>{
 const {g}=fixture(),e=unit(g,'shaman','monster',51),enemy=unit(g,'knight','hero',56);
 g.equipItem(e,g.createItem('W23',e));e.mana=0;e.action='attack';e.target=enemy.id;
 assert.equal(g.usesMagicAttack(e),false);g.act(e,1/30);assert.ok(enemy.hp<1000);assert.equal(e.mana,0);
});

test('a gunner whose decision changes from guard to attack still rolls jam at the actual shot boundary',()=>{
 const {g}=fixture(),e=unit(g,'goblin','monster',51),enemy=unit(g,'knight','hero',56);
 g.equipItem(e,g.createItem('W39',e));e.action='guard';e.decision=0;
 g.decide=actor=>{actor.action='attack';actor.target=enemy.id;actor.decision=100};g.random=()=>0;
 g.act(e,1/30);assert.equal(enemy.hp,1000);assert.equal(e.gunState.jammed,true);assert.equal(g.metrics().jams,1);
});
