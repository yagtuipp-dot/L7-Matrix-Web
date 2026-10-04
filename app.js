const TEST_CODE = "L7TEST";
const AU8_URL = "https://www.88au8.net/mobile/#/home";
const login = document.getElementById("login");
const platforms = document.getElementById("platforms");
const code = document.getElementById("code");
const error = document.getElementById("error");

function showPlatforms(){
  login.classList.add("hidden");
  platforms.classList.remove("hidden");
}
function showLogin(){
  platforms.classList.add("hidden");
  login.classList.remove("hidden");
}
document.getElementById("loginBtn").onclick = () => {
  if(code.value.trim().toUpperCase() === TEST_CODE){
    sessionStorage.setItem("l7_access","1");
    error.textContent = "";
    showPlatforms();
  } else {
    error.textContent = "測試序號不正確";
  }
};
code.addEventListener("keydown", e => { if(e.key === "Enter") document.getElementById("loginBtn").click(); });
document.getElementById("logoutBtn").onclick = () => {
  sessionStorage.removeItem("l7_access"); code.value=""; showLogin();
};
document.getElementById("au8Btn").onclick = () => {
  // iOS/PWA cannot reliably embed every third-party site because the site may
  // block frames. Opening the normal mobile URL is the most reliable first test.
  window.location.href = AU8_URL;
};
if(sessionStorage.getItem("l7_access")==="1") showPlatforms();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));