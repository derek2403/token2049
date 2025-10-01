import { Geist, Geist_Mono } from "next/font/google";
import { Spotlight } from "@/components/ui/spotlight";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { UserBalance } from "@/components/user-balance";
import { Zap } from "lucide-react";

// Font configuration for the app
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Single Page Ticketing Platform Landing Page
 * Integrated with Celo blockchain wallet functionality
 * Everything fits on one screen without scrolling
 */
export default function Home() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans h-screen overflow-hidden`}>
      {/* Single Screen Layout with Spotlight Effect */}
      <div className="h-full w-full flex flex-col bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        {/* Navbar with wallet connection */}
        <Navbar />
        
        {/* Spotlight effect - animated background */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col justify-between p-6 md:p-8 max-w-7xl mx-auto relative z-10 w-full">
          
          {/* Hero Section */}
          <div className="flex-1 flex flex-col items-center justify-center">
            
            {/* Text Content - Centered */}
            <div className="flex flex-col items-center text-center">
              {/* Celo Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20"
              >
                <Zap className="h-4 w-4" />
                Powered by Celo Blockchain
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400"
              >
                TOKEN2049 Tickets
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 font-normal text-sm md:text-base text-neutral-300 max-w-lg"
              >
                The modern ticketing platform that makes event management effortless.
                Create, sell, and manage tickets with blockchain security.
              </motion.p>

              {/* User Balance Display - shows when wallet connected */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full max-w-md mt-6"
              >
                <UserBalance />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 flex gap-3 md:gap-4"
              >
                <button className="px-6 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition duration-200">
                  Browse Events
                </button>
                <button className="px-6 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-full border border-neutral-600 text-neutral-300 hover:bg-neutral-800 transition duration-200">
                  Create Event
                </button>
              </motion.div>
            </div>

          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-neutral-500 text-xs md:text-sm text-center pb-2"
          >
            <div className="flex gap-4 md:gap-6 justify-center mb-2">
              <a href="#" className="hover:text-neutral-300 transition">Privacy</a>
              <a href="#" className="hover:text-neutral-300 transition">Terms</a>
              <a href="#" className="hover:text-neutral-300 transition">Contact</a>
            </div>
            <p>© 2025 TOKEN2049 Tickets. All rights reserved.</p>
          </motion.footer>
        </div>
      </div>
    </div>
  );
}
