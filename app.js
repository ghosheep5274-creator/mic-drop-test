// app.js - Project Borahae 多歌曲非同步完整版 (2026.02.15)

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

let startTime = 0; 
let useYoutubeMode = false; // 🔴 改為 false
let pauseStartTime = 0;

let currentSongData = []; 
let currentSongId = "mic_drop"; 

// [區域 A] 介面元素抓取
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');
const musicToggle = document.getElementById('music-toggle'); 
const modeText = document.getElementById('mode-text');
const btnPause = document.getElementById('btn-pause');
const songSelect = document.getElementById('song-select');

// [區域 B] 模式切換監聽 - 修正即時同步版
if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
        // 1. 在切換前，先記下「這一瞬間」播到幾毫秒了
        let currentProgress = useYoutubeMode ? 
            (player.getCurrentTime() * 1000) : 
            (Date.now() - startTime);

        useYoutubeMode = e.target.checked;

        // 2. 關鍵同步邏輯
        if (useYoutubeMode) {
            // 轉為音樂模式：叫 YouTube 飛到剛剛的位置
            if (player && isVideoReady) {
                player.seekTo(currentProgress / 1000);
                if (isPlaying) player.playVideo(); // 如果正在練，音樂也跟著開
            }
        } else {
            // 轉為離線模式：校準虛擬起點 (startTime)
            // 讓 (Date.now() - startTime)剛好等於剛才的進度
            startTime = Date.now() - currentProgress;
            if (player) player.pauseVideo(); // 離線模式就讓音樂閉嘴
        }

        // 3. UI 顯示更新
        modeText.innerText = useYoutubeMode ? "🎵 音樂模式 (需網路)" : "🔕 離線模式 (純文字)";
        modeText.style.color = useYoutubeMode ? "#AB46D2" : "#aaa";
    });
}

// [區域 C] YouTube API 初始化
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

function onPlayerStateChange(event) {
    if (startScreen && startScreen.style.display !== 'none') {
        if (event.data === YT.PlayerState.PLAYING) player.stopVideo();
        return;
    }
    if (useYoutubeMode) {
        if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            updatePauseButton(true);
            updateLoop();
        } else if (event.data === YT.PlayerState.PAUSED) {
            isPlaying = false;
            updatePauseButton(false);
            cancelAnimationFrame(animationFrameId);
        } else if (event.data === YT.PlayerState.ENDED) {
            finishGame();
        }
    }
}

// [區域 D] 啟動與非同步載入
if (btnStart) {
    btnStart.addEventListener('click', async () => {
        const selectedValue = songSelect ? songSelect.value : "mic_drop";
        const loaded = await loadSong(selectedValue);
        if (!loaded) return;

        if (useYoutubeMode) {
            if (!isVideoReady || !player) {
                alert("YouTube 載入中...");
                return;
            }
            enterPlayScreen();
            player.playVideo(); // 音樂模式才執行播放
        } else {
            // 🔴 離線模式保險：確保 YouTube 停止播放
            if (player && typeof player.stopVideo === 'function') {
                player.stopVideo();
            }
            
            enterPlayScreen();
            startTime = Date.now(); 
            isPlaying = true;
            updatePauseButton(true);
            updateLoop();
        }
    });
}

async function loadSong(songKey) {
    const song = songLibrary[songKey];
    if (!song) {
        alert("找不到歌曲資料：" + songKey);
        return false;
    }
    currentSongId = songKey;
    try {
        const response = await fetch(song.file);
        if (!response.ok) throw new Error("Fetch failed");
        currentSongData = await response.json();
    } catch (e) {
        alert("歌詞讀取失敗，請確認資料夾中是否有 " + song.file);
        return false;
    }
    if (player && typeof player.cueVideoById === 'function') {
        player.cueVideoById(song.videoId);
    }
    const heart = document.getElementById('metronome-icon');
    if (heart && song.bpm) {
        const duration = (60 / song.bpm) + "s";
        heart.style.animationDuration = duration;
        console.log(`BPM set to ${song.bpm}, duration: ${duration}`);
    }
    return true;
}

function enterPlayScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
}

// [區域 E] 核心循環
function updateLoop() {
    if (!isPlaying) return;
    let currentMs = useYoutubeMode ? (player.getCurrentTime() * 1000) : (Date.now() - startTime);
    if (useYoutubeMode && currentMs === 0) {
        animationFrameId = requestAnimationFrame(updateLoop);
        return;
    }
    const currentTime = currentMs + offset; 
    renderSyncTimer(currentTime);
    const currentLyric = currentSongData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, currentSongData[0]);
    if (currentLyric) {
        if (currentLyric.type === 'end') { finishGame(); return; }
        render(currentLyric);
    }
    animationFrameId = requestAnimationFrame(updateLoop);
}

// [區域 F] 渲染與特效
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

// [區域 G] UI 互動函式 (綁定至 window 以修復 ReferenceError)

window.togglePlay = function() {
    if (isPlaying) {
        isPlaying = false;
        updatePauseButton(false);
        cancelAnimationFrame(animationFrameId);
        if (useYoutubeMode && player) player.pauseVideo();
        else pauseStartTime = Date.now();
    } else {
        isPlaying = true;
        updatePauseButton(true);
        if (useYoutubeMode && player) player.playVideo();
        else { startTime += (Date.now() - pauseStartTime); updateLoop(); }
    }
};

window.returnToHome = function() {
    if (confirm("確定要回到首頁嗎？目前的練習將不會計次。")) {
        closeCertificate();
    }
};

function updatePauseButton(active) {
    if (btnPause) {
        btnPause.innerText = active ? "⏸ 暫停" : "▶️ 繼續";
        btnPause.style.background = active ? "rgba(171, 70, 210, 0.3)" : "#AB46D2";
        btnPause.style.animation = active ? "none" : "pulse 1.5s infinite";
    }
    const heart = document.getElementById('metronome-icon');
    if (heart) {
        if (active) heart.classList.remove('paused-animation');
        else heart.classList.add('paused-animation');
    }
}

window.adjustTime = function(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
    const toast = document.querySelector('.toast') || createToast();
    toast.innerText = `校正: ${offset > 0 ? '+' : ''}${offset}ms`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1000);
};

function createToast() {
    const t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
    return t;
}

window.toggleHelp = function(show) {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

function finishGame() {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    if (useYoutubeMode && player) player.pauseVideo();
    const key = `${currentSongId}_count`;
    let count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, count);
    showCertificate();
}

function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function closeCertificate() {
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'none';
    if (player && typeof player.stopVideo === 'function') player.stopVideo();
    isPlaying = false;
    offset = 0;
    startTime = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    updatePauseButton(false);
}

function renderSyncTimer(ms) {
    if (!syncTimer) return;
    let totalSec = Math.floor(Math.max(0, ms) / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100); 
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}




