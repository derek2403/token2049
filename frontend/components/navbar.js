"use client"

import Link from "next/link"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ConnectButton } from "@/components/connect-button"

// Navigation links for the app
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Chat", href: "/chat" },
  { name: "Balance", href: "/balance" },
]

/**
 * Navbar Component
 * Sticky navigation bar with wallet connection and mobile menu
 * Includes responsive design for mobile and desktop views
 */
export function Navbar() {
  const router = useRouter()
  const [pathname, setPathname] = useState("")
  
  // Set pathname on client side only to prevent hydration errors
  useEffect(() => {
    setPathname(router.pathname)
  }, [router.pathname])
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-black/90 backdrop-blur-md supports-[backdrop-filter]:bg-black/70">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
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
                  Token2049
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
                <div className="mt-6 pt-6 border-t border-neutral-800/50">
                  <ConnectButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="font-bold text-xl text-neutral-100">
              Token2049
            </span>
          </Link>
        </div>
        
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
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  )
}

