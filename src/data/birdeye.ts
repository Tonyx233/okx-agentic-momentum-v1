import axios from 'axios';

const BASE = 'https://public-api.birdeye.so';
const KEY = process.env.BIRDEYE_API_KEY ?? '';

const client = axios.create({
  baseURL: BASE,
  headers: KEY
    ? { 'X-API-KEY': KEY, 'x-chain': 'solana', Accept: 'application/json' }
    : { 'x-chain': 'solana', Accept: 'application/json' },
});

export interface TokenOverview {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24hPercent: number;
  liquidity: number;
  v24hUSD: number;
  mc: number;
}

interface TrendingTokenRaw {
  address: string;
  symbol: string;
  name?: string;
  price: number;
  price24hChangePercent: number;
  liquidity: number;
  volume24hUSD: number;
  marketcap: number;
}

export async function getTokenOverview(mint: string): Promise<TokenOverview | null> {
  try {
    const { data } = await client.get('/defi/token_overview', { params: { address: mint } });
    if (!data?.success) return null;
    return data.data as TokenOverview;
  } catch (err) {
    console.error('[birdeye] overview failed:', (err as Error).message);
    return null;
  }
}

export async function getTrendingTokens(limit = 20): Promise<TokenOverview[]> {
  try {
    const { data } = await client.get('/defi/token_trending', {
      params: { sort_by: 'rank', sort_type: 'asc', limit },
    });
    const raw: TrendingTokenRaw[] = data?.data?.tokens ?? [];
    return raw.map((t) => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name ?? t.symbol,
      price: t.price,
      priceChange24hPercent: t.price24hChangePercent,
      liquidity: t.liquidity,
      v24hUSD: t.volume24hUSD,
      mc: t.marketcap,
    }));
  } catch (err) {
    console.error('[birdeye] trending failed:', (err as Error).message);
    return [];
  }
}

export async function getOHLCV(opts: {
  mint: string;
  interval?: '1m' | '5m' | '15m' | '1H' | '4H' | '1D';
  fromUnix: number;
  toUnix: number;
}) {
  try {
    const { data } = await client.get('/defi/ohlcv', {
      params: {
        address: opts.mint,
        type: opts.interval ?? '15m',
        time_from: opts.fromUnix,
        time_to: opts.toUnix,
      },
    });
    return data?.data?.items ?? [];
  } catch (err) {
    console.error('[birdeye] ohlcv failed:', (err as Error).message);
    return [];
  }
}
