// app.js - Project Borahae YouTube 整合修正版 (支援自動結算)

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

// 介面元素
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');

/**
 * [區域 A] YouTube IFrame API 初始化
 */
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'e95-Gaj2iXM', // 使用你指定的 ID
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
                console.log("YouTube Player Ready");
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

/**
 * [區域 B] 監聽播放狀態 (新增 ENDED 判定)
 */
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateLoop();
    } 
    // 🆕 修正：如果影片播完了，直接強制跳證書
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
 * [區域 C] 啟動邏輯
 */
btnStart.addEventListener('click', () => {
    if (!isVideoReady) {
        alert("影片仍在緩衝中，請稍候...");
        return;
    }

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
    
    player.playVideo();
});

function adjustTime(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
}

/**
 * [區域 D] 核心渲染循環
 */
function updateLoop() {
    if (!isPlaying || !player || !player.getCurrentTime) return; 

    const currentTime = (player.getCurrentTime() * 1000) + offset;
    renderSyncTimer(currentTime);

    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        // 如果時間軸走到 end，也觸發證書
        if (currentLyric.type === 'end') {
            showCertificate();
            isPlaying = false;
            player.pauseVideo();
            cancelAnimationFrame(animationFrameId);
            return; 
        }
        render(currentLyric);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
}

/**
 * [區域 E] 顯示證書邏輯 (獨立化)
 */
function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert && cert.style.display === 'none') {
        cert.style.display = 'flex';
        // 慶祝震動
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
}

function renderSyncTimer(ms) {
    if (ms < 0) ms = 0;
    let totalSec = Math.floor(ms / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100);
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

function render(lyricObj) {
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

/**
 * [區域 F] 關閉與重置
 */
function toggleHelp(show) {
    const modal = document.getElementById('help-modal');
    modal.style.display = show ? 'flex' : 'none';
}

document.getElementById('help-modal').addEventListener('click', (e) => {
    if (e.target.id === 'help-modal') toggleHelp(false);
});

function closeCertificate() {
    document.getElementById('beta-cert-overlay').style.display = 'none';
    if (player) player.stopVideo();
    
    isPlaying = false;
    offset = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    document.getElementById('play-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate(50);
}
