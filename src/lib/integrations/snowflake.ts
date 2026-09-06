import "server-only";

import snowflake from "snowflake-sdk";

import { getCampaign } from "@/lib/donations/campaigns";
import type { CampaignCategory, Donation, ImpactStats } from "@/lib/donations/types";
import { CATEGORY_LABELS } from "@/lib/donations/types";

/**
 * Snowflake integration — the accountability & analytics warehouse.
 *
 * Transparent giving means donors can see the whole picture, not just their
 * own gift. Snowflake is where every donation is mirrored for aggregate
 * reporting: totals, trends, category breakdowns — the numbers behind the
 * public transparency dashboard.
 *
 * Two paths, one contract:
 *  - If Snowflake credentials are configured, we push each donation into a
 *    DONATIONS table and read aggregates back with SQL.
 *  - Otherwise we compute the exact same ImpactStats shape locally from the
 *    in-memory ledger, so the dashboard is always populated. The `source`
 *    field on ImpactStats tells the UI which path produced the numbers.
 */

/** How long to wait on Snowflake before giving up and using the local path. */
const SNOWFLAKE_TIMEOUT_MS = Number(process.env.SNOWFLAKE_TIMEOUT_MS ?? 8000);

/** Reject after `ms` so a suspended warehouse never stalls the page render. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("snowflake timeout")), ms)),
  ]);
}

function isConfigured(): boolean {
  return Boolean(
    process.env.SNOWFLAKE_ACCOUNT &&
      process.env.SNOWFLAKE_USERNAME &&
      process.env.SNOWFLAKE_PASSWORD
  );
}

function connect(): Promise<snowflake.Connection> {
  return new Promise((resolve, reject) => {
    const connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT as string,
      username: process.env.SNOWFLAKE_USERNAME as string,
      password: process.env.SNOWFLAKE_PASSWORD as string,
      database: process.env.SNOWFLAKE_DATABASE ?? "OPENPLEDGE",
      schema: process.env.SNOWFLAKE_SCHEMA ?? "PUBLIC",
      warehouse: process.env.SNOWFLAKE_WAREHOUSE ?? "COMPUTE_WH",
    });
    connection.connect((err, conn) => (err ? reject(err) : resolve(conn)));
  });
}

function execute<T = Record<string, unknown>>(
  connection: snowflake.Connection,
  sqlText: string,
  binds: (string | number)[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete: (err, _stmt, rows) => (err ? reject(err) : resolve((rows as T[]) ?? [])),
    });
  });
}

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS DONATIONS (
    ID STRING PRIMARY KEY,
    CAMPAIGN_ID STRING,
    CATEGORY STRING,
    DONOR_NAME STRING,
    AMOUNT_USD NUMBER(12,2),
    TX_SIGNATURE STRING,
    LEDGER_STATUS STRING,
    CREATED_AT TIMESTAMP_NTZ
  )
`;

/** Mirror a single donation into Snowflake. No-op (silent) if unconfigured. */
export async function recordDonationInWarehouse(donation: Donation): Promise<void> {
  if (!isConfigured()) return;
  let connection: snowflake.Connection | undefined;
  try {
    connection = await connect();
    await execute(connection, CREATE_TABLE);
    const category = getCampaign(donation.campaignId)?.category ?? "technology-giving";
    await execute(
      connection,
      `INSERT INTO DONATIONS
        (ID, CAMPAIGN_ID, CATEGORY, DONOR_NAME, AMOUNT_USD, TX_SIGNATURE, LEDGER_STATUS, CREATED_AT)
       SELECT ?, ?, ?, ?, ?, ?, ?, TO_TIMESTAMP_NTZ(?)`,
      [
        donation.id,
        donation.campaignId,
        category,
        donation.donorName,
        donation.amountUsd,
        donation.txSignature,
        donation.ledgerStatus,
        donation.createdAt,
      ]
    );
  } catch {
    // Analytics mirroring is best-effort; never block a gift on it.
  } finally {
    connection?.destroy(() => void 0);
  }
}

/** Aggregate impact stats from Snowflake. Returns null if unavailable. */
async function statsFromSnowflake(): Promise<ImpactStats | null> {
  if (!isConfigured()) return null;
  let connection: snowflake.Connection | undefined;
  try {
    connection = await withTimeout(connect(), SNOWFLAKE_TIMEOUT_MS);
    await execute(connection, CREATE_TABLE);

    const [totals] = await execute<{
      TOTAL: number;
      CNT: number;
      DONORS: number;
      CAMPAIGNS: number;
      CONFIRMED: number;
    }>(
      connection,
      `SELECT
         COALESCE(SUM(AMOUNT_USD),0) AS TOTAL,
         COUNT(*) AS CNT,
         COUNT(DISTINCT DONOR_NAME) AS DONORS,
         COUNT(DISTINCT CAMPAIGN_ID) AS CAMPAIGNS,
         COUNT_IF(LEDGER_STATUS = 'confirmed') AS CONFIRMED
       FROM DONATIONS`
    );

    const byCat = await execute<{ CATEGORY: string; TOTAL: number }>(
      connection,
      `SELECT CATEGORY, SUM(AMOUNT_USD) AS TOTAL FROM DONATIONS GROUP BY CATEGORY`
    );

    const trend = await execute<{ D: string; TOTAL: number }>(
      connection,
      `SELECT TO_VARCHAR(CREATED_AT::DATE) AS D, SUM(AMOUNT_USD) AS TOTAL
       FROM DONATIONS GROUP BY 1 ORDER BY 1 DESC LIMIT 7`
    );

    const count = Number(totals?.CNT ?? 0);
    const total = Number(totals?.TOTAL ?? 0);
    return {
      totalRaisedUsd: total,
      donationCount: count,
      donorCount: Number(totals?.DONORS ?? 0),
      averageDonationUsd: count ? Math.round(total / count) : 0,
      campaignsSupported: Number(totals?.CAMPAIGNS ?? 0),
      confirmedOnChain: Number(totals?.CONFIRMED ?? 0),
      byCategory: byCat.map((r) => ({
        category: r.CATEGORY as CampaignCategory,
        label: CATEGORY_LABELS[r.CATEGORY as CampaignCategory] ?? r.CATEGORY,
        totalUsd: Number(r.TOTAL),
      })),
      recentTrend: trend.map((r) => ({ date: r.D, totalUsd: Number(r.TOTAL) })).reverse(),
      source: "snowflake",
    };
  } catch {
    return null;
  } finally {
    connection?.destroy(() => void 0);
  }
}

/** Compute the same ImpactStats locally from the in-memory ledger. */
function statsFromLocal(donations: Donation[]): ImpactStats {
  const total = donations.reduce((s, d) => s + d.amountUsd, 0);
  const count = donations.length;
  const donors = new Set(donations.map((d) => d.donorName)).size;
  const campaigns = new Set(donations.map((d) => d.campaignId)).size;
  const confirmed = donations.filter((d) => d.ledgerStatus === "confirmed").length;

  const catTotals = new Map<CampaignCategory, number>();
  for (const d of donations) {
    const cat = getCampaign(d.campaignId)?.category ?? "technology-giving";
    catTotals.set(cat, (catTotals.get(cat) ?? 0) + d.amountUsd);
  }

  const dayTotals = new Map<string, number>();
  for (const d of donations) {
    const day = d.createdAt.slice(0, 10);
    dayTotals.set(day, (dayTotals.get(day) ?? 0) + d.amountUsd);
  }

  return {
    totalRaisedUsd: total,
    donationCount: count,
    donorCount: donors,
    averageDonationUsd: count ? Math.round(total / count) : 0,
    campaignsSupported: campaigns,
    confirmedOnChain: confirmed,
    byCategory: [...catTotals.entries()].map(([category, totalUsd]) => ({
      category,
      label: CATEGORY_LABELS[category],
      totalUsd,
    })),
    recentTrend: [...dayTotals.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, totalUsd]) => ({ date, totalUsd })),
    source: "local",
  };
}

/**
 * Impact stats for the dashboard. Prefers Snowflake; falls back to a local
 * computation so the page is always populated. `donations` is the local
 * ledger used both for the fallback and as a warehouse-free demo source.
 */
export async function getImpactStats(donations: Donation[]): Promise<ImpactStats> {
  const remote = await statsFromSnowflake();
  if (remote && remote.donationCount > 0) return remote;
  return statsFromLocal(donations);
}
