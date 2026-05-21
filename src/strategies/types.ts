export interface MarketSnapshot {
  mint: string;
  symbol: string;
  price: number;
  liquidity: number;
  volume24hUsd: number;
  priceChange24hPct: number;
  marketCap: number;
  timestamp: number;
}

export type Action =
  | { type: 'HOLD'; reason: string }
  | { type: 'BUY'; mint: string; symbol: string; amountUsd: number; reason: string }
  | { type: 'SELL'; mint: string; symbol: string; fraction: number; reason: string };

export interface Strategy {
  name: string;
  decide(snapshot: MarketSnapshot, context: StrategyContext): Promise<Action>;
}

export interface StrategyContext {
  maxPositionUsd: number;
  minLiquidityUsd: number;
  positions: Record<string, { amountUsd: number; entryPrice: number }>;
  dryRun: boolean;
}
