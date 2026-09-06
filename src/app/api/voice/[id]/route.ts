import { getDonation } from "@/lib/donations/store";
import { synthesizeVoiceReceipt } from "@/lib/integrations/elevenlabs";

export const dynamic = "force-dynamic";

/**
 * Voice receipt — narrates a donation's thank-you note with ElevenLabs and
 * streams it back as MP3. Returns 404 when the note or voice key is missing,
 * so the UI can gracefully hide the player.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const donation = getDonation(id);

  if (!donation?.thankYouNote) {
    return Response.json({ error: "No receipt available" }, { status: 404 });
  }

  const result = await synthesizeVoiceReceipt(donation.thankYouNote);
  if (!result.ok || !result.audio) {
    return Response.json({ error: result.reason ?? "Voice unavailable" }, { status: 503 });
  }

  return new Response(result.audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
