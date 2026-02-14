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
