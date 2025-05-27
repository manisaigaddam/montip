import { NextApiRequest, NextApiResponse } from 'next';
import { createWalletClient, http, encodeFunctionData, parseEther, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';
import walletAbi from '@/lib/walletAbi.json';
import erc20Abi from '@/lib/erc20Abi.json';

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY as `0x${string}`;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS as `0x${string}`;
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

// Token list (should match frontend)
const TOKENS = [
  { symbol: "MON", address: null, decimals: 18 },
  { symbol: "USDC", address: "0xf817257FeD379853cDe0fa4F97AB987181B1E5Ea", decimals: 6 },
  { symbol: "USDT", address: "0x88B8E2161DEDC77EF4AB7585569D2415A1C1055D", decimals: 6 },
  { symbol: "BEAN", address: "0x268E4E24E0051EC27B3D27A95977E71CE6875A05", decimals: 18 },
  { symbol: "BMONAD", address: "0x3552F8254263EA8880C7F7E25CB8DBBD79C0C4B1", decimals: 18 },
  { symbol: "CHOG", address: "0xE0590015A873BF326BD645C3E1266D4DB41C4E6B", decimals: 18 },
  // ... add all tokens as in frontend ...
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fromWallet, toAddress, tokenSymbol, amount } = req.body;
  if (!fromWallet || !toAddress || !tokenSymbol || !amount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const token = TOKENS.find(t => t.symbol === tokenSymbol);
  if (!token) {
    return res.status(400).json({ error: 'Unsupported token' });
  }

  let tokenAddress;
  try {
    tokenAddress = token.address ? getAddress(token.address) : '0x0000000000000000000000000000000000000000';
  } catch (e) {
    return res.status(400).json({ error: 'Token contract address is invalid. Please check the token address and checksum.' });
  }

  try {
    const account = privateKeyToAccount(OWNER_PRIVATE_KEY);
    const client = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(process.env.MONAD_TESTNET_RPC_URL!),
    });

    // Prepare contract call
    const walletAddress = fromWallet as `0x${string}`;
    const recipient = toAddress as `0x${string}`;
    const decimals = token.decimals;
    const amountWei = BigInt(Math.floor(Number(amount) * 10 ** decimals));

    // Encode sendTip function call
    const data = encodeFunctionData({
      abi: walletAbi,
      functionName: 'sendTip',
      args: [recipient, tokenAddress, amountWei],
    });

    // Estimate gas (optional, can set a default)
    // Send transaction
    const txHash = await client.sendTransaction({
      to: walletAddress,
      data,
      account,
      // value: tokenSymbol === 'MON' ? amountWei : 0n, // Only if native
    });

    return res.status(200).json({ txHash });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Withdraw failed' });
  }
} 