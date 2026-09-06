/**
 * Verify the Solana treasury secret without printing it.
 *
 * Run: bun run check:solana-key
 *
 * The script reads SOLANA_TREASURY_SECRET from the local environment, derives
 * its public key, and checks the devnet balance. If the account is funded, the
 * app will record real on-chain ("confirmed") donations. The secret is never
 * logged.
 */

import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const rawSecret = process.env.SOLANA_TREASURY_SECRET?.trim();

if (!rawSecret) {
  console.error("SOLANA_TREASURY_SECRET is not set in the local environment.");
  process.exit(1);
}

let keypair: Keypair;
try {
  const secret = JSON.parse(rawSecret) as unknown;
  if (
    !Array.isArray(secret) ||
    secret.length !== 64 ||
    secret.some((value) => typeof value !== "number")
  ) {
    throw new Error("expected a JSON array of 64 numbers");
  }
  keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
} catch (error) {
  console.error(
    `SOLANA_TREASURY_SECRET is invalid: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}

const derivedPublicKey = keypair.publicKey.toBase58();
const cluster = (process.env.SOLANA_CLUSTER ?? "devnet").trim();
const rpcUrl = process.env.SOLANA_RPC_URL?.trim() || clusterApiUrl(cluster as "devnet");

console.log(`Treasury public key: ${derivedPublicKey}`);
console.log(`Cluster:             ${cluster}`);
console.log(`RPC:                 ${rpcUrl}`);

try {
  const connection = new Connection(rpcUrl, "confirmed");
  const balance = await connection.getBalance(keypair.publicKey);
  const sol = balance / LAMPORTS_PER_SOL;
  console.log(`Balance:             ${sol} SOL`);
  console.log(
    `Explorer:            https://explorer.solana.com/address/${derivedPublicKey}?cluster=${cluster}`
  );
  console.log(
    sol > 0
      ? "\n\u2705 Ready. Donations will be recorded on-chain as \u201cConfirmed\u201d."
      : "\n\u26a0 Key is valid but the balance is 0. Fund it at https://faucet.solana.com to enable on-chain donations."
  );
  if (sol <= 0) process.exitCode = 2;
} catch (error) {
  console.error(
    `Could not check balance: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
}
