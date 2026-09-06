"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle2, ExternalLink, HandHeart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VoiceReceipt } from "@/components/voice-receipt";
import type { Donation } from "@/lib/donations/types";
import { shortSig, usd } from "@/lib/format";

const PRESETS = [5, 10, 25, 50];

interface DonateResponse {
  donation: Donation;
  ledger: { explorerUrl: string };
}

export function DonatePanel({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(25);
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<DonateResponse | null>(null);

  async function handleDonate() {
    if (!amount || amount < 1) {
      toast.error("Please enter an amount of at least $1.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amountUsd: Math.round(amount),
          donorName: donorName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Donation failed");
      }
      const data = (await res.json()) as DonateResponse;
      setReceipt(data);
      toast.success("Thank you! Your gift is on the ledger.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setReceipt(null);
    setMessage("");
    setDonorName("");
    setAmount(25);
  }

  return (
    <>
      <div className="flex flex-col gap-5 rounded-xl border border-border/60 bg-card p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Make a gift</h2>
          <p className="text-sm text-muted-foreground">
            Any amount helps — and you'll see it recorded on the public ledger instantly.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Amount (USD)</Label>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p}
                type="button"
                variant={amount === p ? "default" : "outline"}
                onClick={() => setAmount(p)}
              >
                ${p}
              </Button>
            ))}
          </div>
          <Input
            type="number"
            min={1}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-label="Custom amount"
            className="mt-1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="donorName">Your name (optional)</Label>
          <Input
            id="donorName"
            placeholder="Anonymous"
            value={donorName}
            maxLength={60}
            onChange={(e) => setDonorName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="message">A note to the cause (optional)</Label>
          <Textarea
            id="message"
            placeholder="Why this cause matters to you…"
            value={message}
            maxLength={280}
            rows={3}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button size="lg" onClick={handleDonate} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Recording your gift…
            </>
          ) : (
            <>
              <HandHeart className="size-4" />
              Give {usd(Math.max(0, Math.round(amount) || 0))}
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo mode — no real funds move. Gifts are anchored on Solana devnet.
        </p>
      </div>

      {/* Receipt dialog */}
      <Dialog open={!!receipt} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="sm:max-w-md">
          {receipt && (
            <>
              <DialogHeader>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-6" />
                </div>
                <DialogTitle className="text-center">
                  Thank you, {receipt.donation.donorName}!
                </DialogTitle>
                <DialogDescription className="text-center">
                  Your {usd(receipt.donation.amountUsd)} gift is recorded.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                {receipt.donation.thankYouNote && (
                  <blockquote className="rounded-lg border border-border/60 bg-accent/40 p-4 text-sm italic leading-relaxed">
                    “{receipt.donation.thankYouNote}”
                    <span className="mt-2 block text-[10px] not-italic uppercase tracking-wide text-muted-foreground">
                      Written by Gemini
                    </span>
                  </blockquote>
                )}

                <VoiceReceipt donationId={receipt.donation.id} />

                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        receipt.donation.ledgerStatus === "confirmed" ? "default" : "secondary"
                      }
                    >
                      {receipt.donation.ledgerStatus === "confirmed" ? "On-chain" : "Simulated"}
                    </Badge>
                    <span className="font-mono text-muted-foreground">
                      {shortSig(receipt.donation.txSignature)}
                    </span>
                  </div>
                  <a
                    href={receipt.ledger.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Explorer
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <Button variant="outline" onClick={reset}>
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
