import "server-only";

import { CAMPAIGNS, getCampaign } from "@/lib/donations/campaigns";
import { listDonations, listDonationsForCampaign, raisedByCampaign } from "@/lib/donations/store";
import type { Campaign, Donation } from "@/lib/donations/types";
import { getImpactStats } from "@/lib/integrations/snowflake";

export interface CampaignWithProgress extends Campaign {
  raisedUsd: number;
  donationCount: number;
  percent: number;
}

export function getCampaignsWithProgress(): CampaignWithProgress[] {
  const raised = raisedByCampaign();
  const counts = listDonations().reduce<Record<string, number>>((acc, d) => {
    acc[d.campaignId] = (acc[d.campaignId] ?? 0) + 1;
    return acc;
  }, {});

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

export function getCampaignWithProgress(id: string): CampaignWithProgress | undefined {
  const campaign = getCampaign(id);
  if (!campaign) return undefined;
  const donations = listDonationsForCampaign(campaign.id);
  const raisedUsd = donations.reduce((s, d) => s + d.amountUsd, 0);
  return {
    ...campaign,
    raisedUsd,
    donationCount: donations.length,
    percent: Math.min(100, Math.round((raisedUsd / campaign.goalUsd) * 100)),
  };
}

export function getCampaignDonations(id: string): Donation[] {
  return listDonationsForCampaign(id);
}

export function getLedger(): Donation[] {
  return listDonations();
}

export async function getStats() {
  return getImpactStats(listDonations());
}
