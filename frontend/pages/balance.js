import { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useBalance, useBlockNumber, useChainId } from "wagmi";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  TrendingUp,
  Coins,
  Network,
  Check,
  RefreshCw,
  DollarSign,
  CircleDollarSign,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Celo token contract addresses on mainnet
const TOKENS = {
  cUSD: {
    address: "0x765de816845861e75a25fca122bb6898b8b1282a",
    symbol: "cUSD",
    name: "Celo Dollar",
    icon: DollarSign,
    iconColor: "text-green-400"
  },
  USDC: {
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    symbol: "USDC",
    name: "USD Coin",
    icon: CircleDollarSign,
    iconColor: "text-blue-400"
  },
  USDT: {
    address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    symbol: "USDT",
    name: "Tether USD",
    icon: Banknote,
    iconColor: "text-emerald-400"
  }
};

/**
 * Token Balance Card Component
 * Displays balance for a specific token with loading state
 */
function TokenBalanceCard({ address, token, refreshKey }) {
  const { data, isLoading, refetch } = useBalance({
    address,
    token: token.address,
  });

  // Refetch when refresh is triggered
  useState(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey]);

  const IconComponent = token.icon;
  
  return (
    <Card className="bg-neutral-900/50 border-neutral-800 p-4 hover:border-neutral-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`bg-neutral-800 p-2 rounded-lg ${token.iconColor}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-white font-medium">{token.symbol}</h3>
            <p className="text-xs text-neutral-500">{token.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">
            {isLoading ? "..." : parseFloat(data?.formatted || '0').toFixed(4)}
          </p>
          <p className="text-xs text-neutral-500">{token.symbol}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Native CELO Balance Card
 * Shows the native CELO token balance
 */
function NativeBalanceCard({ address, refreshKey }) {
  const { data, isLoading, refetch } = useBalance({
    address,
  });

  // Refetch when refresh is triggered
  useState(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey]);

  return (
    <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-600/20 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">CELO</h3>
            <p className="text-xs text-green-300">Native Token</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">
            {isLoading ? "..." : parseFloat(data?.formatted || '0').toFixed(4)}
          </p>
          <p className="text-sm text-green-300">CELO</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Balance Page Component
 * Main page showing wallet balances, tokens, and blockchain info
 */
export default function Balance() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Refresh all balances
  const refreshBalances = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Format address for display (shortened)
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get blockchain explorer URL
  const getExplorerUrl = () => {
    if (!address || !chain) return "#";
    const baseUrl = chain.id === 42220 
      ? "https://explorer.celo.org"
      : "https://alfajores.celoscan.io";
    return `${baseUrl}/address/${address}`;
  };

  return (
    <div className="font-sans min-h-screen overflow-x-hidden">
      {/* Main Layout with Spotlight Effect */}
      <div className="min-h-screen w-full flex flex-col bg-black/[0.96] antialiased bg-grid-white/[0.02] relative">
        {/* Navbar */}
        <Navbar />
        
        {/* Spotlight effect - animated background */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto relative z-10 w-full">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-2">
              Account Balance
            </h1>
            <p className="text-xs md:text-sm text-neutral-400">
              View your wallet balances and blockchain information
            </p>
          </motion.div>

          {/* Connection Status & Wallet Info */}
          {isConnected && address ? (
            <>
              {/* Wallet Address Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6"
              >
                <Card className="bg-neutral-900/90 border-neutral-800 p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600/20 p-3 rounded-full">
                        <Wallet className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Connected Wallet</p>
                        <p className="text-white font-mono text-sm md:text-base">{formatAddress(address)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAddress}
                        className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl(), '_blank')}
                        className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Explorer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshBalances}
                        className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Balances Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-5 w-5 text-white" />
                  <h2 className="text-xl font-semibold text-white">Token Balances</h2>
                </div>
                
                {/* Native CELO Balance */}
                <div className="mb-4">
                  <NativeBalanceCard address={address} refreshKey={refreshKey} />
                </div>

                {/* Token Balances Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(TOKENS).map((token) => (
                    <TokenBalanceCard 
                      key={token.symbol} 
                      address={address} 
                      token={token}
                      refreshKey={refreshKey}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Blockchain Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Network className="h-5 w-5 text-white" />
                  <h2 className="text-xl font-semibold text-white">Network Information</h2>
                </div>
                
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Network Name */}
                    <div>
                      <p className="text-xs text-neutral-500 mb-2">Network</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                          {chain?.name || "Unknown"}
                        </Badge>
                      </div>
                    </div>

                    {/* Chain ID */}
                    <div>
                      <p className="text-xs text-neutral-500 mb-2">Chain ID</p>
                      <p className="text-white font-mono">{chainId}</p>
                    </div>

                    {/* Current Block */}
                    <div>
                      <p className="text-xs text-neutral-500 mb-2">Current Block</p>
                      <p className="text-white font-mono">{blockNumber?.toString() || "..."}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-white" />
                  <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                  >
                    Send Tokens
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white"
                  >
                    Swap Tokens
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/chat'}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
                  >
                    AI Chat
                  </Button>
                  <Button
                    onClick={() => window.open(getExplorerUrl(), '_blank')}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white"
                  >
                    View Explorer
                  </Button>
                </div>
              </motion.div>
            </>
          ) : (
            // Not Connected State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex items-center justify-center"
            >
              <Card className="bg-neutral-900/90 border-neutral-800 p-8 text-center max-w-md">
                <div className="bg-neutral-800 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Wallet className="h-10 w-10 text-neutral-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Wallet Not Connected</h2>
                <p className="text-neutral-400 mb-6">
                  Please connect your wallet to view your balances and blockchain information.
                </p>
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                  Use the Connect button in the top navigation
                </Badge>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

