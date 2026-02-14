// app.js - Project Borahae 最終融合完全體 (2026.02.14)
// 特性：YouTube 精準同步 + 舊版防呆機制 + 自動結算修復

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

// [舊版元素回歸] 介面元素抓取
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');

/**
 * [區域 A] YouTube API 初始化
 */
function onYouTubeIframeAPIReady() {
    console.log("Loading YouTube API...");
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'e95-Gaj2iXM', // BTS - MIC Drop (Audio)
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': () => { 
                isVideoReady = true; 
                console.log("YouTube Player Ready!");
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

/**
 * [區域 B] 監聽播放狀態 (融合舊版 ENDED 邏輯)
 */
function onPlayerStateChange(event) {
    // 狀態 1: 播放中
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateLoop();
    } 
    // [舊版元素回歸] 狀態 0: 影片播完 -> 強制跳證書
    else if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        showCertificate(); 
    }
    else {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
    }
}

/**
 * [區域 C] 啟動邏輯 (融合舊版 btnStart 防呆檢查)
 */
if (btnStart) {
    btnStart.addEventListener('click', () => {
        // [舊版元素回歸] 防止 API 沒載入好就按
        if (!isVideoReady || !player) {
            alert("影片載入中，請稍候...");
            return;
        }

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        }
        
        startScreen.style.display = 'none';
        playScreen.style.display = 'flex';
        
        player.playVideo();
    });
}

function adjustTime(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
}

/**
 * [區域 D] 核心循環 (融合舊版 songData 檢查 + 0秒 bug 修復)
 */
function updateLoop() {
    // [舊版元素回歸] 防止 songData 未定義導致報錯
    if (!isPlaying || !player || typeof songData === 'undefined') return; 
    
    // 取得時間
    let ytTime = player.getCurrentTime() * 1000;

    // [舊版元素回歸] 0秒 bug 修復：如果 YouTube 還沒回傳時間，先不執行
    if (ytTime === 0 && isPlaying) {
        animationFrameId = requestAnimationFrame(updateLoop);
        return;
    }

    const currentTime = ytTime + offset; 
    renderSyncTimer(currentTime);

    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        // 雙重保險：時間軸到了也觸發
        if (currentLyric.type === 'end') {
            showCertificate();
            isPlaying = false;
            player.pauseVideo();
            return; 
        }
        render(currentLyric);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
}

/**
 * [區域 E] 渲染邏輯 (融合舊版 DOM 存在檢查)
 */
function render(lyricObj) {
    if (!lyricBox) return; // 防止找不到框框報錯

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
        lyricBox.className = ""; 
        void lyricBox.offsetWidth; // 強制重繪
        
        lyricBox.classList.add('active');
        
        // 特效邏輯
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

/**
 * [區域 F] 證書與視窗邏輯 (融合舊版獨立函式)
 */
function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function renderSyncTimer(ms) {
    if (!syncTimer) return;
    let totalSec = Math.floor(Math.max(0, ms) / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100);
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

// 說明視窗 (防呆版)
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
    
    // 停止 YouTube
    if (player) {
        player.stopVideo();
        player.seekTo(0);
    }
    
    isPlaying = false;
    offset = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    
    if (navigator.vibrate) navigator.vibrate(50);
}
