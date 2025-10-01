"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Menu, Wallet, Copy, Check, Loader2 } from "lucide-react"
import { useAccount, useReadContract, useChainId } from "wagmi"
import { formatUnits } from "viem"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ConnectButton } from "@/components/connect-button"

// Navigation links for the app
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Chat", href: "/chat" },
]

// Token contract addresses for Celo Alfajores (testnet) and Mainnet
// Replace these with actual contract addresses for your network
const TOKEN_ADDRESSES = {
  // Celo Alfajores (testnet - chainId: 44787)
  44787: {
    USDC: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B", // Alfajores USDC
    USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", // Alfajores USDT
    cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // Alfajores cUSD (native stablecoin)
  },
  // Celo Mainnet (chainId: 42220)
  42220: {
    USDC: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a", // Mainnet USDC
    USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", // Mainnet USDT
    cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Mainnet cUSD
  },
}

// ERC20 ABI - just the balanceOf function we need
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]

/**
 * Navbar Component
 * Sticky navigation bar with wallet connection and mobile menu
 * Includes responsive design for mobile and desktop views
 */
export function Navbar() {
  const router = useRouter()
  const [pathname, setPathname] = useState("")
  const [isBalanceOpen, setIsBalanceOpen] = useState(false) // Balance modal state
  const [copiedAddress, setCopiedAddress] = useState(false) // Track if address was copied
  
  // Get wallet connection info
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  // Get token addresses for current chain
  const tokenAddresses = TOKEN_ADDRESSES[chainId] || TOKEN_ADDRESSES[44787] // Default to Alfajores
  
  // Fetch USDC balance
  const { data: usdcBalance } = useReadContract({
    address: tokenAddresses.USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address && isConnected,
  })
  
  // Fetch USDT balance
  const { data: usdtBalance } = useReadContract({
    address: tokenAddresses.USDT,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address && isConnected,
  })
  
  // Fetch cUSD balance
  const { data: cusdBalance } = useReadContract({
    address: tokenAddresses.cUSD,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address && isConnected,
  })
  
  // Format balances (tokens typically have 18 decimals, USDC/USDT may have 6)
  const formatBalance = (balance, decimals = 18) => {
    if (!balance) return "0.00"
    try {
      const formatted = formatUnits(balance, decimals)
      return parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    } catch {
      return "0.00"
    }
  }
  
  // Prepare user data with actual wallet info
  const userData = {
    name: chainId === 42220 ? "Celo Mainnet" : "Celo Alfajores",
    phone: "+1 (234) 567-8900", // You can make this editable or remove it
    address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected",
    fullAddress: address || "",
    balances: {
      USDC: formatBalance(usdcBalance, 6), // USDC typically has 6 decimals
      USDT: formatBalance(usdtBalance, 6), // USDT typically has 6 decimals
      cUSD: formatBalance(cusdBalance, 18), // cUSD has 18 decimals
    }
  }
  
  // Calculate total balance
  const calculateTotal = () => {
    try {
      const usdc = parseFloat(userData.balances.USDC.replace(/,/g, '')) || 0
      const usdt = parseFloat(userData.balances.USDT.replace(/,/g, '')) || 0
      const cusd = parseFloat(userData.balances.cUSD.replace(/,/g, '')) || 0
      return (usdc + usdt + cusd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    } catch {
      return "0.00"
    }
  }
  
  // Set pathname on client side only to prevent hydration errors
  useEffect(() => {
    setPathname(router.pathname)
  }, [router.pathname])
  
  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (userData.fullAddress) {
      navigator.clipboard.writeText(userData.fullAddress)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000) // Reset after 2 seconds
    }
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-black/90 backdrop-blur-md supports-[backdrop-filter]:bg-black/70">
      <div className="container flex h-14 md:h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-neutral-950 border-neutral-800/50">
              <div className="flex items-center gap-2 mb-8">
                <span className="font-bold text-lg text-neutral-100">
                  LeftAI
                </span>
              </div>
              {/* Mobile navigation links */}
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-base font-medium transition-colors px-3 py-2 rounded-lg ${
                      pathname === link.href 
                        ? "text-neutral-100 bg-neutral-800/50" 
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Mobile balance and wallet section */}
                <div className="mt-6 pt-6 border-t border-neutral-800/50 space-y-3">
                  <div className="px-3">
                    {/* Balance button for mobile - Only show when connected */}
                    {isConnected && (
                      <Button 
                        variant="outline"
                        onClick={() => setIsBalanceOpen(true)}
                        className="w-full bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white mb-3"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        View Balance
                      </Button>
                    )}
                    <ConnectButton />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="font-bold text-xl text-neutral-100">
              LeftAI
            </span>
          </Link>
        </div>
        
        {/* Mobile Balance Button - Visible on top right - Only show when connected */}
        {isConnected && (
          <div className="md:hidden">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsBalanceOpen(true)}
              className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <Wallet className="h-4 w-4 mr-1" />
              Balance
            </Button>
          </div>
        )}
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex items-center gap-3">
            {/* Balance button for desktop - Only show when connected */}
            {isConnected && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsBalanceOpen(true)}
                className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Balance
              </Button>
            )}
            <ConnectButton />
          </div>
        </nav>
      </div>
      
      {/* Balance Modal - Compact for mobile, comfortable for desktop */}
      <Dialog open={isBalanceOpen} onOpenChange={setIsBalanceOpen}>
        <DialogContent className="sm:max-w-md w-[92vw] mx-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Account Balance</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View your wallet information and token balances
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 py-2">
            {/* User Information Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                User Information
              </h3>
              
              {/* Name */}
              <div className="flex items-center justify-between p-2 sm:p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                <span className="text-xs sm:text-sm text-neutral-400">Name</span>
                <span className="text-xs sm:text-sm font-medium text-neutral-100">{userData.name}</span>
              </div>
              
              {/* Phone */}
              <div className="flex items-center justify-between p-2 sm:p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                <span className="text-xs sm:text-sm text-neutral-400">Phone</span>
                <span className="text-xs sm:text-sm font-medium text-neutral-100">{userData.phone}</span>
              </div>
              
              {/* Wallet Address with Copy Button */}
              <div className="flex items-center justify-between p-2 sm:p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                <span className="text-xs sm:text-sm text-neutral-400">Wallet</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-100 font-mono">{userData.address}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 hover:bg-neutral-700"
                  >
                    {copiedAddress ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-neutral-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Token Balances Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                Token Balances
              </h3>
              
              {/* USDC Balance */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-neutral-800/80 rounded-xl border-2 border-neutral-700 shadow-lg hover:bg-neutral-800 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-600 shadow-md">
                    <Image 
                      src="/logos/usd-coin-usdc-logo.svg"
                      alt="USDC"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-neutral-50">USDC</p>
                    <p className="text-[10px] sm:text-xs text-neutral-400">USD Coin</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base sm:text-xl font-bold text-neutral-50">${userData.balances.USDC}</p>
                </div>
              </div>
              
              {/* USDT Balance */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-neutral-800/80 rounded-xl border-2 border-neutral-700 shadow-lg hover:bg-neutral-800 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-600 shadow-md">
                    <Image 
                      src="/logos/USDT_Logo.png"
                      alt="USDT"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-neutral-50">USDT</p>
                    <p className="text-[10px] sm:text-xs text-neutral-400">Tether USD</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base sm:text-xl font-bold text-neutral-50">${userData.balances.USDT}</p>
                </div>
              </div>
              
              {/* cUSD Balance */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-neutral-800/80 rounded-xl border-2 border-neutral-700 shadow-lg hover:bg-neutral-800 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-600 shadow-md">
                    <Image 
                      src="/logos/cUSD.png"
                      alt="cUSD"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-neutral-50">cUSD</p>
                    <p className="text-[10px] sm:text-xs text-neutral-400">Celo Dollar</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base sm:text-xl font-bold text-neutral-50">${userData.balances.cUSD}</p>
                </div>
              </div>
            </div>
            
            {/* Total Balance */}
            <div className="pt-2 sm:pt-3 border-t border-neutral-700">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-neutral-800/80 rounded-lg">
                <span className="text-sm sm:text-base font-medium text-neutral-300">Total Balance</span>
                <span className="text-lg sm:text-xl font-bold text-neutral-100">
                  ${calculateTotal()}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

