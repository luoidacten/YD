import {CARDS,CHARMS} from './data.js';
import {SKILLS,PASSIVES} from './catalog.js';
import {ITEMS} from './expansion.js';

const skills=[
 ['SK51','Nhảy Vượt Vực','vault','Nhảy qua vực tối đa 3 ô, đáp trong cùng phòng; không vượt tường/cửa khóa.',{range:4,cd:14,mana:0}],
 ['SK52','Phá Vật Cản','smash','250% ATK lên vật cản có thể phá; cần đứng cạnh.',{range:1.8,cd:6,mana:0,power:2.5}],
 ['SK53','Dựng Khiên Chắn','bulwark','Khiên 40% HP và block 30% trong 5 giây.',{range:0,cd:18,mana:8}],
 ['SK54','Móc Cứu Hộ','hook','Kéo đồng đội gục về tối đa 4 ô trên sàn; không xuyên tường/vực.',{range:5,cd:15,mana:5}],
 ['SK55','Kích Nổ Từ Xa','detonate','100 sát thương vào thùng nổ trong LOS, tầm 8; vụ nổ gây friendly fire.',{range:8,cd:12,mana:10}],
 ['SK56','Cứu Tỉnh Khẩn Cấp','revive','Thi triển 3 giây, cứu người gục với 30% HP; bị sát thương ngắt.',{range:1.5,channel:3,cd:45,mana:20,value:.3}]
];
for(const[id,name,kind,description,config]of skills)SKILLS[id]={id,name,kind,description,counter:'Ngắt thi triển, giữ khoảng cách hoặc chặn LOS.',power:1,...config};
SKILLS.SK57={id:'SK57',name:'Đoạt Cơ Quan',kind:'trapControl',description:'Chiếm bẫy đã biết trong tầm 6, đổi phe kích hoạt trong 10 giây; CD 18s.',counter:'Rời bẫy, chờ hết hiệu lực.',range:6,cd:18,mana:8};
SKILLS.SK58={id:'SK58',name:'Kích Bẫy',kind:'trapTrigger',description:'Kích hoạt bẫy nhà đã biết, báo trước 0,7 giây; không gây sát thương xuyên tường.',counter:'Né vùng bẫy, phá tầm nhìn.',range:6,cd:12,mana:5};
const passives=[['PS51','Chân Chắc','Cạnh vực nhận anchored 80%.'],['PS52','Bậc Thầy Góc Khuất','Cạnh tường tránh 15% đòn thường tầm xa; AoE vẫn trúng.'],['PS53','Kháng Chấn','Giảm 35% sát thương vụ nổ.'],['PS54','Phá Công Sự','Thêm 50% sát thương lên vật cản có thể phá.'],['PS55','Bàn Tay Cứu Mạng','Tiến độ cứu hộ nhanh hơn 40%.'],['PS56','Cảnh Giới','Mỗi 3 giây nhận trapSense 25% trong 1 giây.']];
for(const[id,name,description]of passives)PASSIVES[id]={id,name,description,trigger:'context',counter:'Tầm nhìn và cửa khóa vẫn áp dụng.'};
PASSIVES.PS57={id:'PS57',name:'Chân Thạo Bẫy',description:'Giảm 35% sát thương nhận từ bẫy.',trigger:'onDamage',counter:'Tấn công trực tiếp.'};
PASSIVES.PS58={id:'PS58',name:'Thợ Cơ Quan',description:'Bẫy nhà đã biết trong 3 ô hồi nhanh gấp đôi.',trigger:'tick',counter:'Tấn công từ xa hoặc vô hiệu bẫy.'};
const charms=[
 ['CH31','Sức Mạnh','Sát thương vật lý +20%, túi +2, kéo lê đồng đội gục; tốc đánh −10%.',{attackSpeed:-.1}],
 ['CH32','Sợ Độ Cao','Ưu tiên đường xa mép vực; ít dùng kỹ năng vượt vực.',{}],
 ['CH33','Ám Ảnh Vụ Nổ','Tăng ưu tiên bắn thùng nổ; đánh giá nguy cơ đồng minh kém hơn.',{}],
 ['CH34','Người Cứu Nạn','Ưu tiên cứu hoặc kéo người gục +60%.',{rescue:.6}],
 ['CH35','Kẻ Canh Gác','Ưu tiên giữ chỗ nghẽn và canh người gục +50%.',{}],
 ['CH36','Kẻ Ưa Mạo Hiểm','Ít tránh bẫy đã biết, ưu tiên đường tắt qua vực.',{}]
];
for(const[id,name,description,mods]of charms)CHARMS[id]={id,name,description,mods,symbol:'✦',type:'mixed'};
CHARMS.CH37={id:'CH37',name:'Bẫy Sư',description:'Ưu tiên tận dụng bẫy; khi chủ động kích bẫy gây thêm 25% sát thương.',mods:{},symbol:'⚑',type:'positive'};
const items=[
 {id:'IT21',name:'Thuốc Hồi Sinh Cao Cấp',description:'Đứng cạnh, thi triển 2 giây, hồi 50% HP cho người gục; không cứu người chết.',kind:'revival',channel:2,value:.5,charges:1,art:'flask_big_red'},
 {id:'IT22',name:'Dây Kéo Cứu Hộ',description:'Kéo người gục tối đa 4 ô trên sàn; 3 lượt, cần LOS.',kind:'rescueRope',charges:3,slotCost:2,art:'lever_right'},
 {id:'IT23',name:'Khiên Chống Nổ',description:'Giảm 40% sát thương nổ, anchored 30%, tốc chạy −15%.',slot:'armor',blastResist:.4,speed:-.15,effects:{anchored:.3},art:'weapon_big_hammer'}
];
for(const i of items){ITEMS[i.id]=i;CARDS.push({id:i.id,kind:'item',name:i.name,description:i.description,category:'CỨU HỘ',cost:0,resource:'mana',art:i.art,tone:'gold'})}
for(const[id,name,art]of [['entrance','Cổng hầm ngục','floor_stairs'],['treasure','Phòng rương trung tâm','chest_full_open_anim_f2'],['boss','Đại sảnh cầu thang','ogre_idle_anim_f0'],['arrival','Bậc thang tầng sâu','floor_stairs']])if(!CARDS.some(c=>c.id===id))CARDS.push({id,name,kind:'room',description:'Tự chọn vị trí. Mở trận chỉ khi toàn bộ tuyến đường hợp lệ.',category:'NỀN MÓNG',cost:5,resource:'mana',art,tone:'gold'});
