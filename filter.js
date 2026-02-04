import { INFLUENCERS } from "./influencers.js";
import { isFastVelocity } from "./velocity.js";

// all keywords lowercase
const KEYWORDS = [
    // airdrop / infra
    "airdrop",
    "points",
    "xp",
    "quest",
    "whitelist",
    "testnet",
    "devnet",
    "beta",
    "mainnet",
    "now live",
    "soft launch",
    "early access",

    // base / l2
    "base",
    "on base",
    "base meme",
    "layer 2",
    "l2",
    "rollup",

    // actions
    "bridge",
    "stake",
    "mint",
    "claim",
    "deposit",

    // meme / degen
    "meme",
    "memecoin",
    "degen",
    "shitcoin",
    "stealth",
    "fair launch",
    "no presale",
    "community launch",
    "just launched",
    "lp live",
    "liquidity",
    "volume",
    "holders",
    "ape",
    "aping",
    "moon",
    "cook",
    "sending"
];

export function isTrending(tweet) {
    if (!tweet?.text || !tweet?.link) return false;

    const text = tweet.text.toLowerCase();

    // 1️⃣ keyword gate (still required)
    const keywordMatch = KEYWORDS.some(k => text.includes(k));
    if (!keywordMatch) return false;

    const username = tweet.username?.toLowerCase() || "";

    const influencer = INFLUENCERS.includes(username);
    const fast = isFastVelocity(tweet);

    // 🔥 MUCH LOWER threshold
    const earlySignal = tweet.likes >= 3;

    // 🚨 aggressive logic
    if (influencer || fast || earlySignal) return true;

    return false;
}
