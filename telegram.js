import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";

const bot = new TelegramBot(process.env.TG_BOT_TOKEN);

export async function sendAlert(tweet) {
    const msg =
        `🚨 FAST X TREND DETECTED\n\n` +
        `👤 @${tweet.username}\n\n` +
        `📝 ${tweet.text}\n\n` +
        `🔗 ${tweet.link}`;

    await bot.sendMessage(process.env.TG_CHAT_ID, msg, {
        disable_web_page_preview: false
    });
}

