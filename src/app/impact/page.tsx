import type { Metadata } from "next";

import { Database, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getStats } from "@/lib/donations/queries";
import { usd } from "@/lib/format";
import { generateImpactSummary } from "@/lib/integrations/gemini";

// Cache the rendered page and refresh it in the background at most once per
// minute (ISR). After the first load, visits serve instantly from cache instead
// of re-querying Snowflake + Gemini on every navigation. A new donation also
// revalidates this route on demand (see the donate API route).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Impact · OpenPledge",
  description: "Transparent, aggregate impact reporting powered by Snowflake.",
};

export default async function ImpactPage() {
  const stats = await getStats();
  const summary = await generateImpactSummary({
    totalRaisedUsd: stats.totalRaisedUsd,
    donationCount: stats.donationCount,
    campaignsSupported: stats.campaignsSupported,
  });

  const maxCat = Math.max(1, ...stats.byCategory.map((c) => c.totalUsd));
  const maxDay = Math.max(1, ...stats.recentTrend.map((d) => d.totalUsd));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Impact dashboard</h1>
          <Badge variant="outline" className="gap-1">
            <Database className="size-3" />
            {stats.source === "snowflake" ? "Snowflake" : "Local demo data"}
          </Badge>
        </div>
        <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-accent/40 p-3 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="italic">{summary}</span>
        </p>
      </header>

      {/* Headline stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total raised" value={usd(stats.totalRaisedUsd)} />
        <StatCard label="Donations" value={String(stats.donationCount)} />
        <StatCard label="Avg. gift" value={usd(stats.averageDonationUsd)} />
        <StatCard
          label="Verified on-chain"
          value={String(stats.confirmedOnChain)}
          sub={`of ${stats.donationCount} gifts`}
        />
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* By category */}
        <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5">
          <h2 className="text-lg font-semibold">Giving by theme</h2>
          <ul className="flex flex-col gap-4">
            {stats.byCategory.map((c) => (
              <li key={c.category} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{c.label}</span>
                  <span className="font-semibold tabular-nums">{usd(c.totalUsd)}</span>
                </div>
                <Progress value={Math.round((c.totalUsd / maxCat) * 100)} />
              </li>
            ))}
          </ul>
        </section>

        {/* Recent trend */}
        <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="size-4 text-primary" />
            Recent daily giving
          </h2>
          <div className="flex h-40 items-end justify-between gap-2">
            {stats.recentTrend.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-primary/80"
                  style={{ height: `${Math.max(4, (d.totalUsd / maxDay) * 100)}%` }}
                  title={`${d.date}: ${usd(d.totalUsd)}`}
                />
                <span className="text-[10px] text-muted-foreground">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Aggregates recompute from the warehouse in production; here they reflect the demo
            ledger.
          </p>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
