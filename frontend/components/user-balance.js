"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Celo token contract addresses on mainnet
const TOKENS = {
  CELO: { address: null, symbol: "CELO", decimals: 18 },
  USDC: { address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", symbol: "USDC", decimals: 6 },
  cUSD: { address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", symbol: "cUSD", decimals: 18 },
  USDT: { address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", symbol: "USDT", decimals: 6 },
};

/**
 * Fetch balance from Celoscan API
 */
async function fetchBalanceFromExplorer(address, tokenAddress = null) {
  try {
    const baseUrl = "https://api.celoscan.io/api";
    
    if (!tokenAddress) {
      // Get native CELO balance
      const response = await fetch(
        `${baseUrl}?module=account&action=balance&address=${address}&tag=latest`
      );
      const data = await response.json();
      
      if (data.status === "1" && data.result) {
        return (parseFloat(data.result) / 1e18).toFixed(4); // Convert from wei
      }
    } else {
      // Get ERC20 token balance
      const response = await fetch(
        `${baseUrl}?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}&tag=latest`
      );
      const data = await response.json();
      
      if (data.status === "1" && data.result) {
        return data.result;
      }
    }
    
    return "0.0000";
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0.0000";
  }
}

/**
 * Display balance for a specific token
 */
function BalanceDisplay({ address, tokenAddress, symbol, decimals }) {
  const [balance, setBalance] = useState("Loading...");

  useEffect(() => {
    async function loadBalance() {
      const rawBalance = await fetchBalanceFromExplorer(address, tokenAddress);
      
      if (rawBalance !== "Loading...") {
        // Convert from smallest unit based on decimals
        const formatted = decimals === 6 
          ? (parseFloat(rawBalance) / 1e6).toFixed(4)
          : (parseFloat(rawBalance) / 1e18).toFixed(4);
        setBalance(formatted);
      }
    }
    
    loadBalance();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadBalance, 10000);
    return () => clearInterval(interval);
  }, [address, tokenAddress, decimals]);

  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-400">{symbol}</span>
      <span className="font-medium text-neutral-200">{balance}</span>
    </div>
  );
}

/**
 * User Balance Component
 * Displays wallet address and token balances when wallet is connected
 * Fetches balances from Celoscan API
 */
export function UserBalance() {
  const { address, isConnected } = useAccount();

  // Only show when wallet is connected
  if (!isConnected || !address) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-8 bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-200">Account Balance</CardTitle>
        <div className="pt-2">
          <div className="text-xs text-neutral-500">Wallet</div>
          <p className="text-sm text-neutral-300 font-mono truncate pt-1">{address}</p>
          <a 
            href={`https://celoscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            View on Celoscan →
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <div className="text-xs text-neutral-500 mb-2">Token Balances</div>
          <BalanceDisplay 
            address={address} 
            tokenAddress={TOKENS.USDC.address} 
            symbol={TOKENS.USDC.symbol}
            decimals={TOKENS.USDC.decimals}
          />
          <BalanceDisplay 
            address={address} 
            tokenAddress={TOKENS.USDT.address} 
            symbol={TOKENS.USDT.symbol}
            decimals={TOKENS.USDT.decimals}
          />
          <BalanceDisplay 
            address={address} 
            tokenAddress={TOKENS.cUSD.address} 
            symbol={TOKENS.cUSD.symbol}
            decimals={TOKENS.cUSD.decimals}
          />
          <BalanceDisplay 
            address={address} 
            tokenAddress={TOKENS.CELO.address} 
            symbol={TOKENS.CELO.symbol}
            decimals={TOKENS.CELO.decimals}
          />
        </div>
      </CardContent>
    </Card>
  );
}
