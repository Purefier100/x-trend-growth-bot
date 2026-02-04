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
        viewport: { width: 1280, height: 800 },
        locale: "en-US"
    });

    // 🔐 Load & sanitize cookies
    if (fs.existsSync("auth.json")) {
        let cookies = JSON.parse(fs.readFileSync("auth.json", "utf8"));
        cookies = cookies.map(c => {
            if (c.sameSite && !["Strict", "Lax", "None"].includes(c.sameSite)) {
                c.sameSite = "None";
            }
            return c;
        });
        await context.addCookies(cookies);
        console.log("🔐 X cookies loaded & sanitized");
    }

    const page = await context.newPage();
    const results = [];

    for (const handle of TARGET_ACCOUNTS) {
        const url = `https://x.com/${handle}`;
        console.log("🌐 Visiting profile:", handle);

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(4000);

        // Scroll once to ensure newest tweets load
        await page.mouse.wheel(0, 4000);
        await page.waitForTimeout(2000);

        const tweets = await page.$$eval("article", articles =>
            articles.slice(0, 3).map(article => {
                const text =
                    article.querySelector('[data-testid="tweetText"]')?.innerText || "";
                const link =
                    article.querySelector("a[href*='/status/']")?.href || "";
                const username =
                    article.querySelector("a[href^='/' i] span")?.innerText
                        ?.replace("@", "") || "";
                const likesText =
                    article.querySelector('[data-testid="like"]')?.innerText || "0";

                let likes = 0;
                if (likesText.includes("K")) likes = parseFloat(likesText) * 1000;
                else if (likesText.includes("M")) likes = parseFloat(likesText) * 1_000_000;
                else likes = parseInt(likesText.replace(/\D/g, "")) || 0;

                return { text, link, username, likes };
            })
        );

        results.push(...tweets.filter(t => t.text && t.link));
    }

    await browser.close();
    console.log(`📄 Tweets scraped (profiles): ${results.length}`);
    return results;
}
