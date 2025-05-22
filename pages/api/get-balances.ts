import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { address } = req.body;
  const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
  const ALCHEMY_URL = `https://api.g.alchemy.com/data/v1/${ALCHEMY_KEY}/assets/tokens/balances/by-address`;

  const response = await fetch(ALCHEMY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addresses: [{ address, networks: ["monad-testnet"] }],
      includeNativeTokens: true
    })
  });
  const data = await response.json();
  res.status(200).json(data);
}
