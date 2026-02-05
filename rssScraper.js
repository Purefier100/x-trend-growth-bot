import Parser from "rss-parser";
import { TARGET_ACCOUNTS } from "./targets.js";

const parser = new Parser();

// ✅ Multiple Nitter mirrors (auto fallback)
const NITTER_MIRRORS = [
    "https://nitter.net",
    "https://nitter.poast.org",
    "https://nitter.privacydev.net",
    "https://nitter.1d4.us"
];

// Only allow tweets newer than this (minutes)
const MAX_AGE_MINUTES = 60;

export async function scrapeRSS() {
    const now = Date.now();
    let results = [];

    for (const handle of TARGET_ACCOUNTS) {
        let success = false;

        // Try mirrors one by one
        for (const base of NITTER_MIRRORS) {
            try {
                const url = `${base}/${handle}/rss`;
                console.log(`📡 RSS: ${handle} via ${base}`);

                const feed = await parser.parseURL(url);

                for (const item of feed.items.slice(0, 5)) {
                    const link = item.link;
                    const text = item.title;
                    const time = item.pubDate;

                    if (!link || !text || !time) continue;

                    // Freshness filter
                    const tweetTime = new Date(time).getTime();
                    const diffMinutes = (now - tweetTime) / 1000 / 60;

                    if (diffMinutes > MAX_AGE_MINUTES) continue;

                    results.push({
                        username: handle,
                        text,
                        link,
                        likes: 0,
                        time
                    });
                }

                // ✅ If one mirror works, stop trying others
                success = true;
                break;
            } catch (err) {
                console.log(`⚠️ Mirror failed: ${base}`);
            }
        }

        if (!success) {
            console.log(`❌ All RSS mirrors failed for ${handle}`);
        }
    }

    console.log(`✅ Total fresh RSS tweets: ${results.length}`);
    return results;
}
