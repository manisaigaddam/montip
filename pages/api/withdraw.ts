import { NextApiRequest, NextApiResponse } from 'next';
import { createWalletClient, http, encodeFunctionData, parseEther, getAddress, parseUnits, createPublicClient } from 'viem';
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
  { symbol: "DAK", address: "0x0F0BDEBF0F83CD1EE3974779BCB7315F9808C714", decimals: 18 },
  { symbol: "HALLI", address: "0x6Ce1890eEadaE7Db01026F4b294Cb8eC5eCc6563", decimals: 18 },
  { symbol: "HEDGE", address: "0x04A9d9d4aEa93F512A4c7B71993915004325eD38", decimals: 18 },
  { symbol: "JAI", address: "0xCc5B42f9D6144DfdfB6Fb3987A2A916aF902F5F8", decimals: 6 },
  { symbol: "KEYS", address: "0x8A056Df4d7F23121A90aCa1cA1364063d43Ff3B8", decimals: 18 },
  { symbol: "MAD", address: "0xC8527e96C3Cb9522F6E35e95C0A28FeAb8144f15", decimals: 18 },
  { symbol: "MAD-LP", address: "0x786F4aa162457ecDF8fa4657759fa3E86C9394fF", decimals: 18 },
  { symbol: "MIST", address: "0xB38Bb873cCA844b20A9eE448A87Af3626A6e1eF5", decimals: 18 },
  { symbol: "MONDA", address: "0x0C0c92fcf37ae2cbcc512e59714cd3a1a1cbc411", decimals: 18 },
  { symbol: "MOON", address: "0x4AA50E8208095D9594D18E8E3008ABB811125DCE", decimals: 18 },
  { symbol: "NOM", address: "0x43e52cBc0073cAa7c0cF6e64b576cE2d6Fb14eB8", decimals: 18 },
  { symbol: "NSTR", address: "0xC85548e0191cd34be8092b0d42eb4e45eba0d581", decimals: 18 },
  { symbol: "P1", address: "0x44369aafdd04cd9609a57ec0237884f45dd80818", decimals: 18 },
  { symbol: "RBSD", address: "0x8A86d48c867b76ff74a36d3af4d2f1e707b143ed", decimals: 18 },
  { symbol: "RED", address: "0x92eac40c98b383ea0f0efda747bdac7ac891d300", decimals: 18 },
  { symbol: "TFAT", address: "0x24d2fd6c5b29eebd5169cc7d6e8014cd65decd73", decimals: 18 },
  { symbol: "USDX", address: "0xD875bA8e2cAD3c0F7E2973277C360c8d2F92b510", decimals: 6 },
  { symbol: "USDm", address: "0xBdd352f339e27e07089039ba80029f9135f6146f", decimals: 6 },
  { symbol: "WBTC", address: "0xCf5A6076cfa32686c0df13abada2b40dec133f1d", decimals: 8 },
  { symbol: "WETH", address: "0xB5A30b0fdc5ea94a52fdc42e3e9760cb8449fb37", decimals: 18 },
  { symbol: "WMON", address: "0x760afe86e5de5fa0ee542fc7b7b713e1c5425701", decimals: 18 },
  { symbol: "WSOL", address: "0x5387c85a4965769f6b0df430638a1388493486f1", decimals: 9 },
  { symbol: "YAKI", address: "0xFe140e1dce99be9f4f15d657cd9b7bf622270c50", decimals: 18 },
  { symbol: "aprMON", address: "0xB2f82d0f38dc453d596ad40a37799446cc89274a", decimals: 18 },
  { symbol: "gMON", address: "0xAeef2f6b429cb59c9b2d7bb2141ada993e8571c3", decimals: 18 },
  { symbol: "iceMON", address: "0xCeb564775415b524640d9f688278490a7f3ef9cd", decimals: 18 },
  { symbol: "mamaBTC", address: "0x3b428df09c3508d884c30266ac1577f099313cf6", decimals: 8 },
  { symbol: "muBOND", address: "0x0efed4d9fb7863ccc7bb392847c08dcd00fe9be2", decimals: 18 },
  { symbol: "sMON", address: "0xE1d2439b75fb9746e7bc6cb777ae10aa7f7ef9c5", decimals: 18 },
  { symbol: "shMON", address: "0x3a98250f98dd388c211206983453837c8365bdc1", decimals: 18 },
  { symbol: "stMON", address: "0x199c0da6f291a897302300aaae4f20d139162916", decimals: 18 },
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

  // Create a public client for balance checks
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(process.env.MONAD_TESTNET_RPC_URL!),
  });

  // Fetch Montip wallet balances directly from the blockchain
  let montipMonBalance = 0;
  let montipTokenBalance = 0;
  try {
    montipMonBalance = Number(await publicClient.getBalance({
      address: fromWallet as `0x${string}`,
    })) / 1e18;
  } catch (e) {
    console.error(`Error fetching MON balance:`, e);
  }
  if (token.symbol !== 'MON' && token.address) {
    try {
      const checksummedTokenAddress = getAddress(token.address);
      const rawTokenBalance = await publicClient.readContract({
        address: checksummedTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [fromWallet],
      });
      montipTokenBalance = Number(rawTokenBalance) / 10 ** token.decimals;
    } catch (e) {
      console.error(`Error fetching ${token.symbol} balance:`, e);
    }
  }
  console.log(`[WITHDRAW DEBUG] Requested withdraw amount:`, amount, token.symbol);
  // Validate sufficient balance for withdraw
  if (token.symbol === 'MON') {
    if (Number(amount) > montipMonBalance) {
      return res.status(400).json({ error: 'Insufficient MON balance in Montip wallet' });
    }
  } else {
    if (Number(amount) > montipTokenBalance) {
      return res.status(400).json({ error: `Insufficient ${token.symbol} balance in Montip wallet` });
    }
    // Optionally, check for MON gas for ERC-20 withdraw
    if (montipMonBalance < 0.008) {
      return res.status(400).json({ error: 'Insufficient MON for gas in Montip wallet' });
    }
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
    let amountWei;
    if (token.symbol === 'MON') {
      amountWei = parseEther(amount);
    } else {
      amountWei = parseUnits(amount, decimals);
    }

    // Encode sendTip function call
    const data = encodeFunctionData({
      abi: walletAbi,
      functionName: 'sendTip',
      args: [recipient, tokenAddress, amountWei],
    });

    // Send transaction
    const txHash = await client.sendTransaction({
      to: walletAddress,
      data,
      account,
    });

    return res.status(200).json({ txHash });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Withdraw failed' });
  }
} 
