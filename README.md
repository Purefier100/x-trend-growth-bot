A real-time X (Twitter) trend discovery bot designed for organic growth, early alpha, and manual viral replies.

This bot does NOT auto-post.
It finds fast-moving tweets early and alerts you on Telegram so you reply manually (safe + effective).

✨ What This Bot Does

🔍 Monitors X search using a real browser (Playwright)

⚡ Detects fast-growing tweets (velocity-based)

🧠 Filters by:

crypto / Base / infra / meme keywords

trusted influencers & CT accounts

🚨 Sends instant Telegram alerts

💬 Includes reply suggestions to help you act fast

🛡️ No X API, no credits, no scraping bans

🧠 Why This Works

Early replies get ranked higher on X

Velocity > total likes (you catch trends early)

Influencer + keyword filtering removes noise

Manual replies keep your account safe

Project Structure
x-trend-growth-bot/
├── index.js        # Main runner (scheduler + logic)
├── scraper.js     # Playwright-based X scraper
├── filter.js      # Keyword + influencer + velocity logic
├── velocity.js    # Likes-per-minute detection
├── influencers.js # Trusted CT accounts
├── telegram.js    # Telegram alert sender
├── seen.json      # Prevents duplicate alerts
├── .env           # Environment variables
├── package.json
└── README.md

Requirements

Node.js 18+

npm

Telegram account

Telegram bot token

Chromium (installed automatically by Playwright)

🛠️ Installation
git clone https://github.com/yourusername/x-trend-growth-bot
cd x-trend-growth-bot
npm install
npx playwright install chromium

🔑 Environment Setup

Create a .env file:

TG_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
TG_CHAT_ID=YOUR_TELEGRAM_GROUP_ID

⚠️ Never commit your .env file or bot token.

▶️ Running the Bot
npm start


You should see logs like:

🔍 Scanning X via Playwright — 14:32:01
📄 Tweets scraped: 24
🆕 @username | Early Base testnet just dropped...
✅ Scan complete | New: 6 | Alerts: 1

🚨 Telegram Alerts

Each alert includes:

Tweet text (truncated)

Tweet link

Username

Reply ideas you can copy & paste

Example:

🚨 FAST X TREND (VELOCITY)

👤 @base
📝 Early Base testnet now live...
🔗 https://x.com/...

💬 REPLY IDEAS:
• Seeing this early 👀 Base testnets usually reward fast movers.
• Early signals like this tend to get crowded quickly.

🧪 Tuning the Bot
Adjust alert frequency

velocity.js

likesPerMin >= 1   // more alerts
likesPerMin >= 2   // cleaner, rarer alerts

Add/remove influencers

influencers.js

export const INFLUENCERS = [
  "base",
  "jessepollak",
  "CryptoCobain",
  "pentosh1"
];

Add keywords

filter.js

const KEYWORDS = [
  "airdrop",
  "testnet",
  "points",
  "meme",
  "base",
  "fair launch"
];

🛡️ Safety & Best Practices

❌ No auto-tweeting

❌ No auto-liking

❌ No auto-replies

✅ Manual replies only

✅ Human timing

✅ Real browser behavior

This avoids shadowbans and account flags.

🧠 Recommended Usage Strategy

Let the bot run

When an alert hits:

Open tweet immediately

Reply within 5–15 minutes

Use clear, confident language

Don’t over-post

Consistency > volume.

🚀 Roadmap (Optional Ideas)

Separate meme vs infra Telegram channels

Velocity tuning by time of day

Reply tone selector (degen / pro / neutral)

VPS deployment (24/7)

Dashboard UI

📜 Disclaimer

This tool is for research, trend discovery, and organic growth.
You are responsible for how you use it.

👑 Final Note

This bot doesn’t make you viral.
It puts you early.
You do the rest.