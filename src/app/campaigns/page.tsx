import type { Metadata } from "next";

import { CampaignCard } from "@/components/campaign-card";
import { getCampaignsWithProgress } from "@/lib/donations/queries";

export const metadata: Metadata = {
  title: "Campaigns · OpenPledge",
  description: "Browse small-nonprofit campaigns and give with full transparency.",
};

export default async function CampaignsPage() {
  const campaigns = await getCampaignsWithProgress();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Campaigns</h1>
        <p className="max-w-2xl text-muted-foreground">
          Real problems, close to the people who feel them. Every gift is recorded openly — pick a
          cause and give any amount.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
      </div>
    </main>
  );
}
