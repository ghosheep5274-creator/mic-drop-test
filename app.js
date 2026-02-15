// app.js - Project Borahae 多歌曲非同步完整版 (2026.02.15)

let lyricsCache = {}; // 🆕 用來存放所有下載好的歌詞 JSON
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

// [區域 B] 模式切換監聽 - 安全防呆版
if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
        // 1. 安全獲取當前進度
        let currentProgress = 0;
        
        if (useYoutubeMode) {
            // 如果原本是 YouTube 模式，嘗試抓取播放器時間
            // 🛑 防呆：確認 player 真的存在且有 getCurrentTime 方法
            if (player && typeof player.getCurrentTime === 'function') {
                currentProgress = player.getCurrentTime() * 1000;
            } else {
                // 如果 player 壞掉或沒準備好，改用系統時間推算 (Fallback)
                currentProgress = Date.now() - startTime - offset;
            }
        } else {
            // 如果原本是離線模式，直接用系統時間
            currentProgress = Date.now() - startTime;
        }

        // 2. 切換模式變數
        useYoutubeMode = e.target.checked; 

        // 3. 更新 UI 文字
        if (modeText) {
            modeText.innerText = "🎵 音樂模式";
            modeText.style.color = useYoutubeMode ? "#AB46D2" : "#888"; // 紫色 vs 灰色
        }

        // 4. 重置起始時間 (將剛才算出的 currentProgress 帶入新的基準)
        if (useYoutubeMode) {
            // 切換到 Online: 嘗試 seek 到對應秒數
            if (player && typeof player.seekTo === 'function') {
                player.seekTo(currentProgress / 1000, true);
                if (isPlaying) player.playVideo();
            }
        } else {
            // 切換到 Offline: 重設 Date.now() 基準點
            startTime = Date.now() - currentProgress;
        }
        
        console.log(`Mode switched. New mode: ${useYoutubeMode ? 'Online' : 'Offline'}, Progress: ${currentProgress}ms`);
    });
}

// [區域 C] YouTube API 初始化

// 🆕 自動預載所有歌曲 JSON 的函式
async function preloadAllLyrics() {
    console.log("開始預載所有歌曲歌詞...");
    
    // 取得 songs.js 裡所有的歌曲 Key (如 mic_drop, dna)
    const songKeys = Object.keys(songLibrary);
    
    // 使用 Promise.all 同時發送所有請求，速度最快
    await Promise.all(songKeys.map(async (key) => {
        try {
            const song = songLibrary[key];
            const response = await fetch(song.file + '?t=' + Date.now());
            if (response.ok) {
                lyricsCache[key] = await response.json();
                console.log(`✅ ${key} 預載完成`);
            }
        } catch (e) {
            console.error(`❌ ${key} 預載失敗:`, e);
        }
    }));
    
    console.log("所有歌曲已就緒，現在可以離線使用了！");
}

// 在頁面載入完成後立即執行預載
window.addEventListener('load', preloadAllLyrics);


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
// 🔴 關鍵修改點：優先從快取拿資料
    if (lyricsCache[songKey]) {
        currentSongData = lyricsCache[songKey];
        console.log(`🚀 從記憶體讀取 ${songKey}`);
    } else {
        // 如果還沒預載完（例如網路極慢），才進行緊急抓取
        try {
            const response = await fetch(song.file + '?t=' + Date.now());
            currentSongData = await response.json();
            lyricsCache[songKey] = currentSongData; // 補存入快取
        } catch (e) {
            alert("歌詞載入失敗，請確認網路連線");
            return false;
        }
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
        resetToTitle();
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
    console.log("Game Finished"); // Debug

    // 1. 停止播放狀態
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    
    // 2. 停止影片 (如果是在 YouTube 模式)
    if (useYoutubeMode && player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }

    // 3. 累計次數 (這是給 Training 頁面判定進度用的)
    const key = `${currentSongId}_count`;
    let count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, count);
    console.log(`Song ${currentSongId} count: ${count}`);

    // 4. 不跳證書，直接休息一下後返回首頁
    // 設定 1.8 秒緩衝，讓使用者意識到歌曲結束，不要太突然切掉
    setTimeout(() => {
        resetToTitle(); 
    }, 1800); 
}

// 🆕 新函式：重置並返回標題畫面 (取代原本的 closeCertificate)
function resetToTitle() {
    // 切換介面
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    
    // 重置所有變數
    isPlaying = false;
    offset = 0;
    startTime = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    // 再次確保影片停止 (防呆)
    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }
    
    // 重置暫停按鈕外觀
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












