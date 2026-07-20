const DEFAULT_CRESTS=[
  "imagenes/escudos_equipos/atletico_lesterol_512x512.png",
  "imagenes/escudos_equipos/aubameyang_y_10_mas_transparent_512x512.png",
  "imagenes/escudos_equipos/mariscos_recio_transparent_512x512.png",
  "imagenes/escudos_equipos/maccabi_de_levantar_transparent_512x512.png",
  "imagenes/escudos_equipos/recreativo_de_juerga_transparent_512x512.png",
  "imagenes/escudos_equipos/renacidos_cf_transparent_512x512.png",
  "imagenes/escudos_equipos/sporting_de_finidi_transparent_v2_512x512.png",
  "imagenes/escudos_equipos/moleiros_team_transparent_512x512.png",
  "imagenes/escudos_equipos/los_pridecines_transparent_v5_512x512.png",
  "imagenes/escudos_equipos/ozempic_de_leon_transparent_512x512.png",
  "imagenes/escudos_equipos/equipo_11_transparent_512x512.png",
  "imagenes/escudos_equipos/aston_birra_transparent_512x512.png"
];
const DEFAULT_CLUBS=Array.from({length:12},(_,i)=>({
  name:i===0?"Atlético Lesterol":`Equipo ${i+1}`,
  manager:"Por asignar",
  points:0,
  pointsApertura:0,
  pointsClausura:0,
  pointsGeneral:0,
  crest:DEFAULT_CRESTS[i],
  badges:Array.from({length:4},()=>({name:"",image:""})),
  players:Array.from({length:25},()=>({name:"",position:"Medio",marketValue:"",clause:"",points:0})),
  matchdays:Array.from({length:38},()=>0),
  playerHistory:[],
  lineups:Array.from({length:38},()=>Array.from({length:11},()=>({name:"",points:0}))),
  formations:Array.from({length:38},()=>"1-4-3-3"),
  transfers:[],
  initialBalance:0
}));
const DEFAULT_DATA={league:"RONDA FINAL",season:"2026 / 2027",welcome:"",clubs:DEFAULT_CLUBS};
const STORAGE_KEY="universoFantasyData";
const PASSWORD_KEY="universoFantasyPassword";
let data=loadData();
let currentClubIndex=0;

function loadData(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
    let clubs=saved.clubs;
    if(!clubs&&Array.isArray(saved.teams)) clubs=saved.teams.map(name=>({name,manager:"Por asignar",points:0,crest:""}));
    clubs=DEFAULT_CLUBS.map((fallback,i)=>{const club={...fallback,...(clubs?.[i]||{})};if(club.pointsGeneral===0&&club.points)club.pointsGeneral=club.points;club.badges=Array.from({length:4},(_,b)=>({...fallback.badges[b],...(club.badges?.[b]||{})}));club.players=Array.from({length:25},(_,p)=>({...fallback.players[p],...(club.players?.[p]||{})}));club.matchdays=Array.from({length:38},(_,j)=>Number(club.matchdays?.[j])||0);club.playerHistory=Array.isArray(club.playerHistory)?club.playerHistory:[];club.lineups=Array.from({length:38},(_,j)=>Array.from({length:11},(_,p)=>({name:club.lineups?.[j]?.[p]?.name||"",points:Number(club.lineups?.[j]?.[p]?.points)||0})));club.formations=Array.from({length:38},(_,j)=>club.formations?.[j]||"1-4-3-3");club.transfers=Array.isArray(club.transfers)?club.transfers:[];club.initialBalance=Number(club.initialBalance)||0;return club});
    const merged={...DEFAULT_DATA,...saved,clubs};if(merged.season==="2026 / 27")merged.season="2026 / 2027";if(merged.league==="UNIVERSO")merged.league="RONDA FINAL";return merged;
  }catch{return {...DEFAULT_DATA,clubs:DEFAULT_CLUBS.map(c=>({...c}))}}
}
function esc(value){const d=document.createElement("div");d.textContent=value;return d.innerHTML}
function initials(name,index){const words=name.trim().split(/\s+/);return words.length>1?words.slice(0,2).map(w=>w[0]).join("").toUpperCase():(name.slice(0,2)||`E${index+1}`).toUpperCase()}
function crestMarkup(club,index,className="crest"){
  return club.crest?`<img class="${className} has-image" src="${esc(club.crest)}" alt="Escudo de ${esc(club.name)}">`:`<span class="${className} ${className==='mini-crest'?'mini-fallback':''}">${esc(initials(club.name,index))}</span>`;
}
function standingsMarkup(pointsField){
  const ranked=data.clubs.map((club,index)=>({club,index})).sort((a,b)=>Number(b.club[pointsField])-Number(a.club[pointsField])||a.index-b.index);
  return ranked.map(({club,index},position)=>`<a class="standing-row" href="#club/${index}" data-club="${index}"><div class="standing-club"><span class="position">${String(position+1).padStart(2,"0")}</span>${crestMarkup(club,index,"mini-crest")}<span class="standing-name"><strong>${esc(club.name)}</strong><small>Manager · ${esc(club.manager)}</small></span></div><span class="standing-points"><b>${Number(club[pointsField])||0}</b><small>PTS</small></span></a>`).join("");
}
function compactStandingsMarkup(pointsField){const ranked=data.clubs.map((club,index)=>({club,index})).sort((a,b)=>Number(b.club[pointsField])-Number(a.club[pointsField])||a.index-b.index);return ranked.map(({club,index},position)=>`<a class="compact-standing-row" href="#club/${index}" data-club="${index}"><span class="compact-position">${String(position+1).padStart(2,"0")}</span>${club.crest?`<img class="compact-crest" src="${esc(club.crest)}" alt="">`:`<span class="compact-crest compact-fallback">${esc(initials(club.name,index))}</span>`}<strong class="compact-name">${esc(club.name)}</strong><span class="compact-points">${Number(club[pointsField])||0}<small>PTS</small></span></a>`).join("")}
function positionCode(position){return {Portero:"POR",Defensa:"DEF",Medio:"MED",Delantero:"DEL"}[position]||"MED"}
function positionClass(position){return {Portero:"gk",Defensa:"df",Medio:"mf",Delantero:"fw"}[position]||"mf"}
function squadMarkup(club){return club.players.map((player,i)=>`<tr class="${player.name?'':'empty-player'}"><td class="squad-number">${String(i+1).padStart(2,"0")}</td><td class="player-name">${esc(player.name||`Jugador ${i+1}`)}</td><td><span class="position-tag ${positionClass(player.position)}">${positionCode(player.position)}</span></td><td class="money-value">${esc(player.marketValue||"—")}</td><td class="money-value">${esc(player.clause||"—")}</td><td class="points-value">${Number(player.points)||0}</td></tr>`).join("")}
function playersEditorMarkup(club){return `<details class="squad-editor"><summary>Plantilla de 25 jugadores</summary><p class="players-help">Introduce las cantidades con la unidad que prefieras, por ejemplo: 12 M€ o 850.000 €.</p><div class="players-editor">${club.players.map((player,p)=>`<div class="player-editor-row" data-player="${p}"><span>${String(p+1).padStart(2,"0")}</span><label>Jugador<input data-player-field="name" value="${esc(player.name)}" maxlength="40"></label><label>Posición<select data-player-field="position">${["Portero","Defensa","Medio","Delantero"].map(pos=>`<option ${player.position===pos?'selected':''}>${pos}</option>`).join("")}</select></label><label>Valor mercado<input data-player-field="marketValue" value="${esc(player.marketValue)}" maxlength="20"></label><label>Cláusula<input data-player-field="clause" value="${esc(player.clause)}" maxlength="20"></label><label>Puntos<input data-player-field="points" type="number" value="${Number(player.points)||0}"></label></div>`).join("")}</div></details>`}
const FORMATIONS=["1-4-4-2","1-4-3-3","1-3-4-3","1-3-3-4","1-5-3-2","1-5-4-1","1-4-5-1","1-3-5-2"];
function formationSpots(formation){const lines=formation.split("-").slice(1).map(Number),xs=lines.length===2?[36,76]:[29,55,82],spots=[{x:8,y:50,pos:"gk"}];lines.forEach((count,line)=>{for(let p=0;p<count;p++)spots.push({x:xs[line],y:(p+1)*100/(count+1),pos:line===0?"df":line===lines.length-1?"fw":"mf"})});return spots}
function renderLineup(club,jornada){const lineup=club.lineups[jornada],formation=club.formations[jornada],spots=formationSpots(formation);const markings=`<div class="field-markings"><i class="penalty-box left"></i><i class="goal-box left"></i><i class="penalty-box right"></i><i class="goal-box right"></i><i class="center-dot"></i></div>`;document.getElementById("footballField").innerHTML=markings+lineup.map((player,i)=>{const spot=spots[i];return `<div class="lineup-player ${spot.pos}" style="--x:${spot.x}%;--y:${spot.y}%"><span class="player-token">${i+1}</span><strong>${esc(player.name||`Jugador ${i+1}`)}</strong><small>${Number(player.points)||0} PTS</small></div>`}).join("");document.getElementById("lineupFormation").textContent=formation;document.getElementById("lineupTotal").textContent=lineup.reduce((sum,p)=>sum+(Number(p.points)||0),0)}
function lineupAdminRows(club,jornada){return club.lineups[jornada].map((player,p)=>`<div class="admin-lineup-player" data-lineup-player="${p}"><span>${p+1}</span><label>Jugador<input data-lineup-field="name" value="${esc(player.name)}" maxlength="40"></label><label>Puntos<input data-lineup-field="points" type="number" step="0.01" value="${Number(player.points)||0}"></label></div>`).join("")}
function lineupEditorMarkup(club,i){return `<details class="lineup-admin"><summary>Alineaciones por jornada</summary><div class="admin-lineup-toolbar"><label>Jornada<select data-lineup-select="${i}">${Array.from({length:38},(_,j)=>`<option value="${j}">Jornada ${j+1}</option>`).join("")}</select></label><label>Formación<select data-formation-select="${i}">${FORMATIONS.map(f=>`<option ${club.formations[0]===f?'selected':''}>${f}</option>`).join("")}</select></label></div><div class="admin-lineup-grid">${lineupAdminRows(club,0)}</div></details>`}
function numericPrice(value){if(typeof value==="number")return value;return Number(String(value||0).replace(/[^0-9,.-]/g,"").replace(",","."))||0}
function formatMoney(value){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(Number(value)||0)}
function transferEditorRow(item={player:"",type:"Comprado",price:0}){return `<div class="transfer-editor-row"><label>Jugador<input data-transfer-field="player" value="${esc(item.player)}" maxlength="40"></label><label>Operación<select data-transfer-field="type"><option ${item.type==="Comprado"?'selected':''}>Comprado</option><option ${item.type==="Vendido"?'selected':''}>Vendido</option></select></label><label class="transfer-price-input">Precio<input data-transfer-field="price" type="number" min="0" step="1" value="${numericPrice(item.price)}"></label><button class="transfer-remove" type="button">×</button></div>`}
function transfersEditorMarkup(club){return `<details class="transfers-admin"><summary>Economía, compras y ventas</summary><div class="balance-admin"><label>Saldo inicial (€)<input data-initial-balance type="number" min="0" step="1" value="${Number(club.initialBalance)||0}"></label><p>Las compras restan y las ventas suman automáticamente al saldo del manager.</p></div><div class="transfers-editor-list">${club.transfers.map(transferEditorRow).join("")}</div><button class="transfer-add" type="button">＋ AÑADIR OPERACIÓN</button></details>`}
function renderTransfers(club){const items=club.transfers.filter(t=>t.player);document.getElementById("transfersList").innerHTML=items.map((item,i)=>`<tr><td class="transfer-number">${String(i+1).padStart(2,"0")}</td><td class="transfer-player">${esc(item.player)}</td><td><span class="transfer-type ${item.type==='Vendido'?'sell':'buy'}">${esc(item.type)}</span></td><td class="transfer-price">${formatMoney(numericPrice(item.price))}</td></tr>`).join("");document.getElementById("transfersEmpty").hidden=items.length>0;document.querySelector(".transfers-table").hidden=items.length===0;const movement=items.reduce((sum,item)=>sum+(item.type==="Vendido"?numericPrice(item.price):-numericPrice(item.price)),0);document.getElementById("managerBalance").textContent=formatMoney(club.initialBalance+movement);document.getElementById("balanceMovement").textContent=`Inicial ${formatMoney(club.initialBalance)} · Movimientos ${movement>=0?'+':''}${formatMoney(movement)}`}
function matchdaysEditorMarkup(club){const block=(start,end,title)=>`<div class="admin-round"><span class="admin-round-title">${title}</span>${club.matchdays.slice(start,end).map((points,offset)=>{const j=start+offset;return `<label>Jornada ${j+1}<input data-matchday="${j}" type="number" step="0.01" value="${Number(points)||0}"></label>`}).join("")}</div>`;return `<details class="matchdays-editor"><summary>Puntos por jornada</summary><p class="matchday-help">Registra la puntuación numérica de Apertura y Clausura.</p><div class="matchday-inputs">${block(0,19,"Apertura · J1–J19")}${block(19,38,"Clausura · J20–J38")}</div></details>`}
function historyEditorMarkup(club){return `<details class="history-editor"><summary>Histórico de jugadores utilizados</summary><p class="matchday-help">Añade todos los futbolistas que hayan participado con el club, aunque ya no estén en la plantilla.</p><div class="history-editor-list">${club.playerHistory.map(player=>historyEditorRow(player)).join("")}</div><button class="history-add" type="button">＋ AÑADIR JUGADOR AL HISTÓRICO</button></details>`}
function historyEditorRow(player={name:"",points:0}){return `<div class="history-editor-row"><label>Jugador<input data-history-field="name" value="${esc(player.name)}" maxlength="40"></label><label>Puntos<input data-history-field="points" type="number" step="0.01" value="${Number(player.points)||0}"></label><button class="history-remove" type="button" aria-label="Eliminar">×</button></div>`}
function renderHistory(club){const direction=document.getElementById("historySort").value==="asc"?1:-1;const players=[...club.playerHistory].filter(p=>p.name).sort((a,b)=>(Number(a.points)-Number(b.points))*direction||a.name.localeCompare(b.name));document.getElementById("historyList").innerHTML=players.map((player,i)=>`<tr><td class="history-rank">${String(i+1).padStart(2,"0")}</td><td class="history-name">${esc(player.name)}</td><td class="history-points">${Number(player.points)||0}<small>PTS</small></td></tr>`).join("");document.getElementById("historyEmpty").hidden=players.length>0;document.querySelector(".history-table").hidden=players.length===0}
function renderMatchdays(club){const values=club.matchdays.map(Number);document.getElementById("matchdaysTotal").textContent=values.reduce((sum,value)=>sum+value,0).toLocaleString("es-ES");const best=Math.max(...values),worst=Math.min(...values),bestIndex=values.indexOf(best),worstIndex=values.indexOf(worst);document.getElementById("bestMatchdayPoints").textContent=best;document.getElementById("worstMatchdayPoints").textContent=worst;document.getElementById("bestMatchdayLabel").textContent=`Jornada ${bestIndex+1}`;document.getElementById("worstMatchdayLabel").textContent=`Jornada ${worstIndex+1}`;const max=Math.max(10,...values);const roundedMax=Math.ceil(max/10)*10;document.getElementById("chartScale").innerHTML=`<span>${roundedMax}</span><span>${Math.round(roundedMax*.75)}</span><span>${Math.round(roundedMax*.5)}</span><span>${Math.round(roundedMax*.25)}</span><span>0</span>`;document.getElementById("matchdaysChart").innerHTML=values.map((points,j)=>`<div class="chart-column"><div class="chart-bar" style="height:${Math.max(0,points)/roundedMax*100}%" data-tooltip="J${j+1}: ${points} pts"></div><span class="chart-label">${j+1}</span></div>`).join("");const rows=(start,end)=>values.slice(start,end).map((points,offset)=>{const jornada=start+offset+1;return `<div class="round-row"><span class="round-number">JORNADA ${jornada}</span><strong class="round-score">${points}<small>PTS</small></strong></div>`}).join("");document.getElementById("aperturaMatchdays").innerHTML=rows(0,19);document.getElementById("clausuraMatchdays").innerHTML=rows(19,38)}
function render(){
  document.getElementById("brandName").textContent=data.league;
  document.getElementById("seasonText").textContent=data.season;
  document.getElementById("welcomeText").textContent=data.welcome;
  document.title=data.league;
  document.getElementById("teamsGrid").innerHTML=data.clubs.map((club,i)=>`<a class="team-card" href="#club/${i}" data-club="${i}"><span class="team-number">${String(i+1).padStart(2,"0")}</span>${crestMarkup(club,i)}<h3>${esc(club.name)}</h3><div class="card-manager"><span>MANAGER</span><strong>${esc(club.manager)}</strong></div><span class="team-arrow">→</span></a>`).join("");
  document.getElementById("standingsList").innerHTML=standingsMarkup("pointsGeneral");
  document.getElementById("aperturaHomeList").innerHTML=compactStandingsMarkup("pointsApertura");
  document.getElementById("clausuraHomeList").innerHTML=compactStandingsMarkup("pointsClausura");
  document.getElementById("aperturaList").innerHTML=standingsMarkup("pointsApertura");
  document.getElementById("clausuraList").innerHTML=standingsMarkup("pointsClausura");
  document.getElementById("generalList").innerHTML=standingsMarkup("pointsGeneral");
  renderTeamEditors();
  renderBadgeLibraries();
}
const BADGE_PRESETS={fundador:{name:"Equipo Fundador",image:"imagenes/insignias/equipo_fundador_512.png"},mejor:{name:"Mejor Jornada",image:"imagenes/insignias/mejor_jornada_512.png"},peor:{name:"Peor Jornada",image:"imagenes/insignias/peor_jornada_512.png"}};
function renderBadgeLibraries(){document.querySelectorAll(".badge-editor").forEach((details,i)=>{const buttons=Object.entries(BADGE_PRESETS).map(([key,badge])=>`<button class="badge-preset" type="button" data-badge-preset="${key}" data-club="${i}"><img src="${badge.image}" alt="">${badge.name}</button>`).join("");const library=`<div class="badge-library"><small>INSIGNIAS DISPONIBLES</small>${buttons}</div>`;details.querySelector("summary").insertAdjacentHTML("afterend",library)})}
function renderTeamEditors(){
  document.getElementById("teamInputs").innerHTML=data.clubs.map((club,i)=>`<div class="team-editor" data-editor="${i}"><span class="team-editor-title">CLUB ${String(i+1).padStart(2,"0")}</span>${club.crest?`<img class="upload-preview" src="${esc(club.crest)}" alt="">`:""}<label>Nombre<input data-field="name" value="${esc(club.name)}" maxlength="32"></label><label>Manager<input data-field="manager" value="${esc(club.manager)}" maxlength="40"></label><div class="points-editor"><label>Apertura<input data-field="pointsApertura" type="number" min="0" step="1" value="${Number(club.pointsApertura)||0}"></label><label>Clausura<input data-field="pointsClausura" type="number" min="0" step="1" value="${Number(club.pointsClausura)||0}"></label><label>Liga General<input data-field="pointsGeneral" type="number" min="0" step="1" value="${Number(club.pointsGeneral)||0}"></label></div><label>Escudo 512 × 512<input data-crest-input="${i}" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="upload-help">PNG, JPG o WebP. Recomendado: 512 × 512 y menos de 1 MB.</p><details class="badge-editor"><summary>Insignias del club</summary>${club.badges.map((badge,b)=>`<div class="badge-field">${badge.image?`<img src="${esc(badge.image)}" alt="">`:""}<label>Insignia ${b+1}<input data-badge-name="${b}" value="${esc(badge.name)}" placeholder="Ej: Equipo Fundador" maxlength="32"></label><label>Icono<input data-badge-input="${i}:${b}" type="file" accept="image/png,image/jpeg,image/webp"></label></div>`).join("")}</details>${lineupEditorMarkup(club,i)}${transfersEditorMarkup(club)}${matchdaysEditorMarkup(club)}${historyEditorMarkup(club)}</div>`).join("");
}
function navigate(route){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const isClub=route.startsWith("club/");
  const target=isClub?"club":(["inicio","equipos","apertura","clausura","liga-general"].includes(route)?route:"inicio");
  document.getElementById(target).classList.add("active");
  document.querySelectorAll(".nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===target));
  if(isClub){
    const index=Number(route.split("/")[1]);const club=data.clubs[index];
    if(club){currentClubIndex=index;
      document.getElementById("clubName").textContent=club.name;
      document.getElementById("clubManager").textContent=club.manager;
      const lineupSelect=document.getElementById("lineupMatchday");lineupSelect.innerHTML=Array.from({length:38},(_,j)=>`<option value="${j}">Jornada ${j+1}</option>`).join("");lineupSelect.value=0;renderLineup(club,0);renderTransfers(club);
      renderMatchdays(club);
      renderHistory(club);
      const activeBadges=club.badges.filter(b=>b.name||b.image);document.getElementById("clubBadges").innerHTML=activeBadges.length?activeBadges.map(b=>`<div class="club-badge">${b.image?`<img src="${esc(b.image)}" alt="${esc(b.name||'Insignia')}">`:`<span class="badge-placeholder">★</span>`}<strong>${esc(b.name||"Insignia")}</strong></div>`).join(""):`<div class="badges-empty"><span>＋</span><p>Las insignias por hitos del club aparecerán aquí.</p></div>`;
      const crest=document.getElementById("clubCrest");crest.textContent=club.crest?"":initials(club.name,index);crest.classList.toggle("has-image",Boolean(club.crest));crest.style.backgroundImage=club.crest?`url("${club.crest}")`:"";crest.style.backgroundSize="contain";crest.style.backgroundPosition="center";crest.style.backgroundRepeat="no-repeat";
    }
  }
  document.getElementById("mainNav").classList.remove("open");window.scrollTo(0,0);
}
document.addEventListener("click",e=>{const route=e.target.closest("[data-route]");if(route){e.preventDefault();location.hash=route.dataset.route}const club=e.target.closest("[data-club]");if(club){e.preventDefault();location.hash=`club/${club.dataset.club}`}});
window.addEventListener("hashchange",()=>navigate(location.hash.slice(1)||"inicio"));
document.getElementById("historySort").addEventListener("change",()=>renderHistory(data.clubs[currentClubIndex]));
document.getElementById("lineupMatchday").addEventListener("change",e=>renderLineup(data.clubs[currentClubIndex],Number(e.target.value)));
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));

const modal=document.getElementById("adminModal");
function openModal(){modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.getElementById("password").focus()}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.getElementById("loginError").textContent=""}
function enterAdmin(){
  document.getElementById("loginView").hidden=true;document.getElementById("editorView").hidden=false;
  document.getElementById("editLeague").value=data.league;document.getElementById("editSeason").value=data.season;document.getElementById("editWelcome").value=data.welcome;renderTeamEditors();renderBadgeLibraries();
}
window.enterAdmin=enterAdmin;
document.getElementById("adminOpen").addEventListener("click",openModal);
document.getElementById("adminClose").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
document.getElementById("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();const password=document.getElementById("password").value,errorBox=document.getElementById("loginError");
  if(window.remoteEnabled){try{await remoteLogin(password)}catch(error){errorBox.textContent=error.message||"No se pudo iniciar sesión.";return}}
  else{const saved=localStorage.getItem(PASSWORD_KEY)||"cambiar-esta-clave";if(password!==saved){errorBox.textContent="Contraseña incorrecta.";return}}
  enterAdmin();
});
document.getElementById("teamInputs").addEventListener("change",async e=>{
  const input=e.target.closest("[data-crest-input],[data-badge-input]");if(!input||!input.files[0])return;
  const file=input.files[0];
  if(file.size>1500000){alert("El archivo es demasiado grande. Usa una imagen de menos de 1,5 MB.");input.value="";return}
  if(window.remoteEnabled){try{const isCrest=input.hasAttribute("data-crest-input"),assetUrl=await uploadLeagueAsset(file,isCrest?"escudos":"insignias");if(isCrest){data.clubs[Number(input.dataset.crestInput)].crest=assetUrl;const old=input.closest(".team-editor").querySelector(".upload-preview");if(old)old.remove();const preview=document.createElement("img");preview.className="upload-preview";preview.src=assetUrl;input.closest(".team-editor").prepend(preview)}else{const [clubIndex,badgeIndex]=input.dataset.badgeInput.split(":").map(Number);data.clubs[clubIndex].badges[badgeIndex].image=assetUrl;const field=input.closest(".badge-field"),old=field.querySelector("img");if(old)old.remove();const preview=document.createElement("img");preview.src=assetUrl;field.prepend(preview)}return}catch(error){alert(`No se pudo subir la imagen: ${error.message}`);return}}
  const image=new Image();const reader=new FileReader();
  reader.onload=()=>{image.onload=()=>{if(input.hasAttribute("data-crest-input")){if(image.width!==512||image.height!==512){alert(`El escudo mide ${image.width} × ${image.height}. Se recomienda 512 × 512, aunque puedes guardarlo igualmente.`)}data.clubs[Number(input.dataset.crestInput)].crest=reader.result;const old=input.closest(".team-editor").querySelector(".upload-preview");if(old)old.remove();const preview=document.createElement("img");preview.className="upload-preview";preview.src=reader.result;input.closest(".team-editor").prepend(preview)}else{const [clubIndex,badgeIndex]=input.dataset.badgeInput.split(":").map(Number);data.clubs[clubIndex].badges[badgeIndex].image=reader.result;const field=input.closest(".badge-field");const old=field.querySelector("img");if(old)old.remove();const preview=document.createElement("img");preview.src=reader.result;field.prepend(preview)}};image.src=reader.result};reader.readAsDataURL(file);
});
document.getElementById("teamInputs").addEventListener("change",e=>{const select=e.target.closest("[data-lineup-select]");if(select){const editor=select.closest("[data-editor]"),club=data.clubs[Number(editor.dataset.editor)],jornada=Number(select.value);editor.querySelector(".admin-lineup-grid").innerHTML=lineupAdminRows(club,jornada);editor.querySelector("[data-formation-select]").value=club.formations[jornada];return}const formation=e.target.closest("[data-formation-select]");if(formation){const editor=formation.closest("[data-editor]"),jornada=Number(editor.querySelector("[data-lineup-select]").value);data.clubs[Number(editor.dataset.editor)].formations[jornada]=formation.value}});
document.getElementById("teamInputs").addEventListener("input",e=>{const input=e.target.closest("[data-lineup-field]");if(!input)return;const editor=input.closest("[data-editor]"),playerRow=input.closest("[data-lineup-player]"),jornada=Number(editor.querySelector("[data-lineup-select]").value);const player=data.clubs[Number(editor.dataset.editor)].lineups[jornada][Number(playerRow.dataset.lineupPlayer)];player[input.dataset.lineupField]=input.dataset.lineupField==="points"?Number(input.value)||0:input.value});
document.getElementById("teamInputs").addEventListener("click",e=>{const preset=e.target.closest("[data-badge-preset]");if(preset){const club=data.clubs[Number(preset.dataset.club)],badge=club.badges.find(b=>!b.name&&!b.image),selected=BADGE_PRESETS[preset.dataset.badgePreset];if(!badge){alert("Este club ya tiene ocupadas sus cuatro insignias.");return}badge.name=selected.name;badge.image=selected.image;renderTeamEditors();renderBadgeLibraries();return}const add=e.target.closest(".history-add");if(add){add.previousElementSibling.insertAdjacentHTML("beforeend",historyEditorRow());return}const remove=e.target.closest(".history-remove");if(remove){remove.closest(".history-editor-row").remove();return}const transferAdd=e.target.closest(".transfer-add");if(transferAdd){transferAdd.previousElementSibling.insertAdjacentHTML("beforeend",transferEditorRow());return}const transferRemove=e.target.closest(".transfer-remove");if(transferRemove)transferRemove.closest(".transfer-editor-row").remove()});
document.getElementById("editorForm").addEventListener("submit",async e=>{
  e.preventDefault();data.league=document.getElementById("editLeague").value.trim()||DEFAULT_DATA.league;data.season=document.getElementById("editSeason").value.trim()||DEFAULT_DATA.season;data.welcome=document.getElementById("editWelcome").value.trim()||DEFAULT_DATA.welcome;
  document.querySelectorAll("[data-editor]").forEach(editor=>{const index=Number(editor.dataset.editor);data.clubs[index].name=editor.querySelector('[data-field="name"]').value.trim()||`Equipo ${index+1}`;data.clubs[index].manager=editor.querySelector('[data-field="manager"]').value.trim()||"Por asignar";["pointsApertura","pointsClausura","pointsGeneral"].forEach(field=>data.clubs[index][field]=Math.max(0,Number(editor.querySelector(`[data-field="${field}"]`).value)||0));editor.querySelectorAll("[data-badge-name]").forEach(input=>data.clubs[index].badges[Number(input.dataset.badgeName)].name=input.value.trim());editor.querySelectorAll("[data-player]").forEach(row=>{const player=data.clubs[index].players[Number(row.dataset.player)];row.querySelectorAll("[data-player-field]").forEach(input=>player[input.dataset.playerField]=input.dataset.playerField==="points"?Number(input.value)||0:input.value.trim())});editor.querySelectorAll("[data-matchday]").forEach(input=>data.clubs[index].matchdays[Number(input.dataset.matchday)]=Number(input.value)||0);data.clubs[index].playerHistory=[...editor.querySelectorAll(".history-editor-row")].map(row=>({name:row.querySelector('[data-history-field="name"]').value.trim(),points:Number(row.querySelector('[data-history-field="points"]').value)||0})).filter(player=>player.name)});
  document.querySelectorAll("[data-editor]").forEach(editor=>{const index=Number(editor.dataset.editor);data.clubs[index].initialBalance=Math.max(0,Number(editor.querySelector("[data-initial-balance]").value)||0);data.clubs[index].transfers=[...editor.querySelectorAll(".transfer-editor-row")].map(row=>({player:row.querySelector('[data-transfer-field="player"]').value.trim(),type:row.querySelector('[data-transfer-field="type"]').value,price:Math.max(0,Number(row.querySelector('[data-transfer-field="price"]').value)||0)})).filter(item=>item.player)});
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));if(window.remoteEnabled)await remoteSave();render();document.getElementById("saveMessage").textContent="Cambios guardados online correctamente."}catch(error){document.getElementById("saveMessage").textContent=`No se pudo guardar: ${error.message||"error desconocido"}`}setTimeout(()=>document.getElementById("saveMessage").textContent="",4000);
});
document.getElementById("changePassword").addEventListener("click",async()=>{const next=prompt("Escribe tu nueva contraseña (mínimo 8 caracteres):");if(next&&next.length>=8){try{if(window.remoteEnabled)await remoteChangePassword(next);else localStorage.setItem(PASSWORD_KEY,next);alert("Contraseña actualizada correctamente.")}catch(error){alert(`No se pudo cambiar: ${error.message}`)}}else if(next!==null){alert("La contraseña debe tener al menos 8 caracteres.")}});
render();navigate(location.hash.slice(1)||"inicio");
