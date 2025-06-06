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
  const [activeMainTab, setActiveMainTab] = useState<'wallet' | 'settings'>('wallet');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'deposit' | 'withdraw'>('deposit');
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

  // Helper to fetch balances from the route API
  const fetchAllBalances = async (montipAddress: string, loginAddress?: string) => {
    // Helper to fetch balances from the route API
    async function fetchBalances(address: string) {
      const response = await fetch("/api/get-balances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      return response.json();
    }

    // Fetch Montip wallet balances
    const montipData = await fetchBalances(montipAddress);
    // Fetch login wallet balances if provided
    let loginData = null;
    if (loginAddress) {
      loginData = await fetchBalances(loginAddress);
    }

    // Parse balances for both wallets
    const montip: Record<string, string> = {};
    const login: Record<string, string> = {};

    // Helper to parse token balances
    function parseTokenBalances(tokensArr: any[], target: Record<string, string>) {
      for (const tokenObj of tokensArr) {
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
        target[symbol] = value;
      }
    }

    if (montipData?.data?.tokens) {
      parseTokenBalances(montipData.data.tokens, montip);
    }
    if (loginData?.data?.tokens) {
      parseTokenBalances(loginData.data.tokens, login);
    }

    setMontipBalances(montip);
    setLoginWalletBalances(login);
  };

  // After wallet connect, fetch both
  useEffect(() => {
    if (!walletAddress) return;
    if (!isConnected || !address) return;
    // Only trigger for manual wallet connect
    fetchAllBalances(walletAddress, address);
  }, [isConnected, address]); // Only depend on connection changes

  // On Wallet tab, always fetch both if connected
  useEffect(() => {
    if (activeMainTab === 'wallet' && walletAddress) {
      if (isConnected && address) {
        fetchAllBalances(walletAddress, address);
      } else {
        fetchAllBalances(walletAddress);
      }
    }
  }, [activeMainTab, walletAddress, isConnected, address]);

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
    if (isConnected && address) {
      fetchAllBalances(walletAddress, address).finally(() => setPolling(false));
    } else {
      fetchAllBalances(walletAddress).finally(() => setPolling(false));
    }
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
        // Wallet tab effect will handle the balance fetch
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
    console.log("[DEBUG] Deposit token object:", depositToken);
    console.log("[DEBUG] Deposit amount:", depositAmount);
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
          console.log("[DEBUG] Sending native MON deposit", { to: walletAddress, value: depositAmount });
          sendTransaction({
            to: walletAddress as `0x${string}`,
            value: parseEther(depositAmount),
            gas: BigInt(25000),
          });
        } catch (err: any) {
          console.error("[DEBUG] MON deposit error:", err);
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
            console.log("[DEBUG] ERC20 deposit contract address:", checksummedAddress);
            const amountWei = parseUnits(depositAmount, depositToken.decimals);
            console.log("[DEBUG] ERC20 deposit amount (wei):", amountWei.toString());
            const tx = await writeContractAsync({
              address: checksummedAddress,
              abi: erc20Abi,
              functionName: "transfer",
              args: [walletAddress as `0x${string}`, amountWei]
            });
            console.log("[DEBUG] ERC20 deposit tx hash:", tx);
            if (tx) {
              await publicClient.waitForTransactionReceipt({ hash: tx });
              setDepositSuccess("Deposit successful!");
              refreshBalances();
            }
          } catch (err: any) {
            console.error("[DEBUG] ERC20 deposit error:", err);
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
      console.error("[DEBUG] Deposit outer error:", err);
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
    console.log("[DEBUG] Withdraw token object:", withdrawToken);
    console.log("[DEBUG] Withdraw amount:", withdrawAmount);
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
      console.log("[DEBUG] Withdraw recipient address:", toAddr);
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
      console.log("[DEBUG] Withdraw backend response:", data);
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
        // Wait for transaction confirmation before refreshing balances
        try {
          await publicClient.waitForTransactionReceipt({ hash: data.txHash });
          refreshBalances();
        } catch (e) {
          // Optionally handle error
        }
      }
    } catch (err: any) {
      console.error("[DEBUG] Withdraw error:", err);
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

      {/* Top bar: product name, username, fid left; wallet right in Settings tab */}
      <div className="w-full flex flex-row items-center justify-between pt-6 pb-2 px-4">
        <div className="flex flex-col items-start">
          <span className="text-white font-extrabold text-xl tracking-widest uppercase mb-1">MONTIP</span>
          {/* Show smaller username and FID in top-right corner of Wallet tab */}
          {activeMainTab === 'wallet' && (
            <div className="absolute top-4 right-4 flex flex-col items-end">
              <div className="text-base text-white font-semibold tracking-wide font-sans">@{username}</div>
              <div className="text-xs text-indigo-100 font-medium">FID: {fid ?? "-"}</div>
            </div>
          )}
        </div>
        {/* Show Connect Wallet or address/disconnect in Settings tab top right */}
        {activeMainTab === 'settings' && (
          !isConnected ? (
            <button
              onClick={() => connect({ connector: farcasterFrame() })}
              className="bg-white text-black px-4 py-1 rounded text-sm hover:bg-white/90"
            >
              Connect Wallet
            </button>
          ) : (
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
          )
        )}
      </div>

      {/* Info message for wallet tab: what Montip does and how to use it */}
      {activeMainTab === 'wallet' && (
        <div className="w-full flex flex-col items-center mt-2 mb-4 px-6">
          <div className="bg-white/10 text-white text-center text-base rounded-xl px-4 py-3 max-w-xl shadow-sm">
            To tip, reply to any cast with <span className="font-mono bg-white/20 px-1 rounded">!montip tip 1 mon</span> to instantly send MON to that user. For more details, tap on
            <span className="inline-block align-middle ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline w-5 h-5 text-white/80">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor" fontFamily="monospace" fontWeight="bold">?</text>
              </svg>
            </span>
            .
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-lg px-4 flex-1 flex flex-col justify-center items-center pb-20">
        {activeMainTab === 'wallet' && (
          <>
            {/* Tokens List Block - restore vertical scroll */}
            <div className="flex flex-col flex-1 w-full max-w-lg">
              {walletAddress && (
                <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 w-full flex-1 flex flex-col mt-08">
                  {/* Improved Montip Wallet address and copy button as header */}
                  <div className="flex items-center justify-between mb-4 bg-indigo-50 rounded-xl px-3 py-2" style={{ boxShadow: '0 1px 4px 0 rgba(80,80,180,0.06)' }}>
                    <span className="font-bold text-indigo-700 mr-2">Montip Wallet</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-700">{shortenAddress(walletAddress)}</span>
                      <button
                        onClick={handleCopy}
                        className="text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded p-1 border border-indigo-200"
                        title={copied ? "Copied!" : "Copy address"}
                        style={{ transition: 'background 0.2s' }}
                      >
                        {copied ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M5.07 19A9 9 0 1 1 21 12.93" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {Object.entries(montipBalances).map(([symbol, balance], idx, arr) => (
                      <div
                        key={symbol}
                        className={`flex flex-row items-center justify-between px-2 py-3 ${idx < arr.length - 1 ? 'border-b border-gray-200' : ''
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

        {activeMainTab === 'settings' && (
          <div className="w-full flex flex-col items-center">
            {/* Settings Tab Navigation - always at the very top, separated from the card */}
            <div className="flex space-x-2 bg-white/10 rounded-lg p-1 mb-4 w-full max-w-[370px]">
              {(['deposit', 'withdraw'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSettingsTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeSettingsTab === tab
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/10'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {/* Card content always below tab navigation, never affects tab position */}
            <div className="bg-white/20 border border-white/30 shadow-xl rounded-2xl p-4 w-full max-w-[370px] flex flex-col items-center justify-start" style={{ minHeight: '420px' }}>
              <div className="w-full">
                {/* Connect wallet button below tab navigation if not connected, always show info text below */}
                {!isConnected && (
                  <div className="flex flex-col items-center justify-center w-full h-full min-h-[320px] flex-1">
                    <button
                      onClick={() => connect({ connector: farcasterFrame() })}
                      className="bg-white text-black px-6 py-2 rounded text-lg font-bold hover:bg-white/90 mb-3"
                    >
                      Connect Wallet
                    </button>
                    <div className="text-white text-center text-sm">Connect your login wallet to manage tokens.</div>
                  </div>
                )}
                {isConnected && (
                  <>
                    {activeSettingsTab === 'deposit' && (
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
                        <div className="w-full mb-2 text-right text-xs text-white/80 flex items-center justify-end gap-1">
                          <span>
                            Balance: {loginWalletBalances[depositToken.symbol] ? Number(loginWalletBalances[depositToken.symbol]).toFixed(4) : '0.0000'} {depositToken.symbol}
                          </span>
                          <button
                            type="button"
                            onClick={handleUpdateBalances}
                            title="Refresh balance"
                            style={{ padding: 0, marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', height: 18 }}
                            className={`hover:opacity-80 focus:outline-none ${polling ? 'animate-spin' : ''}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.65 6.35A8 8 0 1 0 19 12h-1.5" />
                              <polyline points="19 4 19 12 11 12" />
                            </svg>
                          </button>
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
                            onClick={() => {
                              const bal = loginWalletBalances[depositToken.symbol] ? Number(loginWalletBalances[depositToken.symbol]) : 0;
                              if (depositToken.symbol === "MON") {
                                setDepositAmount(bal > 0.002 ? (bal - 0.002).toFixed(4) : "0");
                              } else {
                                setDepositAmount(bal.toFixed(4));
                              }
                            }}
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

                    {activeSettingsTab === 'withdraw' && (
                      <>
                        <div className="w-full mb-4">
                          <div className="text-xs text-white/80 mb-1">From your Montip wallet:</div>
                          <span className="block font-mono text-xs text-white bg-black/20 rounded px-2 py-1 break-all w-full">{walletAddress}</span>
                        </div>
                        <div className="w-full mb-4">
                          <div className="text-xs text-white/80 mb-1">Send to login wallet:</div>
                          <span className="block font-mono text-xs text-white bg-black/20 rounded px-2 py-1 break-all">
                            {address || "-"}
                          </span>
                        </div>
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
                        <div className="w-full mb-2 text-right text-xs text-white/80 flex items-center justify-end gap-1">
                          <span>
                            Balance: {montipBalances[withdrawToken.symbol] ? Number(montipBalances[withdrawToken.symbol]).toFixed(4) : '0.0000'} {withdrawToken.symbol}
                          </span>
                          <button
                            type="button"
                            onClick={handleUpdateBalances}
                            title="Refresh balance"
                            style={{ padding: 0, marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', height: 18 }}
                            className={`hover:opacity-80 focus:outline-none ${polling ? 'animate-spin' : ''}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.65 6.35A8 8 0 1 0 19 12h-1.5" />
                              <polyline points="19 4 19 12 11 12" />
                            </svg>
                          </button>
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
                                setWithdrawAmount(bal > 0.0081 ? (bal - 0.0081).toFixed(4) : "0");
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setActiveMainTab('wallet')}
              className={`flex flex-col items-center ${activeMainTab === 'wallet' ? 'text-white' : 'text-white/60'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </button>
            <button
              onClick={() => setActiveMainTab('settings')}
              className={`flex flex-col items-center ${activeMainTab === 'settings' ? 'text-white' : 'text-white/60'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <HelpButton />
    </div>
  );
}
