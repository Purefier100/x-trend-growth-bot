import "dotenv/config";
import fs from "fs";
import { scrapeTweets } from "./scraper.js";
import { isTrending } from "./filter.js";
import { sendAlert } from "./telegram.js";

const SEEN_FILE = "seen.json";
const INTERVAL_MS = 5 * 60 * 1000;

// ---- load seen tweets safely ----
let seen = new Set();

if (fs.existsSync(SEEN_FILE)) {
    try {
        const raw = fs.readFileSync(SEEN_FILE, "utf8");
        seen = new Set(JSON.parse(raw));
    } catch {
        console.error("⚠️ seen.json corrupted, resetting");
        seen = new Set();
    }
}

// ---- main runner ----
async function run() {
    console.log(`\n🔍 Scanning X via Playwright — ${new Date().toLocaleTimeString()}`);

    let tweets = [];

    try {
        tweets = await scrapeTweets(); // ✅ profile scraping
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
            `🆕 ${tweet.username ? "@" + tweet.username : "unknown"} | ` +
            tweet.text.slice(0, 70).replace(/\n/g, " ")
        );

        if (isTrending(tweet)) {
            try {
                await sendAlert(tweet);
                alertsSent++;
                seen.add(tweet.link);
            } catch (err) {
                console.error("⚠️ Telegram error:", err.message);
            }
        }
    }

    // persist seen tweets
    fs.writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2));

    console.log(`✅ Scan complete | New: ${newTweets} | Alerts: ${alertsSent}`);
}

// ---- start ----
run();
setInterval(run, INTERVAL_MS);

