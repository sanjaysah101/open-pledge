import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, MapPin, Users } from "lucide-react";

import { DonatePanel } from "@/components/donate-panel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CAMPAIGNS } from "@/lib/donations/campaigns";
import { getCampaignDonations, getCampaignWithProgress } from "@/lib/donations/queries";
import { CATEGORY_LABELS } from "@/lib/donations/types";
import { relativeTime, usd } from "@/lib/format";

// Refresh cached campaign pages at least once a minute; a new donation also
// revalidates the specific campaign on demand (see the donate API route).
export const revalidate = 60;

export function generateStaticParams() {
  return CAMPAIGNS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignWithProgress(slug);
  if (!campaign) return { title: "Campaign not found · OpenPledge" };
  return {
    title: `${campaign.title} · OpenPledge`,
    description: campaign.summary,
  };
}

export default async function CampaignDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaignWithProgress(slug);
  if (!campaign) notFound();

  const donations = await getCampaignDonations(campaign.id);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <Link
        href="/campaigns"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All campaigns
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Main content */}
        <article className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span aria-hidden className="text-5xl">
              {campaign.emoji}
            </span>
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="w-fit">
                {CATEGORY_LABELS[campaign.category]}
              </Badge>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                {campaign.title}
              </h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {campaign.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {campaign.organization}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-5">
            <Progress value={campaign.percent} aria-label="Funding progress" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{usd(campaign.raisedUsd)} raised</span>
              <span className="text-muted-foreground">
                {campaign.percent}% of {usd(campaign.goalUsd)} · {campaign.donationCount} gifts
              </span>
            </div>
          </div>

          <div className="prose-none flex flex-col gap-3">
            <h2 className="text-lg font-semibold">About this cause</h2>
            <p className="leading-relaxed text-muted-foreground">{campaign.story}</p>
          </div>

          {/* Recent donations */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Recent gifts</h2>
            {donations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No gifts yet — be the first to support this cause.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
                {donations.map((d) => (
                  <li key={d.id} className="flex items-start justify-between gap-4 px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{d.donorName}</span>
                      {d.message && (
                        <span className="text-xs text-muted-foreground">“{d.message}”</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-sm font-semibold tabular-nums">{usd(d.amountUsd)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {relativeTime(d.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>

        {/* Donate sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <DonatePanel campaignId={campaign.id} />
        </aside>
      </div>
    </main>
  );
}
