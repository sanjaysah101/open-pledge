import { revalidatePath } from "next/cache";

import { z } from "zod";

import { getCampaign } from "@/lib/donations/campaigns";
import { addDonation } from "@/lib/donations/store";
import type { Donation } from "@/lib/donations/types";
import { isVoiceConfigured } from "@/lib/integrations/elevenlabs";
import { generateThankYouNote } from "@/lib/integrations/gemini";
import { recordDonationInWarehouse } from "@/lib/integrations/snowflake";
import { anchorDonation } from "@/lib/integrations/solana";

export const dynamic = "force-dynamic";

const donateSchema = z.object({
  campaignId: z.string().min(1),
  amountUsd: z.number().int().positive().max(100_000),
  donorName: z.string().trim().max(60).optional(),
  message: z.string().trim().max(280).optional(),
});

/**
 * The donation pipeline — one gift, four technologies working together:
 *  1. Solana anchors the gift on a public, verifiable ledger.
 *  2. Gemini writes a personal thank-you note.
 *  3. Snowflake mirrors the record for transparent analytics.
 *  4. ElevenLabs availability is flagged so the receipt can offer a voice note.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = donateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid donation", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { campaignId, amountUsd, donorName, message } = parsed.data;
  const campaign = getCampaign(campaignId);
  if (!campaign) {
    return Response.json({ error: "Unknown campaign" }, { status: 404 });
  }

  const id = `dn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const cleanDonor = donorName && donorName.length > 0 ? donorName : "Anonymous";

  // Bring-your-own-key: judges can supply their own keys per request. Used for
  // this request only; never persisted server-side.
  const geminiKey = request.headers.get("x-gemini-key") ?? undefined;
  const elevenKey = request.headers.get("x-elevenlabs-key") ?? undefined;

  // 1. Anchor on Solana (confirmed on devnet, or honestly-flagged simulation).
  const ledger = await anchorDonation(id);

  // 2. Generate a personal thank-you note with Gemini.
  const thankYouNote = await generateThankYouNote(
    {
      campaign,
      donorName: cleanDonor,
      amountUsd,
      message,
    },
    geminiKey
  );

  const donation: Donation = {
    id,
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    donorName: cleanDonor,
    amountUsd,
    message,
    createdAt: new Date().toISOString(),
    txSignature: ledger.txSignature,
    ledgerStatus: ledger.status,
    cluster: ledger.cluster,
    thankYouNote,
    // Offer the voice receipt when a server key exists OR the donor brought
    // their own ElevenLabs key with this request.
    hasVoiceReceipt: isVoiceConfigured() || Boolean(elevenKey?.trim()),
  };

  addDonation(donation);

  // 3. Mirror into Snowflake for analytics (best-effort, non-blocking).
  await recordDonationInWarehouse(donation);

  // 4. Refresh the cached transparency pages so this gift appears immediately
  //    instead of waiting for the timed revalidation window.
  revalidatePath("/impact");
  revalidatePath("/ledger");
  revalidatePath(`/campaigns/${campaign.slug}`);

  return Response.json(
    {
      donation,
      ledger: { ...ledger },
    },
    { status: 201 }
  );
}
