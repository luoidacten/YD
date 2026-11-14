export const VERSION=1, COLS=5, ROWS=3, WIDTH=43, HEIGHT=27;
export const ROOMS={
 entrance:{name:'Lối vào',tag:'CỔNG HẦM NGỤC',color:'#ae9c7d',icon:'floor_stairs',cost:0,description:'Đoàn thám hiểm đi vào và rút lui qua đây.'},
 guard:{name:'Doanh trại',tag:'PHÒNG PHÒNG THỦ',color:'#93aa78',icon:'goblin_idle_anim_f0',cost:70,description:'Điểm tập kết của quái vật. Cư dân hồi phục giữa các cuộc thám hiểm.'},
 trap:{name:'Phòng gai',tag:'BẪY',color:'#c17c65',icon:'floor_spikes_anim_f2',cost:60,description:'Gai gây 9 sát thương mỗi 2 giây cho kẻ xâm nhập đang ở trong phòng.'},
 treasure:{name:'Trái tim hầm ngục',tag:'KHO BÁU TRUNG TÂM',color:'#d9b56e',icon:'chest_full_open_anim_f2',cost:0,description:'Giữ kho báu ở trong hầm ngục. Chỉ thua khi kẻ địch mang nó thoát ra ngoài.'},
 grave:{name:'Nghĩa địa',tag:'TÁI TẠO',color:'#a29bc0',icon:'skelet_idle_anim_f0',cost:80,description:'Hồi sinh Skeleton mất khả năng chiến đấu giữa các màn, miễn phí.'},
 mana:{name:'Giếng linh lực',tag:'PHÉP THUẬT',color:'#7ea9b8',icon:'wall_fountain_mid_blue_anim_f0',cost:70,description:'Tạo thêm 15 mana sau mỗi màn. Phong tỏa dịch chuyển trong phòng này.'},
 shop:{name:'Tiệm lữ khách',tag:'THƯƠNG MẠI',color:'#c4a16b',icon:'flask_big_red',cost:90,description:'Bán thuốc 20 vàng. Kẻ địch bị thương có thể mua và hồi 28 HP, trừ Forsaken.'},
 loot:{name:'Kho báu nhử',tag:'DẪN DỤ',color:'#d2b675',icon:'coin_anim_f0',cost:50,description:'Đặt 30 vàng làm mồi. Kẻ tham lam ưu tiên ghé lấy; vàng chuyển quyền sở hữu thật.'}
};
export const CHARMS={
 blessed:{name:'Ban phước',symbol:'✦',type:'positive',description:'+12% HP tối đa, +10% sát thương.'},
 violent:{name:'Bạo lực',symbol:'⚔',type:'positive',description:'+20% sát thương vật lý; tăng ưu tiên tấn công.'},
 fearful:{name:'Sợ hãi',symbol:'↗',type:'mixed',description:'Ưu tiên rút lui khi bị thương; +25% tốc độ khi HP dưới 30%.'},
 forsaken:{name:'Bị ruồng bỏ',symbol:'×',type:'negative',description:'Chặn mọi hồi HP; AI không lãng phí thuốc hồi máu.'},
 frenzy:{name:'Cuồng chiến',symbol:'ϟ',type:'positive',description:'Mỗi 5 giây giao chiến tăng 5% sát thương, tối đa 8 cộng dồn.'},
 greedy:{name:'Tham lam',symbol:'◆',type:'mixed',description:'Tăng ưu tiên loot và rút lui khi túi đồ đầy.'},
 guardian:{name:'Bảo hộ',symbol:'◇',type:'positive',description:'Ưu tiên giao chiến để bảo vệ đồng đội bị thương; giảm 15% sát thương nhận.'},
 opportunist:{name:'Kẻ cơ hội',symbol:'⌁',type:'mixed',description:'Ưu tiên mục tiêu nhìn thấy đang yếu; dễ bỏ giao chiến để lấy chiến lợi phẩm.'},
 proud:{name:'Kiêu hãnh',symbol:'♜',type:'mixed',description:'Tăng ý chí giao chiến; giảm 70% ưu tiên rút lui, dễ cố thủ quá lâu.'},
 camaraderie:{name:'Tình đồng đội',symbol:'∞',type:'positive',description:'Tăng 30% ưu tiên hỗ trợ và cứu đồng đội; giảm ham muốn loot khi đồng đội bị thương.'}
};
export const SPECIES={
 goblin:{name:'Goblin',sprite:'goblin',hp:65,attack:11,speed:2.5,range:1.25,capacity:6,magic:false},
 skeleton:{name:'Skeleton',sprite:'skelet',hp:80,attack:12,speed:2,range:1.25,capacity:6,magic:false},
 slime:{name:'Slime',sprite:'tiny_slug',hp:95,attack:8,speed:1.7,range:1.25,capacity:0,magic:false},
 lord:{name:'Dungeon Lord',sprite:'big_demon',hp:190,attack:20,speed:1.7,range:1.5,capacity:8,magic:true},
 knight:{name:'Hiệp sĩ',sprite:'knight_m',hp:105,attack:13,speed:2.1,range:1.25,capacity:6,magic:false},
 mage:{name:'Pháp sư',sprite:'wizzard_m',hp:65,attack:17,speed:2,range:4,capacity:6,magic:true},
 rogue:{name:'Đạo tặc',sprite:'elf_m',hp:70,attack:10,speed:2.8,range:1.25,capacity:6,magic:false},
 priest:{name:'Tu sĩ',sprite:'wizzard_f',hp:70,attack:9,speed:2,range:3,capacity:6,magic:true}
};
export const CARDS=[
 {id:'guard',kind:'room',name:'Doanh trại',category:'BẢN THIẾT KẾ',cost:70,resource:'gold',art:'goblin_idle_anim_f0',description:'Mở rộng tuyến phòng thủ',tone:'green'},
 {id:'trap',kind:'room',name:'Phòng gai',category:'BẢN THIẾT KẾ',cost:60,resource:'gold',art:'floor_spikes_anim_f2',description:'9 sát thương / 2 giây',tone:'red'},
 {id:'goblin',kind:'creature',name:'Goblin',category:'TRIỆU HỒI',cost:25,resource:'mana',art:'goblin_idle_anim_f0',description:'Nhanh nhẹn · cận chiến',tone:'green'},
 {id:'skeleton',kind:'creature',name:'Skeleton',category:'TRIỆU HỒI',cost:30,resource:'mana',art:'skelet_idle_anim_f0',description:'Bền bỉ · tái tạo',tone:'violet'},
 {id:'slime',kind:'creature',name:'Slime',category:'TRIỆU HỒI',cost:20,resource:'mana',art:'tiny_slug_anim_f0',description:'Chống chịu · làm mòn giáp',tone:'blue'},
 {id:'grave',kind:'room',name:'Nghĩa địa',category:'BẢN THIẾT KẾ',cost:80,resource:'gold',art:'skull',description:'Tái tạo Skeleton miễn phí',tone:'violet'},
 {id:'mana',kind:'room',name:'Giếng linh lực',category:'BẢN THIẾT KẾ',cost:70,resource:'gold',art:'flask_big_blue',description:'+15 mana sau mỗi màn',tone:'blue'},
 {id:'shop',kind:'room',name:'Tiệm lữ khách',category:'BẢN THIẾT KẾ',cost:90,resource:'gold',art:'flask_big_red',description:'Bán thuốc cho kẻ địch',tone:'gold'},
 {id:'loot',kind:'room',name:'Kho báu nhử',category:'BẢN THIẾT KẾ',cost:50,resource:'gold',art:'chest_full_open_anim_f2',description:'Dẫn dụ kẻ tham lam',tone:'gold'}
];
export const center=r=>({x:5+r.col*8,y:5+r.row*8});
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
