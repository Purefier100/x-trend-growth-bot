import { INFLUENCERS } from "./influencers.js";
import { isFastVelocity } from "./velocity.js";

// ✅ Strong alpha keywords only
const KEYWORDS = [
    "airdrop",
    "points",
    "xp",
    "quest",
    "whitelist",
    "testnet",
    "devnet",
    "mainnet",
    "beta",
    "early access",
    "now live",
    "soft launch",

    "base",
    "layer 2",
    "l2",
    "rollup",

    "bridge",
    "stake",
    "mint",
    "claim",
    "deposit",

    "memecoin",
    "meme",
    "fair launch",
    "stealth launch",
    "no presale",
    "community launch",
    "just launched"
];

// 🚫 Block obvious noise accounts
const BLOCKLIST = [
    "cristiano",
    "elonmusk",
    "leomessi"
];

// ⏱️ Only alert tweets newer than this
const MAX_TWEET_AGE_HOURS = 2;

export function isTrending(tweet) {
    if (!tweet?.text || !tweet?.link) return false;

    const text = tweet.text.toLowerCase();
    const username = tweet.username?.toLowerCase() || "";

    // 🚫 Block reposts
    if (text.includes("reposted")) return false;

    // 🚫 Block celebrities/noise
    if (BLOCKLIST.includes(username)) return false;

    // 1️⃣ Keyword gate
    const keywordMatch = KEYWORDS.some(k => text.includes(k));
    if (!keywordMatch) return false;

    // 2️⃣ Time filter (requires scraper returning tweet.time)
    if (tweet.time) {
        const tweetTime = new Date(tweet.time).getTime();
        const ageHours = (Date.now() - tweetTime) / (1000 * 60 * 60);

        if (ageHours > MAX_TWEET_AGE_HOURS) {
            return false; // too old
        }
    }

    // 3️⃣ Alpha scoring
    const influencer = INFLUENCERS.includes(username);
    const fast = isFastVelocity(tweet);

    // 🔥 Early signal: tiny engagement but fresh
    const earlySignal = tweet.likes >= 2;

    // ✅ Alert if any strong signal hits
    if (influencer || fast || earlySignal) return true;

    return false;
}
