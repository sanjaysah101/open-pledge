"use client";

import { useEffect, useState } from "react";

import { Loader2, Square, Volume2 } from "lucide-react";

import { ByokDialog } from "@/components/byok-dialog";
import { Button } from "@/components/ui/button";
import { byokHeaders } from "@/lib/byok";

/** Is the browser's built-in speech synthesis available? */
function browserSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Plays a spoken "voice receipt" for a donation.
 *
 * Primary path: ElevenLabs (premium, natural narration), fetched on demand with
 * any browser-stored "bring your own key".
 *
 * Fallback path: if ElevenLabs is unavailable (no key, or quota/402), we narrate
 * the same thank-you note with the browser's built-in Web Speech API — free, no
 * key, always audible — so the voice receipt still *speaks* for judges.
 */
export function VoiceReceipt({
  donationId,
  fallbackText,
}: {
  donationId: string;
  fallbackText?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  // Stop any browser speech when the receipt unmounts (e.g. dialog closes).
  useEffect(() => {
    return () => {
      if (browserSpeechAvailable()) window.speechSynthesis.cancel();
    };
  }, []);

  async function loadVoice() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/voice/${donationId}`, {
        headers: byokHeaders(["elevenlabs"]),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Voice receipt unavailable.");
        setState("error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setState("ready");
    } catch {
      setError("Network error while generating the voice receipt.");
      setState("error");
    }
  }

  function speakInBrowser() {
    if (!browserSpeechAvailable() || !fallbackText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fallbackText);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (browserSpeechAvailable()) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  if (state === "error") {
    const canSpeak = browserSpeechAvailable() && Boolean(fallbackText);
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-center">
        <p className="text-xs text-muted-foreground">{error}</p>
        {canSpeak && (
          <Button variant="secondary" size="sm" onClick={speaking ? stopSpeaking : speakInBrowser}>
            {speaking ? (
              <>
                <Square className="size-4" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="size-4" />
                Play with browser voice
              </>
            )}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <ByokDialog triggerLabel="Use your ElevenLabs key" />
          <Button variant="ghost" size="sm" onClick={loadVoice}>
            Retry
          </Button>
        </div>
        {canSpeak && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Browser fallback — add an ElevenLabs key for premium narration
          </span>
        )}
      </div>
    );
  }

  if (state === "ready" && audioUrl) {
    return (
      <div className="flex flex-col gap-1">
        <audio controls autoPlay src={audioUrl} className="w-full">
          <track kind="captions" />
        </audio>
        <span className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
          Narrated by ElevenLabs
        </span>
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={loadVoice} disabled={state === "loading"}>
      {state === "loading" ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Generating voice…
        </>
      ) : (
        <>
          <Volume2 className="size-4" />
          Play voice receipt
        </>
      )}
    </Button>
  );
}
