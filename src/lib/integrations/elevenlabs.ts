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
// eleven_multilingual_v2 is broadly available on the free tier; turbo models
// are sometimes gated behind paid plans and return 402 on free accounts.
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

export interface VoiceResult {
  ok: boolean;
  /** MP3 audio bytes, when available. */
  audio?: ArrayBuffer;
  reason?: string;
  /** HTTP status to bubble up to the client (defaults handled by the route). */
  status?: number;
}

/** Options for a single synthesis call, including a per-request override key. */
export interface VoiceOptions {
  /** Bring-your-own-key override; falls back to the server env key. */
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
}

export function isVoiceConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/** Turn an ElevenLabs HTTP status into a clear, demo-friendly message. */
function messageForStatus(status: number, byok: boolean): string {
  switch (status) {
    case 401:
      return byok
        ? "That ElevenLabs key was rejected (401). Double-check you copied it correctly."
        : "ElevenLabs key rejected (401).";
    case 402:
      return "ElevenLabs quota reached or this model needs a paid plan (402). Try your own key, or the free eleven_multilingual_v2 model.";
    case 429:
      return "ElevenLabs rate limit hit (429). Wait a moment and try again.";
    default:
      return `ElevenLabs responded ${status}.`;
  }
}

export async function synthesizeVoiceReceipt(
  text: string,
  options: VoiceOptions = {}
): Promise<VoiceResult> {
  const byokKey = options.apiKey?.trim();
  const apiKey = byokKey || process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      reason: "No ElevenLabs key. Add one via ‘Bring your own key’ to enable voice receipts.",
    };
  }

  const voiceId = options.voiceId?.trim() || DEFAULT_VOICE_ID;
  const modelId = options.modelId?.trim() || MODEL_ID;

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.2,
        },
      }),
    });

    if (!res.ok) {
      return { ok: false, status: res.status, reason: messageForStatus(res.status, !!byokKey) };
    }

    const audio = await res.arrayBuffer();
    return { ok: true, audio };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      reason: error instanceof Error ? error.message : "voice synthesis failed",
    };
  }
}
