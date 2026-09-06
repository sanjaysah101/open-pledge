/**
 * Generate a Solana devnet treasury keypair for OpenPledge.
 *
 * Run:  bun run gen:solana-key
 *
 * It creates a fresh keypair, requests a free devnet airdrop to fund it (so the
 * app can actually send the on-chain "anchor" transactions), and prints the
 * SOLANA_TREASURY_SECRET value ready to paste into .env.local.
 *
 * No Solana CLI required — this uses @solana/web3.js directly. The keypair is
 * devnet-only test SOL with no real value, but treat the secret like a password:
 * it goes in .env.local (gitignored), never in committed files.
 */

import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const CLUSTER = "devnet";
const AIRDROP_SOL = 2;

async function main() {
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl(CLUSTER);
  const connection = new Connection(rpcUrl, "confirmed");

  console.log("🪙  Generating a new Solana devnet keypair…\n");
  const keypair = Keypair.generate();
  const pubkey = keypair.publicKey.toBase58();
  const secretArray = Array.from(keypair.secretKey);

  console.log(`   Public key: ${pubkey}`);
  console.log(`   RPC:        ${rpcUrl}\n`);

  // Try to fund it so real devnet transactions can go through.
  console.log(`💧  Requesting a ${AIRDROP_SOL} SOL devnet airdrop…`);
  try {
    const signature = await connection.requestAirdrop(
      keypair.publicKey,
      AIRDROP_SOL * LAMPORTS_PER_SOL
    );
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature, ...latest }, "confirmed");
    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`   ✓ Funded. Balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);
  } catch (error) {
    console.log(
      `   ⚠ Airdrop failed (devnet faucets are often rate-limited): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    console.log(
      `   You can fund it later at https://faucet.solana.com (paste the public key above),\n` +
        `   or re-run this script. The key below is still valid.\n`
    );
  }

  console.log("─".repeat(72));
  console.log("Add these to your .env.local (do NOT commit):\n");
  console.log(`SOLANA_CLUSTER="${CLUSTER}"`);
  console.log(`SOLANA_TREASURY_SECRET='${JSON.stringify(secretArray)}'`);
  console.log("─".repeat(72));
  console.log(
    "\nTip: the value is wrapped in single quotes so the JSON array pastes cleanly.\n" +
      "After editing .env.local, restart the dev server to load it."
  );
}

main().catch((error) => {
  console.error("Failed to generate keypair:", error);
  process.exit(1);
});
