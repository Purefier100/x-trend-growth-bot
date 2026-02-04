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
    const results = [];

    for (const handle of TARGET_ACCOUNTS) {
        console.log("🌐 Visiting profile:", handle);

        await page.goto(`https://x.com/${handle}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForTimeout(3000);

        // Scroll slightly
        await page.mouse.wheel(0, 2500);
        await page.waitForTimeout(1500);

        const tweets = await page.$$eval("article", articles =>
            articles.slice(0, 5).map(article => {
                const text =
                    article.querySelector('[data-testid="tweetText"]')?.innerText || "";

                const link =
                    article.querySelector("a[href*='/status/']")?.href || "";

                const time =
                    article.querySelector("time")?.getAttribute("datetime") || "";

                // Extract handle safely
                const username =
                    link.split("/status/")[0]?.replace("https://x.com/", "") || "";

                // Likes
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

    console.log(`📄 Tweets scraped: ${results.length}`);
    return results;
}
