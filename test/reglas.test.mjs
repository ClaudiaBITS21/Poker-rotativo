// Pruebas de firestore.rules (torneos, claves, PIN, asistencia, regalos):
// npx firebase emulators:exec --only firestore "node test/reglas.test.mjs"   (requiere @firebase/rules-unit-testing y firebase)
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,updateDoc,deleteDoc,writeBatch,collection,query,where,getDocs} from 'firebase/firestore';
import fs from 'fs';import crypto from 'crypto';
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
const RULES=fs.readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
const env=await initializeTestEnvironment({projectId:'poker-rotativo',firestore:{rules:RULES,host:'127.0.0.1',port:8085}});
const FIRU='pmuhuxmb6f8rh',COCO='pmuhv51jbc5kd';
await env.withSecurityRulesDisabled(async c=>{const d=c.firestore();
  await setDoc(doc(d,'tournaments','rot'),{name:'Poker Rotativo',keyV:1});await setDoc(doc(d,'tkeys','rot'),{h:sha('rot:clave1')});
  await setDoc(doc(d,'tournaments','otro'),{name:'Otro',keyV:1});await setDoc(doc(d,'tkeys','otro'),{h:sha('otro:zzz')});
  for(const [id,t] of [['pA','rot'],['pB','rot'],[FIRU,'rot'],[COCO,'rot'],['pC','otro']]) await setDoc(doc(d,'players',id),{name:id,active:true,ts:{[t]:{}}});
  await setDoc(doc(d,'games','g'),{tid:'rot',type:'vie',status:'open',parts:{pA:{st:'juega'},pB:{st:'juega',rb:1}},timer:{running:false,level:0},result:{}});
  await setDoc(doc(d,'games','g2'),{tid:'otro',type:'vie',status:'open',parts:{},result:{}});
});
const anon=uid=>env.authenticatedContext(uid,{firebase:{sign_in_provider:'anonymous'}}).firestore();
const google=(uid,email)=>env.authenticatedContext(uid,{email,email_verified:true}).firestore();
let ok=0,bad=0;const t=async(name,p,expect)=>{try{await (expect?assertSucceeds(p):assertFails(p));ok++;console.log('✓',name)}catch(e){bad++;console.log('✗',name,String(e.message).slice(0,200))}};
const join=(db,uid,tid,key,v=1)=>{const b=writeBatch(db);b.set(doc(db,'members',tid+'_'+uid),{tid,uid,h:sha(tid+':'+key),v,at:1});b.set(doc(db,'memberOf',uid),{tid});return b.commit()};
const newPin=(db,pid,pin)=>{const b=writeBatch(db);b.set(doc(db,'pins',pid),{h:sha(pid+':'+pin)});b.set(doc(db,'pinflags',pid),{at:1});return b.commit()};
const login=(db,uid,pid,pin)=>setDoc(doc(db,'sessions',uid),{pid,h:sha(pid+':'+pin),at:1});
const qGames=(db,tid)=>getDocs(query(collection(db,'games'),where('tid','==',tid)));
const X=anon('uX'),A=anon('uA'),B=anon('uB'),F=anon('uF'),G=google('uG','claudia@rodo.es'),O=google('uO','otro@gmail.com');

// sin clave
await t('abre el torneo por el link (nombre)',getDoc(doc(X,'tournaments','rot')),true);
await t('no lista los torneos',getDocs(collection(X,'tournaments')),false);
await t('sin clave no ve jugadores',getDoc(doc(X,'players','pA')),false);
await t('sin clave no ve partidas',qGames(X,'rot'),false);
await t('su propio member (no existe) se puede consultar',getDoc(doc(X,'members','rot_uX')),true);
await t('no consulta el member de otro',getDoc(doc(X,'members','rot_uA')),false);
await t('clave incorrecta',join(X,'uX','rot','mala'),false);
await t('clave de otro torneo no sirve',join(X,'uX','rot','zzz'),false);
await t('clave correcta',join(X,'uX','rot','clave1'),true);
await t('no puede crear member para otro uid',setDoc(doc(X,'members','rot_uA'),{tid:'rot',uid:'uA',h:sha('rot:clave1'),v:1,at:1}),false);
await t('con clave ve jugadores',getDoc(doc(X,'players','pA')),true);
await t('con clave ve las partidas de su torneo',qGames(X,'rot'),true);
await t('no ve las del otro torneo',qGames(X,'otro'),false);
await t('no ve una partida del otro torneo',getDoc(doc(X,'games','g2')),false);
await t('no lee la clave',getDoc(doc(X,'tkeys','rot')),false);
// jugadores
await t('agrega jugador a su torneo',setDoc(doc(X,'players','pN'),{name:'Nuevo',active:true,ts:{rot:{}}}),true);
await t('no lo agrega a otro torneo',setDoc(doc(X,'players','pN2'),{name:'N2',active:true,ts:{otro:{}}}),false);
await t('no se regala puntos al crear',setDoc(doc(X,'players','pN3'),{name:'N3',active:true,ts:{rot:{prev:{pts:99}}}}),false);
await t('no se asigna a otro torneo',updateDoc(doc(X,'players','pA'),{'ts.otro':{}}),false);
await t('edita la ficha',updateDoc(doc(X,'players','pA'),{hand:'K9'}),true);
await t('no borra jugadores',deleteDoc(doc(X,'players','pN')),false);
// PIN y asistencia
await join(A,'uA','rot','clave1');await join(B,'uB','rot','clave1');
await t('A crea su PIN',newPin(A,'pA','1234'),true);
await t('nadie pisa el PIN',newPin(B,'pA','9999'),false);
await t('se ve el candado',getDoc(doc(B,'pinflags','pA')),true);
await t('PIN incorrecto',login(B,'uB','pA','0000'),false);
await t('A entra',login(A,'uA','pA','1234'),true);
await t('A cambia su asistencia',updateDoc(doc(A,'games','g'),{'parts.pA.st':'come',_p:'pA'}),true);
await t('A no cambia la de B',updateDoc(doc(A,'games','g'),{'parts.pB.st':'no',_p:'pB'}),false);
await t('A carga su alias de MP',updateDoc(doc(A,'players','pA'),{mp:'a.mp'}),true);
await t('A no cambia el alias de B',updateDoc(doc(A,'players','pB'),{mp:'a.mp'}),false);
await t('X (sin PIN) no cambia el alias de A',updateDoc(doc(X,'players','pA'),{mp:'x.mp'}),false);
await t('X edita otra cosa de A sin tocar el alias',updateDoc(doc(X,'players','pA'),{phrase:'hola'}),true);
await t('X maneja el reloj',updateDoc(doc(X,'games','g'),{'timer.level':1}),true);
await t('X suma rebuy',updateDoc(doc(X,'games','g'),{'parts.pB.rb':2,_p:'pB'}),true);
await t('no cambia el torneo de la partida',updateDoc(doc(X,'games','g'),{tid:'otro'}),false);
await t('crea partida vacía en su torneo',setDoc(doc(X,'games','g3'),{tid:'rot',type:'mie',status:'open',parts:{},result:{}}),true);
await t('no crea partida en otro torneo',setDoc(doc(X,'games','g4'),{tid:'otro',type:'mie',status:'open',parts:{},result:{}}),false);
await t('no borra partidas',deleteDoc(doc(X,'games','g3')),false);
await t('no ve sesiones ajenas',getDocs(collection(X,'sessions')),false);
// dueña con PIN (Firu)
await join(F,'uF','rot','clave1');
await t('Firu crea PIN',newPin(F,FIRU,'4321'),true);
await t('Firu entra',login(F,'uF',FIRU,'4321'),true);
await t('Firu lista torneos',getDocs(collection(F,'tournaments')),true);
await t('Firu crea torneo',setDoc(doc(F,'tournaments','nuevo'),{name:'Nuevo',keyV:1}),true);
await t('Firu pone clave',setDoc(doc(F,'tkeys','nuevo'),{h:sha('nuevo:abc')}),true);
await t('Firu asigna jugador a otro torneo',updateDoc(doc(F,'players','pA'),{'ts.nuevo':{}}),true);
await t('Firu ve las sesiones',getDocs(collection(F,'sessions')),true);
await t('Firu ve los members',getDocs(collection(F,'members')),true);
await t('Firu ve partidas de otro torneo sin clave',qGames(F,'otro'),true);
await t('Firu cambia asistencia de B',updateDoc(doc(F,'games','g'),{'parts.pB.st':'no',_p:'pB'}),true);
await t('Firu resetea PIN de A',(async()=>{const b=writeBatch(F);b.delete(doc(F,'pins','pA'));b.delete(doc(F,'pinflags','pA'));await b.commit()})(),true);
await t('A con PIN reseteado no cambia asistencia',updateDoc(doc(A,'games','g'),{'parts.pA.st':'no',_p:'pA'}),false);
// pedir la clave de nuevo
await t('Firu pide la clave de nuevo',updateDoc(doc(F,'tournaments','rot'),{keyV:2}),true);
await t('X ya no ve partidas',qGames(X,'rot'),false);
await t('X con la clave vieja (v1) no vuelve',join(X,'uX','rot','clave1',1),false);
await t('X vuelve a poner la clave (v2)',join(X,'uX','rot','clave1',2),true);
await t('X ve de nuevo',qGames(X,'rot'),true);
// no dueños
await t('Coco (admin) no crea torneos',(async()=>{const C=anon('uC');await join(C,'uC','rot','clave1',2);await newPin(C,COCO,'1111');await login(C,'uC',COCO,'1111');await setDoc(doc(C,'tournaments','x'),{name:'x',keyV:1})})(),false);
await t('Google claudia lista torneos',getDocs(collection(G,'tournaments')),true);
await t('Google otro no lista torneos',getDocs(collection(O,'tournaments')),false);
await t('anónimo no crea torneos',setDoc(doc(X,'tournaments','y'),{name:'y',keyV:1}),false);
// regalos
await t('X no ve regalos',getDoc(doc(X,'regalos','r')),false);
await t('Firu escribe regalos',setDoc(doc(F,'regalos','r'),{monto:1}),true);
// participación en regalos
await t('Pato (sin sesión válida) no contesta',setDoc(doc(A,'regpart','r1__pA'),{rid:'r1',pid:'pA',in:true,resp:true,at:1}),false);
const P=anon('uP');await join(P,'uP','rot','clave1',2);await newPin(P,'pB','2222');await login(P,'uP','pB','2222');
await t('B contesta que participa',setDoc(doc(P,'regpart','r1__pB'),{rid:'r1',pid:'pB',in:true,resp:true,at:1}),true);
await t('B no contesta por otro',setDoc(doc(P,'regpart','r1__pC'),{rid:'r1',pid:'pC',in:true,resp:true,at:1}),false);
await t('B no se pone el monto',setDoc(doc(P,'regpart','r2__pB'),{rid:'r2',pid:'pB',in:true,resp:true,at:1,amt:0}),false);
await t('Firu pone el monto de B',setDoc(doc(F,'regpart','r1__pB'),{amt:10000,paid:false},{merge:true}),true);
await t('B ve su monto',getDoc(doc(P,'regpart','r1__pB')),true);
await t('B busca los suyos',getDocs(query(collection(P,'regpart'),where('pid','==','pB'))),true);
await t('B no lista los de todos',getDocs(collection(P,'regpart')),false);
await t('B no se marca pagado',updateDoc(doc(P,'regpart','r1__pB'),{paid:true}),false);
await t('B avisa que pagó por MP',updateDoc(doc(P,'regpart','r1__pB'),{pay:'mp',payAt:3}),true);
await t('B no se cambia el alias',updateDoc(doc(P,'regpart','r1__pB'),{alias:'otro'}),false);
await t('B cambia de opinión',updateDoc(doc(P,'regpart','r1__pB'),{in:false,at:2}),true);
await t('B no ve el total del regalo',getDoc(doc(P,'regalos','r1')),false);
// partidas que quedaron sin torneo (importación vieja)
await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),'games','gvieja'),{type:'mie',date:'2026-09-01',parts:{}})});
await t('Pato no ve la partida sin torneo',getDoc(doc(P,'games','gvieja')),false);
await t('dueña la arregla',setDoc(doc(G,'games','gvieja'),{type:'mie',date:'2026-09-01',parts:{},tid:'rot'}),true);
console.log(`\n${ok} ok, ${bad} fallaron`);await env.cleanup();process.exit(bad?1:0);
