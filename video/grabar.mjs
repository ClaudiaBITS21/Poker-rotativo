// Graba el video explicativo de la app con datos de ejemplo (formato celular vertical).
// Uso: node video/grabar.mjs <carpeta-salida>  → deja un .webm; convertir a MP4 con ffmpeg.
import { chromium } from 'playwright';
const NAMES=['Aldo','Alex','Casco','Coco','Cristian','Damian','El Negro Julian','Fantastica71','Firu','Gallego','Guido','Gusti','Jaime','Jorge','Juli','Matias','Mosca','Pablo','Pato','Pelado','Ricky','Rulo','Seba','Sombrero','Tato','Tommy','Willy'];
const PREV={Casco:44,Ricky:43,Pelado:39,Coco:38,Pablo:34,Mosca:32,Alex:27,Gallego:26,Willy:21,Pato:19,Jaime:18,Jorge:16,Aldo:12,Damian:12,Firu:7,Gusti:4,Rulo:3,Guido:2,Matias:2,Seba:2,Tommy:2,Cristian:1};
const WON={Casco:7,Ricky:7,Pelado:6,Coco:5,Pablo:6,Mosca:3,Alex:3,Gallego:2,Willy:3,Pato:2,Jaime:3,Jorge:2,Aldo:2,Damian:2,Firu:1};
const id=n=>'p_'+n.replace(/\W/g,'');
const players={};NAMES.forEach(n=>players[id(n)]={name:n,active:true,since:'2026-08-01',prev:PREV[n]?{pts:PREV[n],won:WON[n]||0}:undefined});
Object.assign(players[id('Coco')],{hand:'44',phrase:'El profesor',av:{k:'card',r:'4',s:'h'}});
Object.assign(players[id('Casco')],{hand:'K9',phrase:'K9 es ALL IN',av:{k:'emo',c:3,e:'🎩'}});
Object.assign(players[id('Gusti')],{phrase:'Nadie baja ganando',av:{k:'emo',c:2,e:'🦈'}});
players[id('Ricky')].av={k:'emo',c:0,e:'🔥'};players[id('Firu')].av={k:'emo',c:8,e:'🤑'};
const past=(date,type,who,res)=>{const parts={};who.forEach((n,i)=>parts[id(n)]={st:i%3?'juega':'come',rb:type==='vie'?i%3:0,rq:type==='mie'&&i%2===0});
  const r={};['p1','p2','p3'].forEach((k,i)=>{if(res[i])r[k]=id(res[i])});
  return {type,date,time:'21:30',status:'closed',entry:15000,rebuyPrice:type==='vie'?15000:'',foodMode:'pp',foodPP:20000,levelMin:type==='vie'?12:7,breakMin:20,parts,result:r,timer:{}}};
const games={
 h1:past('2026-09-02','mie',['Ricky','Coco','Pablo','Mosca','Alex','Willy','Jaime','Pato','Gusti'],['Coco','Ricky']),
 h2:past('2026-09-04','vie',['Ricky','Coco','Pablo','Mosca','Alex','Willy','Jaime','Pato','Casco','Aldo','Pelado','Jorge'],['Casco','Pelado','Ricky']),
 h3:past('2026-09-09','mie',['Ricky','Pablo','Mosca','Alex','Gallego','Jaime','Firu'],['Mosca','Alex']),
 h4:past('2026-09-11','vie',['Ricky','Coco','Pablo','Mosca','Alex','Willy','Casco','Gusti','Aldo','Pelado','Juli'],['Gusti','Coco','Pablo'])};
const DATA=JSON.stringify({players,games});

const OUT=process.argv[2]||'.';
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,recordVideo:{dir:OUT,size:{width:780,height:1688}}});
const pg=await ctx.newPage();
await pg.addInitScript(d=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('poker.data',d);localStorage.setItem('poker.sound','0');sessionStorage.setItem('seeded','1')}},DATA);
await pg.addInitScript(()=>{
  window.addEventListener('DOMContentLoaded',()=>{
    const st=document.createElement('style');st.textContent=`
    #conn{display:none!important}
    #cap{position:fixed;left:10px;right:10px;bottom:14px;z-index:999;pointer-events:none;background:rgba(15,12,9,.92);color:#F4EFE1;border:1.5px solid #D6A739;border-radius:16px;padding:12px 14px;font:500 15px/1.35 Figtree,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5);transition:opacity .35s, transform .35s}
    #cap.hide{opacity:0;transform:translateY(10px)}
    #cap b{display:block;font:800 17px/1.2 "Playfair Display",Georgia,serif;color:#D6A739;margin-bottom:3px}
    #cap i{font-style:normal;color:#A8C5B5;font-size:12px;letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:2px}
    #tap{position:fixed;z-index:1000;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #FFD54A;background:rgba(255,213,74,.35);pointer-events:none;opacity:0;transform:scale(.4);transition:opacity .15s,transform .25s}
    #tap.on{opacity:1;transform:scale(1)}
    #title{position:fixed;inset:0;z-index:1001;display:grid;place-content:center;text-align:center;gap:10px;background:radial-gradient(ellipse at 50% 30%,#177250,#093A26);color:#F4EFE1;font-family:"Playfair Display",Georgia,serif;transition:opacity .6s}
    #title h1{font-size:44px;font-style:italic;font-weight:900;margin:0}#title h1 em{font-style:normal;color:#D6A739}
    #title p{font:500 18px Figtree,system-ui;color:#A8C5B5;margin:0 30px}#title .s{font-size:30px;letter-spacing:6px;color:#D6A739}`;
    document.head.appendChild(st);
    const c=document.createElement('div');c.id='cap';c.className='hide';document.body.appendChild(c);
    const t=document.createElement('div');t.id='tap';document.body.appendChild(t);
  });
});
await pg.goto(new URL('../index.html',import.meta.url).href);
await pg.waitForTimeout(600);
const W=ms=>pg.waitForTimeout(ms);
let stepN=0;const TOTAL=12;
async function cap(title,text,step=true){if(step)stepN++;await pg.evaluate(([t,x,n,T])=>{const c=document.getElementById('cap');c.classList.add('hide');setTimeout(()=>{c.innerHTML=(n?`<i>Paso ${n} de ${T}</i>`:'')+`<b>${t}</b>${x}`;c.classList.remove('hide')},250)},[title,text,step?stepN:0,TOTAL]);await W(400)}
async function capHide(){await pg.evaluate(()=>document.getElementById('cap').classList.add('hide'))}
async function show(sel){const l=pg.locator(sel).first();await l.evaluate(e=>e.scrollIntoView({behavior:'smooth',block:'center'}));await W(700);return l}
async function tap(sel,{wait=500,scroll=true}={}){const l=pg.locator(sel).first();if(scroll){await l.evaluate(e=>{const r=e.getBoundingClientRect();if(r.top<90||r.bottom>innerHeight-170)e.scrollIntoView({behavior:'smooth',block:'center'})});await W(450)}
  const bx=await l.boundingBox();await pg.evaluate(([x,y])=>{const t=document.getElementById('tap');t.style.left=x+'px';t.style.top=y+'px';t.classList.add('on');setTimeout(()=>t.classList.remove('on'),450)},[bx.x+bx.width/2,bx.y+bx.height/2]);await W(260);await l.click();await W(wait)}
async function sel(selector,value){const l=pg.locator(selector);await l.evaluate(e=>e.scrollIntoView({behavior:'smooth',block:'center'}));await W(400);const bx=await l.boundingBox();await pg.evaluate(([x,y])=>{const t=document.getElementById('tap');t.style.left=x+'px';t.style.top=y+'px';t.classList.add('on');setTimeout(()=>t.classList.remove('on'),450)},[bx.x+bx.width/2,bx.y+bx.height/2]);await W(300);await l.selectOption(value);await W(700)}
async function typeIn(selector,text){const l=pg.locator(selector);await l.evaluate(e=>e.scrollIntoView({behavior:'smooth',block:'center'}));await W(400);await l.click();await l.fill('');await l.type(text,{delay:110});await l.press('Tab');await W(500)}
async function top(){await pg.evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await W(600)}

// portada
await pg.evaluate(()=>{const d=document.createElement('div');d.id='title';d.innerHTML='<div class="s">♠ ♥ ♦ ♣</div><h1>Liga de <em>Poker</em></h1><p>Cómo funciona la app, paso a paso, en el orden de una noche de juego</p>';document.body.appendChild(d)});
await W(3200);await pg.evaluate(()=>{const d=document.getElementById('title');d.style.opacity=0;setTimeout(()=>d.remove(),600)});await W(700);

// 1 inicio
await cap('Partidos','La pantalla de inicio: el partido en juego, los próximos y el historial con el ganador de cada noche.');await W(2500);
await pg.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'smooth'}));await W(2600);await top();

// 2 jugadores
await cap('Jugadores','Cada uno tiene su ficha con partidas, puntos y desde cuándo juega. Con <b style="display:inline;font:inherit;color:#D6A739">Editar</b> se carga el nombre, la mano favorita y la frase típica.');
await tap('button[data-tab="jugadores"]',{scroll:false,wait:1600});
await tap('button[data-act="edit"][data-pid="p_Coco"]',{wait:900});
await W(2200);await tap('button[data-act="editCancel"]',{wait:500});
await cap('Tu avatar','Tocá el avatar para elegir ficha, carta, emoji o foto.',false);
await tap('button[data-act="avOpen"][data-pid="p_Willy"]',{wait:900});
await tap('button[data-act="avTab"][data-v="emo"]',{scroll:false,wait:600});
await tap('button[data-act="avSet"][data-f="e"][data-v="🦁"]',{scroll:false,wait:500});
await tap('button[data-act="avSet"][data-f="c"][data-v="5"]',{scroll:false,wait:700});
await tap('button[data-act="avSave"]',{scroll:false,wait:600});
await top();
await cap('¿Quién sos?','Arriba a la derecha cada uno elige quién es: su fila aparece primera y resaltada.',false);
await sel('#me-sel','p_Willy');await W(1200);

// 3 programar
await cap('Programar la partida','Rápido (miércoles): niveles de 7 min, puntos 5·2. Con rebuy (viernes): niveles de 12 min, puntos 7·3·1. Se puede repetir varias semanas.');
await pg.evaluate(()=>{ui.newDate=today()});
await tap('button[data-tab="partida"]',{scroll:false,wait:2200});
await tap('button[data-act="newType"][data-v="vie"]',{wait:1500});
await pg.evaluate(()=>{ui.newDate=today();render()});await W(300);
await tap('button[data-act="newGame"]',{wait:1200});await top();

// 4 asistencia
await cap('Asistencia','Cada uno marca ✕ no va, ♠ juega o 🍽 juega y come. Arriba se ve cuántos entraron.');
await show('.alist');
const plays=['Willy','Aldo','Alex','Casco','Coco','Firu','Gallego','Gusti','Jaime','Jorge','Mosca','Pablo','Pelado','Ricky'];
for(const [i,n] of plays.entries()){await tap(`button[data-act="st"][data-pid="${id(n)}"][data-v="${i%3===0?'come':'juega'}"]`,{wait:i<3?450:180})}
for(const n of ['Rulo','Sombrero']) await tap(`button[data-act="st"][data-pid="${id(n)}"][data-v="no"]`,{wait:200});
await W(600);await top();await W(1600);

// 5 mesas
await cap('Mesas','Con más de 11 se juega en dos mesas. Se eligen los dos que reparten y la app sortea: cada uno a una mesa distinta y el resto al azar. Si son impares, la mesa 1 lleva uno más.');
await show('.card:has(h2:text("Mesas"))');await W(1500);
await sel('#dl-0',id('Ricky'));await sel('#dl-1',id('Pablo'));
await tap('button[data-act="mesas"]',{wait:900});await show('.mesas');await W(3000);

// 6 cuentas
await cap('Cuentas','Se carga la entrada, el rebuy y la comida (total o por persona). La app calcula el pozo, los premios y cuánto paga cada uno.');
await typeIn('#g-entry','20000');await typeIn('#g-rbp','20000');
await tap('button[data-act="foodMode"][data-v="pp"]',{wait:500});await typeIn('#g-foodpp','25000');
await show('.prizes');await W(2600);

// 7 reloj
await top();
await cap('El reloj','Muestra nivel, ciegas y próximas. Pita en el último minuto y suena la alarma al llegar a 0:00. El nivel no avanza solo: se espera a "Arrancar siguiente".');
await show('.timer');await tap('button[data-act="tplay"]',{wait:2500});
await cap('Rebuys','En Con rebuy se suman con + por jugador, hasta que termina el 10-20. Después se bloquean solos.',false);
await show('.alist');
for(const n of ['Casco','Coco','Casco','Gusti','Ricky']) await tap(`button[data-act="rb"][data-pid="${id(n)}"][data-d="1"]`,{wait:350});
await W(800);
await show('.timer');
for(let i=0;i<8;i++) await tap('button[data-act="tnext"]',{wait:320,scroll:false});
await W(1800);

// 8 eliminaciones
await cap('Eliminaciones','Con el rebuy cerrado se habilitan. Se toca dos veces a quien queda afuera: el orden en que caen define el puesto. "Quedan" va bajando.');
await show('.kolist');
for(const n of ['Gallego','Jaime','Firu','Aldo']){await tap(`button[data-act="ko"][data-pid="${id(n)}"]`,{wait:350});await tap(`button[data-act="ko"][data-pid="${id(n)}"]`,{wait:500})}
await show('.kos');await W(1500);await top();await W(1800);

// 9 resultado
await cap('Resultado','Se completa solo con las eliminaciones… o se eligen los ganadores a mano en cualquier momento. Al cerrar, se suman los puntos.');
await show('#res-p1');
await sel('#res-p1',id('Casco'));await sel('#res-p2',id('Coco'));await sel('#res-p3',id('Willy'));
await show('.podium');await W(2000);
await tap('button[data-act="closeGame"]',{wait:1500});

// 10 inicio con jugado
await cap('Historial','La partida queda en "Partidos jugados" con su ganador y el pozo.');
await tap('button[data-tab="inicio"]',{scroll:false,wait:600});
await show('.hist');await W(2600);

// 11 tabla
await cap('Tabla','Puntos del año (incluye la liga anterior), con Mié y Vie como referencia, asistencia, puestos, rebuys y plata ganada. Deslizá la tabla para ver todo.');
await tap('button[data-tab="stats"]',{scroll:false,wait:2200});await show('table');
await pg.locator('.tw').evaluate(e=>e.scrollTo({left:e.scrollWidth,behavior:'smooth'}));await W(2000);await pg.locator('.tw').evaluate(e=>e.scrollTo({left:0,behavior:'smooth'}));await W(1000);
await top();
await cap('Por partido jugado','Para comparar a quien va siempre con quien va poco: puntos por partida, % de victorias y de podios.',false);
await tap('button[data-act="statsMode"][data-v="pj"]',{scroll:false,wait:3200});

// 12 proyectar
await cap('Proyectar','Con "Proyectar" el reloj va a pantalla completa para la tele: ciegas, pozo, premios y quién sigue en juego.');
await pg.evaluate(()=>{ui.gameId=Object.keys(S.games).find(k=>!k.startsWith('h'))});
await tap('button[data-tab="partida"]',{scroll:false,wait:900});
await show('.timer');await tap('button[data-act="big"]',{scroll:false,wait:4200});
await tap('.proj button[data-act="big"]',{scroll:false,wait:600});

// cierre
await capHide();
await pg.evaluate(()=>{const d=document.createElement('div');d.id='title';d.innerHTML='<div class="s">♠ ♥ ♦ ♣</div><h1>¡A <em>jugar</em>!</h1><p>Nadie baja ganando</p>';document.body.appendChild(d)});
await W(3000);
await ctx.close();await b.close();
console.log('ok');
