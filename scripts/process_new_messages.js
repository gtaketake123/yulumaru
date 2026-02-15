
const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, '../src/data/raw_new_messages.txt');
const outputPath = path.join(__dirname, '../src/data/messages.json');

try {
    const rawData = fs.readFileSync(rawPath, 'utf8');
    // Split by newline and filter empty lines
    const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== '');

    const messages = [];
    let idCounter = 1;

    // Replacements Map
    // Order matters: More specific first
    const replacements = [
        { pattern: /存在している。それ以上の才能はない。/g, replacement: "存在している。それだけで素晴らしい才能です。" },
        { pattern: /自分を「ダメ」と呼ぶのをやめよう。/g, replacement: "自分を「ダメ」と呼んでも、そのままで愛されている。" },
        { pattern: /昨日の重荷、ここに置いていけ。/g, replacement: "昨日の重荷、ここに置いていこう。" },
        { pattern: /今日を生き延びた。金メダル級。/g, replacement: "今日を生き延びた。それだけで偉業。" },
        { pattern: /今日をやり過ごした自分に、金メダルを。/g, replacement: "今日をやり過ごした自分に、大きな拍手を。" },
        { pattern: /今日は「自分を褒める天才」になろう。/g, replacement: "今日は「自分を褒める日」にしよう。" }, // Replaces genius
        { pattern: /魂のデトックス/g, replacement: "心の休息" },
        { pattern: /魂の休息/g, replacement: "心の休息" },
        { pattern: /宇宙からのメッセージ/g, replacement: "体からのメッセージ" },
        { pattern: /宇宙の基準/g, replacement: "あなただけの基準" },
        { pattern: /宇宙にとって/g, replacement: "世界にとって" },
        { pattern: /宇宙にたった一人/g, replacement: "世界にたった一人" },
        { pattern: /宇宙は、あなたの存在を歓迎している。/g, replacement: "あなたの存在は、歓迎されている。" },
        { pattern: /宇宙一の宝物/g, replacement: "かけがえのない宝物" },
        { pattern: /宇宙の最高傑作/g, replacement: "奇跡の存在" },
        { pattern: /宇宙一の輝き/g, replacement: "唯一無二の輝き" },
        { pattern: /宇宙と繋がる/g, replacement: "心が落ち着く" },
        { pattern: /宇宙の優しさ/g, replacement: "世界の優しさ" },
        { pattern: /今日は「何もしない」が正解です。/g, replacement: "今日は「何もしない」を選んでもいい。" },
        { pattern: /休むのが正解。/g, replacement: "休んでいい。" },
        { pattern: /正解です。/g, replacement: "大丈夫です。" },
        { pattern: /正解。/g, replacement: "大丈夫。" },
        { pattern: /ゴミ箱に捨てていい/g, replacement: "もう手放していい" },
        { pattern: /ゴミ箱にポイしよう/g, replacement: "空に飛ばそう" },
        { pattern: /全部ゴミ/g, replacement: "全部ノイズ" },
        { pattern: /とキス/g, replacement: "とハグ" },
    ];

    lines.forEach(line => {
        // Remove "1. " etc.
        let text = line.replace(/^\d+\.\s*/, '').trim();

        // Check strict exact matches from "Bad Examples" list first or regex replace
        replacements.forEach(rep => {
            text = text.replace(rep.pattern, rep.replacement);
        });

        // General safeguards (catch-all)
        if (text.includes("ゴミ")) text = text.replace(/ゴミ/g, "不要なもの");
        if (text.includes("宇宙")) text = text.replace(/宇宙/g, "世界"); // Fallback for missed universe
        if (text.includes("魂")) text = text.replace(/魂/g, "心");

        if (text) {
            messages.push({
                id: idCounter++,
                text: text
            });
        }
    });

    fs.writeFileSync(outputPath, JSON.stringify(messages, null, 2));
    console.log(`Successfully processed ${messages.length} messages.`);

} catch (err) {
    console.error('Error:', err);
}
