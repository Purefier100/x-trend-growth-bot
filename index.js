import "dotenv/config";
import fs from "fs";
import { scrapeTweets } from "./scraper.js";
import { isTrending } from "./filter.js";
import { sendAlert } from "./telegram.js";

const SEEN_FILE = "seen.json";
const MAX_ALERTS_PER_RUN = 5;

// ✅ Delay helper (prevents Telegram spam ban)
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Load seen tweets safely ----
let seen = new Set();

if (fs.existsSync(SEEN_FILE)) {
    try {
        const raw = fs.readFileSync(SEEN_FILE, "utf8");
        seen = new Set(JSON.parse(raw));
    } catch {
        console.error("⚠️ seen.json corrupted, resetting...");
        seen = new Set();
    }
}

// ---- Main runner ----
async function run() {
    console.log(`\n🔍 Scanning X — ${new Date().toLocaleString()}`);

    let tweets = [];

    try {
        tweets = await scrapeTweets();
    } catch (err) {
        console.error("❌ Scraper failed:", err.message);
        return;
    }

    console.log(`📄 Tweets scraped: ${tweets.length}`);

    let alertsSent = 0;
    let newTweets = 0;

    for (const tweet of tweets) {
        if (!tweet?.link || !tweet?.text) continue;
        if (seen.has(tweet.link)) continue;

        newTweets++;

        console.log(
            `🆕 @${tweet.username || "unknown"} | ` +
            tweet.text.slice(0, 80).replace(/\n/g, " ")
        );

        if (isTrending(tweet)) {
            try {
                await sendAlert(tweet);
                alertsSent++;

                console.log("🚨 Alert sent!");

                seen.add(tweet.link);

                // ✅ Prevent Telegram spam
                await sleep(3000);

                if (alertsSent >= MAX_ALERTS_PER_RUN) {
                    console.log(
                        `⚠️ Max alerts (${MAX_ALERTS_PER_RUN}) reached — stopping early`
                    );
                    break;
                }
            } catch (err) {
                console.error("⚠️ Telegram error:", err.message);
            }
        } else {
            console.log("⏭️ Not trending (skipped)");
        }
    }

    // ✅ Trim seen list so it doesn’t grow forever
    if (seen.size > 500) {
        seen = new Set([...seen].slice(-200));
        console.log("🧹 Seen list trimmed");
    }

    fs.writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2));

    console.log(`✅ Scan complete | New: ${newTweets} | Alerts: ${alertsSent}`);
}

// ---- Start once (GitHub Actions safe) ----
await run();
process.exit(0);

