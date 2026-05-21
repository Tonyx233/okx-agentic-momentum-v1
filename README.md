# Solana Trading Agent

AI-driven on-chain trading agent on Solana. Combines OKX OnchainOS, Helius gRPC, Birdeye analytics, Jupiter routing, and Claude as the decision layer.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Strategy Layer                         │
│  src/strategies/  ←  Claude reasoning + rule-based logic │
└──────────────────────────────────────────────────────────┘
                    │
┌─────────────────┬─┴─────────────────┬─────────────────┐
│   Data Layer    │   Execution       │  Notification   │
│  src/data/      │  okx-dex-swap +   │  src/utils/     │
│  Helius/Birdeye │  Jupiter          │  Telegram       │
└─────────────────┴───────────────────┴─────────────────┘
```

## Setup

1. Copy `.env.example` → `.env` and fill API keys
2. `npm install`
3. `npm run notify:test` — verify Telegram bot
4. `npm run scan` — scan tokens via Birdeye
5. `npm run dev` — run the agent live

## API Keys needed

| Service | Where | Free tier |
|---------|-------|-----------|
| Helius | https://www.helius.dev | Yes (1M credits/day) |
| Birdeye | https://birdeye.so/developers | Yes (rate-limited) |
| Anthropic | https://console.anthropic.com | Paid |
| Telegram Bot | Create your own via [@BotFather](https://t.me/BotFather) | Free |

## Trading wallet

Sign in to your **OKX Agentic Wallet** via `onchainos wallet login` and the agent will pick up the active session. Set `SOLANA_PUBLIC_KEY` in `.env` to your wallet address (used for balance display and logging only — signing happens through the OnchainOS CLI).

Built for the **OKX Agentic Wallet Trading Contest** (2026-05-07 ~ 2026-05-21).

## Folder structure

- `src/data/` — on-chain data fetchers (Helius, Birdeye, Jupiter)
- `src/strategies/` — strategy implementations (extend `Strategy` interface)
- `src/utils/` — notify, logger, signer helpers
- `src/scripts/` — one-off CLI scripts (scan, backtest)
- `src/index.ts` — main runtime loop
