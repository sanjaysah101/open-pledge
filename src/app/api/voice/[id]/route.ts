import { getDonation } from "@/lib/donations/store";
import { synthesizeVoiceReceipt } from "@/lib/integrations/elevenlabs";

export const dynamic = "force-dynamic";

/**
 * Voice receipt — narrates a donation's thank-you note with ElevenLabs and
 * streams it back as MP3. Returns 404 when the note is missing.
 *
 * Bring-your-own-key: judges can pass their own ElevenLabs key in the
 * `x-elevenlabs-key` header (and optionally `x-elevenlabs-voice` /
 * `x-elevenlabs-model`). The key is used for this request only and never
 * persisted server-side. Falls back to the server env key when absent.
 */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const donation = getDonation(id);

  if (!donation?.thankYouNote) {
    return Response.json({ error: "No receipt available" }, { status: 404 });
  }

  const result = await synthesizeVoiceReceipt(donation.thankYouNote, {
    apiKey: request.headers.get("x-elevenlabs-key") ?? undefined,
    voiceId: request.headers.get("x-elevenlabs-voice") ?? undefined,
    modelId: request.headers.get("x-elevenlabs-model") ?? undefined,
  });

  if (!result.ok || !result.audio) {
    return Response.json(
      { error: result.reason ?? "Voice unavailable" },
      { status: result.status ?? 503 }
    );
  }

  return new Response(result.audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
