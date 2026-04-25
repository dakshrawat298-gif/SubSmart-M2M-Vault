import "dotenv/config";
import { BuyerAgent } from "./src/agent-buyer.js";
import { SellerAgent } from "./src/agent-seller.js";

const MAX_ROUNDS = 5;
const DEAL_SIGNAL = "DEAL AGREED";

// ── Visual helpers ────────────────────────────────────────────────────────────

function printHeader() {
  console.log("");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║       SubSmart M2M Negotiator — Phase 2              ║");
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

function printDeal(agreedBy, message) {
  console.log("");
  console.log("══════════════════════════════════════════════════════");
  console.log(`  ✅ DEAL REACHED — triggered by ${agreedBy}`);
  console.log(`  "${message}"`);
  console.log("══════════════════════════════════════════════════════");
  console.log("");
  console.log("  ➡  Phase 3: Tether WDK will now execute the");
  console.log("     on-chain payment on Solana. (Coming next.)");
  console.log("");
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
      printDeal(buyer.name, buyerReply);
      return { agreed: true, agreedBy: buyer.name, message: buyerReply };
    }

    lastBuyerMessage = buyerReply;

    // ── Seller speaks ─────────────────────────────────────────────────────────
    const sellerReply = await seller.respond(lastBuyerMessage);
    printSpeaker(seller.name, sellerReply);

    if (sellerReply.includes(DEAL_SIGNAL)) {
      printDeal(seller.name, sellerReply);
      return { agreed: true, agreedBy: seller.name, message: sellerReply };
    }

    lastSellerMessage = sellerReply;
  }

  // ── No deal within MAX_ROUNDS ─────────────────────────────────────────────
  printNoDeal();
  return { agreed: false };
}

// ── Entry point ───────────────────────────────────────────────────────────────

startNegotiation().catch((err) => {
  console.error("Fatal error during negotiation:", err);
  process.exit(1);
});
