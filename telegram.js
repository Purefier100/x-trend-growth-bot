import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TG_BOT_TOKEN, {
    polling: false
});

function generateReplies(tweet) {
    return [
        "👀 Seeing this early. Base + points systems usually reward fast movers.",
        "This is how early Base testnets start 👀 Worth tracking.",
        "Airdrop hunters should watch this closely. Early signals look promising."
    ];
}

export async function sendAlert(tweet) {
    const replies = generateReplies(tweet)
        .map(r => `• ${r}`)
        .join("\n");

    const message = `
🚨 FAST X TREND (VELOCITY)

👤 @${tweet.username}

📝 ${tweet.text.slice(0, 280)}...

🔗 ${tweet.link}

💬 REPLY IDEAS:
${replies}
`;

    await bot.sendMessage(process.env.TG_CHAT_ID, message, {
        disable_web_page_preview: true
    });
}

