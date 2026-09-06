---
title: "OpenPledge: See Exactly Where Your Donation Goes (Blockchain + AI for Charity)"
published: false
description: "OpenPledge is a transparent micro-donation app. Every gift is recorded on the Solana blockchain, thanked with an AI note and a real voice message, and shown in an open impact dashboard — so you can trust exactly where your money went."
tags: devchallenge, weekendchallenge, webdev, ai
cover_image: ""
---

*This is a submission for the [DEV Weekend Challenge: Generosity Edition](https://dev.to/challenges/weekend-2026-09-03).*

## The problem, in one sentence

When you donate $5 to a small charity online, you have **no idea what actually happens to it** — and you usually never hear back.

Big donation platforms ask you to *trust them*. **OpenPledge** flips that around: it's a giving app where you don't have to trust anyone, because you can **see everything**.

## What I built

**OpenPledge is a "glass box" for charity.** You pick a cause, give any amount, and in that same moment four things happen — each one making your gift more transparent and more human:

1. 🪙 **Your donation is written onto the [Solana](https://solana.com/) blockchain.** Think of it as a public receipt that no one can secretly edit or delete. Anyone in the world can look it up.
2. 🤖 **[Google Gemini](https://ai.google.dev/) writes you a personal thank-you note.** Not a canned "Thanks for your donation!" — a warm, specific message about the exact cause you supported.
3. 🔊 **[ElevenLabs](https://elevenlabs.io/) reads that note out loud** in a natural human voice, so you get a real spoken thank-you. (If the voice service is unavailable, the app falls back to your browser's built-in voice so it *always* speaks.)
4. ❄️ **[Snowflake](https://www.snowflake.com/) keeps the big-picture numbers** — total raised, gifts by cause, trends over time — and powers a public **Impact Dashboard** the whole community can see.

There's also a **public ledger page**: a plain, honest list of every donation with a link to its blockchain record. No login, no sign-up, nothing hidden.

## See it working (this is real, not a mock-up)

Here's an **actual donation recorded on the Solana blockchain** during testing — click it and you'll see the live transaction on the official Solana Explorer:

👉 [View the on-chain donation on Solana Explorer](https://explorer.solana.com/tx/ecbZYjXooQJnhD2UkXNu9G95QAiC7V9R3EqVQrqkeBCGLHBZHYhwN1FrkhhpXzstfnYEniVwQh115PA7pRRf9SD?cluster=devnet)

That link is the whole point of the project: your generosity leaves a permanent, public, verifiable trail.

> 🔗 **Live app:** <!-- add your deployed URL -->
> 💻 **Source code:** <!-- add your GitHub repo URL -->
> 📸 **Screens/GIF:** <!-- add a short demo GIF of the donation flow -->

### The three pages
- **Give:** browse causes and donate. A receipt pops up with your AI thank-you note, a play-voice button, and your blockchain link.
- **Ledger (`/ledger`):** every gift, listed openly, each linkable to Solana Explorer.
- **Impact (`/impact`):** live totals and charts powered by Snowflake, plus a one-line summary written by Gemini.

## Why "generosity" — the causes

I built six example campaigns around the charity themes the [International Day of Charity](https://en.wikipedia.org/wiki/International_Day_of_Charity) and the challenge highlight, so the demo feels real:

- 💧 Clean water for a school *(climate & poverty)*
- 👩‍💻 A neighborhood code lab for girls *(equity & inclusion)*
- 🚲 A youth-led food-rescue bike brigade *(youth leadership)*
- 🦾 Free 3D-printed assistive devices *(tech-driven giving)*
- 🌱 Replanting a wildfire-burnt ridge
- 🧣 Winter survival kits for unhoused neighbors

## How I used each sponsor technology

I integrated **all four** prize technologies, and each one does real work — none are bolted on for show:

| Technology | What it does in OpenPledge |
| --- | --- |
| [**Solana**](https://solana.com/docs) | Records every donation on-chain (devnet) with a verifiable signature and explorer link. |
| [**Google AI / Gemini**](https://ai.google.dev/gemini-api/docs) | Writes each donor's personal thank-you note and the impact-page summary. |
| [**ElevenLabs**](https://elevenlabs.io/docs) | Turns the thank-you note into natural-sounding speech (a "voice receipt"). |
| [**Snowflake**](https://docs.snowflake.com/) | Stores donations and powers the aggregate analytics on the Impact Dashboard. |

**A "Bring Your Own Key" mode** lets anyone (including the judges) paste their own API keys in the browser to test the live features — the keys stay on your device and are never stored on the server.

## Tech stack

Built with [**Next.js 16**](https://nextjs.org/) (React 19), [**Bun**](https://bun.sh/), [**Tailwind CSS v4**](https://tailwindcss.com/), and [**shadcn/ui**](https://ui.shadcn.com/) on [Base UI](https://base-ui.com/) — scaffolded with [`create-notils`](https://www.npmjs.com/package/create-notils) and linted with [Biome](https://biomejs.dev/).

**A note on honesty:** no real money ever moves — the blockchain entry is a symbolic, public "anchor," not custody of funds. And every integration *degrades gracefully*: if a key or service isn't available, the app keeps working and clearly tells you which parts are live vs. simulated. That transparency felt exactly right for a project about trust.

## What I learned

The biggest takeaway: **trust in charity isn't about a bigger promise — it's about a smaller, verifiable receipt.** Putting a donation on a public ledger, then wrapping it in a genuinely warm AI thank-you, made a tiny $5 gift feel both *accountable* and *human* at the same time.

Thanks to the [DEV team](https://dev.to/devteam) for the theme — building in the spirit of generosity was a genuinely lovely way to spend a weekend. 💚
