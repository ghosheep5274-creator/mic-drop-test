// app.js - Project Borahae YouTube 整合版 (2026.02.14)

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
 * 必須在 index.html 引入 https://www.youtube.com/iframe_api
 */
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'e95-Gaj2iXM', // Mic Drop 預設 ID
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
 * [區域 B] 監聽播放狀態
 * 當影片真正開始播放時，才啟動歌詞渲染循環
 */
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateLoop();
    } else {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
    }
}

/**
 * [區域 C] 啟動邏輯修改
 * 點擊 START 時觸發影片播放
 */
btnStart.addEventListener('click', () => {
    if (!isVideoReady) {
        alert("影片仍在緩衝中，請稍候...");
        return;
    }

    // 嘗試全螢幕 (INTJ 的嚴謹：這需要使用者主動觸發)
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
    
    // 啟動 YouTube 播放 (此動作會觸發 onPlayerStateChange)
    player.playVideo();
});

function adjustTime(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
}

/**
 * [區域 D] 核心循環：時間基準改為 player.getCurrentTime()
 */
function updateLoop() {
    if (!isPlaying || !player || !player.getCurrentTime) return; 

    // 將 YouTube 當前秒數轉為毫秒，並加上手動微調值
    const currentTime = (player.getCurrentTime() * 1000) + offset;
    
    renderSyncTimer(currentTime);

    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        // 偵測結束
        if (currentLyric.type === 'end') {
            render(currentLyric); 
            isPlaying = false;
            player.pauseVideo(); // 同步停止影片
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

    // 2. 一般歌詞渲染
    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; 
        void lyricBox.offsetWidth; // 強制重繪以重啟 CSS 動畫
        
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
    
    // 3. 任務結束 (封測證書)
    if (lyricObj.type === 'end') {
        const cert = document.getElementById('beta-cert-overlay');
        if (cert.style.display === 'none') {
            cert.style.display = 'flex';
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }
}

/**
 * [區域 E] 說明與關閉邏輯 (含 YouTube 重置)
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
    
    // 停止影片並回到開頭
    if (player) {
        player.stopVideo();
    }
    
    isPlaying = false;
    offset = 0;
    lastRenderedText = ""; 
    
    cancelAnimationFrame(animationFrameId);
    
    document.getElementById('play-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    
    if (navigator.vibrate) navigator.vibrate(50);
}