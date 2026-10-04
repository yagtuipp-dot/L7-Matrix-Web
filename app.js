const support = document.getElementById("support");
const result = document.getElementById("result");
const start = document.getElementById("start");
const stop = document.getElementById("stop");
const video = document.getElementById("video");
let stream = null;

const hasMediaDevices = !!navigator.mediaDevices;
const hasDisplayMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

if (!hasMediaDevices) {
  support.textContent = "✕ navigator.mediaDevices 不存在";
} else if (!hasDisplayMedia) {
  support.textContent = "✕ getDisplayMedia API 不存在";
} else {
  support.textContent = "✓ getDisplayMedia API 存在";
}

start.onclick = async () => {
  result.textContent = "正在要求瀏覽器啟動畫面擷取…";
  if (!hasDisplayMedia) {
    result.textContent =
      "結果：API 不存在。\n\n這代表目前這個 Safari/PWA 環境不能使用 getDisplayMedia 取得螢幕畫面。請截圖這個結果給我。";
    return;
  }

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
    video.srcObject = stream;
    stop.disabled = false;
    result.textContent =
      "結果：成功取得畫面串流。\n\n請確認下方是否有本機預覽，然後截圖給我。";
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.addEventListener("ended", () => endStream("系統已結束畫面擷取。"));
    }
  } catch (err) {
    result.textContent =
      "結果：沒有取得畫面串流。\n錯誤類型：" + (err && err.name ? err.name : "Unknown") +
      "\n訊息：" + (err && err.message ? err.message : String(err));
  }
};

function endStream(message) {
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  video.srcObject = null;
  stop.disabled = true;
  if (message) result.textContent = message;
}
stop.onclick = () => endStream("測試已停止。");

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
