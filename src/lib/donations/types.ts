// Domain types for OpenPledge — a transparent micro-donation platform.
// Everything a donor gives is recorded, acknowledged, and made auditable.

/** A small nonprofit campaign accepting micro-donations. */
export interface Campaign {
  id: string;
  slug: string;
  title: string;
  organization: string;
  /** One-line summary shown on cards. */
  summary: string;
  /** Longer description shown on the detail page. */
  story: string;
  /** Thematic category (maps to the UN charity themes in the prompt). */
  category: CampaignCategory;
  /** Fundraising goal, in whole USD. */
  goalUsd: number;
  /** The community / region this campaign serves. */
  location: string;
  /** Accent emoji used as a lightweight, dependency-free illustration. */
  emoji: string;
  /** The Solana address donations are attributed to (devnet demo wallet). */
  walletAddress: string;
}

export type CampaignCategory =
  | "climate-poverty"
  | "youth-leadership"
  | "equity-inclusion"
  | "technology-giving";

export const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  "climate-poverty": "Climate & Poverty",
  "youth-leadership": "Youth Leadership",
  "equity-inclusion": "Equity & Inclusion",
  "technology-giving": "Tech-Driven Giving",
};

/** How a donation was recorded on-chain. */
export type LedgerStatus = "confirmed" | "simulated";

/**
 * A single donation. Every field here is designed to be transparent:
 * the amount, the on-chain reference, and the generated acknowledgement
 * are all visible to donors on the public ledger.
 */
export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  /** Donor display name; "Anonymous" when not provided. */
  donorName: string;
  amountUsd: number;
  /** Optional note the donor left for the cause. */
  message?: string;
  createdAt: string; // ISO timestamp

  // --- Transparency artifacts ---------------------------------------------
  /** Solana transaction signature (real on devnet, or a simulated ref). */
  txSignature: string;
  /** Whether the transaction was confirmed on-chain or simulated locally. */
  ledgerStatus: LedgerStatus;
  /** Solana cluster the tx lives on (e.g. "devnet"). */
  cluster: string;
  /** AI-generated (Gemini) personalized thank-you note. */
  thankYouNote?: string;
  /** Whether an ElevenLabs voice receipt is available for this donation. */
  hasVoiceReceipt: boolean;
}

/** Input accepted by the donation API. */
export interface CreateDonationInput {
  campaignId: string;
  amountUsd: number;
  donorName?: string;
  message?: string;
}

/** Aggregated transparency metrics (backed by Snowflake in production). */
export interface ImpactStats {
  totalRaisedUsd: number;
  donationCount: number;
  donorCount: number;
  averageDonationUsd: number;
  campaignsSupported: number;
  confirmedOnChain: number;
  byCategory: { category: CampaignCategory; label: string; totalUsd: number }[];
  recentTrend: { date: string; totalUsd: number }[];
  /** True when figures come from Snowflake rather than the local fallback. */
  source: "snowflake" | "local";
}
