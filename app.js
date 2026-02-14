// app.js - Project Borahae 多歌曲非同步完整版 (2026.02.15)

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

let startTime = 0; 
let useYoutubeMode = true; 
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

// [區域 B] YouTube API 初始化 - 改為預載模式
function onYouTubeIframeAPIReady() {
    // 取得當前選單選中的 ID
    const initialKey = document.getElementById('song-select').value;
    const initialVideoId = songLibrary[initialKey].videoId;

    player = new YT.Player('player', {
        height: '160', // 給它一點實際尺寸，騙過瀏覽器的節能偵測
        width: '280',
        videoId: initialVideoId, 
        playerVars: { 
            'autoplay': 0, 
            'controls': 0, 
            'disablekb': 1, 
            'playsinline': 1, 
            'rel': 0,
            'origin': window.location.origin // 增加安全性，加快連線驗證
        },
        events: {
            'onReady': (event) => { 
                isVideoReady = true; 
                console.log("YouTube Ready & Pre-buffered");
                // 預載第一首歌，但不播放
                event.target.cueVideoById(initialVideoId);
            },
            'onStateChange': onPlayerStateChange
        }
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
        
        // 等待 JSON 載入
        const loaded = await loadSong(selectedValue);
        if (!loaded) return;

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

async function loadSong(songKey) {
    const song = songLibrary[songKey];
    if (!song) return false;

    currentSongId = songKey;

    // 先啟動歌詞 Fetch (非同步並行)
    const fetchPromise = fetch(song.file).then(res => res.json());

    // 處理 YouTube：如果 ID 沒變，就不需要 loadVideoById
    if (player && isVideoReady) {
        const currentUrl = player.getVideoUrl() || "";
        if (!currentUrl.includes(song.videoId)) {
            player.loadVideoById(song.videoId); // 只有不同首歌才重新載入
        } else {
            player.seekTo(0); // 同一首歌就回原點就好，這樣超快！
        }
    }

    try {
        currentSongData = await fetchPromise;
        
        // 設定 BPM
        const heart = document.getElementById('metronome-icon');
        if (heart && song.bpm) {
            heart.style.animationDuration = (60 / song.bpm) + "s";
        }
        return true;
    } catch (e) {
        alert("載入失敗");
        return false;
    }
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



