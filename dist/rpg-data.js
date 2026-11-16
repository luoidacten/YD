// v0.9 RPG layer data: elements, strengths/weaknesses, mana/blood costs, 10 new AoE skills,
// projectile kinds, room-master auras and the Guild's counter-tactics. Pure data, no runtime state.

export const ELEMENTS={
 physical:{name:'Vật lý',color:'#e2d1b0'},fire:{name:'Lửa',color:'#ee8e2e'},ice:{name:'Băng',color:'#72d6ce'},
 lightning:{name:'Sét',color:'#facb3e'},poison:{name:'Độc',color:'#97da3f'},holy:{name:'Thánh',color:'#fdf7ed'},
 shadow:{name:'Bóng tối',color:'#9a7bd1'},arcane:{name:'Huyền bí',color:'#5698cc'},
};

// Element of each skill hit (catalog + new AoE). Missing = physical, or the caster's default element.
export const SKILL_ELEMENT={
 S04:'physical',S05:'poison',S06:'fire',A01:'fire',A02:'physical',A03:'physical',A04:'ice',A05:'poison',A06:'lightning',
 A07:'physical',A08:'fire',A09:'arcane',A10:'holy',C02:'ice',C04:'shadow',C06:'holy',
 A11:'fire',A12:'physical',A13:'lightning',A14:'fire',A15:'ice',A16:'shadow',A17:'holy',A18:'fire',A19:'physical',A20:'poison',
};

// Basic-attack element of casters (magic species); others hit physical.
export const SPECIES_ELEMENT={
 lord:'fire',imp:'fire',pyromancer:'fire',fire_elemental:'fire',salamander:'fire',frost_mage:'ice',frost_witch:'ice',
 iceZombie:'ice',mage:'arcane',arcaneArcher:'arcane',eyeball:'arcane',naga:'poison',scorpion:'poison',swampy:'poison',
 spider:'poison',spider_queen:'poison',priest:'holy',priestess:'holy',angelHerald:'holy',paladin:'holy',nun:'holy',
 shaman:'shadow',orcShaman:'shadow',lich:'shadow',necro_lord:'shadow',cultist:'shadow',wraith:'shadow',skeleton_mage:'ice',
 bone_king:'shadow',death_knight:'shadow',druid:'poison',
};

// Damage multipliers by element. <1 = strong (resist), >1 = weak. Species entries override family entries.
// Existing special cases stay where they are and are NOT repeated here: treant burn×1.5, salamander burn immunity,
// living_armor/bone poison immunity, bone vs holy ×1.5 (bones.js).
export const FAMILY_AFFINITY={
 bone:{ice:.7,shadow:.6,fire:1.2},
};
export const AFFINITY={
 slime:{physical:.75,fire:1.4},cube_slime:{physical:.7,fire:1.4},mushroom:{poison:.4,fire:1.4},
 iceZombie:{ice:.3,fire:1.5},fire_elemental:{fire:.2,ice:1.6},salamander:{ice:1.5},imp:{fire:.4,holy:1.4,ice:1.25},
 lord:{fire:.3,holy:1.5,ice:1.3},big_demon:{fire:.3,holy:1.5},chort:{fire:.5,holy:1.4},wogol:{fire:.5,holy:1.3},
 ghost:{physical:.5,holy:1.6,arcane:1.2},wraith:{physical:.5,holy:1.6},lich:{shadow:.4,holy:1.5,fire:1.2},
 necro_lord:{shadow:.3,holy:1.6,physical:.9},death_knight:{shadow:.4,physical:.8,holy:1.5,fire:1.2},
 gargoyle:{physical:.6,poison:.3,lightning:1.4},rock_golem:{physical:.55,poison:.2,lightning:1.5,ice:1.2},
 living_armor:{physical:.65,lightning:1.5,arcane:1.2},warden:{physical:.6,lightning:1.5,arcane:1.2},
 werewolf:{physical:.85,holy:1.35},troll:{physical:.85,fire:1.4},treant:{ice:.5,poison:.5,physical:.8},
 frost_witch:{ice:.2,fire:1.5},spider:{poison:.3,fire:1.3},spider_queen:{poison:.2,fire:1.4,lightning:1.2},
 orc:{physical:.9,arcane:1.2},orc_warlord:{physical:.8,arcane:1.3,poison:1.15},minotaur:{physical:.8,arcane:1.3},
 harpy:{lightning:1.35,physical:1.1},bat:{lightning:1.3},naga:{poison:.5,lightning:1.4},scorpion:{poison:.3,ice:1.3},
 swampy:{poison:.4,fire:1.3},muddy:{physical:.8,lightning:1.3},giant_rat:{poison:.6,fire:1.2},kobold:{fire:1.2},
 gnoll:{poison:.8,holy:1.15},cultist:{shadow:.5,holy:1.3},eyeball:{arcane:.5,physical:1.2},pumpkin:{fire:1.5},
 bone_king:{shadow:.4,physical:.85},bone_giant:{physical:.75,fire:1.3},ember_skeleton:{fire:.2,ice:1.5},
 // heroes
 knight:{physical:.85,lightning:1.2},shieldmaiden:{physical:.8,arcane:1.2},paladin:{holy:.5,shadow:.7,lightning:1.2},
 mage:{arcane:.7,physical:1.15},pyromancer:{fire:.5,ice:1.25},frost_mage:{ice:.5,fire:1.25},priest:{holy:.5,shadow:1.2},
 priestess:{holy:.5,shadow:1.2},nun:{shadow:.7},angelHerald:{holy:.3,shadow:1.3},berserker:{physical:.9,arcane:1.2},
 druid:{poison:.5,fire:1.25},ninja:{shadow:.8,fire:1.15},dwarfMiner:{physical:.9,poison:.8},dwarfSmith:{fire:.6},
 arcaneArcher:{arcane:.6},beastmaster:{poison:.8},hunter:{poison:.8},
};

// Who pays skills with blood (HP) instead of mana. 1 mana of cost = this fraction of maxHp.
export const BLOOD_CASTERS={berserker:.0035,werewolf:.003,troll:.0025,death_knight:.0025,orc_warlord:.0025,
 bone_giant:.003,minotaur:.003};

// Mana pools: casters keep 100. Others now get a real pool so their skills compete for mana.
export function manaPool(d){
 if(d.magic)return 100;
 return {support:70,ranged:55,scout:50,ambusher:50,skirmisher:45,tank:40,companion:0}[d.role]??40;
}
// Regen per second in battle (out of battle the existing wave reset refills +30).
export function manaRegen(d){return d.magic?1.2:.55}

// Skills that used to be free now cost mana, so warriors also manage a resource.
export const MANA_COST={S01:6,S02:6,S03:8,S05:6,S07:6,S08:6,S09:10,S10:8,A03:14,A07:12,B01:10,B03:10,C01:6,C03:10,
 C07:8,C09:8,H07:6};

// 10 new AoE skills (with A01–A10 = 20). All go through castSkill → telegraph → resolver.
// Extra fields handled in rpg.js: impacts (extra circles), knock (push tiles), bloodCost (fraction of max HP).
export const NEW_AOE=[
 ['A11','Mưa Tên Lửa','Mưa tên tẩm dầu rơi xuống một vùng, gây bỏng.','Tản đội hình, giải bỏng',
  {power:1.1,radius:3,range:9,windup:1.2,cd:11,mana:14,effect:'burn',duration:3}],
 ['A12','Bão Kiếm','Xoáy kiếm quanh bản thân, chém mọi kẻ địch sát bên.','Giữ khoảng cách',
  {power:1.3,radius:2.5,range:2.5,windup:.6,cd:9,mana:10,self:true}],
 ['A13','Sét Giáng','Sét đánh xuống, choáng ngắn những kẻ đứng trong vùng.','Không đứng tụm, kháng sét',
  {power:1.6,radius:2,range:8,windup:.8,cd:12,mana:16,effect:'stun',duration:.5}],
 ['A14','Núi Lửa Phun','Ba cột dung nham phun quanh mục tiêu, để lại lửa.','Né khỏi vùng đỏ',
  {power:1.2,radius:1.6,range:7,windup:1.5,cd:16,mana:22,effect:'burn',duration:3,impacts:3}],
 ['A15','Vòng Băng','Băng nổ quanh bản thân, trói chân kẻ địch.','Giữ khoảng cách, giải trói',
  {power:.8,radius:3,range:3,windup:.7,cd:13,mana:14,self:true,effect:'rooted',duration:1.5}],
 ['A16','Huyết Bạo','Đốt máu của bản thân thành vụ nổ bóng tối (tốn 12% HP, không tốn mana).','Ép kẻ dùng ở máu thấp',
  {power:1.8,radius:3,range:3,windup:.5,cd:14,mana:0,self:true,bloodCost:.12}],
 ['A17','Thánh Quang','Cột ánh sáng thánh, cực mạnh với bất tử.','Kháng thánh, tản ra',
  {power:1.2,radius:3,range:7,windup:1,cd:12,mana:16}],
 ['A18','Mưa Thiên Thạch','Ba thiên thạch rơi liên tiếp, gây sát thương lớn.','Chạy khỏi vùng báo trước',
  {power:1.5,radius:2,range:9,windup:2,cd:22,mana:30,impacts:3}],
 ['A19','Sóng Chấn','Sóng xung kích hình nón đẩy lùi kẻ địch 2 ô.','Đứng cạnh tường, kháng đẩy',
  {power:1,radius:4,range:4,windup:.6,cd:11,mana:12,cone:true,knock:2}],
 ['A20','Bom Khói Độc','Khói độc làm mù và gây độc trong vùng.','Thanh tẩy, rời khói',
  {power:.4,radius:3,range:6,windup:.5,cd:12,mana:10,effect:'poison',duration:4,blind:.4}],
];

// Who learns the new AoE (appended to their skill lists once, see rpg.js).
export const AOE_KITS={
 archer:['A11'],crossbowman:['A11'],hunter:['A11'],lizardArcher:['A11'],skeleton_archer:['A11'],
 berserker:['A12','A16'],knight:['A12'],orc_warlord:['A12'],minotaur:['A19'],brute:['A19'],
 mage:['A13'],arcaneArcher:['A13'],naga:['A13'],pyromancer:['A14','A18'],lord:['A14'],imp:['A14'],fire_elemental:['A14'],
 frost_mage:['A15'],frost_witch:['A15'],iceZombie:['A15'],skeleton_mage:['A15'],death_knight:['A16'],werewolf:['A16'],
 troll:['A16'],priest:['A17'],priestess:['A17'],paladin:['A17'],nun:['A17'],angelHerald:['A17'],
 necro_lord:['A20'],cultist:['A20'],swampy:['A20'],scorpion:['A20'],assassin:['A20'],ninja:['A20'],druid:['A20'],
 shieldmaiden:['A19'],dwarfSmith:['A19'],gnoll:['A12'],
};

// Real projectiles: speed in tiles/second, hit radius in tiles.
export const PROJECTILE={arrow:{speed:16,radius:.45},bolt:{speed:20,radius:.4},bullet:{speed:28,radius:.35},
 magic:{speed:11,radius:.5},fire:{speed:11,radius:.5},frost:{speed:11,radius:.5},curse:{speed:10,radius:.5},
 knife:{speed:14,radius:.45},axe:{speed:12,radius:.5},holy:{speed:12,radius:.5}};

// Room masters (the elected room commander): aura by role, upgrade paths chosen by the player.
export const MASTER_AURA={
 power:{name:'Uy Lực',status:'power',value:.08,icon:'↑'},
 fortify:{name:'Thành Lũy',status:'fortify',value:.08,icon:'■'},
 haste:{name:'Thần Tốc',status:'haste',value:.08,icon:'»'},
 regen:{name:'Hồi Phục',status:'regen',value:.006,icon:'+'},
 focus:{name:'Tập Trung',status:'manaFlow',value:.6,icon:'◆'},
};
export const ROLE_AURA={tank:'fortify',skirmisher:'haste',ranged:'power',support:'regen',ambusher:'power',scout:'haste',
 companion:'power'};
export const AURA_ORDER=['power','fortify','haste','regen','focus'];
export const MASTER_PATHS={
 strong:{name:'Mạnh hơn',description:'Hiệu lực hào quang +50% mỗi lần chọn.'},
 far:{name:'Xa hơn',description:'Lan thêm một vòng phòng nối hành lang (phòng lân cận nhận 60%).'},
 varied:{name:'Đa dạng hơn',description:'Thêm một loại hào quang mới.'},
};
// Decor props drawn around a room with a master (render-only), by aura.
export const MASTER_DECOR={power:'master_banner_red',fortify:'master_banner_blue',haste:'master_banner_green',
 regen:'master_banner_green',focus:'master_banner_purple'};

// What the Guild learns from losses and how it adapts the next parties.
export const COUNTERS={
 fire:{name:'Kháng Lửa',status:'resistFire',item:'Thuốc kháng lửa',classes:['frost_mage','paladin']},
 ice:{name:'Kháng Băng',status:'resistIce',item:'Thuốc kháng băng',classes:['pyromancer','berserker']},
 poison:{name:'Giải Độc',status:'resistPoison',item:'Thuốc giải độc',classes:['priest','druid']},
 shadow:{name:'Phù Thánh',status:'resistShadow',item:'Bùa thánh',classes:['paladin','priestess','nun']},
 lightning:{name:'Cách Điện',status:'resistLightning',item:'Áo cách điện',classes:['shieldmaiden','dwarfMiner']},
 holy:{name:'Áo Choàng Tối',status:'resistHoly',item:'Áo choàng tối',classes:['assassin','ninja']},
 physical:{name:'Giáp Dày',status:'fortify',item:'Giáp dày',classes:['knight','shieldmaiden','paladin']},
 arcane:{name:'Phù Phá Ma',status:'resistArcane',item:'Phù phá ma',classes:['arcaneArcher','nun']},
 trap:{name:'Dò Bẫy',classes:['dwarfMiner','rogue','hunter']},
 undead:{name:'Diệt Bất Tử',classes:['paladin','priest','nun','priestess']},
 boss:{name:'Săn Boss',classes:['berserker','crossbowman','arcaneArcher']},
};
