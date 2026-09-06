import type { Metadata } from "next";
import Link from "next/link";

import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getLedger } from "@/lib/donations/queries";
import { relativeTime, shortSig, usd } from "@/lib/format";
import { ledgerExplorerUrl } from "@/lib/integrations/solana";

// Cache and refresh at most once per minute; a new donation revalidates this
// route on demand (see the donate API route), so gifts still appear instantly.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Public Ledger · OpenPledge",
  description: "Every donation, recorded openly and anchored on Solana.",
};

export default function LedgerPage() {
  const ledger = getLedger();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Public ledger</h1>
        <p className="max-w-2xl text-muted-foreground">
          Accountability by default. Every gift on OpenPledge is listed here with its on-chain
          reference — auditable by anyone, no login required.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Donor</th>
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Signature</th>
              <th className="px-4 py-3 text-right font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {ledger.map((d) => (
              <tr key={d.id} className="transition-colors hover:bg-accent/30">
                <td className="px-4 py-3 font-medium">{d.donorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.campaignTitle}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {usd(d.amountUsd)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={d.ledgerStatus === "confirmed" ? "default" : "secondary"}>
                    {d.ledgerStatus === "confirmed" ? "On-chain" : "Simulated"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={ledgerExplorerUrl(d.txSignature, d.cluster)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                  >
                    {shortSig(d.txSignature)}
                    <ExternalLink className="size-3" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  {relativeTime(d.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Signatures marked “Simulated” are recorded locally in demo mode; with a funded Solana
        treasury key they become live devnet transactions you can open on the explorer.
      </p>
    </main>
  );
}
