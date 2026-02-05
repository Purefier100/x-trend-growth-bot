import fs from "fs";
import { scrapeHybrid } from "./hybridScraper.js";
import { isTrending } from "./filter.js";
import { sendAlert } from "./telegram.js";

const SEEN_FILE = "seen.json";
const MAX_ALERTS = 5;

let seen = new Set(fs.existsSync(SEEN_FILE) ? JSON.parse(fs.readFileSync(SEEN_FILE)) : []);

async function run() {
    console.log("\n🔍 Running scan...");

    let tweets = await scrapeHybrid();

    // Remove duplicates
    tweets = Array.from(new Map(tweets.map(t => [t.link, t])).values());

    let alerts = 0;

    for (const tweet of tweets) {
        if (seen.has(tweet.link)) continue;

        if (isTrending(tweet)) {
            await sendAlert(tweet);
            alerts++;
            seen.add(tweet.link);
        }

        if (alerts >= MAX_ALERTS) break;
    }

    fs.writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2));
    console.log(`✅ Done. Alerts sent: ${alerts}`);
}

await run();
process.exit(0);
