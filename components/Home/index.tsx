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
import { APP_URL } from '@/lib/constants';
import { useFrame } from '@/components/farcaster-provider';
import { FaShareAlt } from 'react-icons/fa';
import { useShareStats } from '@/components/FarcasterActions';

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

// Add TipTransaction type
interface TipTransaction {
  id: number;
  tx_hash: string;
  tx_status: string;
  timestamp: string;
  tipper_fid: number;
  tipper_username: string;
  tipper_wallet: string;
  recipient_fid: number;
  recipient_username: string;
  recipient_wallet: string;
  token_symbol: string;
  token_address: string;
  amount: string;
  amount_wei: string;
  cast_hash: string;
  parent_cast_hash: string;
  block_number: number;
  gas_used: string;
  failure_reason: string;
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
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showMontipWallet, setShowMontipWallet] = useState(false);
  const [activePage, setActivePage] = useState<'home' | 'profile'>('home');
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const fid = context?.user?.fid;
  const username = context?.user?.username || "-";
  const pfpurl = context?.user?.pfpUrl || " ";


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

  // Tip history state
  const [historyMode, setHistoryMode] = useState<'tipper' | 'earner'>('tipper');
  const [tipHistory, setTipHistory] = useState<TipTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Add state for total tipped/earned
  const [totalTipped, setTotalTipped] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  // Add state for per-token totals
  const [tippedTokens, setTippedTokens] = useState<{ [symbol: string]: number }>({});
  const [earnedTokens, setEarnedTokens] = useState<{ [symbol: string]: number }>({});

  // Separate state for tipper and earner histories and totals
  const [tipperHistory, setTipperHistory] = useState<TipTransaction[]>([]);
  const [earnerHistory, setEarnerHistory] = useState<TipTransaction[]>([]);
  const [tipperTotal, setTipperTotal] = useState(0);
  const [earnerTotal, setEarnerTotal] = useState(0);
  const [tipperTokens, setTipperTokens] = useState<{ [symbol: string]: number }>({});
  const [earnerTokens, setEarnerTokens] = useState<{ [symbol: string]: number }>({});

  const { actions } = useFrame();
  const { shareStats } = useShareStats();

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

  // Effect to fetch balances when home page is active
  useEffect(() => {
    if (activePage === 'home' && walletAddress) {
      if (isConnected && address) {
        fetchAllBalances(walletAddress, address);
      } else {
        fetchAllBalances(walletAddress);
      }
    }
  }, [activePage, walletAddress, isConnected, address]);

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

  // Fetch both histories and totals when profile tab becomes active
  useEffect(() => {
    if (activePage !== 'profile') return;
    setHistoryLoading(true);
    setHistoryError(null);
    // Fetch tipper
    fetch(`/api/history?fid=${fid}&mode=tipper`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTipperHistory(data);
          let sum = 0;
          const tokenMap: { [symbol: string]: number } = {};
          data.forEach(tx => {
            const amt = parseFloat(tx.amount || 0);
            sum += amt;
            if (tx.token_symbol) {
              tokenMap[tx.token_symbol] = (tokenMap[tx.token_symbol] || 0) + amt;
            }
          });
          setTipperTotal(sum);
          setTipperTokens(tokenMap);
        } else {
          setTipperHistory([]);
          setTipperTotal(0);
          setTipperTokens({});
        }
      })
      .catch(() => {
        setTipperHistory([]);
        setTipperTotal(0);
        setTipperTokens({});
      });
    // Fetch earner
    fetch(`/api/history?fid=${fid}&mode=earner`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEarnerHistory(data);
          let sum = 0;
          const tokenMap: { [symbol: string]: number } = {};
          data.forEach(tx => {
            const amt = parseFloat(tx.amount || 0);
            sum += amt;
            if (tx.token_symbol) {
              tokenMap[tx.token_symbol] = (tokenMap[tx.token_symbol] || 0) + amt;
            }
          });
          setEarnerTotal(sum);
          setEarnerTokens(tokenMap);
        } else {
          setEarnerHistory([]);
          setEarnerTotal(0);
          setEarnerTokens({});
        }
      })
      .catch(() => {
        setEarnerHistory([]);
        setEarnerTotal(0);
        setEarnerTokens({});
      })
      .finally(() => setHistoryLoading(false));
    // Default to tipper mode
    setHistoryMode('tipper');
  }, [activePage, fid]);

  // On history tab switch, always re-fetch and update relevant history and totals
  useEffect(() => {
    if (activePage !== 'profile') return;
    setHistoryLoading(true);
    setHistoryError(null);
    fetch(`/api/history?fid=${fid}&mode=${historyMode}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (historyMode === 'tipper') {
            setTipperHistory(data);
            let sum = 0;
            const tokenMap: { [symbol: string]: number } = {};
            data.forEach(tx => {
              const amt = parseFloat(tx.amount || 0);
              sum += amt;
              if (tx.token_symbol) {
                tokenMap[tx.token_symbol] = (tokenMap[tx.token_symbol] || 0) + amt;
              }
            });
            setTipperTotal(sum);
            setTipperTokens(tokenMap);
          } else {
            setEarnerHistory(data);
            let sum = 0;
            const tokenMap: { [symbol: string]: number } = {};
            data.forEach(tx => {
              const amt = parseFloat(tx.amount || 0);
              sum += amt;
              if (tx.token_symbol) {
                tokenMap[tx.token_symbol] = (tokenMap[tx.token_symbol] || 0) + amt;
              }
            });
            setEarnerTotal(sum);
            setEarnerTokens(tokenMap);
          }
        } else {
          if (historyMode === 'tipper') {
            setTipperHistory([]);
            setTipperTotal(0);
            setTipperTokens({});
          } else {
            setEarnerHistory([]);
            setEarnerTotal(0);
            setEarnerTokens({});
          }
        }
      })
      .catch(() => {
        if (historyMode === 'tipper') {
          setTipperHistory([]);
          setTipperTotal(0);
          setTipperTokens({});
        } else {
          setEarnerHistory([]);
          setEarnerTotal(0);
          setEarnerTokens({});
        }
      })
      .finally(() => setHistoryLoading(false));
  }, [historyMode, activePage, fid]);

  // For rendering, always show both tipper and earner totals/tokens, but only one history
  // (currentHistory, currentTotal, currentTokens are still used for the history list)
  const currentHistory = historyMode === 'tipper' ? tipperHistory : earnerHistory;
  const currentTotal = historyMode === 'tipper' ? tipperTotal : earnerTotal;
  const currentTokens = historyMode === 'tipper' ? tipperTokens : earnerTokens;

  // Share functionality is now handled by useShareStats hook

  // No custom splash logic; rely on Warpcast SDK splash
  if (loading) return null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#5b4dcf] to-[#a280ff] flex flex-col items-center pb-24">
      <SplashScreen />
      
      {/* Top bar: conditional rendering for Home and Profile */}
      <div className="w-full flex flex-row items-center justify-between pt-6 pb-2 px-4">
        {activePage === 'home' ? (
          <>
            <span className="text-white font-extrabold text-xl tracking-widest uppercase mb-1">MONTIP</span>
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
          </>
        ) : activePage === 'profile' ? (
          <>
            <div className="flex flex-row items-center space-x-3">
              {pfpurl && (
                <img src={pfpurl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              )}
              <div className="flex flex-col">
                <span className="text-lg text-white font-bold tracking-wide font-sans">@{username}</span>
                <span className="text-sm text-indigo-100 font-medium">FID: {fid ?? "-"}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-lg px-4 flex-1 flex flex-col justify-start items-center space-y-4 py-4">
        {activePage === 'home' && (
          <>
            {/* About Montip Section */}
            {walletAddress && (
              <div className="w-full mb-4 bg-gradient-to-r from-white/15 to-white/10 border border-white/25 rounded-2xl p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg">💡</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">About Montip</h3>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                  Montip lets you tip your favorite Farcaster users with any Monad token! Your tips are stored on-chain
                </p>
                <div className="bg-white/10 rounded-xl p-3 mb-3">
                  <h4 className="text-white font-semibold text-sm mb-2">🚀 How to get started:</h4>
                  <ul className="text-white/80 text-xs space-y-1">
                    <li>• Deposit tokens to your Montip wallet</li>
                    <li>• Reply to any cast with &quot;!montip tip amount token&quot;</li>
                    <li>• Check your profile to see tip stats and history</li>
                    <li>• For more details, click help button</li>

                  </ul>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-200 text-xs font-medium">
                    <span className="mr-1">⚡</span>
                    Onchain tips, onchain flex
                  </span>
                </div>
              </div>
            )}

            {/* Montip Wallet Section - Collapsible */}
            {walletAddress && (
              <div className="w-full">
                <button
                  onClick={() => {
                    setShowMontipWallet(!showMontipWallet);
                    if (!showMontipWallet) {
                      if (isConnected && address) {
                        fetchAllBalances(walletAddress, address);
                      } else {
                        fetchAllBalances(walletAddress);
                      }
                    }
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-lg flex justify-between items-center"
                >
                  <span>Montip Wallet</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${showMontipWallet ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMontipWallet && (
                  <div className="mt-2 bg-white/20 border border-white/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between bg-white/20 rounded-xl px-4 py-2 mb-4">
                      <span className="font-bold text-white mr-2">Wallet Address</span>
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
                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
                      <div className="text-lg font-bold text-gray-700 mb-2 text-center">Tokens</div>
                      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                  </div>
                )}
              </div>
            )}

            {/* Deposit Section */}
            <div className="w-full">
              <button
                onClick={() => setShowDeposit(!showDeposit)}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-lg flex justify-between items-center"
              >
                <span>Deposit</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${showDeposit ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDeposit && (
                <div className="mt-2 bg-white/20 border border-white/30 shadow-xl rounded-2xl p-4">
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
                          {depositError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Withdraw Section */}
            <div className="w-full">
              <button
                onClick={() => setShowWithdraw(!showWithdraw)}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-lg flex justify-between items-center"
              >
                <span>Withdraw</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${showWithdraw ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showWithdraw && (
                <div className="mt-2 bg-white/20 border border-white/30 shadow-xl rounded-2xl p-4">
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
                          {withdrawError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activePage === 'profile' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Totals section header */}
            <div className="w-full max-w-lg mx-auto mt-4 mb-1 flex items-center justify-between">
              <span className="block text-lg font-bold text-white/80 pl-2">Total</span>
              {/* Share/Cast Icon */}
              {actions && (
                <button
                  title="Share your Montip stats on Farcaster"
                  className="text-white hover:text-yellow-300 transition-colors p-2 rounded-full"
                  onClick={() => shareStats({ tipperTotal, earnerTotal, tipperTokens, earnerTokens })}
                >
                  <FaShareAlt size={22} />
                </button>
              )}
            </div>
            <div className="w-full max-w-lg mx-auto mb-4 bg-white/10 rounded-2xl p-4">
              <div className="flex flex-row items-center justify-center gap-4">
                {/* Tipped section */}
                <div className="bg-white/20 rounded-xl px-4 py-2 flex flex-col items-center min-w-[140px]">
                  <span className="text-[11px] text-white/80 mb-1">Tipped</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.keys(tipperTokens).length === 0 && <span className="text-xs text-white/40">-</span>}
                    {Object.entries(tipperTokens)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([symbol, amt]) => (
                        <span key={symbol} className="bg-white/20 rounded px-2 py-0.5 text-xs text-white font-mono">
                          {amt.toFixed(4)} {symbol}
                        </span>
                      ))}
                  </div>
                </div>
                {/* Earned section */}
                <div className="bg-white/20 rounded-xl px-4 py-2 flex flex-col items-center min-w-[140px]">
                  <span className="text-[11px] text-white/80 mb-1">Earned</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.keys(earnerTokens).length === 0 && <span className="text-xs text-white/40">-</span>}
                    {Object.entries(earnerTokens)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([symbol, amt]) => (
                        <span key={symbol} className="bg-white/20 rounded px-2 py-0.5 text-xs text-white font-mono">
                          {amt.toFixed(4)} {symbol}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            {/* History section header */}
            <div className="w-full max-w-lg mx-auto mt-4 mb-1">
              <span className="block text-lg font-bold text-white/80 pl-2">History</span>
            </div>
            {/* Tip History Section */}
            {fid && (
              <div className="w-full max-w-lg mx-auto mt-4 bg-white/10 rounded-2xl p-4">
                <div className="flex justify-center mb-4 space-x-2">
                  <button
                    className={`px-4 py-2 rounded-full font-bold text-sm ${historyMode === 'tipper' ? 'bg-white text-purple-700' : 'bg-purple-700 text-white border border-white/30'}`}
                    onClick={() => setHistoryMode('tipper')}
                  >
                    Tipped
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full font-bold text-sm ${historyMode === 'earner' ? 'bg-white text-purple-700' : 'bg-purple-700 text-white border border-white/30'}`}
                    onClick={() => setHistoryMode('earner')}
                  >
                    Earned
                  </button>
                </div>
                {historyLoading ? (
                  <div className="text-white text-center">Loading...</div>
                ) : historyError ? (
                  <div className="text-red-300 text-center">{historyError}</div>
                ) : currentHistory.length === 0 ? (
                  <div className="text-white text-center">No history found.</div>
                ) : (
                  <ul className="space-y-3 overflow-y-auto" style={{ maxHeight: '320px', minHeight: '80px' }}>
                    {currentHistory.map(tx => (
                      <li key={tx.id} className="bg-white/20 rounded-lg px-4 py-3 flex flex-col">
                        <span className="font-bold text-white text-sm">
                          {historyMode === 'tipper'
                            ? `You tipped @${tx.recipient_username || 'unknown'} ${tx.amount} ${tx.token_symbol}`
                            : `You received ${tx.amount} ${tx.token_symbol} from @${tx.tipper_username || 'unknown'}`}
                        </span>
                        <span className="text-xs text-indigo-100 mt-1">
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : ''}
                        </span>
                        <span className={`text-xs mt-1 ${tx.tx_status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                          {tx.tx_status}
                        </span>
                        {tx.failure_reason && (
                          <span className="text-xs text-red-200 mt-1">{tx.failure_reason}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
      
      {/* Bottom Navigation */}
      <div className="w-full bg-white/10 backdrop-blur-lg border-t border-white/20 fixed bottom-0 left-0 right-0">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-around items-center">
          <button
            onClick={() => setActivePage('home')}
            className={`flex flex-col items-center space-y-1 ${activePage === 'home' ? 'text-white' : 'text-white/60'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActivePage('profile')}
            className={`flex flex-col items-center space-y-1 ${activePage === 'profile' ? 'text-white' : 'text-white/60'}`}
          >
            {pfpurl ? (
              <img 
                src={pfpurl} 
                alt="Profile" 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      <HelpButton />
    </div>
  );
}

