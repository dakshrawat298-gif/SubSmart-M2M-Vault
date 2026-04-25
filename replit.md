# SubSmart Agentic Vault

## Overview
An autonomous M2M (Machine-to-Machine) financial agent built for the **Tether Frontier Hackathon**. Two AI agents (Buyer and Seller) powered by the Tether QVAC SDK negotiate a Smart Contract Audit price autonomously via local LLM inference. Once a `DEAL AGREED` signal is detected, the transaction is executed on the Solana network using Tether's Wallet Development Kit (WDK), sending USDC SPL-Token to the seller's wallet with zero human involvement.

## Tech Stack
- **Runtime**: Node.js 20+ (ES Modules)
- **Server**: Express + WebSocket (`ws`) streaming live events to the browser
- **AI Engine**: Tether QVAC SDK (`@qvac/sdk`) — local LLM inference (mock with one-line swap-in)
- **Wallet/Custody**: Tether WDK (`@tetherto/wdk-node`) — self-custodial machine wallets (mock with one-line swap-in)
- **Network**: Solana Devnet
- **Token**: USDC SPL-Token (`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`, 6 decimals)
- **UI**: Glassmorphic dark-mode dashboard with real-time WebSocket event stream and canvas-confetti on payment success

## Project Structure
```
subsmart-agentic-vault/
├── index.js                  # Express + WebSocket server (port 5000)
├── src/
│   ├── agent-buyer.js        # Buyer AI agent (QVAC mock + swap-in)
│   ├── agent-seller.js       # Seller AI agent (QVAC mock + swap-in)
│   ├── negotiator.js         # Negotiation loop — detects DEAL AGREED signal
│   └── wdk-executor.js       # Tether WDK Solana USDC payment executor
├── public/
│   ├── index.html            # Glassmorphic live dashboard
│   └── favicon.svg
├── .env                      # Local secrets (git-ignored)
├── .env.example              # Safe placeholder template
├── README.md                 # Hackathon-grade project documentation
└── package.json
```

## Environment Variables
See `.env.example` for the full annotated list. Key variables:
- `BUYER_BUDGET` — Buyer's max budget in USDC (default: 100)
- `BUYER_TARGET_PRICE` — Buyer's target price (default: 60)
- `SELLER_ASKING_PRICE` — Seller's opening ask (default: 100)
- `SELLER_MINIMUM_PRICE` — Seller's absolute floor (default: 80)
- `SELLER_WALLET_ADDRESS` — Devnet wallet that receives USDC on deal
- `BUYER_PRIVATE_KEY` — Devnet private key for WDK to sign transactions
- `QVAC_MODEL_PATH` — Optional: path to GGUF model for real QVAC inference

## Development Phases
- **Phase 1** ✅ — Project scaffold, file structure, dependency setup
- **Phase 2** ✅ — AI negotiation logic with QVAC SDK architecture (mock + real swap-in)
- **Phase 3** ✅ — Tether WDK integration, Solana USDC SPL-Token transaction executor
- **Phase 4** ✅ — Real-time glassmorphic web dashboard with WebSocket streaming
- **Phase 5** ✅ — Confetti on payment success, replay/reset button, run counter badge
- **Phase 6** ✅ — .env.example, deployment config, hackathon README, submission-ready

## QVAC SDK Swap-In (one line)
```js
// In agent-buyer.js and agent-seller.js, replace mock with:
import { LLM } from "@qvac/sdk";
const llm = await LLM.load({ model: process.env.QVAC_MODEL_PATH });
// Inside respond(): replace this._mockGenerate() with:
let reply = "";
for await (const token of llm.stream(fullPrompt)) { reply += token; }
return reply.trim();
```

## WDK Swap-In (one line)
```js
// In src/wdk-executor.js, replace MockWDK with:
import { WDK } from "@tetherto/wdk-node";
```

## Scripts
- `node index.js` — Start the server (port 5000)
- `npm start` — Alias for above

## WebSocket Event Stream
| Event | Description |
|---|---|
| `init` | Negotiation started — budgets broadcast |
| `round` | New round begins |
| `buyer` / `seller` | Agent message |
| `deal` | DEAL AGREED detected |
| `payment_init` → `payment_success` | WDK execution steps |
| `no_deal` | Max rounds reached |
| `done` | Run complete, replay enabled |
