import "dotenv/config";
import { BuyerAgent } from "./src/agent-buyer.js";
import { SellerAgent } from "./src/agent-seller.js";
import { executePayment } from "./src/wdk-executor.js";

const MAX_ROUNDS = 5;
const DEAL_SIGNAL = "DEAL AGREED";

// ── Visual helpers ────────────────────────────────────────────────────────────

function printHeader() {
  console.log("");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║       SubSmart M2M Negotiator — Phase 3              ║");
  console.log("║       Tether Frontier Hackathon                      ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("");
}

function printRound(round) {
  console.log(`─── Round ${round} of ${MAX_ROUNDS} ${"─".repeat(43)}`);
}

function printSpeaker(name, message) {
  const label = name === "Buyer Agent" ? "🟦 BUYER " : "🟧 SELLER";
  console.log(`\n${label}: ${message}\n`);
}

function printDealBanner(agreedBy, message) {
  console.log("");
  console.log("══════════════════════════════════════════════════════");
  console.log(`  ✅ DEAL REACHED — triggered by ${agreedBy}`);
  console.log(`  "${message}"`);
  console.log("══════════════════════════════════════════════════════");
  console.log("");
}

function printNoDeal() {
  console.log("");
  console.log("══════════════════════════════════════════════════════");
  console.log("  ❌ MAX ROUNDS REACHED — No deal was agreed.");
  console.log("  Negotiation ended without a transaction.");
  console.log("══════════════════════════════════════════════════════");
  console.log("");
}

// ── Amount extractor ──────────────────────────────────────────────────────────
// Matches the first integer or decimal number that appears after a currency
// keyword or adjacent to "USDC" in the deal message.
// Examples matched:
//   "DEAL AGREED at 85 USDC"     → 85
//   "DEAL AGREED — price: 92.5"  → 92.5
//   "DEAL AGREED 100USDC"        → 100

function extractAmount(message) {
  const match = message.match(/(\d+(?:\.\d+)?)\s*USDC/i)
    || message.match(/(?:at|:|-|for)\s+(\d+(?:\.\d+)?)/i)
    || message.match(/(\d+(?:\.\d+)?)/);

  if (match) {
    const amount = parseFloat(match[1]);
    return isNaN(amount) ? null : amount;
  }
  return null;
}

// ── Core negotiation loop ─────────────────────────────────────────────────────

async function startNegotiation() {
  printHeader();

  const buyer = new BuyerAgent();
  const seller = new SellerAgent();

  console.log(`  Buyer  budget : ${buyer.budget} USDC (max)`);
  console.log(`  Seller minimum: ${seller.minimumPrice} USDC (floor)`);
  console.log(`  Max rounds    : ${MAX_ROUNDS}`);
  console.log(`  Deal signal   : "${DEAL_SIGNAL}"\n`);

  let lastBuyerMessage = "";
  let lastSellerMessage = "";

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    printRound(round);

    // ── Buyer speaks ──────────────────────────────────────────────────────────
    const buyerReply = await buyer.respond(lastSellerMessage);
    printSpeaker(buyer.name, buyerReply);

    if (buyerReply.includes(DEAL_SIGNAL)) {
      printDealBanner(buyer.name, buyerReply);
      await settleDeal(buyerReply);
      return { agreed: true, agreedBy: buyer.name, message: buyerReply };
    }

    lastBuyerMessage = buyerReply;

    // ── Seller speaks ─────────────────────────────────────────────────────────
    const sellerReply = await seller.respond(lastBuyerMessage);
    printSpeaker(seller.name, sellerReply);

    if (sellerReply.includes(DEAL_SIGNAL)) {
      printDealBanner(seller.name, sellerReply);
      await settleDeal(sellerReply);
      return { agreed: true, agreedBy: seller.name, message: sellerReply };
    }

    lastSellerMessage = sellerReply;
  }

  // ── No deal within MAX_ROUNDS ─────────────────────────────────────────────
  printNoDeal();
  return { agreed: false };
}

// ── Settlement: extract amount → execute WDK payment ─────────────────────────

async function settleDeal(dealMessage) {
  const agreedAmount = extractAmount(dealMessage);

  if (!agreedAmount) {
    console.warn("  ⚠  Could not extract a numeric amount from the deal message.");
    console.warn("  ⚠  Skipping WDK payment execution.");
    return;
  }

  const receiverAddress =
    process.env.SELLER_WALLET_ADDRESS || "MockSellerWallet_3kLp...9xRt";

  await executePayment(agreedAmount, receiverAddress);
}

// ── Entry point ───────────────────────────────────────────────────────────────

startNegotiation().catch((err) => {
  console.error("Fatal error during negotiation:", err);
  process.exit(1);
});
