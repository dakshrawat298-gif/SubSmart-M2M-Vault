import "dotenv/config";

// ─────────────────────────────────────────────────────────────────────────────
// QVAC SDK Integration
//
// When @qvac/sdk is installed and a local model is available, replace the mock
// below with the real SDK initialisation:
//
//   import { LLM } from "@qvac/sdk";
//   const llm = await LLM.load({ model: process.env.QVAC_MODEL_PATH });
//
// The `generate(prompt)` interface is identical — no other code changes needed.
// ─────────────────────────────────────────────────────────────────────────────

const SELLER_MINIMUM_PRICE = Number(process.env.SELLER_MINIMUM_PRICE) || 80;
const SELLER_ASKING_PRICE = Number(process.env.SELLER_ASKING_PRICE) || 100;

const SYSTEM_PROMPT =
  "You are an autonomous AI seller offering a Smart Contract Audit. Your goal " +
  "is to maximize profit. Your absolute minimum is 80 USDC. Reply only with " +
  "your counter-argument and your asking amount.";

// ── Mock LLM: mimics QVAC SDK streaming output ───────────────────────────────
// Simulates a seller that opens high and reluctantly moves down to minimum.
// Replace this function body with the real QVAC SDK call when available.

const sellerResponses = [
  "A thorough Smart Contract Audit involves static analysis, manual review, and a full report. My price is 100 USDC.",
  "I cannot go below 95 USDC — this covers two senior engineers and tool licensing. 95 USDC is my revised offer.",
  "Given your seriousness, I'll come down to 90 USDC. That is already a significant concession.",
  "My absolute floor is 85 USDC. Below that I'm operating at a loss. 85 USDC — final offer.",
  "DEAL AGREED at 85 USDC. Generating invoice and audit scope.",
];

let sellerTurn = 0;

async function mockGenerate(prompt) {
  // Simulates token streaming latency from a local LLM
  await new Promise((r) => setTimeout(r, 400));
  const response = sellerResponses[Math.min(sellerTurn, sellerResponses.length - 1)];
  sellerTurn++;
  return response;
}

// ─────────────────────────────────────────────────────────────────────────────

export class SellerAgent {
  constructor() {
    this.name = "Seller Agent";
    this.minimumPrice = SELLER_MINIMUM_PRICE;
    this.askingPrice = SELLER_ASKING_PRICE;
    this.systemPrompt = SYSTEM_PROMPT;
    this.history = [];
  }

  /**
   * Generate a negotiation response given the buyer's latest message.
   * @param {string} buyerMessage - The buyer's most recent offer.
   * @returns {Promise<string>} The seller's reply.
   *
   * ── QVAC SDK swap-in ────────────────────────────────────────────────────────
   * Replace `mockGenerate(fullPrompt)` with the real streaming call, e.g.:
   *
   *   let reply = "";
   *   for await (const token of llm.stream(fullPrompt)) {
   *     process.stdout.write(token);
   *     reply += token;
   *   }
   *   return reply.trim();
   * ───────────────────────────────────────────────────────────────────────────
   */
  async respond(buyerMessage) {
    const fullPrompt = [
      `[SYSTEM]: ${this.systemPrompt}`,
      ...this.history,
      buyerMessage ? `[BUYER]: ${buyerMessage}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const reply = await mockGenerate(fullPrompt);

    this.history.push(`[BUYER]: ${buyerMessage}`);
    this.history.push(`[SELLER]: ${reply}`);

    return reply;
  }
}
