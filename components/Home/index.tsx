"use client";

import { useMiniAppContext } from "@/hooks/use-miniapp-context";
import { useEffect, useState, useRef } from "react";
import { createPublicClient, http, formatUnits } from "viem";
import { monadTestnet } from "viem/chains";
import factoryAbi from "@/lib/factoryAbi.json";
import erc20Abi from "@/lib/erc20Abi.json";
import HelpButton from '../HelpButton';
import SplashScreen from '../SplashScreen';
import { parseEther, isAddress, getAddress, parseUnits } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

// Full token list (from user)
const RAW_TOKENS = [
  { symbol: "MON", address: null, decimals: 18 },
  { symbol: "USDC", address: "0xf817257FeD379853cDe0fa4F97AB987181B1E5Ea", decimals: 6 },
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

const TOKENS = RAW_TOKENS.map(t =>
  t.address ? { ...t, address: getAddress(t.address) } : t
);

function shortenAddress(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "-";
}

function formatBalance(val: string | number | undefined, decimals = 4) {
  if (!val || isNaN(Number(val))) return '0.0000';
  return Number(val).toFixed(decimals);
}

export default function Home() {
  const { context, isEthProviderAvailable } = useMiniAppContext();
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [polling, setPolling] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'deposit' | 'withdraw'>('assets');
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const fid = context?.user?.fid;
  const username = context?.user?.username || "-";

  // Wallet hooks
  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: txHash, sendTransaction, error: sendTxError, isError: isSendTxError } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { connect } = useConnect();

  // New state for deposit
  const [depositToken, setDepositToken] = useState(TOKENS[0]);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  const { writeContract, writeContractAsync } = useWriteContract();

  // Withdraw state
  const [withdrawToOther, setWithdrawToOther] = useState(false);
  const [withdrawOtherAddress, setWithdrawOtherAddress] = useState("");
  const [withdrawToken, setWithdrawToken] = useState(TOKENS[0]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // New state for login wallet balances
  const [montipBalances, setMontipBalances] = useState<Record<string, string>>({});
  const [loginWalletBalances, setLoginWalletBalances] = useState<Record<string, string>>({});

  // Auto-hide messages
  useEffect(() => {
    if (withdrawSuccess || withdrawError) {
      const timer = setTimeout(() => {
        setWithdrawSuccess(null);
        setWithdrawError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [withdrawSuccess, withdrawError]);
  useEffect(() => {
    if (depositSuccess || depositError) {
      const timer = setTimeout(() => {
        setDepositSuccess(null);
        setDepositError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [depositSuccess, depositError]);

  console.log("[MiniApp] Loaded context:", context);

  // Setup viem public client with custom Monad testnet RPC
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http("https://testnet-rpc.monad.xyz"),
  });

  const MONAD_TESTNET_ID = 10143;

  // Helper to fetch balances for both wallets using Alchemy batch endpoint
  const fetchAllBalances = async (montipAddress: string, loginAddress?: string) => {
    const addresses = [
      { address: montipAddress, networks: ["monad-testnet"] },
    ];
    if (loginAddress) {
      addresses.push({ address: loginAddress, networks: ["monad-testnet"] });
    }
    const response = await fetch("https://api.g.alchemy.com/data/v1/ClXqqWvrb6dzy32jRH4jzOfqEReo3T7h/assets/tokens/balances/by-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses, includeNativeTokens: true }),
    });
    const body = await response.json();
    const tokensArr = body?.data?.tokens || [];
    const montip: Record<string, string> = {};
    const login: Record<string, string> = {};
      for (const tokenObj of tokensArr) {
      const isMontip = tokenObj.address.toLowerCase() === montipAddress.toLowerCase();
      const isLogin = loginAddress && tokenObj.address.toLowerCase() === loginAddress.toLowerCase();
      // Find token meta
      let symbol = "MON";
      let decimals = 18;
      if (tokenObj.tokenAddress) {
          const token = TOKENS.find(
          (t) => t.address && t.address.toLowerCase() === tokenObj.tokenAddress.toLowerCase()
          );
          if (token) {
          symbol = token.symbol;
          decimals = token.decimals;
        } else {
          continue; // skip unknown tokens
        }
      }
      const value = (parseInt(tokenObj.tokenBalance, 16) / 10 ** decimals).toFixed(4);
      if (isMontip) montip[symbol] = value;
      if (isLogin) login[symbol] = value;
    }
    setMontipBalances(montip);
    setLoginWalletBalances(login);
  };

  // On initial load, fetch only Montip wallet balances
  useEffect(() => {
    if (!walletAddress) return;
    fetchAllBalances(walletAddress);
  }, [walletAddress]);

  // After wallet connect, fetch both
  useEffect(() => {
    if (!walletAddress) return;
    if (!isConnected || !address) return;
    fetchAllBalances(walletAddress, address);
  }, [walletAddress, isConnected, address]);

  // On Assets tab, always fetch both if connected
  useEffect(() => {
    if (activeTab === 'assets' && walletAddress) {
      if (isConnected && address) {
        fetchAllBalances(walletAddress, address);
      } else {
        fetchAllBalances(walletAddress);
      }
    }
  }, [activeTab, walletAddress, isConnected, address]);

  // After deposit/withdraw, re-fetch both
  const refreshBalances = () => {
    if (walletAddress && isConnected && address) {
      fetchAllBalances(walletAddress, address);
    } else if (walletAddress) {
      fetchAllBalances(walletAddress);
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
    fetchAllBalances(walletAddress).finally(() => setPolling(false));
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
          await fetchAllBalances(address as string);
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

  // Effect to handle transaction confirmation and success message for MON deposit
  useEffect(() => {
    if (txHash) {
      (async () => {
        try {
          await publicClient.waitForTransactionReceipt({ hash: txHash });
          setDepositSuccess("Deposit successful!");
          refreshBalances();
        } catch (err: any) {
          if (err?.message?.toLowerCase().includes("user rejected")) {
            setDepositError("You rejected the transaction.");
          } else {
            setDepositError("Deposit failed: Please try again");
          }
        }
      })();
    }
  }, [txHash]);

  // Reset withdraw amount when token changes
  useEffect(() => {
    setWithdrawAmount("");
  }, [withdrawToken]);

  // Reset deposit amount when token changes (like withdraw)
  useEffect(() => {
    setDepositAmount("");
  }, [depositToken]);

  const handleDeposit = async () => {
    setIsDepositing(true);
    setDepositError(null);
    setDepositSuccess(null);
    try {
      if (chainId !== MONAD_TESTNET_ID) {
        setDepositError("Switch to Monad Testnet");
        setIsDepositing(false);
        return;
      }
      if (!walletAddress || !address) {
        setDepositError("Wallet not connected");
        setIsDepositing(false);
        return;
      }
      if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
        setDepositError("Enter a valid amount");
        setIsDepositing(false);
        return;
      }
      // Use loginWalletBalances for deposit check
      const bal = loginWalletBalances[depositToken.symbol];
      if (bal && Number(depositAmount) > Number(bal)) {
        setDepositError("Insufficient funds: Not enough balance");
        setIsDepositing(false);
        return;
      }
      if (depositToken.symbol === "MON") {
        try {
          sendTransaction({
            to: walletAddress as `0x${string}`,
            value: parseEther(depositAmount),
            gas: BigInt(25000),
          });
          // Success message will be handled in the txHash effect
          // No need to wait for receipt or check tx.hash here
          // No inline note about MON fee
        } catch (err: any) {
          if (err?.message?.toLowerCase().includes("user rejected")) {
            setDepositError("You rejected the transaction.");
          } else if (err?.message?.toLowerCase().includes("insufficient funds")) {
            setDepositError("You do not have enough balance to deposit.");
          } else {
            setDepositError("Deposit failed. Please try again.");
          }
          setIsDepositing(false);
          return;
        }
      } else {
        if (depositToken.address) {
          try {
            const rawAddress = typeof depositToken.address === "string" ? depositToken.address.trim() : "";
            if (!isAddress(rawAddress)) {
              setDepositError("Invalid address: Please check the address");
              setIsDepositing(false);
              return;
            }
            let checksummedAddress;
            try {
              checksummedAddress = getAddress(rawAddress);
            } catch (err) {
              setDepositError("Invalid address: Please check the address");
              setIsDepositing(false);
              return;
            }
            const tx = await writeContractAsync({
              address: checksummedAddress,
              abi: erc20Abi,
              functionName: "transfer",
              args: [walletAddress as `0x${string}`, BigInt(String(Math.floor(Number(depositAmount) * 10 ** depositToken.decimals)))]
            });
            if (tx) {
              // Wait for confirmation
              await publicClient.waitForTransactionReceipt({ hash: tx });
              setDepositSuccess("Deposit successful!");
              refreshBalances();
            }
          } catch (err: any) {
            if (err?.message?.toLowerCase().includes("user rejected")) {
              setDepositError("You rejected the transaction.");
            } else if (err?.message?.toLowerCase().includes("insufficient funds")) {
              setDepositError("Insufficient funds: Not enough balance");
            } else {
              setDepositError("Deposit failed: Please try again");
            }
          }
        } else {
          setDepositError("Invalid address: Please check the address");
        }
      }
    } catch (err: any) {
      setDepositError("Deposit failed: Please try again");
    }
    setIsDepositing(false);
  };

  // Helper to get max withdrawable balance
  const getMaxWithdrawAmount = () => {
    const bal = montipBalances[withdrawToken.symbol];
    return bal ? bal : "";
  };

  // Withdraw handler
  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setWithdrawError(null);
    setWithdrawSuccess(null);
    try {
      if (!walletAddress) {
        setWithdrawError("No Montip wallet found");
        setIsWithdrawing(false);
        return;
      }
      const toAddr = withdrawToOther ? withdrawOtherAddress : address;
      if (!toAddr) {
        setWithdrawError("No recipient address");
        setIsWithdrawing(false);
        return;
      }
      if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
        setWithdrawError("Enter a valid amount");
        setIsWithdrawing(false);
        return;
      }
      const max = getMaxWithdrawAmount();
      if (max && Number(withdrawAmount) > Number(max)) {
        setWithdrawError("Insufficient funds: Not enough balance");
        setIsWithdrawing(false);
        return;
      }
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWallet: walletAddress,
          toAddress: toAddr,
          tokenSymbol: withdrawToken.symbol,
          amount: withdrawAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("insufficient funds")) {
          setWithdrawError("Insufficient funds: Not enough balance");
        } else if (data.error?.toLowerCase().includes("invalid")) {
          setWithdrawError("Invalid address: Please check the address");
        } else {
          setWithdrawError("Withdraw failed: Please try again");
        }
      } else {
        setWithdrawSuccess("Withdraw successful!");
        setWithdrawAmount("");
        refreshBalances();
      }
    } catch (err: any) {
      setWithdrawError("Withdraw failed: Please try again");
    }
    setIsWithdrawing(false);
  };

  // Auto-switch to Monad Testnet (10143) when wallet is connected and not on the correct chain
  useEffect(() => {
    if (isConnected && chainId !== MONAD_TESTNET_ID && switchChain) {
      switchChain({ chainId: MONAD_TESTNET_ID });
    }
  }, [isConnected, chainId, switchChain]);

  // No custom splash logic; rely on Warpcast SDK splash
  if (loading) return null;

  return (
    <div className="min-h-screen h-full w-full flex flex-col items-center justify-start" style={{
      background: "linear-gradient(135deg, #5b4dcf 0%, #a280ff 100%)",
      minHeight: "100vh"
    }}>
      <SplashScreen />
      
      {/* Top bar: product name, username, fid left; wallet right */}
      <div className="w-full flex flex-row items-center justify-between pt-6 pb-2 px-4">
        <div className="flex flex-col items-start">
          <span className="text-white font-extrabold text-xl tracking-widest uppercase mb-1">MONTIP</span>
          <div className="text-lg text-white font-bold tracking-wide font-sans">@{username}</div>
          <div className="text-sm text-indigo-100 font-medium">FID: {fid ?? "-"}</div>
        </div>
        <div className="flex flex-col items-end">
          {isConnected ? (
            <div className="flex flex-row items-center space-x-2">
              <div className="flex flex-col items-start">
                <span className="text-white text-sm">{shortenAddress(address || '')}</span>
                <span className="text-xs text-white/80">{formatBalance(loginWalletBalances["MON"])} MON</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="bg-white/20 text-white px-2 py-1 rounded text-sm hover:bg-white/30 ml-2"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: farcasterFrame() })}
              className="bg-white text-black px-4 py-1 rounded text-sm hover:bg-white/90"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full max-w-lg px-4 mb-2">
        <div className="flex space-x-2 bg-white/10 rounded-lg p-1">
          {(['assets', 'deposit', 'withdraw'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-lg px-4 flex-1 flex flex-col justify-center items-center">
        {activeTab === 'assets' && (
          <>
            {/* Wallet address with copy icon */}
            {walletAddress && (
              <div className="flex items-center justify-between bg-white/20 rounded-xl px-4 py-2 mb-2">
                <span className="font-bold text-white mr-2">Montip Wallet</span>
                <span className="font-mono text-xs text-white mr-2">{shortenAddress(walletAddress)}</span>
                <button
                  onClick={handleCopy}
                  className="text-white bg-indigo-500 hover:bg-indigo-600 rounded p-1"
                  title={copied ? "Copied!" : "Copy address"}
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2.25-2.25V6.75A2.25 2.25 0 0015.75 4.5h-7.5A2.25 2.25 0 006 6.75v10.5A2.25 2.25 0 008.25 19.5h6.5A2.25 2.25 0 0017 17.25v-2.25" />
                    </svg>
                  )}
        </button>
              </div>
      )}
            {/* Tokens List Block fills available height with scroll inside */}
            <div className="flex flex-col flex-1 w-full max-w-lg pb-6">
        {walletAddress && (
                <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 w-full flex-1 flex flex-col">
            <div className="text-lg font-bold text-gray-700 mb-2 text-center">Tokens</div>
                  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {Object.entries(montipBalances).map(([symbol, balance], idx, arr) => (
                <div
                  key={symbol}
                        className={`flex flex-row items-center justify-between px-2 py-3 ${
                          idx < arr.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                >
                  <span className="font-mono text-base text-gray-900 font-bold">{symbol}</span>
                  <span className="font-mono text-lg font-bold text-gray-900">{balance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
          </>
        )}

        {activeTab === 'deposit' && (
          <div className="flex justify-center items-center w-full flex-1">
            <div className="bg-white/20 border border-white/30 shadow-xl rounded-2xl p-4 w-full max-w-[370px] flex flex-col items-center justify-start">
              <div className="w-full">
                {!isConnected ? (
                  <div className="flex flex-col items-center justify-center w-full py-8">
                    <button
                      onClick={() => connect({ connector: farcasterFrame() })}
                      className="bg-white text-black px-6 py-2 rounded text-lg font-bold hover:bg-white/90 mb-3"
                    >
                      Connect Wallet
                    </button>
                    <div className="text-white text-center text-sm">Connect your login wallet to deposit tokens.</div>
                  </div>
                ) : (
                  <>
                    {/* From/To Wallets at the top */}
                    <div className="w-full mb-4">
                      <div className="text-xs text-white/80 mb-1">From connected wallet:</div>
                      <span className="block font-mono text-xs text-white bg-black/20 rounded px-2 py-1 mb-2 break-all">
                        {address}
                      </span>
                      <div className="text-xs text-white/80 mb-1">To your Montip wallet:</div>
                      <span className="block font-mono text-xs text-white bg-black/20 rounded px-2 py-1 break-all">
                        {walletAddress}
                      </span>
                    </div>
                    <div className="w-full mb-4">
                      <select
                        value={depositToken.symbol}
                        onChange={e => setDepositToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                        className="w-full p-3 rounded-lg border border-gray-300 text-lg font-semibold text-gray-800 focus:outline-none"
                      >
                        {TOKENS.map(token => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Show connected wallet balance for selected token */}
                    <div className="w-full mb-2 text-right text-xs text-white/80">
                      Balance: {loginWalletBalances[depositToken.symbol] ? Number(loginWalletBalances[depositToken.symbol]).toFixed(4) : '0.0000'} {depositToken.symbol}
                    </div>
                    <div className="w-full mb-4 relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full p-3 rounded-lg border border-gray-300 text-lg font-mono focus:outline-none pr-16"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-black text-xs font-bold px-3 py-1 rounded shadow hover:bg-white"
                        style={{ zIndex: 2 }}
                        onClick={() => setDepositAmount(loginWalletBalances[depositToken.symbol] || "")}
                      >
                        Max
                      </button>
                    </div>
                    <button
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3 rounded-lg transition-all duration-150 shadow mb-4"
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount || !walletAddress || !address}
                    >
                      {isDepositing ? "Depositing..." : `Deposit ${depositToken.symbol}`}
                    </button>
                    {depositSuccess && <div className="mt-2 text-green-300 text-center font-semibold">{depositSuccess}</div>}
                    {depositError && (
                      <div className="mt-2 text-red-300 text-center font-semibold">
                        {depositError === 'You do not have enough balance to deposit.' && 'Insufficient balance.'}
                        {depositError === 'Please switch to Monad Testnet to deposit.' && 'Please switch to Monad Testnet to deposit.'}
                        {depositError === 'Please connect your wallet to deposit.' && 'Please connect your wallet to deposit.'}
                        {depositError === 'Please enter a valid amount.' && 'Please enter a valid amount.'}
                        {depositError === 'There was an issue with the token address. Please try again.' && 'There was an issue with the token address. Please try again.'}
                        {depositError === 'You rejected the transaction.' && 'You rejected the transaction.'}
                        {depositError === 'Deposit failed. Please try again.' && 'Deposit failed. Please try again.'}
                        {/* fallback for any other error */}
                        {![
                          'You do not have enough balance to deposit.',
                          'Please switch to Monad Testnet to deposit.',
                          'Please connect your wallet to deposit.',
                          'Please enter a valid amount.',
                          'There was an issue with the token address. Please try again.',
                          'You rejected the transaction.',
                          'Deposit failed. Please try again.'
                        ].includes(depositError) && depositError}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="flex justify-center items-center w-full flex-1">
            <div className="bg-white/20 border border-white/30 shadow-xl rounded-2xl p-4 w-full max-w-[370px] flex flex-col items-center justify-start" style={{ boxSizing: 'border-box', marginTop: '8px', marginBottom: '8px' }}>
              <div className="w-full">
                {!isConnected ? (
                  <div className="flex flex-col items-center justify-center w-full py-8">
                    <button
                      onClick={() => connect({ connector: farcasterFrame() })}
                      className="bg-white text-black px-6 py-2 rounded text-lg font-bold hover:bg-white/90 mb-3"
                    >
                      Connect Wallet
                    </button>
                    <div className="text-white text-center text-sm">Connect your login wallet to withdraw tokens.</div>
                  </div>
                ) : (
                  <>
                    {/* From Montip wallet */}
                    <div className="w-full mb-4">
                      <div className="text-xs text-white/80 mb-1">From your Montip wallet:</div>
                      <span className="block font-mono text-xs text-white bg-black/20 rounded px-2 py-1 break-all w-full">{walletAddress}</span>
                    </div>
                    {/* To login wallet (default) */}
                    <div className="w-full mb-4">
                      <div className="text-xs text-white/80 mb-1">Send to login wallet:</div>
                      <span className="block font-mono text-xs text-white bg-black/20 rounded px-2 py-1 break-all">
                        {address || "-"}
                      </span>
                    </div>
                    {/* Withdraw to different wallet */}
                    <div className="w-full mb-4 flex items-center">
                      <input
                        id="withdraw-different-wallet"
                        type="checkbox"
                        className="mr-2"
                        checked={withdrawToOther}
                        onChange={e => setWithdrawToOther(e.target.checked)}
                      />
                      <label htmlFor="withdraw-different-wallet" className="text-xs text-white/80">Withdraw to a different wallet</label>
                    </div>
                    {withdrawToOther && (
                      <div className="w-full mb-4">
                        <input
                          type="text"
                          value={withdrawOtherAddress}
                          onChange={e => setWithdrawOtherAddress(e.target.value)}
                          placeholder="Recipient address"
                          className="w-full p-3 rounded-lg border border-gray-300 text-lg font-mono focus:outline-none"
                        />
                      </div>
                    )}
                    {/* Token select and amount */}
                    <div className="w-full mb-4">
                      <select
                        value={withdrawToken.symbol}
                        onChange={e => setWithdrawToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                        className="w-full p-3 rounded-lg border border-gray-300 text-lg font-semibold text-gray-800 focus:outline-none"
                      >
                        {TOKENS.map(token => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full mb-2 text-right text-xs text-white/80">
                      Balance: {montipBalances[withdrawToken.symbol] ? Number(montipBalances[withdrawToken.symbol]).toFixed(4) : '0.0000'} {withdrawToken.symbol}
                    </div>
                    <div className="w-full mb-4 relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full p-3 rounded-lg border border-gray-300 text-lg font-mono focus:outline-none pr-16"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-black text-xs font-bold px-3 py-1 rounded shadow hover:bg-white"
                        style={{ zIndex: 2 }}
                        onClick={() => {
                          const bal = montipBalances[withdrawToken.symbol] ? Number(montipBalances[withdrawToken.symbol]) : 0;
                          if (withdrawToken.symbol === "MON") {
                            setWithdrawAmount(bal > 0.008 ? (bal - 0.008).toFixed(4) : "0");
                          } else {
                            setWithdrawAmount(bal.toFixed(4));
                          }
                        }}
                      >
                        Max
                      </button>
                    </div>
                    {/* Withdraw button */}
                    <button
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3 rounded-lg transition-all duration-150 shadow mb-4"
                      onClick={handleWithdraw}
                      disabled={isWithdrawing || !withdrawAmount || !walletAddress || (!address && !withdrawToOther) || Number(withdrawAmount) <= 0}
                    >
                      {isWithdrawing ? `Withdrawing...` : `Withdraw ${withdrawToken.symbol}`}
                    </button>
                    {withdrawSuccess && <div className="mt-2 text-green-300 text-center font-semibold">Withdraw successful! Your funds are on the way.</div>}
                    {withdrawError && (
                      <div className="mt-2 text-red-300 text-center font-semibold">
                        {withdrawError === 'You do not have enough balance to withdraw.' && 'Insufficient balance.'}
                        {withdrawError === 'No Montip wallet found.' && 'No Montip wallet found.'}
                        {withdrawError === 'No recipient address provided.' && 'No recipient address provided.'}
                        {withdrawError === 'Please enter a valid amount.' && 'Please enter a valid amount.'}
                        {withdrawError === 'There was an issue with the address. Please try again.' && 'There was an issue with the address. Please try again.'}
                        {withdrawError === 'You rejected the transaction.' && 'You rejected the transaction.'}
                        {withdrawError === 'Withdraw failed. Please try again.' && 'Withdraw failed. Please try again.'}
                        {/* fallback for any other error */}
                        {![
                          'You do not have enough balance to withdraw.',
                          'No Montip wallet found.',
                          'No recipient address provided.',
                          'Please enter a valid amount.',
                          'There was an issue with the address. Please try again.',
                          'You rejected the transaction.',
                          'Withdraw failed. Please try again.'
                        ].includes(withdrawError) && withdrawError}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Wallet Button */}
      {!walletAddress && (
        <div className="flex flex-1 items-center justify-center w-full" style={{ minHeight: "60vh" }}>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-8 py-3 bg-gradient-to-r from-[#5b4dcf] to-[#a280ff] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {creating ? "Creating..." : "Create Wallet"}
          </button>
        </div>
      )}
      
      <HelpButton />
    </div>
  );
}

