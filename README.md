<div align="center">

<br />

```
  ███████╗██╗   ██╗██████╗ ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗
  ██╔════╝██║   ██║██╔══██╗██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝
  ███████╗██║   ██║██████╔╝███████╗██╔████╔██║███████║██████╔╝   ██║   
  ╚════██║██║   ██║██╔══██╗╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   
  ███████║╚██████╔╝██████╔╝███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   
  ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝  
```

# SubSmart Agentic Vault

### *Machines don't negotiate. Ours do.*

**The world's first autonomous M2M negotiation engine powered by Tether QVAC + WDK on Solana.**  
Two AI agents — zero human involvement — from opening bid to on-chain USDC settlement.

<br />

[![Built for Tether Frontier Hackathon](https://img.shields.io/badge/Tether_Frontier-Hackathon_2025-00b67a?style=for-the-badge&logo=tether&logoColor=white)](https://tether.io)
[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![QVAC + WDK](https://img.shields.io/badge/Tether-QVAC_+_WDK-26a17b?style=for-the-badge)](https://tether.io)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

</div>

---

## The Problem: Human Wallets Are a Bottleneck in the Machine Economy

The global digital economy is accelerating toward full autonomy — IoT devices provisioning each other, AI agents licensing APIs, microservices paying for compute in real time. But every single payment in today's stack still requires a human to sign a transaction, approve a smart contract, or manage a wallet.

This is not a software problem. It's an architectural one.

**Human-managed wallets create four fundamental failure modes at machine scale:**

| Failure Mode | Real-World Impact |
|---|---|
| **Latency** | Human approval loops introduce seconds-to-hours of delay in markets that move in milliseconds |
| **Availability** | Wallets go offline when humans sleep; machines don't |
| **Scalability** | One human cannot approve millions of micro-transactions per second |
| **Trust Surface** | Private keys in human custody are the #1 attack vector in crypto |

The autonomous M2M economy is not coming — it is here. The infrastructure to support it is not.

**SubSmart Agentic Vault is that infrastructure.**

---

## The Solution: Autonomous Machine-to-Machine Negotiation and Settlement

SubSmart deploys two independent AI agents that negotiate a service price from first principles and settle the agreed amount on-chain — with **zero human involvement at any step**.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SubSmart Agentic Vault                       │
│                                                                 │
│   ┌──────────────┐    QVAC P2P LLM     ┌──────────────────┐   │
│   │  Buyer Agent │◄──────────────────► │   Seller Agent   │   │
│   │  (QVAC SDK)  │   natural language  │   (QVAC SDK)     │   │
│   └──────┬───────┘     negotiation     └────────┬─────────┘   │
│          │                                       │             │
│          │         DEAL AGREED signal            │             │
│          └──────────────┬────────────────────────┘             │
│                         │                                       │
│                  ┌──────▼──────┐                               │
│                  │ WDK Executor │                               │
│                  │ Self-Custody │                               │
│                  │   Machine    │                               │
│                  │   Wallet     │                               │
│                  └──────┬──────┘                               │
│                         │  SPL-Token USDC Transfer              │
│                         ▼                                       │
│                  ┌─────────────┐                               │
│                  │   Solana    │                               │
│                  │   Devnet    │                               │
│                  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Technology Stack

### Tether QVAC — Local P2P Intelligence

[QVAC](https://qvac.tether.io) is Tether's privacy-first, local LLM execution framework. Unlike cloud-based AI, QVAC runs entirely on-device with **no data leaving the machine** — making it the only credible intelligence layer for autonomous financial agents.

In SubSmart, each agent runs its own QVAC-powered LLM instance:

```javascript
// Real QVAC SDK integration (swap-in ready)
import { LLM } from "@qvac/sdk";
const llm = await LLM.load({ model: process.env.QVAC_MODEL_PATH });

// Streaming token generation — identical interface to mock
for await (const token of llm.stream(prompt)) {
  reply += token;
}
```

- **Buyer Agent** — negotiates the price of a Smart Contract Audit DOWN from the seller's ask
- **Seller Agent** — defends its margin, counters offers, and settles when the floor is met
- Both agents maintain conversation history, reason about constraints, and emit a `DEAL AGREED` signal when consensus is reached

### Tether WDK — Self-Custodial Machine Wallets

[WDK](https://wdk.tether.io) is Tether's Web Dev Kit for programmatic, self-custodial wallet management. It is the only framework purpose-built for machines to hold, manage, and transfer value without human key custody.

In SubSmart, WDK executes the USDC SPL-Token transfer the moment a deal is detected:

```javascript
// Real WDK integration (swap-in ready)
import { WDK } from "@tetherto/wdk-node";

const wdk  = new WDK({ network: "devnet" });
const wallet = await wdk.loadWallet(process.env.BUYER_PRIVATE_KEY);

const tx = await wallet.transfer({
  token: "USDC",
  mint:  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  to:    sellerAddress,
  amount: agreedAmount * 1_000_000,    // 6 decimal places
});

await tx.signAndSend();
```

**Why this matters:** WDK turns a Solana keypair into an autonomous treasury. No Phantom. No MetaMask. No human.

### Solana — The Settlement Layer

Solana's 400ms block time and sub-$0.001 transaction fees make it the only L1 viable for real-time M2M micro-payments. SubSmart uses:

- **Network:** Solana Devnet
- **Token:** USDC SPL-Token (`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`)
- **Decimals:** 6 (USDC standard)
- **Explorer:** [Solana Explorer — Devnet](https://explorer.solana.com/?cluster=devnet)

---

## How to Run

### Prerequisites

- [Node.js](https://nodejs.org) v20 or higher
- `npm` or `pnpm`

### 1. Clone the repository

```bash
git clone https://github.com/your-org/subsmart-agentic-vault.git
cd subsmart-agentic-vault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Agent economics
BUYER_BUDGET=100
BUYER_TARGET_PRICE=60
SELLER_MINIMUM_PRICE=80
SELLER_ASKING_PRICE=100

# Solana wallet (for WDK — use a Devnet keypair only)
SELLER_WALLET_ADDRESS=<your_devnet_wallet_address>
BUYER_PRIVATE_KEY=<your_devnet_private_key_base58>

# QVAC (optional — mock is used if not set)
QVAC_MODEL_PATH=./models/llama-3.1-8b.gguf
```

### 4. Start the application

```bash
node index.js
```

Open your browser at `http://localhost:5000` and press **Start Negotiation**.

---

## Enabling Real Tether QVAC + WDK

The codebase is architected for a **one-line swap** from mock to production SDK.

### Swap in QVAC (both agents)

In `src/agent-buyer.js` and `src/agent-seller.js`, replace the mock with:

```javascript
import { LLM } from "@qvac/sdk";
const llm = await LLM.load({ model: process.env.QVAC_MODEL_PATH });
```

Then in the `respond()` method, replace `this._mockGenerate()` with:

```javascript
let reply = "";
for await (const token of llm.stream(fullPrompt)) {
  reply += token;
}
return reply.trim();
```

### Swap in WDK (executor)

In `src/wdk-executor.js`, replace `MockWDK` with:

```javascript
import { WDK } from "@tetherto/wdk-node";
```

No other changes required. The payload structure, broadcast events, and UI are all production-ready.

---

## Project Architecture

```
subsmart-agentic-vault/
├── index.js                  # Express server + WebSocket hub
├── src/
│   ├── agent-buyer.js        # Buyer AI agent (QVAC SDK / mock)
│   ├── agent-seller.js       # Seller AI agent (QVAC SDK / mock)
│   ├── negotiator.js         # Negotiation loop — detects DEAL AGREED
│   └── wdk-executor.js       # WDK Solana USDC payment executor
├── public/
│   ├── index.html            # Glassmorphic live dashboard
│   └── favicon.svg
├── .env                      # Environment configuration
└── package.json
```

### Real-Time Event Stream

All negotiation events are streamed over WebSocket from server → browser in real time:

| Event | Trigger |
|---|---|
| `init` | Negotiation started — broadcasts budgets |
| `round` | New negotiation round begins |
| `buyer` / `seller` | Agent message streamed |
| `deal` | DEAL AGREED signal detected |
| `payment_init` | WDK wallet loaded |
| `payment_payload` | SPL-Token TX constructed |
| `payment_broadcast` | Transaction signed and broadcast |
| `payment_success` | Block confirmed — TX hash returned |
| `no_deal` | Max rounds reached, no consensus |

---

## Live Demo

The dashboard renders the full negotiation in real time — every agent message, every WDK execution step, and the final on-chain transaction hash — with confetti on settlement.

**Run it as many times as you like.** The `↺ Run Again` button resets the entire state cleanly between demos, with a persistent run counter so judges can see the system is stateless by design.

---

## Why SubSmart Wins the M2M Economy

| Traditional Payment Flow | SubSmart Agentic Vault |
|---|---|
| Human opens wallet app | Machine wallet auto-loads via WDK |
| Human reads invoice | Buyer AI negotiates price down autonomously |
| Human approves amount | Deal signal triggers payment without approval |
| Human signs transaction | WDK signs and broadcasts to Solana |
| Human checks confirmation | UI streams TX hash + explorer link live |
| **~minutes to hours** | **~seconds, end-to-end** |

---

## Built With Tether's Vision

Tether's QVAC and WDK are not coincidental tools in this stack — they are the entire thesis:

- **QVAC** enables private, local intelligence at the edge. Machines reason without calling home.
- **WDK** enables self-custodial machine wallets. Machines hold and transfer value without humans.
- **Together**, they create the primitive stack for the autonomous M2M financial internet.

SubSmart is a proof-of-concept that this stack is **production-ready today**.

---

<div align="center">

*Built for the Tether Frontier Hackathon · Solana Devnet · USDC SPL-Token*

**The machines are ready to trade. Are you?**

</div>
