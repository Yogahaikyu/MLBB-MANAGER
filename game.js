let G;
const $=id=>document.getElementById(id);
const fmt=n=>"Rp "+Math.round(n).toLocaleString("id-ID")+" jt";
const pick=a=>a[Math.floor(Math.random()*a.length)];
function makePlayers(){
 return DB.roles.map((role,i)=>({id:i,name:DB.playerNames[i],role,ovr:78+Math.floor(Math.random()*7),form:70+Math.floor(Math.random()*20),stamina:92,chem:70,salary:40+Math.floor(Math.random()*35),starter:true,contract:2,skill:{MEC:75+Math.floor(Math.random()*12),MAC:70+Math.floor(Math.random()*15),MEN:68+Math.floor(Math.random()*18)}}));
}
function newCareer(){
 G={season:2026,week:1,day:1,club:"Nusantara Phoenix",country:"Indonesia",league:"id",money:1800,fans:18000,morale:76,chem:72,facility:1,reputation:35,tactic:"balanced",players:makePlayers(),fixtures:[],news:[],history:[],trophies:[],careerSeasons:0,market:makeMarket(),records:{wins:0,losses:0,titles:0,msc:0,worlds:0}};
 generateFixtures(); G.news=["Direktur klub: target musim ini adalah finis di 4 besar.","Scout: liga internasional kini dapat dibuka lewat menu Career."]; save(false); render();
}
function makeMarket(){
 return Array.from({length:12},(_,i)=>({id:"m"+i,name:pick(DB.playerNames)+" "+pick(["Jr","X","Prime","Ace","Pro"]),role:pick(DB.roles),ovr:72+Math.floor(Math.random()*16),fee:180+Math.floor(Math.random()*420),salary:35+Math.floor(Math.random()*55),country:pick(["Indonesia","Philippines","Malaysia","Thailand","Cambodia","Brazil"])}));
}
function teamObjects(leagueId){
 let L=DB.leagues.find(x=>x.id===leagueId)||DB.leagues[0];
 return L.teams.map(t=>({name:t[0],short:t[1],power:t[2],p:0,w:0,l:0,gw:0,gl:0,pts:0}));
}
function generateFixtures(){
 let t=teamObjects("id").filter(x=>x.name!=="Nusantara Phoenix");
 // Our custom club replaces one fictional slot; other teams remain current 2026 names.
 let opponents=t.slice(0,8);
 G.fixtures=[];
 for(let r=0;r<14;r++){
  let opp=opponents[r%opponents.length];
  if(r>=7)opp=opponents[(r+3)%opponents.length];
  G.fixtures.push({week:r+1,home:r%2===0?G.club:opp.name,away:r%2===0?opp.name:G.club,played:false});
 }
}
function save(show=true){localStorage.setItem("mlbb_manager_2026",JSON.stringify(G));if(show)toast("Progress tersimpan");}
function load(){try{G=JSON.parse(localStorage.getItem("mlbb_manager_2026"))}catch(e){}if(!G)newCareer();else render()}
function toast(s){$("toast").textContent=s;$("toast").className="show";setTimeout(()=>$("toast").className="",1600)}
function avg(){return Math.round(G.players.reduce((a,p)=>a+p.ovr,0)/G.players.length+(G.chem-50)*.10+(G.facility-1)*2)}
function activePlayers(){return G.players.filter(p=>p.starter).slice(0,5)}
function teamPower(){let p=avg(),st=activePlayers().reduce((a,x)=>a+x.stamina,0)/Math.max(1,activePlayers().length);return p+(st-70)*.06+(G.morale-50)*.06+(G.chem-50)*.05}
function setPage(page){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 $(page).classList.add("active");
 document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 renderPage(page);
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>setPage(b.dataset.page));
$("save").onclick=()=>save();
$("newgame").onclick=()=>{if(confirm("Mulai karier baru? Progress lama akan hilang.")){localStorage.removeItem("mlbb_manager_2026");newCareer()}};

function render(){
 $("season").textContent="SEASON "+G.season;
 $("date").textContent="Week "+G.week+" / 14";
 renderPage(document.querySelector(".page.active").id);
}
function renderPage(p){
 if(p==="home")home();if(p==="career")career();if(p==="squad")squad();if(p==="training")training();if(p==="tactics")tactics();if(p==="leagues")leagues();if(p==="matches")matches();if(p==="market")market();if(p==="club")club();if(p==="records")records();
}
function home(){
 let next=G.fixtures.find(x=>!x.played);
 $("home").innerHTML=`<div class="hero"><div><span class="eyebrow">CAREER OVERVIEW • 2026</span><h1>${G.club}</h1><p class="muted">Bangun organisasi, kelola roster, dan taklukkan panggung global.</p></div><button class="primary" onclick="playWeek()">▶ SIMULATE WEEK</button></div>
 <div class="cards">${[
 ["TEAM OVR",avg()],["MORALE",G.morale+"%"],["CHEMISTRY",G.chem+"%"],["FANS",G.fans.toLocaleString("id-ID")],["BUDGET",fmt(G.money)],["REPUTATION",G.reputation]
 ].map(x=>`<div class="card"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join("")}</div>
 <div class="grid2"><div class="panel"><h3>Club News</h3>${G.news.slice(0,7).map(n=>`<div class="notice">${n}</div>`).join("")}</div>
 <div class="panel"><h3>Next Match</h3>${next?`<div class="big center">${next.home===G.club?next.away:next.home}</div><p class="center muted">Week ${next.week} • Regular Season • BO3</p><div class="center"><button class="primary" onclick="playWeek()">MAIN SEKARANG</button></div>`:`<div class="empty">Season selesai.</div>`}</div></div>`;
}
function career(){
 let ls=DB.leagues;
 $("career").innerHTML=`<div class="sectionhead"><div><h1>Career</h1><p class="muted">Naik dari liga domestik menuju panggung dunia.</p></div></div>
 <div class="panel"><h3>Career Ladder</h3><div class="tilegrid">${[
 ["🇮🇩 Indonesia","MPL Indonesia","Current",G.league==="id"],
 ["🌏 Southeast Asia","MSC Qualifier","Unlock via top finish",G.reputation>=50],
 ["🌐 World","M World Championship","Unlock via qualification",G.records.msc>0]
 ].map(x=>`<div class="tile"><span class="tag">${x[2]}</span><h3>${x[0]}</h3><p class="muted">${x[1]}</p><b>${x[3]?"✓ Available":"🔒 Locked"}</b></div>`).join("")}</div></div>
 <div class="panel" style="margin-top:13px"><h3>Global Leagues</h3><div class="leaguegrid">${ls.map(l=>`<div class="leaguecard"><span class="tag">${l.tier}</span><h3>${l.name}</h3><p>${l.country} • ${l.season}</p><b>${l.teams.length} teams</b></div>`).join("")}</div></div>`;
}
function squad(){
 $("squad").innerHTML=`<div class="sectionhead"><div><h1>Squad</h1><p class="muted">Starter, OVR, form, stamina, role dan kontrak.</p></div></div><div class="panel"><table class="table"><thead><tr><th>Start</th><th>Player</th><th>Role</th><th>OVR</th><th>Form</th><th>Stamina</th><th>Salary</th><th>Contract</th></tr></thead><tbody>${G.players.map(p=>`<tr><td><input type="checkbox" ${p.starter?"checked":""} onchange="toggleStart(${p.id})"></td><td><b>${p.name}</b></td><td><span class="pill2">${p.role}</span></td><td><b>${p.ovr}</b></td><td>${p.form}%</td><td>${p.stamina}%</td><td>${fmt(p.salary)}</td><td>${p.contract} yr</td></tr>`).join("")}</tbody></table></div>`;
}
function toggleStart(id){let p=G.players.find(x=>x.id===id);let count=activePlayers().length;p.starter=!p.starter;if(p.starter&&count>=5)p.starter=false;renderPage("squad")}
function training(){
 $("training").innerHTML=`<div class="sectionhead"><div><h1>Training Center Lv.${G.facility}</h1><p class="muted">Latihan meningkatkan atribut tetapi mengurangi stamina.</p></div></div><div class="tilegrid">${[
 ["Mechanical","+OVR & micro","ovr"],["Macro & Objective","+MAC","mac"],["Teamwork","+Chemistry","chem"],["Mental","+MEN & morale","men"],["Fitness","+stamina","fit"],["Rest","Recover","rest"]
 ].map(t=>`<div class="tile"><h3>${t[0]}</h3><p class="muted">${t[1]}</p><button class="actions" onclick="doTraining('${t[2]}')">TRAIN</button></div>`).join("")}</div>`;
}
function doTraining(type){
 if(type==="rest"){G.players.forEach(p=>p.stamina=Math.min(100,p.stamina+18));G.morale=Math.min(100,G.morale+3)}
 else if(type==="ovr"){G.players.forEach(p=>{if(p.starter)p.ovr=Math.min(99,p.ovr+1+Math.floor(Math.random()*2));p.stamina=Math.max(20,p.stamina-8)})}
 else if(type==="mac"){G.players.forEach(p=>p.skill.MAC=Math.min(99,p.skill.MAC+2));G.players.forEach(p=>p.stamina-=5)}
 else if(type==="chem"){G.chem=Math.min(100,G.chem+5);G.players.forEach(p=>p.chem=Math.min(100,p.chem+3));G.players.forEach(p=>p.stamina-=5)}
 else if(type==="men"){G.morale=Math.min(100,G.morale+6);G.players.forEach(p=>p.skill.MEN=Math.min(99,p.skill.MEN+2))}
 else {G.players.forEach(p=>p.stamina=Math.min(100,p.stamina+10));G.morale=Math.min(100,G.morale+1)}
 G.news.unshift("Training selesai: "+type.toUpperCase());save(false);renderPage("training");renderCardsSafe()
}
function renderCardsSafe(){if(document.querySelector(".page.active").id==="home")home()}
function tactics(){
 const T=[["balanced","Balanced","Stabil, fleksibel, risiko rendah."],["aggressive","Aggressive","Pressure tinggi; performa bisa meledak."],["objective","Objective","Fokus turtle/lord dan kontrol map."],["split","Split Map","Rotasi cepat dan tekanan side lane."],["defensive","Defensive","Aman melawan tim dengan power lebih tinggi."]];
 $("tactics").innerHTML=`<div class="sectionhead"><div><h1>Tactics</h1><p class="muted">Identitas tim memengaruhi simulasi pertandingan.</p></div></div><div class="tilegrid">${T.map(t=>`<div class="tile ${G.tactic===t[0]?"selected":""}"><span class="tag">${G.tactic===t[0]?"ACTIVE":"TACTIC"}</span><h3>${t[1]}</h3><p class="muted">${t[2]}</p><button onclick="setTactic('${t[0]}')">${G.tactic===t[0]?"SELECTED":"USE TACTIC"}</button></div>`).join("")}</div>`;
}
function setTactic(t){G.tactic=t;G.news.unshift("Taktik berubah menjadi "+t+".");save(false);renderPage("tactics")}
function leagues(){
 $("leagues").innerHTML=`<div class="sectionhead"><div><h1>Global Leagues • 2026</h1><p class="muted">Database liga dan tim untuk mode simulasi.</p></div></div><div class="leaguegrid">${DB.leagues.map(l=>`<div class="leaguecard"><span class="tag">${l.tier}</span><h3>${l.name}</h3><p>${l.country} • ${l.season}</p>${l.teams.slice(0,5).map((t,i)=>`<div class="row"><span>${i+1}. ${t[0]}</span><b>${t[2]}</b></div>`).join("")}<div class="small muted" style="margin-top:10px">+ ${Math.max(0,l.teams.length-5)} tim lainnya</div></div>`).join("")}</div>`;
}
function matches(){
 let arr=G.fixtures;
 $("matches").innerHTML=`<div class="sectionhead"><div><h1>Schedule</h1><p class="muted">Regular season • BO3</p></div><button class="primary" onclick="playWeek()">SIMULATE NEXT</button></div><div class="panel">${arr.map(m=>`<div class="match"><div><span class="tag">W${m.week}</span></div><div class="fixture">${m.home} <span class="muted">vs</span> ${m.away}</div><div>${m.played?`<b class="${m.result.startsWith("W")?"win":"loss"}">${m.result}</b>`:"<span class='muted'>Upcoming</span>"}</div></div>`).join("")}</div>`;
}
function market(){
 $("market").innerHTML=`<div class="sectionhead"><div><h1>Transfer Market</h1><p class="muted">Scout pemain global. Fee dibayar dari budget klub.</p></div></div><div class="playergrid">${G.market.map(p=>`<div class="player"><div class="playerTop"><div><h3>${p.name}</h3><span class="tag">${p.role}</span></div><div class="ovr">${p.ovr}</div></div><p class="muted">${p.country}</p><div class="bars"><div class="barline"><span>OVR</span><div class="bar"><i style="width:${p.ovr}%"></i></div><b>${p.ovr}</b></div></div><div class="row"><span>Transfer</span><b class="money">${fmt(p.fee)}</b></div><button style="width:100%;margin-top:10px" onclick="buy('${p.id}')">SIGN PLAYER</button></div>`).join("")}</div>`;
}
function buy(id){
 let p=G.market.find(x=>x.id===id);if(!p)return;if(G.money<p.fee){toast("Budget tidak cukup.");return}
 G.money-=p.fee;G.players.push({id:Date.now(),name:p.name,role:p.role,ovr:p.ovr,form:75,stamina:90,chem:65,salary:p.salary,starter:false,contract:3,skill:{MEC:p.ovr-2,MAC:p.ovr-4,MEN:p.ovr-3}});
 G.chem=Math.max(0,G.chem-3);G.market=G.market.filter(x=>x.id!==id);G.news.unshift("Transfer sukses: "+p.name);save(false);renderPage("market")
}
function club(){
 let cost=350+G.facility*300;
 $("club").innerHTML=`<div class="sectionhead"><div><h1>Club Management</h1><p class="muted">Ekonomi, fasilitas, fans, dan reputasi.</p></div></div><div class="grid2"><div class="panel"><h3>Facilities</h3>
 <div class="row"><div><b>Training Center</b><div class="muted small">Lv.${G.facility} • bonus training</div></div><button onclick="upgrade()">Upgrade ${fmt(cost)}</button></div>
 <div class="row"><div><b>Scouting Network</b><div class="muted small">Pasar transfer lebih berkualitas.</div></div><span class="tag">Lv.${Math.max(1,G.facility-1)}</span></div>
 <div class="row"><div><b>Performance Lab</b><div class="muted small">Analisis lawan & taktik.</div></div><span class="tag">Lv.${G.facility}</span></div></div>
 <div class="panel"><h3>Club Health</h3><div class="statline"><span>Morale</span><div class="progress"><i style="width:${G.morale}%"></i></div><b>${G.morale}</b></div><div class="statline"><span>Chemistry</span><div class="progress"><i style="width:${G.chem}%"></i></div><b>${G.chem}</b></div><div class="statline"><span>Reputation</span><div class="progress"><i style="width:${Math.min(100,G.reputation)}%"></i></div><b>${G.reputation}</b></div></div></div>`;
}
function upgrade(){let c=350+G.facility*300;if(G.money<c){toast("Budget tidak cukup.");return}G.money-=c;G.facility++;G.news.unshift("Training Center upgrade ke Lv."+G.facility);save(false);club()}
function records(){
 $("records").innerHTML=`<div class="sectionhead"><div><h1>Records</h1><p class="muted">Riwayat karier manager.</p></div></div><div class="cards">${[["WINS",G.records.wins],["LOSSES",G.records.losses],["TITLES",G.records.titles],["MSC QUAL",G.records.msc],["WORLD APPEARANCES",G.records.worlds],["SEASONS",G.careerSeasons]].map(x=>`<div class="card"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join("")}</div><div class="panel"><h3>Career History</h3>${G.history.length?G.history.slice(0,20).map(x=>`<div class="row"><span>Season ${x.season} • ${x.text}</span><b>${x.result||""}</b></div>`).join(""):"<div class='empty'>Belum ada sejarah.</div>"}</div>`;
}
function playWeek(){
 let m=G.fixtures.find(x=>!x.played);if(!m){finishSeason();return}
 let oppName=m.home===G.club?m.away:m.home;
 let opp=DB.leagues.find(l=>l.id==="id").teams.find(t=>t[0]===oppName);
 let op=opp?opp[2]:80;
 let bonus={balanced:1,aggressive:3,objective:2,split:1,defensive:-1}[G.tactic];
 let p=teamPower()+bonus;
 if(G.tactic==="defensive"&&op>p)p+=3;
 let chance=1/(1+Math.exp(-(p-op)/6.5));
 let win=Math.random()<chance;
 let close=Math.random()<.45;
 let score=win?(close?"2-1":"2-0"):(close?"1-2":"0-2");
 m.played=true;m.result=(win?"W ":"L ")+score;
 G.players.forEach(x=>{x.stamina=Math.max(20,x.stamina-(7+Math.floor(Math.random()*8)));x.form=Math.max(45,Math.min(99,x.form+(win?3:-3)))});
 if(win){G.money+=120;G.fans+=Math.floor(300+Math.random()*500);G.morale=Math.min(100,G.morale+5);G.reputation=Math.min(100,G.reputation+2);G.records.wins++}
 else {G.money+=55;G.fans+=50;G.morale=Math.max(0,G.morale-5);G.records.losses++}
 G.chem=Math.max(0,Math.min(100,G.chem+(win?1:-1)));
 G.news.unshift(`${win?"🔥 WIN":"⚠️ LOSS"} vs ${oppName} ${score} • ${G.tactic.toUpperCase()}`);
 G.history.unshift({season:G.season,text:`Week ${G.week} vs ${oppName}`,result:m.result});
 G.week++;
 if(G.week>14)finishSeason();
 save(false);render();
}
function finishSeason(){
 let wins=G.records.wins%100; // global record only
 let localWins=G.fixtures.filter(x=>x.played&&x.result.startsWith("W")).length;
 let pos=localWins>=10?1:localWins>=8?3:localWins>=6?5:7;
 let bonus=pos<=4?600:250;
 G.money+=bonus;G.fans+=pos<=4?1500:500;G.reputation=Math.min(100,G.reputation+(pos<=4?8:2));
 G.news.unshift(`🏁 Season ${G.season} selesai. Estimasi posisi: ${pos}. Bonus ${fmt(bonus)}.`);
 if(pos<=4){G.records.titles += pos===1?1:0;if(pos===1)G.trophies.push("MPL Indonesia "+G.season);G.records.msc++}
 G.careerSeasons++;G.season++;G.week=1;G.facility=Math.min(5,G.facility);G.players.forEach(p=>{p.stamina=100;p.form=75;p.contract=Math.max(1,p.contract-1)});generateFixtures();G.market=makeMarket();
}
load();