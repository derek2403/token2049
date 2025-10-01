import { Geist, Geist_Mono } from "next/font/google";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { Spotlight } from "@/components/ui/spotlight";
import { motion } from "framer-motion";
import { Ticket, Calendar, Users, Shield } from "lucide-react";

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
 * Ticketing Platform Landing Page
 * Features Aceternity UI components with animated spotlight and hero effects
 */
export default function Home() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      {/* Hero Section with Aceternity UI Spotlight */}
      <div className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        {/* Spotlight effect - animated background */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          {/* Main heading with animations */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50"
          >
            Your Events, <br /> Simplified & Secured
          </motion.h1>
          
          {/* Subtitle with delayed animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto"
          >
            The modern ticketing platform that makes event management effortless.
            Create, sell, and manage tickets for any event size.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex gap-4 justify-center"
          >
            <button className="px-8 py-3 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition duration-200">
              Get Started Free
            </button>
            <button className="px-8 py-3 rounded-full border border-neutral-600 text-neutral-300 hover:bg-neutral-800 transition duration-200">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </div>

      {/* Interactive Hero Highlight Section */}
      <HeroHighlight containerClassName="min-h-screen">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto"
        >
          Create unforgettable events with{" "}
          <Highlight className="text-black dark:text-white">
            TOKEN2049 Tickets
          </Highlight>
        </motion.h1>
      </HeroHighlight>

      {/* Features Section */}
      <div className="bg-white dark:bg-black py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
            Everything you need to succeed
          </h2>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-xl transition duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">
                Easy Ticketing
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Create and customize tickets in minutes. No technical skills required.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-xl transition duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">
                Event Management
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage all your events from one simple dashboard. Track sales in real-time.
              </p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-xl transition duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">
                Attendee Insights
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Understand your audience with detailed analytics and reports.
              </p>
            </motion.div>

            {/* Feature Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-xl transition duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">
                Secure Payments
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Bank-level security for all transactions. Your money is safe.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4">© 2025 TOKEN2049 Tickets. All rights reserved.</p>
          <div className="flex gap-6 justify-center">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
