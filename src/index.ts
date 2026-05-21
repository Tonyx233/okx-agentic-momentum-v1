import 'dotenv/config';
import { getTrendingTokens } from './data/birdeye.js';
import { momentumStrategy } from './strategies/momentum.js';
import type { MarketSnapshot, StrategyContext } from './strategies/types.js';
import { notify, notifyTrade } from './utils/notify.js';

const ctx: StrategyContext = {
  maxPositionUsd: Number(process.env.MAX_POSITION_USD ?? 50),
  minLiquidityUsd: Number(process.env.MIN_LIQUIDITY_USD ?? 50000),
  positions: {},
  dryRun: (process.env.DRY_RUN ?? 'true').toLowerCase() === 'true',
};

async function tick() {
  const tokens = await getTrendingTokens(15);
  if (tokens.length === 0) {
    console.log('[tick] no tokens from birdeye — check BIRDEYE_API_KEY');
    return;
  }

  for (const t of tokens) {
    const snap: MarketSnapshot = {
      mint: t.address,
      symbol: t.symbol,
      price: t.price,
      liquidity: t.liquidity,
      volume24hUsd: t.v24hUSD,
      priceChange24hPct: t.priceChange24hPercent,
      marketCap: t.mc,
      timestamp: Date.now(),
    };

    const action = await momentumStrategy.decide(snap, ctx);
    if (action.type === 'HOLD') continue;

    console.log(`[${snap.symbol}] ${action.type}: ${action.reason}`);

    if (action.type === 'BUY') {
      if (ctx.dryRun) {
        await notify(
          `[DRY] BUY ${snap.symbol} $${action.amountUsd} — ${action.reason}`,
          'trade',
        );
      } else {
        await notifyTrade({
          action: 'BUY',
          symbol: snap.symbol,
          amountUsd: action.amountUsd,
          price: snap.price,
          reason: action.reason,
        });
        // TODO: hand off to okx-dex-swap / Jupiter executor
      }
      ctx.positions[snap.mint] = { amountUsd: action.amountUsd, entryPrice: snap.price };
    }

    if (action.type === 'SELL') {
      const pos = ctx.positions[snap.mint];
      if (!pos) continue;
      const sellUsd = pos.amountUsd * action.fraction;
      if (ctx.dryRun) {
        await notify(
          `[DRY] SELL ${snap.symbol} $${sellUsd.toFixed(2)} — ${action.reason}`,
          'trade',
        );
      } else {
        await notifyTrade({
          action: 'SELL',
          symbol: snap.symbol,
          amountUsd: sellUsd,
          price: snap.price,
          reason: action.reason,
        });
      }
      if (action.fraction >= 1) delete ctx.positions[snap.mint];
      else pos.amountUsd -= sellUsd;
    }
  }
}

async function main() {
  await notify(
    `🐻 Trading agent started (${ctx.dryRun ? 'DRY-RUN' : 'LIVE'}) — strategy: ${momentumStrategy.name}`,
    'info',
  );
  while (true) {
    try {
      await tick();
    } catch (err) {
      console.error('[tick] error:', err);
      await notify(`tick failed: ${(err as Error).message}`, 'error');
    }
    await new Promise((r) => setTimeout(r, 60_000));
  }
}

main();
