import axios from 'axios';

const BASE = process.env.JUPITER_API_BASE || 'https://lite-api.jup.ag';

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: unknown[];
}

export async function getQuote(opts: {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}): Promise<JupiterQuote> {
  const { data } = await axios.get(`${BASE}/swap/v1/quote`, {
    params: {
      inputMint: opts.inputMint,
      outputMint: opts.outputMint,
      amount: opts.amount,
      slippageBps: opts.slippageBps ?? 100,
    },
  });
  return data;
}

export async function getPrice(mint: string): Promise<number | null> {
  try {
    const { data } = await axios.get(`${BASE}/price/v2`, {
      params: { ids: mint },
    });
    return Number(data?.data?.[mint]?.price ?? 0) || null;
  } catch {
    return null;
  }
}

export const MINT = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
} as const;
