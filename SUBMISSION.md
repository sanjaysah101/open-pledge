---
title: "OpenPledge — Give small, see everything: radically transparent micro-donations"
published: false
tags: devchallenge, weekendchallenge, webdev, nextjs
---

*This is a submission for [Weekend Challenge: Generosity Edition](https://dev.to/challenges/weekend-2026-09-03)*

## What I Built

**OpenPledge** is a transparent micro-donation platform for small nonprofits.

The idea started from a simple discomfort: when I give $5 to a small cause, I
have no idea what happens next. Big platforms ask me to *trust* them. So I built
the opposite — a giving experience where you don't have to trust anyone, because
you can **see everything**.

When you make a gift on OpenPledge, four things happen in the same moment:

1. 🪙 **The gift is anchored on a public Solana ledger** with a verifiable
   signature anyone can look up.
2. 🤖 **Google Gemini writes you a personal thank-you note** — warm, specific to
   the cause, not a canned receipt.
3. 🔊 **ElevenLabs narrates that note into a voice receipt** — more accessible
   and far more human than text alone.
4. ❄️ **Snowflake mirrors the donation** and powers an open impact dashboard so
   the *whole community* can see aggregate totals, giving by theme, and trends.

There's also a **public ledger page** — every donation, listed openly, linkable
to a Solana explorer, no login required. Accountability by default.

I designed the six demo campaigns around the UN charity themes the prompt
highlights: clean water (climate & poverty), a girls' code lab (equity &
inclusion), a youth-led food-rescue brigade (youth leadership), open-source
assistive devices (tech-driven giving), reforestation, and winter kits for
unhoused neighbors.

## Demo

<!-- Add your live URL and/or screenshots/GIFs here -->

**The donation flow (the heart of it):** pick an amount → your gift instantly
appears in "Recent gifts," a thank-you dialog shows the Gemini note, a "Play
voice receipt" button, and the Solana signature with an explorer link.

**Public ledger:** `/ledger` — every gift with its on-chain reference.
**Impact dashboard:** `/impact` — Snowflake-backed aggregates + a Gemini-written
summary.

> 🔗 Repo: <!-- your repo URL -->

## How I used the prize technologies

I integrated **all four** categories, each doing real work rather than being
bolted on:

- **Solana** — every donation is anchored on devnet; the UI surfaces the
  signature and an explorer link, and honestly labels confirmed vs. simulated.
- **Google AI (Gemini)** — generates the per-donor thank-you notes *and* the
  impact-dashboard summary sentence.
- **ElevenLabs** — text-to-speech turns each thank-you note into a voice
  receipt, streamed on demand.
- **Snowflake** — donations mirror into a `DONATIONS` table; the dashboard reads
  aggregates back with SQL (with a local fallback so it's always populated).

A design principle I stuck to: **every integration degrades gracefully.** With
no API keys, the app runs in a full demo mode and *tells you* which path
produced each result. That honesty felt on-theme for a project about
transparency.

## Tech stack & notes

Built with **Bun + Next.js 16 (App Router, React Compiler) + Tailwind v4 +
shadcn/ui on Base UI**, scaffolded with
[`create-notils`](https://www.npmjs.com/package/create-notils) and lint/format
via Biome.

- **Demo mode by design** — no real funds ever move. The on-chain footprint is a
  symbolic anchor, not custody of money.
- Everything was built within the challenge window.

Thanks to the DEV team for the theme — building something in the spirit of
generosity was a genuinely nice way to spend a weekend. 💚
