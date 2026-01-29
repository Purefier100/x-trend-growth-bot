import { chromium } from "playwright";

export async function scrapeTweets(query) {
    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    });

    const page = await context.newPage();

    const url = `https://x.com/search?q=${encodeURIComponent(
        query
    )}&src=typed_query&f=live`;

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);

    // Scroll to load tweets
    for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(2000);
    }

    const tweets = await page.$$eval("article", articles =>
        articles
            .map(article => {
                const text =
                    article.querySelector('[data-testid="tweetText"]')
                        ?.innerText || "";

                const link =
                    article.querySelector("a[href*='/status/']")?.href;

                const username =
                    article.querySelector("a[href^='/' i] span")?.innerText
                        ?.replace("@", "");

                const statEls = article.querySelectorAll('[data-testid="like"]');
                const likesText = statEls[0]?.innerText || "0";

                const likes = likesText.includes("K")
                    ? parseFloat(likesText) * 1000
                    : parseInt(likesText.replace(/\D/g, "")) || 0;

                return { text, link, username, likes };
            })

            .filter(t => t.text && t.link)
    );

    await browser.close();
    return tweets;
}
