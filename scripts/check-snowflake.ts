/**
 * Verify Snowflake credentials for OpenPledge.
 *
 * Run:  bun run check:snowflake
 *
 * Reads the SNOWFLAKE_* variables from your environment (.env.local via Bun's
 * automatic loading), connects, ensures the database/schema exist, creates the
 * DONATIONS table if needed, and reports the row count. Gives instant feedback
 * instead of discovering credential issues through the app.
 */

import snowflake from "snowflake-sdk";

// Quiet the SDK's verbose default logging.
snowflake.configure({ logLevel: "ERROR" });

const required = ["SNOWFLAKE_ACCOUNT", "SNOWFLAKE_USERNAME", "SNOWFLAKE_PASSWORD"] as const;

const DATABASE = process.env.SNOWFLAKE_DATABASE ?? "OPENPLEDGE";
const SCHEMA = process.env.SNOWFLAKE_SCHEMA ?? "PUBLIC";
const WAREHOUSE = process.env.SNOWFLAKE_WAREHOUSE ?? "COMPUTE_WH";

function connect(): Promise<snowflake.Connection> {
  return new Promise((resolve, reject) => {
    const connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT as string,
      username: process.env.SNOWFLAKE_USERNAME as string,
      password: process.env.SNOWFLAKE_PASSWORD as string,
      warehouse: WAREHOUSE,
    });
    connection.connect((err, conn) => (err ? reject(err) : resolve(conn)));
  });
}

function execute(
  connection: snowflake.Connection,
  sqlText: string
): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      complete: (err, _stmt, rows) =>
        err ? reject(err) : resolve((rows as Record<string, unknown>[]) ?? []),
    });
  });
}

async function main() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`❌ Missing env vars: ${missing.join(", ")}`);
    console.error("   Add them to .env.local and re-run.");
    process.exit(1);
  }

  console.log(`❄️  Connecting to Snowflake account "${process.env.SNOWFLAKE_ACCOUNT}"…`);
  const connection = await connect();
  console.log("   ✓ Connected.\n");

  try {
    console.log(`   Ensuring warehouse ${WAREHOUSE} is active…`);
    await execute(connection, `USE WAREHOUSE ${WAREHOUSE}`);

    console.log(`   Ensuring database ${DATABASE} exists…`);
    await execute(connection, `CREATE DATABASE IF NOT EXISTS ${DATABASE}`);
    await execute(connection, `USE DATABASE ${DATABASE}`);
    await execute(connection, `USE SCHEMA ${SCHEMA}`);

    console.log("   Ensuring DONATIONS table exists…");
    await execute(
      connection,
      `CREATE TABLE IF NOT EXISTS DONATIONS (
        ID STRING PRIMARY KEY,
        CAMPAIGN_ID STRING,
        CATEGORY STRING,
        DONOR_NAME STRING,
        AMOUNT_USD NUMBER(12,2),
        TX_SIGNATURE STRING,
        LEDGER_STATUS STRING,
        CREATED_AT TIMESTAMP_NTZ
      )`
    );

    const rows = await execute(connection, `SELECT COUNT(*) AS CNT FROM DONATIONS`);
    const count = rows[0]?.CNT ?? 0;

    console.log("\n─".repeat(1) + "─".repeat(71));
    console.log(`✅ Snowflake is ready.`);
    console.log(`   Database: ${DATABASE}  ·  Schema: ${SCHEMA}  ·  Warehouse: ${WAREHOUSE}`);
    console.log(`   DONATIONS rows: ${count}`);
    console.log("─".repeat(72));
    console.log("\nThe Impact dashboard will now read live aggregates from Snowflake.");
  } finally {
    connection.destroy(() => void 0);
  }
}

main().catch((error) => {
  console.error("\n❌ Snowflake check failed:");
  console.error(`   ${error instanceof Error ? error.message : String(error)}`);
  console.error(
    "\nCommon causes:\n" +
      "  • Account identifier format — use <orgname>-<account_name> (from Snowsight → Account).\n" +
      "  • Wrong username/password.\n" +
      "  • Warehouse name doesn't exist (trial default is COMPUTE_WH)."
  );
  process.exit(1);
});
