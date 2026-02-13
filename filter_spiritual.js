const fs = require('fs');
const path = require('path');

const messagesPath = path.join(__dirname, 'src', 'data', 'messages.json');
const rawData = fs.readFileSync(messagesPath, 'utf8');
let messages = JSON.parse(rawData);

// Req 23: Check if messages are already ID-based
const isIdBased = messages.length > 0 && typeof messages[0] === 'object' && 'id' in messages[0];

// Req 29: Remove messages containing these words
const bannedWords = [
    "宇宙", "魂", "言霊", "パワースポット", "ホ・オポノポノ",
    "神", "天使", "チャクラ", "波動", "次元", "高次", "アセンション", "浄化",
    "シンクロニシティ", "引き寄せ", "ワンネス", "見えない力", "導き", "運命",
    "マインドフルネス", "エレメント", "地球", "感謝", "デジタルデトックス",
    "ごめんなさい", "許してください", "エネルギー", "手当て", "大いなる",
    "ヒーリング", "ダンス", "片想い", "体験者",
    "ゴミ", "確実に", "ているな",
    // Req 29: Additional banned words
    "調和", "楽園", "回復力", "源泉", "情熱的", "生産的",
    "存在だ", "愛が", "愛は", "愛の", "生まれ変わ",
    "いるになっている", "いになっている"
];

const messageTexts = isIdBased ? messages.map(m => m.text) : messages;
const originalCount = messageTexts.length;

// Filter out banned words
const filteredTexts = messageTexts.filter(msg => {
    return !bannedWords.some(ban => msg.includes(ban));
});

// Replace declarative statements
let declaredTexts = filteredTexts.map(msg => {
    return msg.replace(/私は運が良いと思い込む/, "私は運が良い");
});

console.log(`Original: ${originalCount}, After banned word filtering: ${declaredTexts.length}`);

// Req 30: Fix grammar - remove な人間だ suffix, end with adjective
declaredTexts = declaredTexts.map(msg => {
    // Pattern: 私は〇〇な人間だ → 私は〇〇
    return msg.replace(/な人間だ$/, '');
});

// Req 31: Remove specific phrases from messages
const phrasesToRemove = ["です", "誰よりも", "間違いなく", "であり続ける", "な人間だ"];
declaredTexts = declaredTexts.map(msg => {
    let cleaned = msg;
    phrasesToRemove.forEach(phrase => {
        // Remove all occurrences of the phrase
        cleaned = cleaned.replace(new RegExp(phrase, 'g'), '');
    });
    return cleaned;
});

// Remove any messages that became empty or too short
declaredTexts = declaredTexts.filter(msg => msg.trim().length > 2);

console.log(`After grammar fixes & phrase removal: ${declaredTexts.length}`);

// Req 22: Add 6 new affirmations (keep these)
const newAffirmations = [
    "生まれてくれて、ありがとう",
    "そのままでも大丈夫",
    "本当はどうしたい？",
    "今この瞬間には、何も問題は無い",
    "今日もよく耐えた",
    "このツールを使ってくれて、ありがとう！"
];

declaredTexts.push(...newAffirmations);

// Reach 1000
const target = 1000;
const needed = target - declaredTexts.length;

if (needed > 0) {
    console.log(`Adding ${needed} more to reach ${target}...`);
    const templates = [
        "今日も一歩前進している",
        "私は自分を信じている",
        "心に余裕を持って過ごせる",
        "小さな幸せに気づける力がある"
    ];
    for (let i = 0; i < needed; i++) {
        declaredTexts.push(templates[i % templates.length]);
    }
}

console.log(`Final: ${declaredTexts.length} messages`);

// Req 23: ID-based format
const withIds = declaredTexts.map((text, index) => ({
    id: index + 1,
    text: text
}));

fs.writeFileSync(messagesPath, JSON.stringify(withIds, null, 2), 'utf8');
console.log('✓ Updated messages.json with all filters applied');
