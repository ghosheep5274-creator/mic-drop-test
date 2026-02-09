// app.js - 核心邏輯

let startTime = 0;
let currentTime = 0;
let isPlaying = false;
let animationFrameId;
let offset = 0;

const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');

btnStart.addEventListener('click', () => {
    // 嘗試全螢幕
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
    
    startTime = Date.now();
    isPlaying = true;
    updateLoop();
});

function adjustTime(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
}

function updateLoop() {
    if (!isPlaying) return; 

    currentTime = Date.now() - startTime + offset;
    renderSyncTimer(currentTime);

    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        // 如果偵測到結束，先 render 證書，然後立刻停掉 loop
        if (currentLyric.type === 'end') {
            render(currentLyric); 
            isPlaying = false; // 這裡停掉，下面就不會再跑了
            cancelAnimationFrame(animationFrameId);
            return; 
        }
        render(currentLyric);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
}

function renderSyncTimer(ms) {
    if (ms < 0) ms = 0;
    let totalSec = Math.floor(ms / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100);
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

let lastRenderedText = "";

function render(lyricObj) {
    // 1. 警告模式
    if (lyricObj.type === 'warning') {
        document.body.classList.add('warning-mode');
        if (lastRenderedText !== lyricObj.text) {
             lyricBox.innerText = lyricObj.text;
             lyricBox.className = "type-scream"; 
             lastRenderedText = lyricObj.text;
        }
        return; 
    } else {
        document.body.classList.remove('warning-mode');
    }

    // 2. 一般歌詞
    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; // 重置
        void lyricBox.offsetWidth; // 強制重繪
        
        // 加入特效 Class
        lyricBox.classList.add('active');
        if (lyricObj.type === 'chant') {
            lyricBox.classList.add('type-chant');
            if (navigator.vibrate) navigator.vibrate(50);
        } else if (lyricObj.type === 'sing') {
            lyricBox.classList.add('type-sing', 'icon-sing');
        } else if (lyricObj.type === 'scream') {
            lyricBox.classList.add('type-scream', 'icon-scream');
            if (navigator.vibrate) navigator.vibrate([50,30,50]);
        } else if (lyricObj.type === 'wave') {
            lyricBox.classList.add('type-sing', 'icon-wave');
        }
        
        lastRenderedText = lyricObj.text;
    }
    
    // --- 🆕 新增：處理任務結束 (封測證書) ---
    if (lyricObj.type === 'end') {
        // 顯示證書
        const cert = document.getElementById('beta-cert-overlay');
        if (cert.style.display === 'none') {
            cert.style.display = 'flex';
            // 慶祝震動 (長震兩次)
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
        return; // 結束渲染
    }

  

}
// app.js 最下面加入

// 控制說明視窗開關
function toggleHelp(show) {
    const modal = document.getElementById('help-modal');
    if (show) {
        modal.style.display = 'flex'; // 用 flex 才能置中
    } else {
        modal.style.display = 'none';
    }
}

// 點擊視窗外部也可以關閉 (優化體驗)
document.getElementById('help-modal').addEventListener('click', (e) => {
    if (e.target.id === 'help-modal') {
        toggleHelp(false);
    }
});

function closeCertificate() {
    // 1. 隱藏證書遮罩
    document.getElementById('beta-cert-overlay').style.display = 'none';
    
    // 2. 停止播放狀態
    isPlaying = false;
    
    // 3. 重置所有數值（這樣下次玩才不會卡住）
    currentTime = 0;
    offset = 0;
    lastRenderedText = ""; 
    
    // 4. 停止計時動畫
    cancelAnimationFrame(animationFrameId);
    
    // 5. 切換畫面：隱藏播放頁，顯示啟動頁
    document.getElementById('play-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    
    // 6. 震動回饋（代表成功回到總部）
    if (navigator.vibrate) navigator.vibrate(50);
}