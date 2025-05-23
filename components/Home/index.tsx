"use client";

import { useMiniAppContext } from "@/hooks/use-miniapp-context";
import { useEffect, useState, useRef } from "react";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";
import factoryAbi from "@/lib/factoryAbi.json";
import erc20Abi from "@/lib/erc20Abi.json";
import HelpButton from '../HelpButton';
import SplashScreen from '../SplashScreen';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

// Full token list (from user)
const TOKENS = [
  { symbol: "MON", address: null, decimals: 18 },
  { symbol: "USDC", address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", decimals: 6 },
  { symbol: "USDT", address: "0x88B8E2161DEDC77EF4AB7585569D2415A1C1055D", decimals: 6 },
  { symbol: "BEAN", address: "0x268E4E24E0051EC27B3D27A95977E71CE6875A05", decimals: 18 },
  { symbol: "BMONAD", address: "0x3552F8254263EA8880C7F7E25CB8DBBD79C0C4B1", decimals: 18 },
  { symbol: "CHOG", address: "0xE0590015A873BF326BD645C3E1266D4DB41C4E6B", decimals: 18 },
  { symbol: "DAK", address: "0x0F0BDEBF0F83CD1EE3974779BCB7315F9808C714", decimals: 18 },
  { symbol: "HALLI", address: "0x6CE1890EEADAE7DB01026F4B294CB8EC5ECC6563", decimals: 18 },
  { symbol: "HEDGE", address: "0x04A9D9D4AEA93F512A4C7B71993915004325ED38", decimals: 18 },
  { symbol: "JAI", address: "0xCC5B42F9D6144DFDFB6FB3987A2A916AF902F5F8", decimals: 6 },
  { symbol: "KEYS", address: "0x8A056DF4D7F23121A90ACA1CA1364063D43FF3B8", decimals: 18 },
  { symbol: "MAD", address: "0xC8527E96C3CB9522F6E35E95C0A28FEAB8144F15", decimals: 18 },
  { symbol: "MAD-LP", address: "0x786F4AA162457ECDF8FA4657759FA3E86C9394FF", decimals: 18 },
  { symbol: "MIST", address: "0xB38BB873CCA844B20A9EE448A87AF3626A6E1EF5", decimals: 18 },
  { symbol: "MONDA", address: "0x0C0C92FCF37AE2CBCC512E59714CD3A1A1CBC411", decimals: 18 },
  { symbol: "MOON", address: "0x4AA50E8208095D9594D18E8E3008ABB811125DCE", decimals: 18 },
  { symbol: "NOM", address: "0x43E52CBC0073CAA7C0CF6E64B576CE2D6FB14EB8", decimals: 18 },
  { symbol: "NSTR", address: "0xC85548E0191CD34BE8092B0D42EB4E45EBA0D581", decimals: 18 },
  { symbol: "P1", address: "0x44369AAFDD04CD9609A57EC0237884F45DD80818", decimals: 18 },
  { symbol: "RBSD", address: "0x8A86D48C867B76FF74A36D3AF4D2F1E707B143ED", decimals: 18 },
  { symbol: "RED", address: "0x92EAC40C98B383EA0F0EFDA747BDAC7AC891D300", decimals: 18 },
  { symbol: "TFAT", address: "0x24D2FD6C5B29EEBD5169CC7D6E8014CD65DECD73", decimals: 18 },
  { symbol: "USDX", address: "0xD875BA8E2CAD3C0F7E2973277C360C8D2F92B510", decimals: 6 },
  { symbol: "USDm", address: "0xBDD352F339E27E07089039BA80029F9135F6146F", decimals: 6 },
  { symbol: "WBTC", address: "0xCF5A6076CFA32686C0DF13ABADA2B40DEC133F1D", decimals: 8 },
  { symbol: "WETH", address: "0xB5A30B0FDC5EA94A52FDC42E3E9760CB8449FB37", decimals: 18 },
  { symbol: "WMON", address: "0x760AFE86E5DE5FA0EE542FC7B7B713E1C5425701", decimals: 18 },
  { symbol: "WSOL", address: "0x5387C85A4965769F6B0DF430638A1388493486F1", decimals: 9 },
  { symbol: "YAKI", address: "0xFE140E1DCE99BE9F4F15D657CD9B7BF622270C50", decimals: 18 },
  { symbol: "aprMON", address: "0xB2F82D0F38DC453D596AD40A37799446CC89274A", decimals: 18 },
  { symbol: "gMON", address: "0xAEEF2F6B429CB59C9B2D7BB2141ADA993E8571C3", decimals: 18 },
  { symbol: "iceMON", address: "0xCEB564775415B524640D9F688278490A7F3EF9CD", decimals: 18 },
  { symbol: "mamaBTC", address: "0x3B428DF09C3508D884C30266AC1577F099313CF6", decimals: 8 },
  { symbol: "muBOND", address: "0x0EFED4D9FB7863CCC7BB392847C08DCD00FE9BE2", decimals: 18 },
  { symbol: "sMON", address: "0xE1D2439B75FB9746E7BC6CB777AE10AA7F7EF9C5", decimals: 18 },
  { symbol: "shMON", address: "0x3A98250F98DD388C211206983453837C8365BDC1", decimals: 18 },
  { symbol: "stMON", address: "0x199C0DA6F291A897302300AAAE4F20D139162916", decimals: 18 },
];

function shortenAddress(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "-";
}

export default function Home() {
  const { context } = useMiniAppContext();
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true for initial load
  const [creating, setCreating] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [polling, setPolling] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wallet' | 'topTippers'>('wallet');
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const fid = context?.user?.fid;
  const username = context?.user?.username || "-";

  console.log("[MiniApp] Loaded context:", context);

  // Setup viem public client with custom Monad testnet RPC
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http("https://testnet-rpc.monad.xyz"),
  });

  // Use backend API for token balances (single address)
  const fetchBalances = async (address: string) => {
    try {
      const response = await fetch('/api/get-balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      const tokensArr = data?.data?.tokens || [];
      const newBalances: Record<string, string> = {};
      for (const tokenObj of tokensArr) {
        // Native MON
        if (!tokenObj.tokenAddress) {
          newBalances["MON"] = (parseInt(tokenObj.tokenBalance, 16) / 1e18).toFixed(4);
        } else {
          // ERC-20
          const token = TOKENS.find(
            (t) =>
              t.address &&
              t.address.toLowerCase() === tokenObj.tokenAddress.toLowerCase()
          );
          if (token) {
            newBalances[token.symbol] = (
              parseInt(tokenObj.tokenBalance, 16) / 10 ** token.decimals
            ).toFixed(4);
          }
        }
      }
      setBalances(newBalances);
    } catch (e) {
      console.error("[MiniApp] Error fetching balances:", e);
    }
  };

  // On first load, fetch wallet and balances together
  useEffect(() => {
    if (!fid) {
      console.warn("[MiniApp] No FID found in context");
      return;
    }
    setLoading(true);
    (async () => {
      try {
        console.log("[MiniApp] Checking wallet for FID:", fid);
        const address = await publicClient.readContract({
          address: FACTORY_ADDRESS,
          abi: factoryAbi,
          functionName: "getWallet",
          args: [BigInt(fid)],
        });
        if (address && address !== "0x0000000000000000000000000000000000000000") {
          console.log("[MiniApp] Wallet found:", address);
          setWalletAddress(address as string);
          await fetchBalances(address as string);
        } else {
          console.log("[MiniApp] No wallet found for FID:", fid);
          setWalletAddress(null);
        }
      } catch (e) {
        console.error("[MiniApp] Error checking wallet:", e);
        setWalletAddress(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [fid]);

  // Only allow manual balance updates after initial load
  const handleUpdateBalances = () => {
    if (!walletAddress) return;
    setPolling(true);
    console.log("[MiniApp] Manual balance update triggered");
    fetchBalances(walletAddress).finally(() => setPolling(false));
  };

  // Replace handleCreate with API call
  const handleCreate = async () => {
    if (!fid) return;
    setCreating(true);
    setCreationError(null);
    console.log("[MiniApp] Creating wallet for FID:", fid);
    try {
      const res = await fetch('/api/create-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("[MiniApp] Wallet creation failed:", data.error);
        setCreationError(data.error || 'Failed to create wallet');
        setCreating(false);
        return;
      }
      console.log("[MiniApp] Wallet creation tx hash:", data.hash);
      // Wait a moment for the contract to update
      setTimeout(async () => {
        const address = await publicClient.readContract({
          address: FACTORY_ADDRESS,
          abi: factoryAbi,
          functionName: 'getWallet',
          args: [BigInt(fid)],
        });
        setWalletAddress(address as string);
        if (address && address !== '0x0000000000000000000000000000000000000000') {
          await fetchBalances(address as string);
        }
      }, 2000);
    } catch (e: any) {
      console.error("[MiniApp] Error creating wallet:", e);
      setCreationError(e?.message || 'Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  // Show all tokens, always
  const visibleTokens = TOKENS;

  // No custom splash logic; rely on Warpcast SDK splash
  if (loading) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start" style={{
      background: "linear-gradient(135deg, #5b4dcf 0%, #a280ff 100%)",
      minHeight: "100vh"
    }}>
      <SplashScreen />
      {/* Top bar: username/fid left, product name right */}
      <div className="w-full flex flex-row items-center justify-between pt-6 pb-2 px-4">
        <div className="text-lg text-white font-bold tracking-wide font-sans">@{username} <span className="text-xs text-indigo-100 font-medium">(fid: {fid ?? "-"})</span></div>
        <span className="text-white font-extrabold text-xl tracking-widest uppercase">montip</span>
      </div>
      {/* Pill-shaped address box */}
      {walletAddress && (
        <div className="flex items-center bg-white/90 rounded-full px-5 py-2 shadow text-sm font-mono text-gray-700 mb-6 transition-transform duration-150 hover:scale-105">
          {shortenAddress(walletAddress)}
          <button onClick={handleCopy} className="ml-2 hover:text-green-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" fill="#64748b" rx="2"/><rect width="14" height="14" x="7" y="7" fill="#fff" rx="2"/><rect width="14" height="14" x="9" y="9" fill="#64748b" rx="2"/></svg>
          </button>
          {copied && <span className="ml-2 text-green-600 font-semibold">Copied!</span>}
        </div>
      )}
      {/* Update Balances Button */}
      {walletAddress && (
        <button className="bg-gradient-to-r from-[#5b4dcf] to-[#a280ff] text-white px-8 py-3 rounded-full font-bold text-lg shadow transition-transform duration-150 hover:scale-105 mb-6" onClick={handleUpdateBalances} disabled={polling}>
          {polling ? "Updating..." : "Update Balances"}
        </button>
      )}
      {/* Tokens block stretches to bottom, scrolls internally if needed */}
      <div className="flex flex-col flex-grow w-full max-w-lg">
        {walletAddress && (
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 w-full flex flex-col flex-grow min-h-0" style={{height: '100%', flex: 1}}>
            <div className="text-lg font-bold text-gray-700 mb-2 text-center">Tokens</div>
            <div className="flex-1 min-h-0 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 flex flex-col">
              {Object.entries(balances).map(([symbol, balance], idx, arr) => (
                <div
                  key={symbol}
                  className={`flex flex-row items-center justify-between px-2 py-3 ${idx < arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <span className="font-mono text-base text-gray-900 font-bold">{symbol}</span>
                  <span className="font-mono text-lg font-bold text-gray-900">{balance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Show Create button if no wallet */}
      {!walletAddress && (
        <button className="bg-gradient-to-r from-[#5b4dcf] to-[#a280ff] text-white px-8 py-3 rounded-full font-bold text-lg shadow transition-transform duration-150 hover:scale-105 mt-8" onClick={handleCreate} disabled={creating}>
          {creating ? "Creating..." : "Create Wallet"}
        </button>
      )}
      <HelpButton />
    </div>
  );
}

