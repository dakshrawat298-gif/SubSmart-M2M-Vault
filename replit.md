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
- **Phase 2** ⏳ — QVAC SDK integration, AI negotiation logic
- **Phase 3** ⏳ — Tether WDK integration, Solana transaction execution

## Scripts
- `npm start` — Run the entry point
- `npm run dev` — Run with file watching
- `npm run negotiate` — Run the full negotiation flow (Phase 2+)
