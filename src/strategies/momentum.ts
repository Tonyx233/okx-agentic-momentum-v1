import type { Strategy, MarketSnapshot, Action, StrategyContext } from './types.js';

export const momentumStrategy: Strategy = {
  name: 'momentum-v1',

  async decide(s: MarketSnapshot, ctx: StrategyContext): Promise<Action> {
    if (s.liquidity < ctx.minLiquidityUsd) {
      return { type: 'HOLD', reason: `liquidity $${s.liquidity.toFixed(0)} < min` };
    }

    const position = ctx.positions[s.mint];

    if (!position) {
      if (s.priceChange24hPct >= 15 && s.volume24hUsd >= s.liquidity * 0.5) {
        return {
          type: 'BUY',
          mint: s.mint,
          symbol: s.symbol,
          amountUsd: ctx.maxPositionUsd,
          reason: `+${s.priceChange24hPct.toFixed(1)}% 24h, vol/liq=${(s.volume24hUsd / s.liquidity).toFixed(2)}`,
        };
      }
      return { type: 'HOLD', reason: 'no entry signal' };
    }

    const pnlPct = ((s.price - position.entryPrice) / position.entryPrice) * 100;
    if (pnlPct <= -10) {
      return {
        type: 'SELL',
        mint: s.mint,
        symbol: s.symbol,
        fraction: 1,
        reason: `stop-loss ${pnlPct.toFixed(1)}%`,
      };
    }
    if (pnlPct >= 30) {
      return {
        type: 'SELL',
        mint: s.mint,
        symbol: s.symbol,
        fraction: 0.5,
        reason: `take-profit ${pnlPct.toFixed(1)}%`,
      };
    }
    return { type: 'HOLD', reason: `holding, PnL ${pnlPct.toFixed(1)}%` };
  },
};
