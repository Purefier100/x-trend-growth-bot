import { chromium } from "playwright";
import fs from "fs";
import { TARGET_ACCOUNTS } from "./targets.js";

export async function scrapeTweets() {
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox"]
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });

    // Cookies only locally
    if (!process.env.GITHUB_ACTIONS && fs.existsSync("auth.json")) {
        const cookies = JSON.parse(fs.readFileSync("auth.json", "utf8"));
        await context.addCookies(cookies);
        console.log("🔐 Cookies loaded");
    }

    const page = await context.newPage();
    let results = [];

    const now = Date.now();
    const MAX_AGE_MINUTES = 60;

    for (const handle of TARGET_ACCOUNTS) {
        console.log("🌐 Playwright profile:", handle);

        await page.goto(`https://x.com/${handle}`, {
            waitUntil: "domcontentloaded",
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        const tweets = await page.$$eval("article", articles =>
            articles.slice(0, 5).map(article => {
                const text =
                    article.querySelector('[data-testid="tweetText"]')?.innerText || "";

                const link =
                    article.querySelector("a[href*='/status/']")?.href || "";

                const time =
                    article.querySelector("time")?.getAttribute("datetime") || "";

                return { text, link, time };
            })
        );

        results.push(
            ...tweets.map(t => ({
                username: handle,
                ...t,
                likes: 0
            }))
        );
    }

    await browser.close();

    // Fresh tweets only
    results = results.filter(t => {
        if (!t.time) return false;
        const diff = (now - new Date(t.time).getTime()) / 1000 / 60;
        return diff <= MAX_AGE_MINUTES;
    });

    console.log(`✅ Playwright tweets: ${results.length}`);
    return results;
}
