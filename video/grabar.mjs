// Graba el video explicativo (celular vertical, al doble de resolución) sincronizado con la narración.
// Pasos: 1) python3 video/voz.py genera cada frase de video/narracion.json con la voz es_AR "daniela" (Piper vía sherpa-onnx)
// 2) node video/grabar.mjs <carpeta> (necesita dur.json y narr.json en esa carpeta) 3) ffmpeg une cuadros (frames.txt) y voz.
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
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const pg=await ctx.newPage();
await pg.addInitScript(d=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('poker.data',d);localStorage.setItem('poker.sound','0');sessionStorage.setItem('seeded','1')}},DATA);
await pg.addInitScript(()=>{Element.prototype.requestFullscreen=function(){return Promise.resolve()}});
await pg.addInitScript(()=>{
  window.addEventListener('DOMContentLoaded',()=>{
    const st=document.createElement('style');st.textContent=`
    #conn{display:none!important}
    #cap{position:fixed;left:10px;right:10px;bottom:12px;z-index:999;pointer-events:none;background:rgba(15,12,9,.92);color:#F4EFE1;border:1.5px solid #D6A739;border-radius:16px;padding:12px 14px;font:500 15px/1.35 Figtree,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5);transition:opacity .35s, transform .35s}
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


import fs from 'fs';
const DUR=JSON.parse(fs.readFileSync(OUT+'/dur.json','utf8'));
const NARR=Object.fromEntries(JSON.parse(fs.readFileSync(OUT+'/narr.json','utf8')));
// captura cuadro por cuadro al doble de resolución (el grabador de Playwright graba a la mitad)
fs.rmSync(OUT+'/frames',{recursive:true,force:true});fs.mkdirSync(OUT+'/frames');
const cdp=await ctx.newCDPSession(pg);const frames=[];let fi=0;
cdp.on('Page.screencastFrame',async f=>{const n=String(fi++).padStart(5,'0');fs.writeFileSync(`${OUT}/frames/${n}.jpg`,Buffer.from(f.data,'base64'));frames.push({n,t:f.metadata.timestamp});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
await cdp.send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:780,maxHeight:1688,everyNthFrame:1});
await W(500);
const T0=Date.now()/1000;const marks=[];
// mantiene el cuadro "vivo" aunque no cambie nada (el screencast solo manda cuadros cuando algo cambia)
await pg.evaluate(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;z-index:9999;pointer-events:none';document.body.appendChild(d);let o=0;setInterval(()=>{o=o?0:.01;d.style.background=`rgba(0,0,0,${o})`},90)});
async function scene(key,title,fn=async()=>{}){
  marks.push({key,t:Date.now()/1000-T0});
  if(title) await cap(title,NARR[key],false);
  await Promise.all([fn(),W(DUR[key]*1000+450)]);
}
await pg.evaluate(()=>{const d=document.createElement('div');d.id='title';d.innerHTML='<div class="s">♠ ♥ ♦ ♣</div><h1>Liga de <em>Poker</em></h1><p>Cómo funciona la app, paso a paso</p>';document.body.appendChild(d)});
await scene('intro',null);
await pg.evaluate(()=>{const d=document.getElementById('title');d.style.opacity=0;setTimeout(()=>d.remove(),600)});await W(500);
await scene('partidos','Partidos',async()=>{await W(3500);await pg.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'smooth'}));await W(3500);await top()});
await scene('jugadores','Jugadores',async()=>{await tap('button[data-tab="jugadores"]',{scroll:false,wait:2500});await tap('button[data-act="edit"][data-pid="p_Coco"]',{wait:3500});await tap('button[data-act="editCancel"]',{wait:300})});
await scene('avatar','Tu avatar',async()=>{await tap('button[data-act="avOpen"][data-pid="p_Willy"]',{wait:600});await tap('button[data-act="avTab"][data-v="emo"]',{scroll:false,wait:500});await tap('button[data-act="avSet"][data-f="e"][data-v="🦁"]',{scroll:false,wait:400});await tap('button[data-act="avSet"][data-f="c"][data-v="5"]',{scroll:false,wait:500});await tap('button[data-act="avSave"]',{scroll:false,wait:200})});
await top();
await scene('quien','¿Quién sos?',async()=>{await W(1200);await sel('#me-sel','p_Willy')});
await scene('programar','Programar la partida',async()=>{await tap('button[data-tab="partida"]',{scroll:false,wait:3000});await tap('button[data-act="newType"][data-v="vie"]',{wait:1500});await pg.evaluate(()=>{ui.newDate=today();render()});await W(300);await tap('button[data-act="newGame"]',{wait:600});await top()});
const plays=['Willy','Aldo','Alex','Casco','Coco','Firu','Gallego','Gusti','Jaime','Jorge','Mosca','Pablo','Pelado','Ricky'];
await scene('asistencia','Asistencia',async()=>{await show('.alist');for(const [i,n] of plays.entries()){await tap(`button[data-act="st"][data-pid="${id(n)}"][data-v="${i%3===0?'come':'juega'}"]`,{wait:i<3?350:130})}await top()});
await scene('mesas','Mesas',async()=>{await show('.card:has(h2:text("Mesas"))');await W(800);await sel('#dl-0',id('Ricky'));await sel('#dl-1',id('Pablo'));await tap('button[data-act="mesas"]',{wait:600});await show('.mesas')});
await scene('cuentas','Cuentas',async()=>{await typeIn('#g-entry','20000');await typeIn('#g-rbp','20000');await tap('button[data-act="foodMode"][data-v="pp"]',{wait:300});await typeIn('#g-foodpp','25000');await show('.prizes')});
await top();
await scene('reloj','El reloj',async()=>{await show('.timer');await tap('button[data-act="tplay"]',{wait:500})});
await scene('rebuys','Rebuys',async()=>{await show('.alist');for(const n of ['Casco','Coco','Casco','Gusti','Ricky']) await tap(`button[data-act="rb"][data-pid="${id(n)}"][data-d="1"]`,{wait:250});await show('.timer');for(let i=0;i<8;i++) await tap('button[data-act="tnext"]',{wait:200,scroll:false})});
await scene('elim','Eliminaciones',async()=>{await show('.kolist');for(const n of ['Gallego','Jaime','Firu','Aldo']){await tap(`button[data-act="ko"][data-pid="${id(n)}"]`,{wait:250});await tap(`button[data-act="ko"][data-pid="${id(n)}"]`,{wait:350})}await show('.kos');await W(600);await top()});
await scene('resultado','Resultado',async()=>{await show('#res-p1');await sel('#res-p1',id('Casco'));await sel('#res-p2',id('Coco'));await sel('#res-p3',id('Willy'));await show('.podium');await W(900);await tap('button[data-act="closeGame"]',{wait:300})});
await scene('historial','Partidos jugados',async()=>{await tap('button[data-tab="inicio"]',{scroll:false,wait:500});await show('.played')});
await scene('tabla','Tabla',async()=>{await tap('button[data-tab="stats"]',{scroll:false,wait:1800});await show('table');await pg.locator('.tw').evaluate(e=>e.scrollTo({left:e.scrollWidth,behavior:'smooth'}));await W(2200);await pg.locator('.tw').evaluate(e=>e.scrollTo({left:0,behavior:'smooth'}));await W(800);await top()});
await scene('pj','Por partido jugado',async()=>{await tap('button[data-act="statsMode"][data-v="pj"]',{scroll:false,wait:300})});
await scene('proyectar','Proyectar',async()=>{await pg.evaluate(()=>{ui.gameId=Object.keys(S.games).find(k=>!k.startsWith('h'))});await tap('button[data-tab="partida"]',{scroll:false,wait:500});await show('.timer');await tap('button[data-act="big"]',{scroll:false,wait:300})});
await tap('.proj button[data-act="big"]',{scroll:false,wait:300});await capHide();
await pg.evaluate(()=>{const d=document.createElement('div');d.id='title';d.innerHTML='<div class="s">♠ ♥ ♦ ♣</div><h1>¡A <em>jugar</em>!</h1><p>Nadie baja ganando</p>';document.body.appendChild(d)});
await scene('fin',null);await W(800);
const TEND=Date.now()/1000;
await cdp.send('Page.stopScreencast');await W(300);
// lista de cuadros con su duración, relativa a T0
const lst=[];const fr=frames.filter(f=>f.t>=T0-0.2);
for(let i=0;i<fr.length;i++){const d=(i+1<fr.length?fr[i+1].t:TEND)-fr[i].t;lst.push(`file 'frames/${fr[i].n}.jpg'\nduration ${Math.max(d,0.001).toFixed(4)}`)}
lst.push(`file 'frames/${fr[fr.length-1].n}.jpg'`);
fs.writeFileSync(OUT+'/frames.txt',lst.join('\n'));
const first=fr[0].t-T0;
fs.writeFileSync(OUT+'/marks.json',JSON.stringify({marks:marks.map(m=>({...m,t:m.t-first})),total:TEND-fr[0].t},null,1));
await ctx.close();await b.close();console.log('frames',fr.length,'total',(TEND-fr[0].t).toFixed(1));
