// mic_drop.js - 精準修正版 (再次推遲 +600ms，總計較原始版 +2300ms)
const songData = [
    { "time": 2500, "text": "Waiting for beat...", "type": "wait" },

    // --- 序幕：應援開始 ---
    { "time": 7000, "text": "김.남.준!", "type": "chant" },
    { "time": 8224, "text": "김.석.진!", "type": "chant" },
    { "time": 9649, "text": "민.윤.기!", "type": "chant" },
    { "time": 11050, "text": "정.호.석!", "type": "chant" },
    { "time": 12471, "text": "박.지.민!", "type": "chant" },
    { "time": 13841, "text": "김.태.형!", "type": "chant" },
    { "time": 15286, "text": "전.정.국!", "type": "chant" },
    { "time": 16659, "text": "B.T.S!", "type": "chant" },

    // --- 第二輪應援 ---
    { "time": 18116, "text": "김.남.준!", "type": "chant" },
    { "time": 19505, "text": "김.석.진!", "type": "chant" },
    { "time": 20917, "text": "민.윤.기!", "type": "chant" },
    { "time": 22325, "text": "정.호.석!", "type": "chant" },
    { "time": 23709, "text": "박.지.靜!", "type": "chant" },
    { "time": 25104, "text": "김.태.형!", "type": "chant" },
    { "time": 26575, "text": "전.정.국!", "type": "chant" },
    { "time": 27934, "text": "B.T.S!", "type": "chant" },

    // --- 主歌區 (Sing 模式) ---
    { "time": 29500, "text": "scream!", "type": "scream" },
    { "time": 42189, "text": "bang bang", "type": "chant" },
    { "time": 44828, "text": "clap clap", "type": "chant" },
    { "time": 52915, "text": "bungee", "type": "chant" },
  
    // --- 主歌區 ---
    { "time": 54298, "text": "전진", "type": "chant" },
    { "time": 58363, "text": "Billboard", "type": "chant" },
    { "time": 59850, "text": "worldwide", "type": "chant" },
    { "time": 69258, "text": "I do it I do it", "type": "chant" },
    { "time": 70800, "text": "Sue it", "type": "chant" },
  // --- 🚨 預警 (提前 3 秒) ---
    { "time": 72000, "text": "⚠️ INCOMING! ⚠️", "type": "warning" },

    // --- 中段錄製點 ---
  
    { "time": 75760, "text": "(bag)-①", "type": "chant" },
    { "time": 77186, "text": "(bag)-②", "type": "chant" },
    { "time": 79270, "text": "(가득해)", "type": "chant" },
    { "time": 81354, "text": "(that)-①", "type": "chant" },
    { "time": 82806, "text": "(that)-②", "type": "chant" },
    { "time": 84883, "text": "(학을 떼)", "type": "chant" },
    { "time": 88103, "text": "(성공)", "type": "chant" },
    { "time": 90909, "text": "(봉송)", "type": "chant" },
    { "time": 93763, "text": "(숑숑)", "type": "chant" },

    { "time": 96615, "text": "scream!", "type": "scream" },
     // --- 後半段數據 ---
    { "time": 102818, "text": "MIC Drop-①", "type": "chant" },
    { "time": 104241, "text": "MIC Drop-②", "type": "chant" },
    { "time": 105786, "text": "발 발", "type": "chant" },
    { "time": 107146, "text": "말 말", "type": "chant" },
    { "time": 108572, "text": "scream!", "type": "scream" },
    { "time": 113550, "text": "MIC Drop-①", "type": "chant" },
    { "time": 114976, "text": "MIC Drop-②", "type": "chant" }, 
    { "time": 116402, "text": "발 발", "type": "chant" }, 
    { "time": 117828, "text": "말 말", "type": "chant" },
    { "time": 121183, "text": "(자)", "type": "chant" },
    { "time": 122596, "text": "(ah)", "type": "chant" },
    { "time": 126815, "text": "쌔 쌤통", "type": "chant" },
    { "time": 129409, "text": "행복", "type": "chant" },
    { "time": 130835, "text": "scream!", "type": "scream" },
    { "time": 140743, "text": "MIC Drop baam", "type": "chant" },
    { "time": 143171, "text": "(bag)-①", "type": "chant" },
    { "time": 144560, "text": "(bag)-②", "type": "chant" },
    { "time": 146675, "text": "(가득해)", "type": "chant" },
    { "time": 148781, "text": "(that)-①", "type": "chant" },
    { "time": 150189, "text": "(that)-②", "type": "chant" },
    { "time": 152310, "text": "(학을 떼)", "type": "chant" },
    { "time": 155517, "text": "(성공)", "type": "chant" },
    { "time": 158341, "text": "(봉송)", "type": "chant" },
    { "time": 161167, "text": "(숑숑)", "type": "chant" },
    { "time": 162593, "text": "scream!", "type": "scream" },
    { "time": 170214, "text": "MIC Drop-①", "type": "chant" },
    { "time": 171672, "text": "MIC Drop-②", "type": "chant" },
    { "time": 173287, "text": "발 발", "type": "chant" },
    { "time": 174551, "text": "말 말", "type": "chant" },
    { "time": 175977, "text": "scream!", "type": "scream" },
    { "time": 181555, "text": "MIC Drop-①", "type": "chant" },
    { "time": 182951, "text": "MIC Drop-②", "type": "chant" },
    { "time": 184486, "text": "발 발", "type": "chant" },
    { "time": 185887, "text": "말 말", "type": "chant" },
    { "time": 186687, "text": "scream!", "type": "scream" },
    { "time": 201852, "text": "마지막 인사야", "type": "sing" },
    { "time": 207379, "text": "사과도 하지 마", "type": "sing" },
    { "time": 213080, "text": "마지막 인사야", "type": "sing" },
    { "time": 218708, "text": "사과도 하지 마", "type": "sing" },
    { "time": 221210, "text": "잘", "type": "sing" },
    { "time": 221936, "text": "봐", "type": "sing" },
    { "time": 223981, "text": "탁", "type": "sing" },
    { "time": 224711, "text": "쏴", "type": "sing" },
    { "time": 226825, "text": "각", "type": "sing" },
    { "time": 227532, "text": "막", "type": "sing" },
    { "time": 229645, "text": "폼나지-①", "type": "sing" },
    { "time": 231086, "text": "폼나지-②", "type": "sing" },
    { "time": 232512, "text": "scream!", "type": "scream" },


    // --- 🏆 結業證書觸發 ---
    { "time": 241300, "text": "", "type": "end" }

];
