"use client";

import { useAccount, useBalance } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Celo token contract addresses on mainnet
const cUSD_ADDRESS = "0x765de816845861e75a25fca122bb6898b8b1282a";
const USDC_ADDRESS = "0x01C5C0122039549AD1493B8220cABEdD739BC44E";
const USDT_ADDRESS = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e";

/**
 * Display balance for a specific token
 * Shows loading state and formats the balance to 4 decimal places
 */
function BalanceDisplay({ address, token, symbol }) {
  const { data, isLoading } = useBalance({
    address,
    token,
  });

  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-400">{symbol}</span>
      <span className="font-medium text-neutral-200">
        {isLoading ? "Loading..." : `${parseFloat(data?.formatted || '0').toFixed(4)}`}
      </span>
    </div>
  );
}

/**
 * User Balance Component
 * Displays wallet address and token balances when wallet is connected
 * Shows CELO, cUSD, USDC, and USDT balances
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
        <CardTitle className="text-lg font-medium text-neutral-200">Connected Wallet</CardTitle>
        <p className="text-sm text-neutral-400 truncate pt-1">{address}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <BalanceDisplay address={address} symbol="CELO" token={undefined} />
          <BalanceDisplay address={address} token={cUSD_ADDRESS} symbol="cUSD" />
          <BalanceDisplay address={address} token={USDC_ADDRESS} symbol="USDC" />
          <BalanceDisplay address={address} token={USDT_ADDRESS} symbol="USDT" />
        </div>
      </CardContent>
    </Card>
  );
}

