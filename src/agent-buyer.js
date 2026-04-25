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

const BUYER_BUDGET = Number(process.env.BUYER_BUDGET) || 100;
const BUYER_TARGET_PRICE = Number(process.env.BUYER_TARGET_PRICE) || 60;

const SYSTEM_PROMPT =
  "You are an autonomous AI buyer. Your goal is to negotiate the price of a " +
  "Smart Contract Audit DOWN. Your max budget is 100 USDC. Start low. " +
  "Reply only with your argument and your current offer amount.";

// ── Mock LLM: mimics QVAC SDK streaming output ───────────────────────────────
// Simulates a buyer that starts at 60 USDC and inches toward its budget cap.
// Replace this function body with the real QVAC SDK call when available.

const buyerResponses = [
  "A standard audit is straightforward work. I'll offer 60 USDC — that's fair market value for this scope.",
  "I understand you have overhead, but 60 USDC is my opening offer. I can stretch to 70 USDC given the complexity.",
  "I appreciate your position. Final push — 78 USDC is as high as I can go without exceeding my authorised limit.",
  "This is my ceiling. 85 USDC, and I need this wrapped today. Take it or leave it.",
  "DEAL AGREED at 85 USDC. Initiating payment.",
];

let buyerTurn = 0;

async function mockGenerate(prompt) {
  // Simulates token streaming latency from a local LLM
  await new Promise((r) => setTimeout(r, 400));
  const response = buyerResponses[Math.min(buyerTurn, buyerResponses.length - 1)];
  buyerTurn++;
  return response;
}

// ─────────────────────────────────────────────────────────────────────────────

export class BuyerAgent {
  constructor() {
    this.name = "Buyer Agent";
    this.budget = BUYER_BUDGET;
    this.targetPrice = BUYER_TARGET_PRICE;
    this.systemPrompt = SYSTEM_PROMPT;
    this.history = [];
  }

  /**
   * Generate a negotiation response given the seller's latest message.
   * @param {string} sellerMessage - The seller's most recent counter-offer.
   * @returns {Promise<string>} The buyer's reply.
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
  async respond(sellerMessage) {
    const fullPrompt = [
      `[SYSTEM]: ${this.systemPrompt}`,
      ...this.history,
      sellerMessage ? `[SELLER]: ${sellerMessage}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const reply = await mockGenerate(fullPrompt);

    this.history.push(`[SELLER]: ${sellerMessage}`);
    this.history.push(`[BUYER]: ${reply}`);

    return reply;
  }
}
