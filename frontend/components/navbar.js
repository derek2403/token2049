"use client"

import Link from "next/link"
import { useRouter } from "next/router"
import { Menu, Home, Calendar, Ticket, MessageSquare, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ConnectButton } from "@/components/connect-button"

// Navigation links for the app with Lucide icons
const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Chat", href: "/chat", icon: MessageSquare },
]

/**
 * Navbar Component
 * Sticky navigation bar with wallet connection and mobile menu
 * Includes responsive design for mobile and desktop views
 */
export function Navbar() {
  const router = useRouter()
  const pathname = router.pathname
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-neutral-300 hover:text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-neutral-900 border-neutral-800">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-lg text-white">
                  NL Transactions
                </span>
              </div>
              {/* Mobile navigation links */}
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 text-base font-medium transition-colors hover:text-blue-400 ${
                        pathname === link.href ? "text-white" : "text-neutral-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  );
                })}
                <div className="mt-6 pt-6 border-t border-neutral-800">
                  <ConnectButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-xl text-white">
              NL Transactions
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-400 ${
                  pathname === link.href
                    ? "text-white"
                    : "text-neutral-400"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
          
          <div className="flex items-center gap-3">
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  )
}

