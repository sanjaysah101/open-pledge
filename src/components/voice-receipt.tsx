"use client";

import { useState } from "react";

import { Loader2, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Plays an ElevenLabs-narrated voice receipt for a donation. Fetches the
 * audio on demand; if the service is unavailable (no key configured) it
 * shows an unobtrusive note instead of an error.
 */
export function VoiceReceipt({ donationId }: { donationId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function loadVoice() {
    setState("loading");
    try {
      const res = await fetch(`/api/voice/${donationId}`);
      if (!res.ok) {
        setState("unavailable");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setState("ready");
    } catch {
      setState("unavailable");
    }
  }

  if (state === "unavailable") {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Voice receipt unavailable — add an ElevenLabs API key to enable narration.
      </p>
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
