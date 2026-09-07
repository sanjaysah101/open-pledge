import Link from "next/link";

import { Coins, HandHeart, MessageSquareHeart, ShieldCheck, Volume2 } from "lucide-react";

import { CampaignCard } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { getCampaignsWithProgress, getStats } from "@/lib/donations/queries";
import { usd } from "@/lib/format";

export default async function Home() {
  const campaigns = await getCampaignsWithProgress();
  const stats = await getStats();
  const featured = campaigns.slice(0, 3);

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-accent)_0%,transparent_70%)] opacity-60"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <HandHeart className="size-3.5 text-primary" />
            Built for International Day of Charity
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-6xl">
            Give small. <span className="text-primary">See everything.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            OpenPledge makes micro-giving to small nonprofits radically transparent. Every gift is
            anchored on a public ledger, acknowledged with a personal note and voice receipt, and
            rolled into open impact reporting — so donors trust exactly where their generosity goes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/campaigns" />}>
              Explore campaigns
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/impact" />}
            >
              See the impact
            </Button>
          </div>

          {/* Live stats */}
          <dl className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Raised" value={usd(stats.totalRaisedUsd)} />
            <Stat label="Gifts" value={String(stats.donationCount)} />
            <Stat label="Donors" value={String(stats.donorCount)} />
            <Stat label="Campaigns" value={String(stats.campaignsSupported)} />
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Transparency, built in at every step
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
          Four technologies quietly work together so a $5 gift feels as accountable as a $5,000 one.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<Coins className="size-5" />}
            title="On-chain ledger"
            body="Each donation is anchored on Solana with a verifiable signature anyone can audit."
            tag="Solana"
          />
          <Feature
            icon={<MessageSquareHeart className="size-5" />}
            title="Personal thank-you"
            body="Gemini writes a warm, specific note for every donor — the human touch, at scale."
            tag="Google AI"
          />
          <Feature
            icon={<Volume2 className="size-5" />}
            title="Voice receipt"
            body="ElevenLabs narrates each note into natural speech — accessible and heartfelt."
            tag="ElevenLabs"
          />
          <Feature
            icon={<ShieldCheck className="size-5" />}
            title="Open reporting"
            body="Snowflake powers aggregate impact analytics so the whole community can see the picture."
            tag="Snowflake"
          />
        </div>
      </section>

      {/* Featured campaigns */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured campaigns</h2>
          <Link href="/campaigns" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-left">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
          {icon}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {tag}
        </span>
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
