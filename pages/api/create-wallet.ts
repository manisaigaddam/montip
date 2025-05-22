import type { NextApiRequest, NextApiResponse } from 'next';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';
import factoryAbi from '@/lib/factoryAbi.json';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("[API] /api/create-wallet called with method:", req.method, "body:", req.body);
  
  if (req.method !== 'POST') {
    console.warn("[API] Method not allowed:", req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid } = req.body;
  if (!fid) {
    console.warn("[API] Missing fid in request body");
    return res.status(400).json({ error: 'Missing fid' });
  }

  if (!DEPLOYER_PRIVATE_KEY) {
    console.error("[API] Bot private key not set in environment");
    return res.status(500).json({ error: 'Bot private key not set in environment.' });
  }

  try {
    const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(),
    });

    console.log("[API] Creating wallet for FID:", fid);
    const hash = await walletClient.writeContract({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: 'createWallet',
      args: [BigInt(fid)],
      account,
    });

    console.log("[API] Wallet creation tx hash:", hash);
    return res.status(200).json({ hash });
  } catch (e: any) {
    console.error("[API] Error creating wallet:", e);
    return res.status(500).json({ error: e?.message || 'Failed to create wallet' });
  }
} 