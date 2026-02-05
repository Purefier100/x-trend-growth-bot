import { scrapeRSS } from "./rssScraper.js";
import { scrapeTweets } from "./scraper.js";

export async function scrapeHybrid() {
    console.log("⚡ Hybrid mode: RSS first");

    let tweets = await scrapeRSS();

    if (tweets.length > 0) {
        console.log("✅ RSS worked → skipping Playwright");
        return tweets;
    }

    console.log("🕵️ RSS empty → fallback to Playwright");
    tweets = await scrapeTweets();

    return tweets;
}
