// ==UserScript==
// @name L7 MATRIX - SA Reader V1.5 L7 MATRIX PREMIUM UI
// @namespace l7.matrix
// @version 1.5.0
// @match *://*/*
// @grant none
// ==/UserScript==
(()=>{
'use strict';
if(window.__L7SA1)return; window.__L7SA1=1;
const ID='l7-sa-reader-v1', S={table:null,host:null,header:null,road:null,key:null,n:0,timer:null};
const q=(s,r=document)=>r.querySelector(s), H=u=>u.getAttribute('href')||u.getAttribute('xlink:href')||'';

function spriteNum(head,key){
 const u=[...head.querySelectorAll('use')].find(x=>H(x).includes(key)); if(!u)return null;
 let e=u;
 for(let i=0;i<9&&e;i++,e=e.parentElement){
  const a=[...(e.querySelectorAll?.('p')||[])].map(x=>x.textContent.trim()).filter(x=>/^\d+$/.test(x));
  if(a.length===1)return +a[0];
 }
 return null;
}
function header(){
 const h=q('.ingame-roadmap-frame-header'); if(!h)return null;
 const m=h.innerText.match(/#\s*(\d+)/);
 const B=spriteNum(h,'bead-road-red'),P=spriteNum(h,'bead-road-blue'),T=spriteNum(h,'bead-road-green');
 if(!m||![B,P,T].every(Number.isFinite))return null;
 return {round:+m[1],B,P,T,settled:B+P+T};
}
function table(){return q('.table-name-label-rwd-text')?.textContent.trim()||'—'}
function host(){
 const e=q('.rwd-ingame-roadmap-frame'); if(!e)return null;
 const k=Object.keys(e).find(x=>x.startsWith('__reactFiber$')); let f=k?e[k]:null;
 for(let i=0;f&&i<30;i++,f=f.return){const p=f.memoizedProps||f.pendingProps;if(p&&Number.isFinite(+p.hostId))return +p.hostId}
 return null;
}
function road(){
 const r=document.getElementById('baccarat-ingame-big-road-obj'); if(!r)return null;
 const c=[...r.querySelectorAll('use')].map(u=>{
  const h=H(u); if(!h.includes('baccarat__big__big-road')||+getComputedStyle(u).opacity<=0)return null;
  const result=h.includes('big-road-red')?'B':h.includes('big-road-blue')?'P':null;if(!result)return null;
  return {result,x:+(u.getAttribute('x')||0),y:+(u.getAttribute('y')||0),tie:h.includes('-tie')};
 }).filter(Boolean);
 if(!c.length)return {cells:[],seq:'',B:0,P:0,T:0,read:0,unused:0};
 const xs=[...new Set(c.map(x=>x.x))].sort((a,b)=>a-b),ys=[...new Set(c.map(x=>x.y))].sort((a,b)=>a-b);
 const dx=xs.length>1?Math.min(...xs.slice(1).map((x,i)=>x-xs[i]).filter(x=>x>0)):20;
 const dy=ys.length>1?Math.min(...ys.slice(1).map((y,i)=>y-ys[i]).filter(x=>x>0)):20;
 const minX=Math.min(...c.map(x=>x.x)),minY=Math.min(...c.map(x=>x.y)),maxX=Math.max(...c.map(x=>x.x));
 const map=new Map(c.map(x=>[`${x.x},${x.y}`,x])),used=new Set(),hist=[];let cur=map.get(`${minX},${minY}`),startX=minX;
 while(cur){
  const k=`${cur.x},${cur.y}`;if(used.has(k))break;used.add(k);hist.push(cur);
  let nk=`${cur.x},${cur.y+dy}`,z=map.get(nk);if(z&&!used.has(nk)&&z.result===cur.result){cur=z;continue}
  nk=`${cur.x+dx},${cur.y}`;z=map.get(nk);if(z&&!used.has(nk)&&z.result===cur.result){cur=z;continue}
  let next=null;for(let x=startX+dx;x<=maxX;x+=dx){nk=`${x},${minY}`;z=map.get(nk);if(z&&!used.has(nk)&&z.result!==cur.result){next=z;startX=x;break}}
  cur=next;
 }
 const seq=hist.map(x=>x.result).join('');
 return {cells:c,seq,read:hist.length,unused:c.length-hist.length,B:hist.filter(x=>x.result==='B').length,P:hist.filter(x=>x.result==='P').length,T:hist.filter(x=>x.tie).length};
}
function pattern(s){
 if(!s)return '—';let n=1;for(let i=s.length-2;i>=0&&s[i]===s.at(-1);i--)n++;
 let a=[`${s.at(-1)==='B'?'莊':'閒'} ${n}連`];
 if(s.length>=6&&[...s.slice(-6)].every((v,i,z)=>!i||v!==z[i-1]))a.push('單跳');
 if(s.length>=8){const z=s.slice(-8),o=z[0]==='B'?'P':'B';if([...z].every((v,i)=>v===(Math.floor(i/2)%2?o:z[0])))a.push('雙跳')}
 return a.join(' · ');
}
function signal(s,sync){
 if(!sync||s.length<4)return ['觀望','等待完整同步'];
 let n=1;for(let i=s.length-2;i>=0&&s[i]===s.at(-1);i--)n++;
 if(n>=3)return [s.at(-1)==='B'?'莊':'閒',`長龍 ${n}連提示`];
 return ['觀望','目前沒有明確規則訊號'];
}

function nativeRoad(id){
 const root=document.getElementById(id); if(!root)return {seq:'',last:'—',R:0,B:0};
 const a=[...root.querySelectorAll('use')].map(u=>{
  if(+getComputedStyle(u).opacity<=0)return null;
  const h=H(u);
  if(h.includes('red'))return 'R';
  if(h.includes('blue'))return 'B';
  return null;
 }).filter(Boolean);
 return {seq:a.join(''),last:a.at(-1)||'—',R:a.filter(x=>x==='R').length,B:a.filter(x=>x==='B').length};
}
function askRoads(){
 const area=q('.ingame-roadmap-frame-portrait-inner')||q('.rwd-ingame-roadmap-frame')?.children?.[1];
 if(!area)return {banker:[],player:[]};
 const out={banker:[],player:[]};
 [...area.querySelectorAll('use')].forEach(u=>{
  const h=H(u); if(!h.includes('-ask'))return;
  const c=h.includes('red')?'R':h.includes('blue')?'B':null; if(!c)return;
  // SA ask sprites are retained as raw R/B road predictions.
  const box=u.closest('svg')?.parentElement?.innerText||'';
  if(/莊/.test(box))out.banker.push(c);
  else if(/閒/.test(box))out.player.push(c);
 });
 return out;
}
function roadSummary(){
 const bigEye=nativeRoad('baccarat-ingame-big-eye-road-obj');
 const small=nativeRoad('baccarat-ingame-small-road-obj');
 const cock=nativeRoad('baccarat-ingame-cockroach-road-obj');
 const ask=askRoads();
 return {bigEye,small,cock,ask};
}
function analysisV11(seq,sync){
 if(!sync)return {side:'觀望',reason:'資料 CHECK，暫停分析'};
 if(!seq||seq.length<4)return {side:'觀望',reason:'牌路資料不足'};
 let run=1;for(let i=seq.length-2;i>=0&&seq[i]===seq.at(-1);i--)run++;
 const last=seq.at(-1), opp=last==='B'?'P':'B';
 if(run>=3)return {side:last==='B'?'莊':'閒',reason:`大路長龍 ${run} 連｜跟龍規則訊號`};
 if(seq.length>=6){
  const z=[...seq.slice(-6)];
  if(z.every((v,i)=>!i||v!==z[i-1]))return {side:opp==='B'?'莊':'閒',reason:'大路單跳成立｜延續單跳規則訊號'};
 }
 if(seq.length>=8){
  const z=seq.slice(-8),o=z[0]==='B'?'P':'B';
  if([...z].every((v,i)=>v===(Math.floor(i/2)%2?o:z[0])))
   return {side:opp==='B'?'莊':'閒',reason:'大路雙跳成立｜延續雙跳規則訊號'};
 }
 return {side:'觀望',reason:'大路未形成已設定規則；下三路僅作結構參考'};
}

function UI(){
 const st=document.createElement('style');st.textContent=`#${ID}{position:fixed;left:18px;top:18px;z-index:2147483647;width:300px;background:#10141beF;color:#fff;font:13px "Segoe UI","Microsoft JhengHei";border:1px solid #ffffff30;border-radius:14px;box-shadow:0 12px 35px #0008;overflow:hidden}#${ID} .h{padding:10px 12px;font-weight:700;background:#ffffff10;cursor:move;display:flex;justify-content:space-between}#${ID} button{background:#ffffff18;color:#fff;border:0;border-radius:6px}#${ID} .b{padding:11px}#${ID} .r{display:flex;justify-content:space-between;margin:6px 0;gap:8px}#${ID} .s{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}#${ID} .x{background:#ffffff0d;padding:7px;text-align:center;border-radius:8px}#${ID} .n{font-size:18px;font-weight:800}#${ID} .seq{font:11px Consolas;word-break:break-all;background:#ffffff0b;padding:7px;border-radius:7px;max-height:50px;overflow:auto}#${ID}.mini .b{display:none}`;
 document.head.appendChild(st);
 const e=document.createElement('div');e.id=ID;e.innerHTML=`<div class=h><span class="l7brand"><i class="l7mark"><em>L</em><strong>7</strong></i><span class="l7word"><b>L7 MATRIX</b><small>RESULT · RULE · DISCIPLINE</small></span></span><button>—</button></div><div class=b><div class=r><span id=l7tbl>等待 SA...</span><b id=l7sync>WAIT</b></div><div class=r><span id=l7host>host —</span><span id=l7round>#—</span></div><div class=s><div class=x>莊<div class=n id=l7b>—</div></div><div class=x>閒<div class=n id=l7p>—</div></div><div class=x>和<div class=n id=l7t>—</div></div><div class=x>結算<div class=n id=l7set>—</div></div></div><div class=r><span>大路讀取</span><span id=l7read>—</span></div><div class=r><span>牌型</span><span id=l7pat>—</span></div><div class=r><span>L7 判斷</span><b id=l7sig>觀望</b></div><div class=r><small id=l7why>等待同步</small></div><div class=r><span>實心路（大眼仔）</span><span id=l7eye>—</span></div><div class=r><span>空心路（小路）</span><span id=l7small>—</span></div><div class=r><span>斜線路（曱甴路）</span><span id=l7cock>—</span></div><div class=r><span>莊問路 / 閒問路</span><span id=l7ask>—</span></div><div class=seq id=l7seq>—</div></div>`;
 document.body.appendChild(e);e.querySelector('button').onclick=()=>e.classList.toggle('mini');
 
 // V1.4: mouse/touch drag + remember position.
 const POSKEY='L7_MATRIX_PANEL_POS_V14';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 try{
   const p=JSON.parse(localStorage.getItem(POSKEY)||'null');
   if(p&&Number.isFinite(p.left)&&Number.isFinite(p.top)){
     e.style.left=clamp(p.left,0,Math.max(0,innerWidth-e.offsetWidth))+'px';
     e.style.top=clamp(p.top,0,Math.max(0,innerHeight-e.offsetHeight))+'px';
     e.style.right='auto';
   }
 }catch(_){}
 let d=null;
 const head=e.querySelector('.h');
 const point=ev=>{
   const t=ev.touches?.[0]||ev.changedTouches?.[0]||ev;
   return {x:t.clientX,y:t.clientY};
 };
 const begin=ev=>{
   if(ev.target.closest('button'))return;
   const p=point(ev),r=e.getBoundingClientRect();
   d={dx:p.x-r.left,dy:p.y-r.top};
   e.style.right='auto';
   head.classList.add('dragging');
   if(ev.cancelable)ev.preventDefault();
 };
 const move=ev=>{
   if(!d)return;
   const p=point(ev);
   const left=clamp(p.x-d.dx,0,Math.max(0,innerWidth-e.offsetWidth));
   const top=clamp(p.y-d.dy,0,Math.max(0,innerHeight-e.offsetHeight));
   e.style.left=left+'px'; e.style.top=top+'px';
   if(ev.cancelable)ev.preventDefault();
 };
 const end=()=>{
   if(!d)return;
   d=null; head.classList.remove('dragging');
   const r=e.getBoundingClientRect();
   try{localStorage.setItem(POSKEY,JSON.stringify({left:r.left,top:r.top}))}catch(_){}
 };
 head.addEventListener('mousedown',begin);
 addEventListener('mousemove',move);
 addEventListener('mouseup',end);
 head.addEventListener('touchstart',begin,{passive:false});
 addEventListener('touchmove',move,{passive:false});
 addEventListener('touchend',end,{passive:true});
 addEventListener('resize',()=>{
   const r=e.getBoundingClientRect();
   e.style.left=clamp(r.left,0,Math.max(0,innerWidth-e.offsetWidth))+'px';
   e.style.top=clamp(r.top,0,Math.max(0,innerHeight-e.offsetHeight))+'px';
 });

}
function render(){
 const h=S.header,r=S.road;
 const usable=!!(h&&r&&r.cells&&r.cells.length>0&&r.unused===0);
 q('#l7tbl').textContent=S.table||'等待牌桌';
 q('#l7host').textContent='';
 q('#l7round').textContent=h?'#'+h.round:'#—';

 // Internal data remains available in L7_SA_READER; member UI is simplified.
 q('#l7b').parentElement.parentElement.style.display='none';
 q('#l7read').parentElement.style.display='none';
 q('#l7pat').parentElement.style.display='none';
 ['#l7eye','#l7small','#l7cock','#l7ask'].forEach(id=>{
   const e=q(id); if(e?.parentElement)e.parentElement.style.display='none';
 });
 q('#l7seq').style.display='none';

 q('#l7sync').textContent=usable?'● 分析完成':'● 分析中…';
 const g=analysisV11(r?.seq||'',usable);
 q('#l7sig').textContent=g.side;
 q('#l7why').textContent=g.reason
   .replace('大路長龍','長龍')
   .replace('大路單跳','單跳')
   .replace('大路雙跳','雙跳')
   .replace('｜跟龍規則訊號','')
   .replace('｜延續單跳規則訊號','')
   .replace('｜延續雙跳規則訊號','')
   .replace('大路未形成已設定規則；下三路僅作結構參考','條件不足・等待下一局');

 const sig=q('#l7sig');
 sig.style.fontSize='34px';
 sig.style.display='block';
 sig.style.textAlign='center';
 sig.style.width='100%';
 sig.style.padding='18px 0 8px';
 sig.style.letterSpacing='4px';

 const why=q('#l7why');
 why.style.display='block';
 why.style.width='100%';
 why.style.textAlign='center';
 why.style.opacity='.72';

 const label=sig.parentElement.querySelector('span');
 if(label)label.textContent='本局訊號';
 sig.parentElement.style.display='block';
 q('#l7why').parentElement.style.display='block';
}
function tick(){
 const t=table(),ho=host(),h=header();if(!h){S.table=t;S.host=ho;S.header=S.road=null;render();return}
 const ident=`${ho}|${t}`;if(S.table!==null&&ident!==`${S.host}|${S.table}`){S.key=null;S.n=0}
 S.table=t;S.host=ho;const k=`${ident}|${h.round}|${h.B}|${h.P}|${h.T}`;if(k===S.key)S.n++;else{S.key=k;S.n=1}
 if(S.n>=3||!S.header){S.header=h;S.road=road()}render();
}
function start(){UI();tick();S.timer=setInterval(tick,500);window.L7_SA_READER={version:'1.5.0',mode:'visible-road-only-premium-ui',state:S,readHeader:header,readBigRoad:road,readRoadSummary:roadSummary,readAskRoads:askRoads,stop:()=>clearInterval(S.timer),start:()=>{clearInterval(S.timer);S.timer=setInterval(tick,500)}}}
document.readyState==='loading'?addEventListener('DOMContentLoaded',start,{once:true}):start();

/* ===== L7 MATRIX V1.5 L7 MATRIX PREMIUM UI ===== */
(function(){
 const css=document.createElement('style');
 css.textContent=`
 #l7-matrix-panel{
   width:268px!important;
   min-height:0!important;
   border-radius:18px!important;
   background:linear-gradient(145deg,rgba(9,13,20,.94),rgba(18,24,34,.91))!important;
   border:1px solid rgba(255,255,255,.12)!important;
   box-shadow:0 14px 40px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.05)!important;
   backdrop-filter:blur(16px)!important;
   -webkit-backdrop-filter:blur(16px)!important;
   overflow:hidden!important;
 }
 #l7-matrix-panel *{box-sizing:border-box!important}
 #l7-matrix-panel>div:first-child{
   padding:10px 12px!important;
   border-bottom:1px solid rgba(255,255,255,.08)!important;
 }
 #l7tbl{font-weight:700!important;font-size:12px!important;letter-spacing:.3px!important}
 #l7round{font-weight:800!important}
 #l7sync{
   font-size:11px!important;
   opacity:.85!important;
 }
 #l7sig{
   font-size:42px!important;
   line-height:1!important;
   font-weight:900!important;
   letter-spacing:8px!important;
   padding:16px 0 8px!important;
   text-shadow:0 2px 18px rgba(255,255,255,.10)!important;
 }
 #l7why{
   font-size:11px!important;
   line-height:1.45!important;
   padding:0 12px 12px!important;
   opacity:.68!important;
   white-space:nowrap!important;
   overflow:hidden!important;
   text-overflow:ellipsis!important;
 }
 `;
 document.head.appendChild(css);
})();





/* ===== L7 MATRIX V1.5 PREMIUM MEMBER UI ===== */
(function(){
 const css=document.createElement('style');
 css.textContent=`
 #l7-matrix-panel{
   position:fixed!important;
   width:238px!important;
   min-height:0!important;
   border-radius:17px!important;
   color:#f7f9ff!important;
   background:
     radial-gradient(150px 85px at 0% 0%,rgba(255,92,20,.13),transparent 65%),
     radial-gradient(180px 95px at 100% 0%,rgba(27,111,255,.15),transparent 67%),
     linear-gradient(160deg,rgba(9,13,21,.965),rgba(13,19,30,.94))!important;
   border:1px solid rgba(255,255,255,.13)!important;
   box-shadow:0 18px 50px rgba(0,0,0,.46), inset 0 1px 0 rgba(255,255,255,.055)!important;
   backdrop-filter:blur(18px) saturate(1.2)!important;
   -webkit-backdrop-filter:blur(18px) saturate(1.2)!important;
   overflow:hidden!important;
   font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang TC","Noto Sans TC",sans-serif!important;
 }
 #l7-matrix-panel:before{
   content:"";position:absolute;z-index:2;left:0;right:0;top:0;height:2px;pointer-events:none;
   background:linear-gradient(90deg,#ff8a18 0%,#ff4a1f 36%,#6a61ff 64%,#20a5ff 100%);
   box-shadow:0 0 12px rgba(73,130,255,.38);
 }
 #l7-matrix-panel *{box-sizing:border-box!important}
 #l7-matrix-panel .h{
   height:50px!important;padding:8px 9px 7px 10px!important;
   display:flex!important;align-items:center!important;justify-content:space-between!important;
   cursor:grab!important;touch-action:none!important;user-select:none!important;
   border-bottom:1px solid rgba(255,255,255,.07)!important;
   background:linear-gradient(180deg,rgba(255,255,255,.025),transparent)!important;
 }
 #l7-matrix-panel .h.dragging{cursor:grabbing!important}
 #l7-matrix-panel .l7brand{display:flex!important;align-items:center!important;gap:8px!important;min-width:0!important}
 #l7-matrix-panel .l7mark{
   position:relative!important;display:block!important;width:32px!important;height:32px!important;
   border-radius:9px!important;overflow:hidden!important;flex:0 0 32px!important;
   background:linear-gradient(135deg,rgba(255,132,20,.18),rgba(35,111,255,.18))!important;
   border:1px solid rgba(255,255,255,.14)!important;
   box-shadow:inset 0 0 16px rgba(255,255,255,.04),0 0 14px rgba(57,110,255,.10)!important;
 }
 #l7-matrix-panel .l7mark em,
 #l7-matrix-panel .l7mark strong{
   position:absolute!important;font-style:italic!important;font-weight:950!important;font-family:Arial Black,Arial,sans-serif!important;
   font-size:18px!important;line-height:32px!important;top:0!important;
 }
 #l7-matrix-panel .l7mark em{left:5px!important;color:#ff7b19!important;text-shadow:0 0 8px rgba(255,88,20,.35)!important}
 #l7-matrix-panel .l7mark strong{right:4px!important;color:#3695ff!important;text-shadow:0 0 8px rgba(35,112,255,.4)!important}
 #l7-matrix-panel .l7word{display:block!important;min-width:0!important}
 #l7-matrix-panel .l7word b{
   display:block!important;font-size:11px!important;line-height:1.1!important;letter-spacing:.9px!important;
   white-space:nowrap!important;color:#fff!important;
 }
 #l7-matrix-panel .l7word small{
   display:block!important;margin-top:3px!important;font-size:5.8px!important;line-height:1!important;
   letter-spacing:.75px!important;white-space:nowrap!important;color:rgba(218,227,244,.43)!important;
 }
 #l7-matrix-panel .h button{
   width:24px!important;height:24px!important;border-radius:8px!important;padding:0!important;
   color:rgba(255,255,255,.7)!important;background:rgba(255,255,255,.055)!important;
   border:1px solid rgba(255,255,255,.075)!important;font-size:13px!important;
 }
 #l7-matrix-panel .b{padding:9px 10px 10px!important}
 #l7-matrix-panel .r{min-height:22px!important;margin:0!important}
 #l7tbl{font-size:11px!important;font-weight:750!important;color:rgba(245,248,255,.9)!important}
 #l7host{display:none!important}
 #l7round{
   display:inline-flex!important;align-items:center!important;justify-content:center!important;
   min-width:34px!important;height:20px!important;padding:0 7px!important;border-radius:10px!important;
   font-size:10px!important;font-weight:800!important;color:#eaf1ff!important;
   background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.07)!important;
 }
 #l7sync{
   position:relative!important;font-size:9px!important;font-weight:650!important;color:rgba(226,234,248,.68)!important;
 }
 #l7sync:before{
   content:"";display:inline-block;width:5px;height:5px;border-radius:50%;margin-right:5px;
   background:#52e6a3;box-shadow:0 0 7px rgba(82,230,163,.55);vertical-align:1px;
 }
 #l7sig{
   display:block!important;width:100%!important;text-align:center!important;
   margin:4px 0 0!important;padding:13px 0 8px!important;
   font-size:40px!important;line-height:1!important;font-weight:900!important;letter-spacing:7px!important;
   color:#fff!important;text-shadow:0 3px 20px rgba(255,255,255,.09)!important;
 }
 #l7sig:before{
   content:"SIGNAL";display:block!important;margin-bottom:8px!important;
   font-size:7px!important;line-height:1!important;font-weight:700!important;letter-spacing:2.2px!important;
   color:rgba(184,198,221,.42)!important;text-shadow:none!important;
 }
 #l7why{
   display:block!important;width:100%!important;text-align:center!important;
   padding:0 5px 3px!important;font-size:9.5px!important;line-height:1.35!important;
   color:rgba(220,228,241,.58)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
 }
 #l7read,#l7pat,#l7eye,#l7small,#l7cock,#l7ask,#l7seq{display:none!important}
 #l7-matrix-panel .s{display:none!important}
 `;
 document.head.appendChild(css);
})();

})();