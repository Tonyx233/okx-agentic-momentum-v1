import { Connection } from '@solana/web3.js';

const RPC =
  process.env.SOLANA_RPC_URL ??
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY ?? ''}`;

export const connection = new Connection(RPC, 'confirmed');

export async function getSlot(): Promise<number> {
  return connection.getSlot();
}

export async function getSolBalance(pubkey: string): Promise<number> {
  const { PublicKey } = await import('@solana/web3.js');
  const lamports = await connection.getBalance(new PublicKey(pubkey));
  return lamports / 1e9;
}
