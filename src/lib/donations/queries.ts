import "server-only";

import { CAMPAIGNS, getCampaign } from "@/lib/donations/campaigns";
import { listDonations } from "@/lib/donations/store";
import type { Campaign, Donation } from "@/lib/donations/types";
import { getImpactStats, listDonationsFromWarehouse } from "@/lib/integrations/snowflake";

export interface CampaignWithProgress extends Campaign {
  raisedUsd: number;
  donationCount: number;
  percent: number;
}

/**
 * The authoritative donation list. Prefers Snowflake (the source of truth,
 * consistent across serverless instances); falls back to the in-memory demo
 * store when Snowflake isn't configured or is empty.
 */
async function resolveDonations(): Promise<Donation[]> {
  const warehouse = await listDonationsFromWarehouse();
  return warehouse ?? listDonations();
}

function withProgress(campaign: Campaign, donations: Donation[]): CampaignWithProgress {
  const raisedUsd = donations.reduce((s, d) => s + d.amountUsd, 0);
  return {
    ...campaign,
    raisedUsd,
    donationCount: donations.length,
    percent: Math.min(100, Math.round((raisedUsd / campaign.goalUsd) * 100)),
  };
}

export async function getCampaignsWithProgress(): Promise<CampaignWithProgress[]> {
  const donations = await resolveDonations();
  const raised: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const d of donations) {
    raised[d.campaignId] = (raised[d.campaignId] ?? 0) + d.amountUsd;
    counts[d.campaignId] = (counts[d.campaignId] ?? 0) + 1;
  }

  return CAMPAIGNS.map((c) => {
    const raisedUsd = raised[c.id] ?? 0;
    return {
      ...c,
      raisedUsd,
      donationCount: counts[c.id] ?? 0,
      percent: Math.min(100, Math.round((raisedUsd / c.goalUsd) * 100)),
    };
  });
}

export async function getCampaignWithProgress(
  id: string
): Promise<CampaignWithProgress | undefined> {
  const campaign = getCampaign(id);
  if (!campaign) return undefined;
  const donations = (await resolveDonations()).filter((d) => d.campaignId === campaign.id);
  return withProgress(campaign, donations);
}

export async function getCampaignDonations(id: string): Promise<Donation[]> {
  const campaign = getCampaign(id);
  if (!campaign) return [];
  return (await resolveDonations()).filter((d) => d.campaignId === campaign.id);
}

export async function getLedger(): Promise<Donation[]> {
  return resolveDonations();
}

export async function getStats() {
  return getImpactStats(listDonations());
}
