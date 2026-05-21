import 'dotenv/config';
import { connection, getSolBalance } from '../data/helius.js';

async function main() {
  const slot = await connection.getSlot();
  const blockHeight = await connection.getBlockHeight();
  const pubkey = process.env.SOLANA_PUBLIC_KEY!;
  const sol = await getSolBalance(pubkey);

  console.log(`Helius RPC online`);
  console.log(`  Slot:        ${slot}`);
  console.log(`  BlockHeight: ${blockHeight}`);
  console.log(`  Wallet:      ${pubkey}`);
  console.log(`  SOL balance: ${sol.toFixed(4)} SOL`);
}

main().catch((err) => {
  console.error('Helius test failed:', err);
  process.exit(1);
});
