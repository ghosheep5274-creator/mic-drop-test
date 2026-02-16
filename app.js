// app.js - Project Borahae 最終整合版 (2026.02.15)
// 包含：自動選單生成、歌詞預載、雙模式切換、防呆機制

let lyricsCache = {}; // 存放預載歌詞
let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

let startTime = 0; 
let useYoutubeMode = false; 
let pauseStartTime = 0;

let currentSongData = []; 
let currentSongId = "mic_drop"; // 預設值

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

// [區域 B] 初始化邏輯 (自動選單 & 預載)

// 1. 自動渲染歌曲選單
function renderSongSelect() {
    if (!songSelect || typeof songLibrary === 'undefined') return;

    songSelect.innerHTML = ""; // 清空

    // 產生選項
    Object.entries(songLibrary).forEach(([id, data]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = data.title;
        songSelect.appendChild(option);
    });

    // 讀取上次選擇
    const lastPicked = localStorage.getItem('last_picked_song');
    if (lastPicked && songLibrary[lastPicked]) {
        songSelect.value = lastPicked;
        currentSongId = lastPicked;
    } else {
        // 如果沒有紀錄，就用選單的第一個
        currentSongId = songSelect.value;
    }
    console.log("選單初始化完成，目前選擇:", currentSongId);
}

// 2. 自動預載所有歌詞
async function preloadAllLyrics() {
    console.log("開始預載所有歌曲歌詞...");
    if (typeof songLibrary === 'undefined') return;

    const songKeys = Object.keys(songLibrary);
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
    console.log("歌詞預載作業結束。");
}

// 頁面載入時執行初始化
window.addEventListener('DOMContentLoaded', () => {
    initEffects(); // 👈 加入這行，建立夕陽背景層
    renderSongSelect();
    preloadAllLyrics();
});

// 監聽選單改變
if (songSelect) {
    songSelect.addEventListener('change', (e) => {
        currentSongId = e.target.value;
        localStorage.setItem('last_picked_song', currentSongId);
        console.log("切換歌曲至:", currentSongId);
    });
}

// [區域 C] 模式切換邏輯
if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
        let currentProgress = 0;
        
        // 1. 計算當前進度
        if (useYoutubeMode) {
            if (player && typeof player.getCurrentTime === 'function') {
                currentProgress = player.getCurrentTime() * 1000;
            } else {
                currentProgress = Date.now() - startTime - offset;
            }
        } else {
            currentProgress = Date.now() - startTime;
        }

        // 2. 切換狀態
        useYoutubeMode = e.target.checked; 

        // 3. 更新 UI
        if (modeText) {
            modeText.innerText = "🎵 音樂模式";
            modeText.style.color = useYoutubeMode ? "#AB46D2" : "#888"; 
        }

        // 4. 重置時間基準
        if (useYoutubeMode) {
            if (player && typeof player.seekTo === 'function') {
                player.seekTo(currentProgress / 1000, true);
                if (isPlaying) player.playVideo();
            }
        } else {
            startTime = Date.now() - currentProgress;
        }
    });
}

// [區域 D] YouTube API
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
    // 如果還在首頁就偷跑，強制停止
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

// [區域 E] 遊戲啟動 (Start Game)
if (btnStart) {
    btnStart.addEventListener('click', async () => {
        // 確保 currentSongId 有值
        const targetSong = songSelect ? songSelect.value : currentSongId;
        const loaded = await loadSong(targetSong);
        if (!loaded) return;

        if (useYoutubeMode) {
            if (!isVideoReady || !player) {
                alert("YouTube 載入中，請稍後再試...");
                return;
            }
            enterPlayScreen();
            player.playVideo();
        } else {
            if (player && typeof player.stopVideo === 'function') player.stopVideo();
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
    
    // 優先從快取讀取
    if (lyricsCache[songKey]) {
        currentSongData = lyricsCache[songKey];
        console.log(`🚀 從記憶體讀取 ${songKey}`);
    } else {
        try {
            const response = await fetch(song.file + '?t=' + Date.now());
            currentSongData = await response.json();
            lyricsCache[songKey] = currentSongData;
        } catch (e) {
            alert("歌詞載入失敗，請檢查網路。");
            return false;
        }
    }
    
    // 設定 YouTube 影片
    if (player && typeof player.cueVideoById === 'function') {
        player.cueVideoById(song.videoId);
    }
    
    // 設定心跳 BPM
    const heart = document.getElementById('metronome-icon');
    if (heart && song.bpm) {
        const duration = (60 / song.bpm) + "s";
        heart.style.animationDuration = duration;
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

// [區域 F] 核心循環 (Game Loop)
function updateLoop() {
    if (!isPlaying) return;
    
    let currentMs = useYoutubeMode ? (player.getCurrentTime() * 1000) : (Date.now() - startTime);
    
    // YouTube 有時候剛開始會回傳 0，若是 0 則繼續跑 loop 等待
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

// [區域 G] 渲染 (Render)
function render(lyricObj) {
    if (!lyricBox) return;

    // 🌸 新增：偵測特效指令
    if (lyricObj.type === 'sakura_start') {
        startSakura();
        return; // 這種指令不需要印出文字，直接跳出
    }
    if (lyricObj.type === 'sakura_stop') {
        stopSakura();
        return;
    }

    // 🔥 新增：I Need U 特效指令
    if (lyricObj.type === 'sunset_start') { showSunset(); return; }
    if (lyricObj.type === 'sunset_stop') { hideSunset(); return; }
    if (lyricObj.type === 'ember_start') { startEmbers(); return; }
    if (lyricObj.type === 'ember_stop') { stopEmbers(); return; }

    
    // 處理特殊 Type 樣式
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
        void lyricBox.offsetWidth; // 觸發重繪 (Reflow) 以重啟動畫
        lyricBox.classList.add('active');
        
        // 根據 Type 加 class
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

// [區域 H] 控制與輔助函式

// 暫停/繼續
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

// 返回首頁
window.returnToHome = function() {
    if (confirm("確定要回到首頁嗎？目前的練習將不會計次。")) {
        resetToTitle();
    }
};

// 更新暫停按鈕外觀
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

// 微調時間
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

// 顯示/隱藏說明
window.toggleHelp = function(show) {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

// 遊戲結束邏輯
function finishGame() {
    console.log("Game Finished"); 
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    
    if (useYoutubeMode && player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }

    // 增加計數
    const key = `${currentSongId}_count`;
    let count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, count);
    console.log(`Song ${currentSongId} count: ${count}`);

    //🌸 新增：歌曲結束時停止生成 (舊的讓它飄完很美)
    stopSakura();
    clearAllEffects(); // 👈 歌曲結束也清空
    
    // 延遲後回首頁
    setTimeout(() => {
        resetToTitle(); 
    }, 1800); 
}

// 重置回首頁
function resetToTitle() {
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    
    isPlaying = false;
    offset = 0;
    startTime = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }
    clearSakura();
    clearAllEffects(); // 👈 改用這個大掃除函式
    updatePauseButton(false);
}

// 渲染計時器
function renderSyncTimer(ms) {
    if (!syncTimer) return;
    let totalSec = Math.floor(Math.max(0, ms) / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100); 
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}


// ===========================
// [區域 I] 特效引擎 (Sakura, Sunset, Embers)
// ===========================

let sakuraInterval = null;

// 啟動櫻花
function startSakura() {
    if (sakuraInterval) return; // 避免重複啟動
    console.log("🌸 櫻花季開始");
    
    // 每 300毫秒 產生一片花瓣 (數字越小花越密)
    sakuraInterval = setInterval(createPetal, 600);
}

// 停止櫻花 (停止生成，舊的讓它飄完)
function stopSakura() {
    if (sakuraInterval) {
        clearInterval(sakuraInterval);
        sakuraInterval = null;
        console.log("🌸 櫻花季結束");
    }
}

// 強制清除所有花瓣 (回首頁時用)
function clearSakura() {
    stopSakura();
    document.querySelectorAll('.sakura-petal').forEach(el => el.remove());
}

// 產生單片花瓣
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');
    
    // 隨機屬性
    const size = Math.random() * 10 + 5 + 'px'; // 大小 5~15px
    const left = Math.random() * 100 + 'vw'; // 水平位置 0~100%
    const duration = Math.random() * 5 + 8 + 's'; // 飄落時間 4~7秒 (慢一點比較溫柔)
    const delay = Math.random() * 2 + 's'; // 隨機延遲

    petal.style.width = size;
    petal.style.height = size;
    petal.style.left = left;
    petal.style.animationDuration = duration;
    // petal.style.animationDelay = delay; // 不需要延遲，直接下比較順
    
    // 偶爾出現深粉紅
    if (Math.random() > 0.8) {
        petal.style.backgroundColor = '#ffb7b2'; 
    }

    document.body.appendChild(petal);

    // 動畫結束後自我銷毀，避免記憶體洩漏
    setTimeout(() => {
        petal.remove();
    }, parseFloat(duration) * 1000);
}



// --- 通用初始化 (在 window.onload 呼叫) ---
function initEffects() {
    // 如果還沒有夕陽層，就建立一個
    if (!document.getElementById('sunset-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'sunset-overlay';
        // 把它插在 body 的最前面，確保在文字後面
        document.body.insertBefore(overlay, document.body.firstChild);
    }
}
// 記得在下面的 window.addEventListener('DOMContentLoaded', ...) 裡呼叫 initEffects();


// --- 🔥 Sunset + Embers (I Need U) ---
let emberInterval = null;

// 啟動夕陽
function showSunset() {
    const overlay = document.getElementById('sunset-overlay');
    if (overlay) overlay.classList.add('active');
    console.log("🌅 夕陽漸層啟動");
}

// 關閉夕陽
function hideSunset() {
    const overlay = document.getElementById('sunset-overlay');
    if (overlay) overlay.classList.remove('active');
    console.log("🌃 回歸黑夜");
}

// 啟動火星
function startEmbers() {
    if (emberInterval) return;
    console.log("🔥 餘燼開始燃燒");
    // 頻率：每 320ms 產生一顆 (密集一點比較有燃燒感)
    emberInterval = setInterval(createEmber, 320);
}

// 停止火星生成
function stopEmbers() {
    if (emberInterval) {
        clearInterval(emberInterval);
        emberInterval = null;
        console.log("🔥 餘燼熄滅");
    }
}

// 清除所有特效 (回首頁用)
function clearAllEffects() {
    // 停止生成器
    stopSakura(); // 如果有櫻花
    stopEmbers(); // 如果有火星
    hideSunset(); // 關閉夕陽

    // 移除畫面上的殘留粒子
    document.querySelectorAll('.sakura-petal').forEach(el => el.remove());
    document.querySelectorAll('.ember-particle').forEach(el => el.remove());
}

// 產生單顆火星
function createEmber() {
    const ember = document.createElement('div');
    ember.classList.add('ember-particle');
    
    // 隨機屬性
    const size = Math.random() * 5 + 2 + 'px'; // 大小 2~7px
    const left = Math.random() * 100 + 'vw'; // 水平位置
    const duration = Math.random() * 4 + 5 + 's'; // 飄升速度 3~7秒
    const drift = (Math.random() * 150 - 75) + 'px'; // 左右大幅飄移 (-75px ~ 75px)

    ember.style.width = size;
    ember.style.height = size;
    ember.style.left = left;
    ember.style.animationDuration = duration;
    ember.style.setProperty('--drift', drift);

    document.body.appendChild(ember);

    setTimeout(() => { ember.remove(); }, parseFloat(duration) * 1000);
}




