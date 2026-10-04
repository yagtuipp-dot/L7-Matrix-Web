const AU8="https://www.88au8.net/mobile/#/home";
const $=id=>document.getElementById(id);
$("enter").onclick=()=>{
 if($("code").value.trim().toUpperCase()!=="L7TEST"){ $("err").textContent="測試序號不正確"; return; }
 $("login").classList.add("hide"); $("main").classList.remove("hide");
};
$("embed").onclick=()=>{
 $("frameWrap").classList.remove("hide");
 $("state").textContent="正在嘗試內嵌 AU8";
 $("detail").textContent="若網站禁止 iframe，畫面可能空白或顯示拒絕連線。";
 const f=$("gameFrame");
 f.src=AU8;
 f.onload=()=>{
   $("state").textContent="iframe 已完成一次載入事件";
   $("detail").textContent="請直接觀察下方是否真的顯示 AU8 並可操作；跨網域限制下，L7 無法直接讀取 iframe 內部 DOM。";
 };
};
$("normal").onclick=()=>location.href=AU8;
$("close").onclick=()=>{ $("gameFrame").src="about:blank"; $("frameWrap").classList.add("hide"); $("state").textContent="測試已關閉"; $("detail").textContent="可再次測試。"; };
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");