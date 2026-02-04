import { chromium } from "playwright";
import fs from "fs";
import { TARGET_ACCOUNTS } from "./targets.js";

export async function scrapeTweets() {
    const browser = await chromium.launch({
        headless: true,
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    const context = await browser.newContext({
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        viewport: { width: 1280, height: 800 }
    });

    // 🔐 Load cookies ONLY locally
    if (!process.env.GITHUB_ACTIONS && fs.existsSync("auth.json")) {
        let cookies = JSON.parse(fs.readFileSync("auth.json", "utf8"));

        cookies = cookies.map(c => {
            if (c.sameSite && !["Strict", "Lax", "None"].includes(c.sameSite)) {
                c.sameSite = "None";
            }
            return c;
        });

        await context.addCookies(cookies);
        console.log("🔐 X cookies loaded locally");
    } else {
        console.log("⚠️ No cookies loaded (GitHub mode)");
    }

    const page = await context.newPage();
    let results = [];

    // 🕒 Current time
    const now = Date.now();

    // ⏱️ Only allow tweets from last 2 hours
    const MAX_AGE_MINUTES = 120;

    for (const handle of TARGET_ACCOUNTS) {
        console.log("🌐 Visiting profile:", handle);

        await page.goto(`https://x.com/${handle}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForTimeout(3000);

        // Scroll slightly to load newest tweets
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(2000);

        const tweets = await page.$$eval("article", articles =>
            articles.slice(0, 8).map(article => {
                const text =
                    article.querySelector('[data-testid="tweetText"]')?.innerText || "";

                const link =
                    article.querySelector("a[href*='/status/']")?.href || "";

                const time =
                    article.querySelector("time")?.getAttribute("datetime") || "";

                const username =
                    link.split("/status/")[0]?.replace("https://x.com/", "") || "";

                const likesText =
                    article.querySelector('[data-testid="like"]')?.innerText || "0";

                let likes = 0;
                if (likesText.includes("K")) likes = parseFloat(likesText) * 1000;
                else if (likesText.includes("M"))
                    likes = parseFloat(likesText) * 1_000_000;
                else likes = parseInt(likesText.replace(/\D/g, "")) || 0;

                return { text, link, username, likes, time };
            })
        );

        results.push(...tweets.filter(t => t.text && t.link));
    }

    await browser.close();

    console.log(`📄 Total tweets scraped: ${results.length}`);

    // ✅ FILTER: Only recent tweets (last 2 hours)
    const freshTweets = results.filter(t => {
        if (!t.time) return false;

        const tweetTime = new Date(t.time).getTime();
        const diffMinutes = (now - tweetTime) / 1000 / 60;

        return diffMinutes <= MAX_AGE_MINUTES;
    });

    console.log(`🕒 Fresh tweets only: ${freshTweets.length}`);

    return freshTweets;
}
