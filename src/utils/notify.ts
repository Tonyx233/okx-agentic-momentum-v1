import 'dotenv/config';
import axios from 'axios';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  throw new Error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing in .env');
}

const API_BASE = `https://api.telegram.org/bot${TOKEN}`;

export type Level = 'info' | 'warn' | 'error' | 'trade';

const ICON: Record<Level, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  trade: '💰',
};

export async function notify(message: string, level: Level = 'info'): Promise<void> {
  const text = `${ICON[level]} ${message}`;
  try {
    await axios.post(`${API_BASE}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } catch (err) {
    console.error('[notify] failed:', (err as Error).message);
  }
}

export async function notifyTrade(opts: {
  action: 'BUY' | 'SELL';
  symbol: string;
  amountUsd: number;
  price: number;
  txHash?: string;
  reason?: string;
}): Promise<void> {
  const lines = [
    `<b>${opts.action} ${opts.symbol}</b>`,
    `Size: $${opts.amountUsd.toFixed(2)} @ $${opts.price}`,
  ];
  if (opts.reason) lines.push(`Reason: ${opts.reason}`);
  if (opts.txHash) lines.push(`Tx: <code>${opts.txHash}</code>`);
  await notify(lines.join('\n'), 'trade');
}

const entry = process.argv[1]?.replace(/\\/g, '/');
if (entry && import.meta.url.endsWith(entry.split('/').pop()!)) {
  notify('Solana trading agent — notify util online', 'info').then(() =>
    console.log('Test notification sent.'),
  );
}
