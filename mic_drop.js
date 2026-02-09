// mic_drop.js - 精準修正版 (+200ms Offset)
const songData = [
    { "time": 200, "text": "Waiting for beat...", "type": "wait" },

    // --- 序幕：應援開始 ---
    { "time": 4700, "text": "김.남.준!", "type": "chant" },
    { "time": 5924, "text": "김.석.진!", "type": "chant" },
    { "time": 7349, "text": "민.윤.기!", "type": "chant" },
    { "time": 8750, "text": "정.호.석!", "type": "chant" },
    { "time": 10171, "text": "박.지.민!", "type": "chant" },
    { "time": 11541, "text": "김.태.형!", "type": "chant" },
    { "time": 12986, "text": "전.정.국!", "type": "chant" },
    { "time": 14359, "text": "B.T.S!", "type": "chant" },

    // --- 第二輪應援 ---
    { "time": 15816, "text": "김.남.준!", "type": "chant" },
    { "time": 17205, "text": "김.석.진!", "type": "chant" },
    { "time": 18617, "text": "민.윤.기!", "type": "chant" },
    { "time": 20025, "text": "정.호.석!", "type": "chant" },
    { "time": 21409, "text": "박.지.민!", "type": "chant" },
    { "time": 22804, "text": "김.태.형!", "type": "chant" },
    { "time": 24275, "text": "전.정.국!", "type": "chant" },
    { "time": 25634, "text": "B.T.S!", "type": "chant" },

    // --- 主歌區 (Sing 模式) ---
    { "time": 27200, "text": "scream!", "type": "scream" },
    { "time": 39889, "text": "bang bang", "type": "chant" },
    { "time": 42528, "text": "clap clap", "type": "chant" },
    { "time": 50615, "text": "bungee", "type": "chant" },
  
    // --- 主歌區 ---
    { "time": 51998, "text": "전진", "type": "chant" },
    { "time": 56063, "text": "Billboard", "type": "chant" },
    { "time": 57550, "text": "worldwide", "type": "chant" },
    { "time": 66958, "text": "I do it I do it", "type": "chant" },
    { "time": 68500, "text": "Sue it", "type": "chant" },
  // --- 🚨 預警 (提前 3 秒) ---
    { "time": 69700, "text": "⚠️ INCOMING! ⚠️", "type": "warning" },

    // --- 中段錄製點 ---
  
    { "time": 73460, "text": "(bag)-①", "type": "chant" },
    { "time": 74886, "text": "(bag)-②", "type": "chant" },
    { "time": 76970, "text": "(가득해)", "type": "chant" },
    { "time": 79054, "text": "(that)-①", "type": "chant" },
    { "time": 80506, "text": "(that)-②", "type": "chant" },
    { "time": 82583, "text": "(학을 떼)", "type": "chant" },
    { "time": 85803, "text": "(성공)", "type": "chant" },
    { "time": 88609, "text": "(봉송)", "type": "chant" },
    { "time": 91463, "text": "(숑숑)", "type": "chant" },

    { "time": 94315, "text": "scream!", "type": "scream" },
     // --- 後半段數據 ---
    { "time": 100518, "text": "MIC Drop-①", "type": "chant" },
    { "time": 101941, "text": "MIC Drop-②", "type": "chant" },
    { "time": 103486, "text": "발 발", "type": "chant" },
    { "time": 104846, "text": "말 말", "type": "chant" },
    { "time": 106272, "text": "scream!", "type": "scream" },
    { "time": 111250, "text": "MIC Drop-①", "type": "chant" },
    { "time": 112676, "text": "MIC Drop-②", "type": "chant" }, 
    { "time": 114102, "text": "발 발", "type": "chant" }, 
    { "time": 115528, "text": "말 말", "type": "chant" },
    { "time": 118883, "text": "(자)", "type": "chant" },
    { "time": 120296, "text": "(ah)", "type": "chant" },
    { "time": 124515, "text": "쌔 쌤통", "type": "chant" },
    { "time": 127109, "text": "행복", "type": "chant" },
    { "time": 138443, "text": "MIC Drop baam", "type": "chant" },
    { "time": 140871, "text": "(bag)-①", "type": "chant" },
    { "time": 142260, "text": "(bag)-②", "type": "chant" },
    { "time": 144375, "text": "(가득해)", "type": "chant" },
    { "time": 146481, "text": "(that)-①", "type": "chant" },
    { "time": 147889, "text": "(that)-②", "type": "chant" },
    { "time": 150010, "text": "(학을 떼)", "type": "chant" },
    { "time": 153217, "text": "(성공)", "type": "chant" },
    { "time": 156041, "text": "(봉송)", "type": "chant" },
    { "time": 158867, "text": "(숑숑)", "type": "chant" },
    { "time": 167914, "text": "MIC Drop-①", "type": "chant" },
    { "time": 169372, "text": "MIC Drop-②", "type": "chant" },
    { "time": 170987, "text": "발 발", "type": "chant" },
    { "time": 172251, "text": "말 말", "type": "chant" },
    { "time": 179255, "text": "MIC Drop-①", "type": "chant" },
    { "time": 180651, "text": "MIC Drop-②", "type": "chant" },
    { "time": 182186, "text": "발 발", "type": "chant" },
    { "time": 183587, "text": "말 말", "type": "chant" },
    { "time": 199552, "text": "마지막 인사야", "type": "sing" },
    { "time": 205079, "text": "사과도 하지 마", "type": "sing" },
    { "time": 210780, "text": "마지막 인사야", "type": "sing" },
    { "time": 216408, "text": "사과도 하지 마", "type": "sing" },
    { "time": 218910, "text": "잘", "type": "sing" },
    { "time": 219636, "text": "봐", "type": "sing" },
    { "time": 221681, "text": "탁", "type": "sing" },
    { "time": 222411, "text": "쏴", "type": "sing" },
    { "time": 224525, "text": "각", "type": "sing" },
    { "time": 225232, "text": "막", "type": "sing" },
    { "time": 227345, "text": "폼나지-①", "type": "sing" },
    { "time": 228786, "text": "폼나지-②", "type": "sing" },


    // --- 🏆 結業證書觸發 ---
    { "time": 239000, "text": "", "type": "end" }
];