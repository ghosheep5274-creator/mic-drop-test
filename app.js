// app.js - Project Borahae YouTube 最終修復版

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');

// [區域 A] YouTube API 初始化 - 必須由 global 呼叫
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'e95-Gaj2iXM', 
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': () => { isVideoReady = true; },
            'onStateChange': onPlayerStateChange
        }
    });
}

// [區域 B] 狀態監聽
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateLoop();
    } else if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        showCertificate(); 
    } else {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
    }
}

// [區域 C] 啟動按鈕
if (btnStart) {
    btnStart.addEventListener('click', () => {
        if (!isVideoReady) {
            alert("影片緩衝中，請稍候...");
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

// [區域 D] 渲染循環
function updateLoop() {
    if (!isPlaying || !player || !player.getCurrentTime) return; 

    const currentTime = (player.getCurrentTime() * 1000) + offset;
    renderSyncTimer(currentTime);

    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
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

// [區域 E] 核心渲染邏輯 (修復 lyricBox 內容顯示)
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
        }
        lastRenderedText = lyricObj.text;
    }
}

function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

// [區域 F] 防止 null 報錯的事件監聽
function toggleHelp(show) {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

const helpModal = document.getElementById('help-modal');
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        if (e.target.id === 'help-modal') toggleHelp(false);
    });
}

function renderSyncTimer(ms) {
    let totalSec = Math.floor(Math.max(0, ms) / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100);
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

function closeCertificate() {
    document.getElementById('beta-cert-overlay').style.display = 'none';
    if (player) player.stopVideo();
    isPlaying = false;
    lastRenderedText = ""; 
    document.getElementById('play-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}
