import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TG_BOT_TOKEN, {
    polling: false
});

export async function sendAlert(tweet) {
    if (!tweet) return;

    const username = tweet.username ? `@${tweet.username}` : "unknown";
    const likes = tweet.likes ?? 0;

    const message = `
🚨 *X TREND DETECTED*

👤 ${username}
📝 ${tweet.text}

🔥 Likes: ${likes}
🔗 ${tweet.link}
  `.trim();

    await bot.sendMessage(process.env.TG_CHAT_ID, message, {
        parse_mode: "Markdown",
        disable_web_page_preview: false
    });
}


