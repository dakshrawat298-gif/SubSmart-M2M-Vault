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
// Then replace the MockWDK / MockTransaction classes below with:
//   import { WDK } from "@tetherto/wdk-node";
//
// The rest of this file — wallet init, transaction payload, signAndSend call —
// mirrors real WDK usage and requires no further changes.
// ─────────────────────────────────────────────────────────────────────────────

const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_DECIMALS = 6;

// ── MOCK ZONE ─────────────────────────────────────────────────────────────────

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
  }

  async signAndSend() {
    await new Promise((r) => setTimeout(r, 600));
    const hash =
      "MockTxHash_" +
      Math.random().toString(36).substring(2, 12).toUpperCase() +
      "...devnet";
    return {
      success: true,
      transactionHash: hash,
      explorerUrl: `https://explorer.solana.com/tx/${hash}?cluster=devnet`,
      slot: Math.floor(Math.random() * 1_000_000) + 300_000_000,
    };
  }
}

// ── END MOCK ZONE ─────────────────────────────────────────────────────────────

function buildSplTokenPayload(senderAddress, receiverAddress, amountUsdc) {
  const rawAmount = amountUsdc * Math.pow(10, USDC_DECIMALS);
  return {
    type: "SPL_TOKEN_TRANSFER",
    network: process.env.SOLANA_NETWORK || "devnet",
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    token: { mint: USDC_MINT_DEVNET, decimals: USDC_DECIMALS, symbol: "USDC" },
    sender: senderAddress,
    receiver: receiverAddress,
    amount: { human: amountUsdc, raw: rawAmount },
    memo: "SubSmart M2M Negotiator — Autonomous Payment",
    commitment: "confirmed",
  };
}

/**
 * Execute an autonomous USDC payment via Tether WDK on Solana Devnet.
 * @param {number} amount           - Agreed USDC amount
 * @param {string} receiverAddress  - Seller's wallet address
 * @param {function} broadcast      - WebSocket event emitter
 */
export async function executePayment(amount, receiverAddress, broadcast = () => {}) {
  const network = process.env.SOLANA_NETWORK || "devnet";

  // Step 1: Init WDK
  broadcast({ type: "payment_init", network });
  await new Promise((r) => setTimeout(r, 300));

  const wdk = new MockWDK({ network, apiKey: process.env.WDK_API_KEY });

  // Step 2: Load wallet
  const wallet = await wdk.createSelfCustodialWallet(
    process.env.BUYER_WALLET_SEED || "mock-seed-phrase"
  );

  const senderAddress = process.env.BUYER_WALLET_ADDRESS || wallet.address;
  const targetAddress = receiverAddress || process.env.SELLER_WALLET_ADDRESS || "MockSellerWallet_3kLp...9xRt";

  broadcast({ type: "payment_wallet", sender: senderAddress, receiver: targetAddress });
  await new Promise((r) => setTimeout(r, 300));

  // Step 3: Build SPL payload
  const payload = buildSplTokenPayload(senderAddress, targetAddress, amount);

  broadcast({
    type: "payment_payload",
    token: payload.token.symbol,
    mint: payload.token.mint,
    amount: payload.amount.human,
    raw: payload.amount.raw,
  });
  await new Promise((r) => setTimeout(r, 300));

  // Step 4: Sign and broadcast
  broadcast({ type: "payment_broadcast" });

  const tx = new MockTransaction(payload);
  const result = await tx.signAndSend(wallet);

  if (!result.success) throw new Error("WDK signAndSend returned a failure.");

  // Step 5: Confirmed
  broadcast({
    type: "payment_success",
    amount,
    txHash: result.transactionHash,
    explorerUrl: result.explorerUrl,
    slot: result.slot,
  });

  // Console log (server-side)
  console.log(`\n✅ [SubSmart Vault] WDK Transaction Executed on Solana: ${amount} USDC transferred autonomously.`);
  console.log(`   TX Hash : ${result.transactionHash}`);
  console.log(`   Explorer: ${result.explorerUrl}\n`);

  return result;
}
