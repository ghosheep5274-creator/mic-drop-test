// app.js - Project Borahae 最終融合完全體 (特效與毫秒計時全數回歸)

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
 * [區域 A] YouTube API 初始化
 */
function onYouTubeIframeAPIReady() {
    console.log("Loading YouTube API...");
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
            'onReady': () => { 
                isVideoReady = true; 
                console.log("YouTube Player Ready!");
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

/**
 * [區域 B] 監聽播放狀態
 */
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateLoop();
    } else if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        showCertificate(); 
    } else {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
    }
}

/**
 * [區域 C] 啟動邏輯
 */
if (btnStart) {
    btnStart.addEventListener('click', () => {
        if (!isVideoReady || !player) {
            alert("影片載入中，請稍候...");
            return;
        }

        // 嘗試全螢幕
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
 * [區域 D] 核心循環
 */
function updateLoop() {
    if (!isPlaying || !player || typeof songData === 'undefined') return; 
    
    let ytTime = player.getCurrentTime() * 1000;

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
 * [區域 E] 毫秒計時器 (原汁原味還原)
 */
function renderSyncTimer(ms) {
    if (ms < 0) ms = 0;
    let totalSec = Math.floor(ms / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100);
    if (syncTimer) {
        syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
    }
}

/**
 * [區域 F] 渲染邏輯 (特效完全還原)
 */
function render(lyricObj) {
    if (!lyricBox) return;

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

    // 2. 一般歌詞渲染
    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; 
        void lyricBox.offsetWidth; // 強制重繪
        
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
 * [區域 G] 說明視窗與關閉邏輯
 */
function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

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

function closeCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'none';
    
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
