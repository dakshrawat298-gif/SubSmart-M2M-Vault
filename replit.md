# SubSmart M2M Negotiator

## Overview
An autonomous AI financial agent built for the **Tether Frontier Hackathon**. Two AI agents (Buyer and Seller) powered by the Tether QVAC SDK negotiate a service price autonomously via local LLM inference. Once an agreement is reached, the transaction is executed on the Solana network using Tether's Wallet Development Kit (WDK).

## Tech Stack
- **Runtime**: Node.js (ES6 Modules)
- **AI Engine**: Tether QVAC SDK (`@qvac/sdk`) — local LLM inference
- **Wallet/Custody**: Tether WDK (Wallet Development Kit)
- **Network**: Solana Devnet / Polygon
- **Config**: `dotenv` for environment variables

## Project Structure
```
subsmart-m2m-negotiator/
├── index.js                  # Entry point
├── package.json              # ES6 module config
├── src/
│   ├── agent-buyer.js        # Buyer AI agent scaffold
│   └── agent-seller.js       # Seller AI agent scaffold
```

## Environment Variables
Stored securely via Replit Secrets:
- `WDK_API_KEY` — Tether WDK API key
- `QVAC_MODEL_PATH` — Path to local QVAC model
- `SOLANA_NETWORK` — Solana network (devnet/mainnet)
- `SOLANA_RPC_URL` — Solana RPC endpoint
- `BUYER_WALLET_ADDRESS` — Buyer agent wallet
- `SELLER_WALLET_ADDRESS` — Seller agent wallet
- `BUYER_BUDGET` — Max budget for buyer
- `BUYER_TARGET_PRICE` — Target price for buyer
- `SELLER_ASKING_PRICE` — Initial asking price
- `SELLER_MINIMUM_PRICE` — Minimum acceptable price

## Development Phases
- **Phase 1** ✅ — Project scaffold, file structure, dependency setup
- **Phase 2** ✅ — AI negotiation logic, QVAC SDK architecture (mock + real swap-in point)
- **Phase 3** ✅ — Tether WDK integration, Solana USDC SPL-Token transaction execution

## QVAC SDK Swap-In
The codebase is fully wired for real LLM inference. When `@qvac/sdk` is installed
and a model is available, replace the `mockGenerate()` functions in both agent files
with the commented-out streaming block:
```js
import { LLM } from "@qvac/sdk";
const llm = await LLM.load({ model: process.env.QVAC_MODEL_PATH });
// inside respond():
let reply = "";
for await (const token of llm.stream(fullPrompt)) {
  process.stdout.write(token);
  reply += token;
}
return reply.trim();
```

## Scripts
- `npm start` — Run the entry point
- `npm run dev` — Run with file watching
- `npm run negotiate` — Run the full negotiation flow (Phase 2+)
