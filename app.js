// app.js - 最終人性化版 (回首頁 + 暫停功能)
// 特性：雙核心模式 + 完整暫停邏輯 + 強制回首頁

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

// 時間控制變數
let startTime = 0; 
let useYoutubeMode = true; 
let pauseStartTime = 0; // 紀錄暫停當下的時間

// [介面元素抓取]
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');
const musicToggle = document.getElementById('music-toggle'); 
const modeText = document.getElementById('mode-text');
const btnPause = document.getElementById('btn-pause'); // 抓暫停鈕

// [區域 A] 切換開關監聽
if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
        useYoutubeMode = e.target.checked;
        if (useYoutubeMode) {
            modeText.innerText = "🎵 音樂模式 (需網路)";
            modeText.style.color = "#AB46D2";
        } else {
            modeText.innerText = "🔕 離線模式 (純文字)";
            modeText.style.color = "#aaa";
        }
    });
}

// [區域 B] YouTube API 初始化
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0', width: '0', videoId: 'e95-Gaj2iXM', 
        playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'playsinline': 1, 'rel': 0 },
        events: {
            'onReady': () => { isVideoReady = true; console.log("YouTube Ready"); },
            'onStateChange': onPlayerStateChange
        }
    });
}

// [區域 C] 狀態監聽 (整合暫停狀態 UI)
function onPlayerStateChange(event) {
    if (startScreen && startScreen.style.display !== 'none') {
        if (event.data === YT.PlayerState.PLAYING) player.stopVideo();
        return;
    }

    if (useYoutubeMode) {
        if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            updatePauseButton(true); // 變為 "暫停"
            updateLoop();
        } else if (event.data === YT.PlayerState.PAUSED) {
            isPlaying = false;
            updatePauseButton(false); // 變為 "播放"
            cancelAnimationFrame(animationFrameId);
        } else if (event.data === YT.PlayerState.ENDED) {
            finishGame();
        }
    }
}

// [區域 D] 啟動與暫停邏輯
if (btnStart) {
    btnStart.addEventListener('click', () => {
        if (useYoutubeMode) {
            if (!isVideoReady || !player) {
                alert("YouTube 載入中...");
                return;
            }
            enterPlayScreen();
            player.playVideo();
        } else {
            enterPlayScreen();
            startTime = Date.now(); 
            isPlaying = true;
            updatePauseButton(true);
            updateLoop();
        }
    });
}

function enterPlayScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
}

// 🆕 暫停/播放 切換功能
window.togglePlay = function() {
    if (isPlaying) {
        // 執行暫停
        isPlaying = false;
        updatePauseButton(false);
        cancelAnimationFrame(animationFrameId);
        
        if (useYoutubeMode && player) {
            player.pauseVideo();
        } else {
            // 離線模式：紀錄暫停開始的時間點
            pauseStartTime = Date.now();
        }
    } else {
        // 執行播放
        isPlaying = true;
        updatePauseButton(true);
        
        if (useYoutubeMode && player) {
            player.playVideo();
        } else {
            // 離線模式：把「休息了多久」加回到 startTime，讓時間接續
            const pausedDuration = Date.now() - pauseStartTime;
            startTime += pausedDuration;
            updateLoop();
        }
    }
};

// 🆕 回首頁功能 (暴力重置所有狀態)
window.returnToHome = function() {
    if (confirm("確定要中斷應援並回到首頁嗎？")) {
        closeCertificate(); // 借用這個函式的重置邏輯
    }
};


function updatePauseButton(active) {
    // 1. 控制按鈕外觀
    if (btnPause) {
        btnPause.innerText = active ? "⏸ 暫停" : "▶️ 繼續";
        btnPause.style.background = active ? "rgba(171, 70, 210, 0.3)" : "#AB46D2";
        
        // 暫停時讓按鈕閃爍，提示使用者點擊繼續
        if (!active) {
            btnPause.style.animation = "pulse 1.5s infinite";
        } else {
            btnPause.style.animation = "none";
        }
    }

    // 2. 控制愛心凍結 (魔鬼細節)
    const heart = document.getElementById('metronome-icon');
    if (heart) {
        if (active) {
            // 播放中：移除暫停標籤，動畫繼續
            heart.classList.remove('paused-animation');
        } else {
            // 暫停中：加上暫停標籤，凍結在半空中
            heart.classList.add('paused-animation');
        }
    }
}

// [區域 E] 核心循環
function updateLoop() {
    if (!isPlaying) return;
    if (typeof songData === 'undefined') return;

    let currentMs = 0;

    if (useYoutubeMode) {
        if (!player || typeof player.getCurrentTime !== 'function') return;
        currentMs = player.getCurrentTime() * 1000;
        if (currentMs === 0) {
            animationFrameId = requestAnimationFrame(updateLoop);
            return;
        }
    } else {
        currentMs = Date.now() - startTime;
    }

    const currentTime = currentMs + offset; 
    renderSyncTimer(currentTime);

    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        if (currentLyric.type === 'end') {
            finishGame();
            return; 
        }
        render(currentLyric);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
}

// [區域 F] 渲染邏輯
function render(lyricObj) {
    if (!lyricBox) return;

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

    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; 
        void lyricBox.offsetWidth; 
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
}

// [區域 G] 輔助功能
function finishGame() {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    if (useYoutubeMode && player) player.pauseVideo();
    showCertificate();
}

function renderSyncTimer(ms) {
    if (!syncTimer) return;
    if (ms < 0) ms = 0;
    
    let totalSec = Math.floor(ms / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100); 
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);
let toastTimeout;

window.adjustTime = function(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
    const sign = offset > 0 ? '+' : '';
    toast.innerText = `校正: ${sign}${offset}ms`;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 1000);
};

function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

const helpModal = document.getElementById('help-modal');
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        if (e.target.id === 'help-modal') toggleHelp(false);
    });
}

function toggleHelp(show) {
    if (helpModal) helpModal.style.display = show ? 'flex' : 'none';
}

function closeCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'none';

    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';

    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo(); 
    }
    
    isPlaying = false;
    offset = 0;
    startTime = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    updatePauseButton(false); // 重置按鈕狀態
    
    if (navigator.vibrate) navigator.vibrate(50);
}

