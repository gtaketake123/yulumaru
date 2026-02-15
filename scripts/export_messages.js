
const fs = require('fs');
const path = require('path');

const messagesPath = path.join(__dirname, '../src/data/messages.json');
// Output directly to project root
const outputPath = path.join(__dirname, '../power_words.csv');

try {
    const data = fs.readFileSync(messagesPath, 'utf8');
    const messages = JSON.parse(data);

    // BOM for Excel compatibility with UTF-8
    let csvContent = '\uFEFFID,Message\n';

    messages.forEach(msg => {
        // Escape quotes in message
        const text = msg.text.replace(/"/g, '""');
        csvContent += `${msg.id},"${text}"\n`;
    });

    fs.writeFileSync(outputPath, csvContent);
    console.log(`Successfully exported ${messages.length} messages to ${outputPath}`);
} catch (err) {
    console.error('Error:', err);
}
