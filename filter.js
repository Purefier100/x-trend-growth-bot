import { INFLUENCERS } from "./influencers.js";
import { isFastVelocity } from "./velocity.js";

const KEYWORDS = ["airdrop", "base", "points", "testnet", "farming", "GM", "MAainnet", "BULK", "points", "xp", "quest", "whitelist", "testnet", "devnet", "beta", "now live", "soft launch", "early access", "base", "layer 2", "l2", "rollup", "bridge", "stake", "mint", "claim", "deposit", "meme", "memecoin", "degen", "shitcoin", "stealth", "fair launch", "no presale", "community launch", "just launched", "live now", "cook", "sending", "run it", "ape", "aping", "moon", "mint", "lp live", "liquidity", "volume", "holders", "base", "on base", "base meme"];

export function isTrending(tweet) {
    if (!tweet.text || !tweet.link) return false;

    // 1️⃣ keyword filter
    const text = tweet.text.toLowerCase();
    if (!KEYWORDS.some(k => text.includes(k))) return false;

    // 2️⃣ influencer filter
    if (!INFLUENCERS.includes(tweet.username)) return false;

    // 3️⃣ velocity filter
    if (!isFastVelocity(tweet)) return false;

    return true;
}

