import "server-only";

/**
 * ElevenLabs integration — accessible, human-sounding voice receipts.
 *
 * A spoken thank-you is more accessible (low-literacy, low-vision, or simply
 * screen-fatigued donors) and far warmer than text alone. We narrate the
 * Gemini thank-you note into natural speech and hand it back as audio the
 * donor can play on their receipt.
 *
 * Graceful degradation: without an API key the endpoint reports that no
 * audio is available and the UI hides the player — the rest of the receipt
 * still works.
 */

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // "Rachel"
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5";

export interface VoiceResult {
  ok: boolean;
  /** MP3 audio bytes, when available. */
  audio?: ArrayBuffer;
  reason?: string;
}

export function isVoiceConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export async function synthesizeVoiceReceipt(text: string): Promise<VoiceResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { ok: false, reason: "ElevenLabs API key not configured" };

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.2,
        },
      }),
    });

    if (!res.ok) {
      return { ok: false, reason: `ElevenLabs responded ${res.status}` };
    }

    const audio = await res.arrayBuffer();
    return { ok: true, audio };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "voice synthesis failed",
    };
  }
}
