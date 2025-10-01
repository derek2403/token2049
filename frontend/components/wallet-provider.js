"use client";

import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { 
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  trustWallet,
  rainbowWallet
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider, createConfig, http, useConnect } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";

// Configure wallet connectors for RainbowKit
// This sets up the available wallet options for users
// Including mobile-friendly wallets that use WalletConnect
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,      // MetaMask - works on mobile via WalletConnect
        walletConnectWallet, // Generic WalletConnect - supports many mobile wallets
        injectedWallet,      // Browser wallets (desktop extensions)
      ],
    },
    {
      groupName: "More Options",
      wallets: [
        trustWallet,     // Trust Wallet (popular mobile wallet)
        rainbowWallet,   // Rainbow Wallet
      ],
    },
  ],
  {
    appName: "Token2049",
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "YOUR_PROJECT_ID",
  }
);

// Configure Wagmi with Celo networks
// Supports both mainnet (celo) and testnet (celoAlfajores)
const wagmiConfig = createConfig({
  chains: [celo, celoAlfajores],
  connectors,
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
  },
  ssr: true,
});

// Create React Query client for data fetching
const queryClient = new QueryClient();

/**
 * Inner wallet provider that handles MiniPay auto-connect
 * MiniPay is Celo's mobile wallet that auto-connects when detected
 */
function WalletProviderInner({ children }) {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    // Check if the app is running inside MiniPay
    if (typeof window !== "undefined" && window.ethereum && window.ethereum.isMiniPay) {
      // Find the injected connector, which is what MiniPay uses
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    }
  }, [connect, connectors]);

  return <>{children}</>;
}

/**
 * Main WalletProvider component
 * Wraps the app with Web3 providers for Celo blockchain interaction
 */
export function WalletProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  
  // Prevent SSR hydration issues
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletProviderInner>{children}</WalletProviderInner>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

