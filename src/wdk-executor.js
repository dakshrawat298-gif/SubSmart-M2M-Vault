import "dotenv/config";

// ─────────────────────────────────────────────────────────────────────────────
// Tether WDK (Wallet Development Kit) — Solana USDC Payment Executor
//
// Architecture reflects real WDK self-custodial wallet usage.
// `wallet.signAndSend()` is mocked to prevent deployment errors in dev.
//
// When the real WDK package is available, install it:
//   npm install @tetherto/wdk-node
//
// Then replace the MOCK ZONE below with the real import:
//   import { WDK } from "@tetherto/wdk-node";
//
// The rest of this file — wallet init, transaction payload, signAndSend call —
// mirrors real WDK usage and requires no further changes.
// ─────────────────────────────────────────────────────────────────────────────

// Solana Devnet USDC SPL Token mint address (official Circle/Devnet address)
const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// USDC uses 6 decimal places on Solana
const USDC_DECIMALS = 6;

// ── MOCK ZONE: Replace with real WDK import ───────────────────────────────────
// import { WDK } from "@tetherto/wdk-node";

class MockWDK {
  constructor(config) {
    this.network = config.network;
    this.apiKey = config.apiKey ? "***loaded***" : "no-key";
  }

  async createSelfCustodialWallet(seed) {
    return {
      address: process.env.BUYER_WALLET_ADDRESS || "MockBuyerWallet_7fGh...3kLp",
      publicKey: "MockPublicKey_9xRt...2mNq",
      _seed: seed,
    };
  }
}

class MockTransaction {
  constructor(payload) {
    this.payload = payload;
    this.hash = null;
  }

  async signAndSend(wallet) {
    // ── REAL WDK CALL (uncomment when live): ─────────────────────────────────
    // return await wallet.signAndSend(this.payload);
    // ─────────────────────────────────────────────────────────────────────────

    // Simulate network latency for signing + broadcast
    await new Promise((r) => setTimeout(r, 600));

    this.hash =
      "MockTxHash_" +
      Math.random().toString(36).substring(2, 12).toUpperCase() +
      "...devnet";

    return {
      success: true,
      transactionHash: this.hash,
      explorerUrl: `https://explorer.solana.com/tx/${this.hash}?cluster=devnet`,
      slot: Math.floor(Math.random() * 1_000_000) + 300_000_000,
    };
  }
}
// ── END MOCK ZONE ─────────────────────────────────────────────────────────────

/**
 * Build a Solana SPL-Token (USDC) transfer transaction payload.
 *
 * @param {string} senderAddress   - The buyer's wallet public key
 * @param {string} receiverAddress - The seller's wallet public key
 * @param {number} amountUsdc      - Human-readable USDC amount (e.g. 85)
 * @returns {object} Raw transaction payload passed to WDK
 */
function buildSplTokenPayload(senderAddress, receiverAddress, amountUsdc) {
  const rawAmount = amountUsdc * Math.pow(10, USDC_DECIMALS);

  return {
    type: "SPL_TOKEN_TRANSFER",
    network: process.env.SOLANA_NETWORK || "devnet",
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    token: {
      mint: USDC_MINT_DEVNET,
      decimals: USDC_DECIMALS,
      symbol: "USDC",
    },
    sender: senderAddress,
    receiver: receiverAddress,
    amount: {
      human: amountUsdc,
      raw: rawAmount,
    },
    memo: "SubSmart M2M Negotiator — Autonomous Payment",
    commitment: "confirmed",
  };
}

/**
 * Execute an autonomous USDC payment via Tether WDK on Solana Devnet.
 *
 * @param {number} amount          - Agreed USDC amount extracted from negotiation
 * @param {string} receiverAddress - Seller's wallet address
 * @returns {Promise<object>} Transaction result including hash and explorer URL
 */
export async function executePayment(amount, receiverAddress) {
  console.log("");
  console.log("══════════════════════════════════════════════════════");
  console.log("  🔐 [SubSmart Vault] Initializing Tether WDK...");
  console.log("══════════════════════════════════════════════════════");

  // ── Step 1: Initialize WDK ─────────────────────────────────────────────────
  const wdk = new MockWDK({
    network: process.env.SOLANA_NETWORK || "devnet",
    apiKey: process.env.WDK_API_KEY,
  });

  console.log(`  Network : Solana ${wdk.network.toUpperCase()}`);
  console.log(`  API Key : ${wdk.apiKey}`);

  // ── Step 2: Load self-custodial buyer wallet ───────────────────────────────
  console.log("");
  console.log("  🔑 Loading self-custodial buyer wallet...");

  const wallet = await wdk.createSelfCustodialWallet(
    process.env.BUYER_WALLET_SEED || "mock-seed-phrase-replace-with-real"
  );

  const senderAddress =
    process.env.BUYER_WALLET_ADDRESS || wallet.address;
  const targetAddress =
    receiverAddress || process.env.SELLER_WALLET_ADDRESS || "MockSellerWallet_3kLp...9xRt";

  console.log(`  Sender  : ${senderAddress}`);
  console.log(`  Receiver: ${targetAddress}`);

  // ── Step 3: Build SPL Token (USDC) transaction payload ────────────────────
  console.log("");
  console.log("  🏗  Building Solana SPL Token (USDC) transaction...");

  const payload = buildSplTokenPayload(senderAddress, targetAddress, amount);

  console.log(`  Token   : ${payload.token.symbol} (${payload.token.mint})`);
  console.log(`  Amount  : ${payload.amount.human} USDC (${payload.amount.raw} raw lamport-units)`);
  console.log(`  Memo    : ${payload.memo}`);

  // ── Step 4: Sign and broadcast via WDK ────────────────────────────────────
  console.log("");
  console.log("  📡 Signing and broadcasting transaction to Solana...");

  const tx = new MockTransaction(payload);
  const result = await tx.signAndSend(wallet);

  // ── Step 5: Final vault log ────────────────────────────────────────────────
  if (result.success) {
    console.log("");
    console.log("══════════════════════════════════════════════════════");
    console.log(
      `  ✅ [SubSmart Vault] WDK Transaction Executed on Solana: ${amount} USDC transferred autonomously.`
    );
    console.log(`  TX Hash  : ${result.transactionHash}`);
    console.log(`  Explorer : ${result.explorerUrl}`);
    console.log(`  Slot     : ${result.slot}`);
    console.log("══════════════════════════════════════════════════════");
    console.log("");
  } else {
    throw new Error("WDK signAndSend returned a failure response.");
  }

  return result;
}
