import { BuyerAgent } from "./agent-buyer.js";
import { SellerAgent } from "./agent-seller.js";
import { executePayment } from "./wdk-executor.js";

const MAX_ROUNDS = 5;
const DEAL_SIGNAL = "DEAL AGREED";

function extractAmount(message) {
  const match =
    message.match(/(\d+(?:\.\d+)?)\s*USDC/i) ||
    message.match(/(?:at|:|-|for)\s+(\d+(?:\.\d+)?)/i) ||
    message.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const amount = parseFloat(match[1]);
    return isNaN(amount) ? null : amount;
  }
  return null;
}

export async function runNegotiation(broadcast) {
  const buyer = new BuyerAgent();
  const seller = new SellerAgent();

  broadcast({
    type: "init",
    budget: buyer.budget,
    minimum: seller.minimumPrice,
    maxRounds: MAX_ROUNDS,
  });

  let lastBuyerMessage = "";
  let lastSellerMessage = "";

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    broadcast({ type: "round", round, maxRounds: MAX_ROUNDS });

    // ── Buyer speaks ──────────────────────────────────────────────────────────
    const buyerReply = await buyer.respond(lastSellerMessage);
    broadcast({ type: "buyer", message: buyerReply, round });

    if (buyerReply.includes(DEAL_SIGNAL)) {
      const amount = extractAmount(buyerReply);
      broadcast({ type: "deal", agreedBy: "Buyer Agent", message: buyerReply, amount });
      await executePayment(amount, process.env.SELLER_WALLET_ADDRESS, broadcast);
      return;
    }

    lastBuyerMessage = buyerReply;

    // ── Seller speaks ─────────────────────────────────────────────────────────
    const sellerReply = await seller.respond(lastBuyerMessage);
    broadcast({ type: "seller", message: sellerReply, round });

    if (sellerReply.includes(DEAL_SIGNAL)) {
      const amount = extractAmount(sellerReply);
      broadcast({ type: "deal", agreedBy: "Seller Agent", message: sellerReply, amount });
      await executePayment(amount, process.env.SELLER_WALLET_ADDRESS, broadcast);
      return;
    }

    lastSellerMessage = sellerReply;
  }

  broadcast({ type: "no_deal" });
}
