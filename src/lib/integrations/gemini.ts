import "server-only";

import { GoogleGenAI } from "@google/genai";

import type { Campaign } from "@/lib/donations/types";

/**
 * Google AI (Gemini) integration — the human touch at scale.
 *
 * Small nonprofits rarely have time to thank every micro-donor personally.
 * Gemini writes a warm, specific, non-generic thank-you note grounded in the
 * exact campaign and gift — the kind of acknowledgement that makes a donor
 * feel seen, generated in the moment of giving.
 *
 * Graceful degradation: without an API key we return a hand-crafted
 * template note so the flow never breaks in a demo.
 */

interface ThankYouParams {
  campaign: Campaign;
  donorName: string;
  amountUsd: number;
  message?: string;
}

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

/** Reject after `ms` so a slow upstream call falls back instead of hanging. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

function fallbackNote({ campaign, donorName, amountUsd }: ThankYouParams): string {
  const who = donorName && donorName !== "Anonymous" ? `${donorName}, ` : "";
  return `${who}thank you for your $${amountUsd} gift to "${campaign.title}" by ${campaign.organization}. Your generosity moves ${campaign.location} one real step closer — every dollar is recorded openly so you can see exactly what it builds.`;
}

export async function generateThankYouNote(
  params: ThankYouParams,
  byokKey?: string
): Promise<string> {
  const apiKey = byokKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackNote(params);

  const { campaign, donorName, amountUsd, message } = params;

  const prompt = [
    "You write short, heartfelt thank-you notes for donors to small nonprofits.",
    "Rules: 2 sentences max, under 45 words, warm but not saccharine, specific to the",
    "cause, second person, no hashtags, no emojis, no markdown. Do not invent facts",
    "beyond what is given.",
    "",
    `Cause: "${campaign.title}" by ${campaign.organization} in ${campaign.location}.`,
    `What it does: ${campaign.summary}`,
    `Donor name: ${donorName || "Anonymous"}`,
    `Gift amount: $${amountUsd}`,
    message ? `Donor's own message: "${message}"` : "The donor left no message.",
    "",
    "Write only the thank-you note.",
  ].join("\n");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const text = response.text?.trim();
    return text && text.length > 0 ? text : fallbackNote(params);
  } catch {
    return fallbackNote(params);
  }
}

/**
 * Generate a short, uplifting impact summary from aggregate numbers — used on
 * the transparency dashboard to turn raw stats into a story donors feel.
 */
export async function generateImpactSummary(input: {
  totalRaisedUsd: number;
  donationCount: number;
  campaignsSupported: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = `Together, ${input.donationCount} gifts have raised $${input.totalRaisedUsd.toLocaleString()} across ${input.campaignsSupported} community campaigns — every dollar tracked on a public ledger.`;
  if (!apiKey) return fallback;

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Cap the wait so a slow model call never stalls the Impact page render.
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: [
          "Write one uplifting sentence (max 30 words, no emojis, no markdown) summarizing",
          "collective donor impact for a transparent giving platform.",
          `Total raised: $${input.totalRaisedUsd}. Donations: ${input.donationCount}. Campaigns: ${input.campaignsSupported}.`,
        ].join("\n"),
      }),
      6000
    );
    return response.text?.trim() || fallback;
  } catch {
    return fallback;
  }
}
