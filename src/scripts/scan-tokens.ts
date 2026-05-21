import 'dotenv/config';
import { getTrendingTokens } from '../data/birdeye.js';

async function main() {
  const tokens = await getTrendingTokens(20);
  if (tokens.length === 0) {
    console.log('No tokens returned. Check BIRDEYE_API_KEY in .env');
    return;
  }
  console.log(
    `\n${'#'.padStart(3)} ${'Symbol'.padEnd(10)} ${'Price'.padStart(12)} ${'24h%'.padStart(9)} ${'Liquidity'.padStart(14)} ${'Volume24h'.padStart(14)}`,
  );
  console.log('-'.repeat(70));
  tokens.forEach((t, i) => {
    console.log(
      `${String(i + 1).padStart(3)} ${(t.symbol ?? '').slice(0, 10).padEnd(10)} ${
        `$${t.price?.toFixed(6) ?? '-'}`.padStart(12)
      } ${`${t.priceChange24hPercent?.toFixed(2) ?? '-'}%`.padStart(9)} ${
        `$${formatNum(t.liquidity)}`.padStart(14)
      } ${`$${formatNum(t.v24hUSD)}`.padStart(14)}`,
    );
  });
}

function formatNum(n: number | undefined): string {
  if (!n) return '-';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

main();
