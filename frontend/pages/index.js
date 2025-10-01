import { Spotlight } from "@/components/ui/spotlight";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { ChatDemo } from "@/components/chat-demo";

/**
 * Natural Language Transaction Engine Landing Page
 * Mobile-first design optimized for iPhone 13 Pro Max (428x926px)
 * Demonstrates chatbot interface for crypto transactions
 * PWA ready for iOS
 */
export default function Home() {
  return (
    <div className="font-sans min-h-screen overflow-x-hidden">
      {/* Mobile-optimized Layout with Spotlight Effect */}
      <div className="min-h-screen w-full flex flex-col bg-black/[0.96] antialiased bg-grid-white/[0.02] relative">
        {/* Navbar with wallet connection */}
        <Navbar />
        
        {/* Spotlight effect - animated background */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        {/* Main Content Container - Mobile optimized with safe padding */}
        <div className="flex-1 flex flex-col px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto relative z-10 w-full safe-area-inset">
          
          {/* Header Section - Compact for mobile */}
          <div className="mb-6 mt-8 md:mt-12">
            {/* Main heading with gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-4"
            >
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-2">
                Natural Language Transactions
              </h1>
            </motion.div>

          </div>

          {/* Chatbot Demo - Main Feature - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex items-start justify-center w-full"
          >
            <ChatDemo />
          </motion.div>


          {/* Footer - Compact */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-neutral-600 text-xs text-center mt-6 pb-4"
          >
            <p>Natural Language Crypto Transactions</p>
          </motion.footer>
        </div>
      </div>
    </div>
  );
}
