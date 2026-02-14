// mic_drop.js - 精準修正版 (基準 -700ms，總計較原始版 +1600ms)
const songData = [
    { "time": 1800, "text": "Waiting for beat...", "type": "wait" },

    // --- 序幕：應援開始 ---
    { "time": 6300, "text": "김.남.준!", "type": "chant" },
    { "time": 7524, "text": "김.석.진!", "type": "chant" },
    { "time": 8949, "text": "민.윤.기!", "type": "chant" },
    { "time": 10350, "text": "정.호.석!", "type": "chant" },
    { "time": 11771, "text": "박.지.민!", "type": "chant" },
    { "time": 13141, "text": "김.태.형!", "type": "chant" },
    { "time": 14586, "text": "전.정.국!", "type": "chant" },
    { "time": 15959, "text": "B.T.S!", "type": "chant" },

    // --- 第二輪應援 ---
    { "time": 17416, "text": "김.남.준!", "type": "chant" },
    { "time": 18805, "text": "김.석.진!", "type": "chant" },
    { "time": 20217, "text": "민.윤.기!", "type": "chant" },
    { "time": 21625, "text": "정.호.석!", "type": "chant" },
    { "time": 23009, "text": "박.지.민!", "type": "chant" },
    { "time": 24404, "text": "김.태.형!", "type": "chant" },
    { "time": 25875, "text": "전.정.국!", "type": "chant" },
    { "time": 27234, "text": "B.T.S!", "type": "chant" },

    // --- 主歌區 (Sing 模式) ---
    { "time": 28800, "text": "scream!", "type": "scream" },
    { "time": 41489, "text": "bang bang", "type": "chant" },
    { "time": 44128, "text": "clap clap", "type": "chant" },
    { "time": 52215, "text": "bungee", "type": "chant" },
  
    // --- 主歌區 ---
    { "time": 53598, "text": "전진", "type": "chant" },
    { "time": 57663, "text": "Billboard", "type": "chant" },
    { "time": 59150, "text": "worldwide", "type": "chant" },
    { "time": 68558, "text": "I do it I do it", "type": "chant" },
    { "time": 70100, "text": "Sue it", "type": "chant" },
  // --- 🚨 預警 (提前 3 秒) ---
    { "time": 71300, "text": "⚠️ INCOMING! ⚠️", "type": "warning" },

    // --- 中段錄製點 ---
  
    { "time": 75060, "text": "(bag)-①", "type": "chant" },
    { "time": 76486, "text": "(bag)-②", "type": "chant" },
    { "time": 78570, "text": "(가득해)", "type": "chant" },
    { "time": 80654, "text": "(that)-①", "type": "chant" },
    { "time": 82106, "text": "(that)-②", "type": "chant" },
    { "time": 84183, "text": "(학을 떼)", "type": "chant" },
    { "time": 87403, "text": "(성공)", "type": "chant" },
    { "time": 90209, "text": "(봉송)", "type": "chant" },
    { "time": 93063, "text": "(숑숑)", "type": "chant" },

    { "time": 95915, "text": "scream!", "type": "scream" },
     // --- 後半段數據 ---
    { "time": 102118, "text": "MIC Drop-①", "type": "chant" },
    { "time": 103541, "text": "MIC Drop-②", "type": "chant" },
    { "time": 105086, "text": "발 발", "type": "chant" },
    { "time": 106446, "text": "말 말", "type": "chant" },
    { "time": 107872, "text": "scream!", "type": "scream" },
    { "time": 112850, "text": "MIC Drop-①", "type": "chant" },
    { "time": 114276, "text": "MIC Drop-②", "type": "chant" }, 
    { "time": 115702, "text": "발 발", "type": "chant" }, 
    { "time": 117128, "text": "말 말", "type": "chant" },
    { "time": 120483, "text": "(자)", "type": "chant" },
    { "time": 121896, "text": "(ah)", "type": "chant" },
    { "time": 126115, "text": "쌔 쌤통", "type": "chant" },
    { "time": 128709, "text": "행복", "type": "chant" },
    { "time": 130135, "text": "scream!", "type": "scream" },
    { "time": 140043, "text": "MIC Drop baam", "type": "chant" },
    { "time": 142471, "text": "(bag)-①", "type": "chant" },
    { "time": 143860, "text": "(bag)-②", "type": "chant" },
    { "time": 145975, "text": "(가득해)", "type": "chant" },
    { "time": 148081, "text": "(that)-①", "type": "chant" },
    { "time": 149489, "text": "(that)-②", "type": "chant" },
    { "time": 151610, "text": "(학을 떼)", "type": "chant" },
    { "time": 154817, "text": "(성공)", "type": "chant" },
    { "time": 157641, "text": "(봉송)", "type": "chant" },
    { "time": 160467, "text": "(숑숑)", "type": "chant" },
    { "time": 161893, "text": "scream!", "type": "scream" },
    { "time": 169514, "text": "MIC Drop-①", "type": "chant" },
    { "time": 170972, "text": "MIC Drop-②", "type": "chant" },
    { "time": 172587, "text": "발 발", "type": "chant" },
    { "time": 173851, "text": "말 말", "type": "chant" },
    { "time": 175277, "text": "scream!", "type": "scream" },
    { "time": 180855, "text": "MIC Drop-①", "type": "chant" },
    { "time": 182251, "text": "MIC Drop-②", "type": "chant" },
    { "time": 183786, "text": "발 발", "type": "chant" },
    { "time": 185187, "text": "말 말", "type": "chant" },
    { "time": 185987, "text": "scream!", "type": "scream" },
    { "time": 201152, "text": "마지막 인사야", "type": "sing" },
    { "time": 206679, "text": "사과도 하지 마", "type": "sing" },
    { "time": 212380, "text": "마지막 인사야", "type": "sing" },
    { "time": 218008, "text": "사과도 하지 마", "type": "sing" },
    { "time": 220510, "text": "잘", "type": "sing" },
    { "time": 221236, "text": "봐", "type": "sing" },
    { "time": 223281, "text": "탁", "type": "sing" },
    { "time": 224011, "text": "쏴", "type": "sing" },
    { "time": 226125, "text": "각", "type": "sing" },
    { "time": 226832, "text": "막", "type": "sing" },
    { "time": 228945, "text": "폼나지-①", "type": "sing" },
    { "time": 230386, "text": "폼나지-②", "type": "sing" },
    { "time": 231812, "text": "scream!", "type": "scream" },


    // --- 🏆 結業證書觸發 ---
    { "time": 240600, "text": "", "type": "end" }
];
