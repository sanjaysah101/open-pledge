import "server-only";

import { CAMPAIGNS } from "@/lib/donations/campaigns";
import type { Donation } from "@/lib/donations/types";

/**
 * In-memory donation ledger for the demo. State resets when the server
 * restarts — this is a stand-in for a real database, and says so. The public
 * transparency ledger and impact stats read from here; Snowflake mirrors it
 * for analytics when configured.
 *
 * The module-level array is intentionally kept on `globalThis` so it survives
 * Next.js dev-mode module reloads within a single server process.
 */
const globalForStore = globalThis as unknown as {
  __openpledge_donations?: Donation[];
};

function seed(): Donation[] {
  const now = Date.now();
  const hours = (h: number) => new Date(now - h * 3_600_000).toISOString();
  const sig = (n: number) => `Sim${n.toString().padStart(4, "0")}DemoLedgerRef${"X".repeat(60)}`;

  const rows: Omit<Donation, "id" | "campaignTitle">[] = [
    {
      campaignId: "clean-water-mto",
      donorName: "Amara",
      amountUsd: 50,
      message: "Water is life. Proud to help.",
      createdAt: hours(2),
      txSignature: sig(1),
      ledgerStatus: "simulated",
      cluster: "devnet",
      thankYouNote:
        "Amara, your $50 lays real pipe toward clean water for 400 students — thank you for walking this last mile with Mto Primary.",
      hasVoiceReceipt: true,
    },
    {
      campaignId: "girls-code-lab",
      donorName: "Anonymous",
      amountUsd: 25,
      createdAt: hours(5),
      txSignature: sig(2),
      ledgerStatus: "simulated",
      cluster: "devnet",
      thankYouNote:
        "Your quiet $25 becomes keystrokes and confidence for a young builder at Futuras. Thank you for believing in her before the world does.",
      hasVoiceReceipt: false,
    },
    {
      campaignId: "youth-food-rescue",
      donorName: "Diego",
      amountUsd: 100,
      message: "Keep those bikes rolling!",
      createdAt: hours(9),
      txSignature: sig(3),
      ledgerStatus: "simulated",
      cluster: "devnet",
      thankYouNote:
        "Diego, $100 keeps a rescue bike rolling and roughly 12,000 meals out of the landfill this year. Thank you for fueling the brigade.",
      hasVoiceReceipt: true,
    },
    {
      campaignId: "reforest-ridge",
      donorName: "Sofia",
      amountUsd: 40,
      message: "For the canopy that comes back.",
      createdAt: hours(20),
      txSignature: sig(4),
      ledgerStatus: "simulated",
      cluster: "devnet",
      thankYouNote:
        "Sofia, your $40 puts native saplings in burnt soil and roots hope for the ridge. Thank you for planting a future you may never sit under.",
      hasVoiceReceipt: false,
    },
    {
      campaignId: "assistive-devices",
      donorName: "Anonymous",
      amountUsd: 75,
      createdAt: hours(28),
      txSignature: sig(5),
      ledgerStatus: "simulated",
      cluster: "devnet",
      thankYouNote:
        "$75 of filament and care becomes a 3D-printed hand, given free to a family that needs it. Thank you for open-sourcing generosity.",
      hasVoiceReceipt: false,
    },
    {
      campaignId: "warm-nights",
      donorName: "Kenji",
      amountUsd: 25,
      message: "One kit, one warm night.",
      createdAt: hours(34),
      txSignature: sig(6),
      ledgerStatus: "simulated",
      cluster: "devnet",
      thankYouNote:
        "Kenji, your $25 is one complete winter kit — a warm night for a neighbor when it matters most. Thank you.",
      hasVoiceReceipt: true,
    },
  ];

  const titleOf = (id: string) => CAMPAIGNS.find((c) => c.id === id)?.title ?? "Campaign";
  return rows.map((r, i) => ({
    ...r,
    id: `seed-${i + 1}`,
    campaignTitle: titleOf(r.campaignId),
  }));
}

function db(): Donation[] {
  if (!globalForStore.__openpledge_donations) {
    globalForStore.__openpledge_donations = seed();
  }
  return globalForStore.__openpledge_donations;
}

/** All donations, newest first. */
export function listDonations(): Donation[] {
  return [...db()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listDonationsForCampaign(campaignId: string): Donation[] {
  return listDonations().filter((d) => d.campaignId === campaignId);
}

export function getDonation(id: string): Donation | undefined {
  return db().find((d) => d.id === id);
}

export function addDonation(donation: Donation): Donation {
  db().unshift(donation);
  return donation;
}

export function updateDonation(id: string, patch: Partial<Donation>): Donation | undefined {
  const rows = db();
  const idx = rows.findIndex((d) => d.id === id);
  const current = rows[idx];
  if (idx === -1 || !current) return undefined;
  const next: Donation = { ...current, ...patch };
  rows[idx] = next;
  return next;
}

/** Total raised (USD) per campaign id. */
export function raisedByCampaign(): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const d of db()) {
    totals[d.campaignId] = (totals[d.campaignId] ?? 0) + d.amountUsd;
  }
  return totals;
}
