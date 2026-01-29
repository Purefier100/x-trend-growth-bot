const velocityMap = new Map();

export function isFastVelocity(tweet) {
    const now = Date.now();
    const likes = tweet.likes || 0;

    if (!velocityMap.has(tweet.link)) {
        velocityMap.set(tweet.link, { likes, time: now });
        return false;
    }

    const prev = velocityMap.get(tweet.link);
    const minutes = (now - prev.time) / 60000;
    if (minutes < 1) return false;

    const likesPerMin = (likes - prev.likes) / minutes;

    velocityMap.set(tweet.link, { likes, time: now });

    return likesPerMin >= 1; // 🔥 adjust if needed
}
