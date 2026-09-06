"use client";

import { useState } from "react";

import { CheckCircle2, ExternalLink, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useByokKey } from "@/lib/byok";

/**
 * "Bring your own key" dialog. Lets judges/visitors paste their own API keys so
 * the live integrations can be tested without the maintainer's keys. Keys are
 * stored only in the browser (localStorage) and sent per-request to our API
 * routes, which forward them to the provider and never persist them.
 */
export function ByokDialog({ triggerLabel }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [eleven, setEleven] = useByokKey("elevenlabs");
  const [gemini, setGemini] = useByokKey("gemini");

  const [elevenDraft, setElevenDraft] = useState(eleven);
  const [geminiDraft, setGeminiDraft] = useState(gemini);

  function onOpenChange(next: boolean) {
    if (next) {
      // Sync drafts with stored values whenever the dialog opens.
      setElevenDraft(eleven);
      setGeminiDraft(gemini);
    }
    setOpen(next);
  }

  function save() {
    setEleven(elevenDraft);
    setGemini(geminiDraft);
    toast.success(
      "Keys saved in your browser. They never leave this device except to call the provider."
    );
    setOpen(false);
  }

  function clearAll() {
    setEleven("");
    setGemini("");
    setElevenDraft("");
    setGeminiDraft("");
    toast.message("Cleared your saved keys.");
  }

  const anyStored = Boolean(eleven || gemini);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <KeyRound className="size-4" />
            {triggerLabel ?? "Bring your own key"}
            {anyStored && <CheckCircle2 className="size-3.5 text-primary" />}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            Bring your own key
          </DialogTitle>
          <DialogDescription>
            Test the live integrations with your own API keys. Keys are stored{" "}
            <strong>only in this browser</strong> and are sent per-request to the provider — never
            saved on our server.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="byok-eleven">ElevenLabs API key</Label>
              <a
                href="https://elevenlabs.io/app/settings/api-keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Get a free key
                <ExternalLink className="size-3" />
              </a>
            </div>
            <Input
              id="byok-eleven"
              type="password"
              autoComplete="off"
              placeholder="sk_…"
              value={elevenDraft}
              onChange={(e) => setElevenDraft(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Powers spoken voice receipts. Free tier works with the{" "}
              <code className="rounded bg-muted px-1">eleven_multilingual_v2</code> model.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="byok-gemini">Google Gemini API key (optional)</Label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Get a free key
                <ExternalLink className="size-3" />
              </a>
            </div>
            <Input
              id="byok-gemini"
              type="password"
              autoComplete="off"
              placeholder="AI…"
              value={geminiDraft}
              onChange={(e) => setGeminiDraft(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Powers AI-written thank-you notes &amp; impact summaries.
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={clearAll} disabled={!anyStored}>
              Clear keys
            </Button>
            <Button onClick={save}>Save keys</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
