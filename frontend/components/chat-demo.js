import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import Link from "next/link";

// All messages in the conversation - defined outside component to prevent re-creation
const allMessages = [
    {
      id: 1,
      type: "user",
      text: "Send 100 cUSD to my brother",
      timestamp: "2:34 PM",
    },
    {
      id: 2,
      type: "system",
      text: "Processing your request...",
      timestamp: "2:34 PM",
      status: "processing",
    },
    {
      id: 3,
      type: "bot",
      text: "I'll help you send 100 cUSD. Let me prepare the transaction.",
      timestamp: "2:34 PM",
      intent: {
        action: "Send",
        amount: "100 cUSD",
        recipient: "0x742d...4f2a",
        estimatedFee: "0.001 CELO",
      },
    },
    {
      id: 4,
      type: "attestation",
      text: "EigenLayer AVS verified",
      details: [
        "Token: cUSD ✓",
        "Amount: 100 ✓",
        "Recipient: 0x742d...4f2a ✓",
        "Fee within limits ✓",
      ],
      timestamp: "2:34 PM",
    },
    {
      id: 5,
      type: "user",
      text: "Swap my CELO for the best price on Ubeswap",
      timestamp: "2:35 PM",
    },
    {
      id: 6,
      type: "bot",
      text: "Found best rate on Ubeswap. Ready to swap your CELO.",
      timestamp: "2:35 PM",
      intent: {
        action: "Swap",
        from: "5 CELO",
        to: "~425 cUSD",
        route: "Ubeswap",
      slippage: "0.5%",
    },
  },
  {
    id: 7,
    type: "bot",
    text: "Ready to make your own transactions? Click here to try it out!",
    timestamp: "2:35 PM",
  },
];

/**
 * ChatDemo Component
 * Streaming chatbot demo showing Natural Language Transaction Engine
 * Messages stream in one-by-one to demonstrate the flow
 * Optimized for mobile (iPhone 13 Pro Max) PWA
 */
export function ChatDemo() {
  // State for streaming messages
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingText, setTypingText] = useState(""); // Current text being typed
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null); // Track which message is typing
  const scrollAreaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasStartedRef = useRef(false); // Track if animation has started
  const initialRenderRef = useRef(true); // Track initial render

  // Smooth scroll function - scrolls the chat to bottom
  // instant: true for immediate scroll (user messages), false for smooth (bot messages)
  const scrollToBottom = useCallback((instant = false) => {
    if (scrollAreaRef.current) {
      // Use requestAnimationFrame for smoother, faster scrolling
      requestAnimationFrame(() => {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: instant ? 'auto' : 'smooth'
          });
        }
      });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive (only after first message)
  useEffect(() => {
    // Skip scroll on initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Only scroll after messages have started appearing
    if (hasStartedRef.current) {
      scrollToBottom();
    }
  }, [messages, typingText]);

  // Stream messages one by one with typing effect
  useEffect(() => {
    if (currentIndex >= allMessages.length) return;

    const currentMessage = allMessages[currentIndex];
    
    // User messages and system messages appear instantly
    if (currentMessage.type === "user" || currentMessage.type === "system" || currentMessage.type === "attestation") {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, currentMessage]);
        setCurrentIndex(prev => prev + 1);
        // Enable scrolling only AFTER first message is displayed (on second message)
        if (currentIndex > 0) {
          hasStartedRef.current = true;
        }
        // User messages scroll instantly, others scroll smoothly
        const isUserMessage = currentMessage.type === "user";
        setTimeout(() => scrollToBottom(isUserMessage), 10);
      }, currentIndex === 0 ? 400 : 600);
      
      return () => clearTimeout(timer);
    }
    
    // Bot messages type letter by letter
    if (currentMessage.type === "bot") {
      // Add extra delay for the last message (id: 7)
      const extraDelay = currentMessage.id === 7 ? 300 : 0;
      
      const delayTimer = setTimeout(() => {
        setIsTyping(true);
        setTypingMessageId(currentMessage.id); // Track which message is typing
        const fullText = currentMessage.text;
        let charIndex = 0;
        
        const typeTimer = setInterval(() => {
          if (charIndex <= fullText.length) {
            setTypingText(fullText.slice(0, charIndex));
            charIndex++;
            // Scroll while typing to keep up with text
            if (charIndex % 10 === 0) {
              scrollToBottom();
            }
          } else {
            clearInterval(typeTimer);
            setIsTyping(false);
            setTypingMessageId(null);
            setTypingText("");
            setMessages(prev => [...prev, currentMessage]);
            setCurrentIndex(prev => prev + 1);
            // Scroll after message is complete
            setTimeout(scrollToBottom, 50);
          }
        }, 25); // 25ms per character for faster typing
      }, extraDelay);
      
      return () => clearTimeout(delayTimer);
    }
  }, [currentIndex, scrollToBottom]); // Include scrollToBottom in deps

  return (
    <Card className="w-full max-w-md mx-auto bg-neutral-900/50 border-neutral-700/50 backdrop-blur-lg relative overflow-hidden">
      {/* Border Beam Effects - Dual animated beams */}
      <BorderBeam 
        duration={6}
        size={400}
        className="from-transparent via-neutral-500 to-transparent"
      />
      <BorderBeam 
        duration={6}
        delay={3}
        size={400}
        borderWidth={2}
        className="from-transparent via-neutral-600 to-transparent"
      />
      
      {/* Chat Messages - Scrollable area for mobile */}
      <ScrollArea ref={scrollAreaRef} className="h-[450px] p-4">
        <div ref={messagesContainerRef} className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* User Messages - Right aligned */}
              {message.type === "user" && (
                <div className="flex justify-end">
                  <div className="max-w-[80%]">
                    <div className="bg-neutral-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5 border border-neutral-500/30">
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 text-right">{message.timestamp}</p>
                  </div>
                </div>
              )}

              {/* Bot Messages - Left aligned */}
              {message.type === "bot" && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    {/* Clickable CTA message for the last message */}
                    {message.id === 7 ? (
                      <div>
                        <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                          <p className="text-sm mb-3">{message.text}</p>
                          <Link href="/chat">
                            <PulsatingButton 
                              pulseColor="rgba(115, 115, 115, 0.5)"
                              duration="2s"
                              className="w-full bg-neutral-700 hover:bg-neutral-600 text-neutral-100 transition-colors"
                            >
                              Try it Now →
                            </PulsatingButton>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                        <p className="text-sm">{message.text}</p>
                        
                        {/* Intent Details Card */}
                        {message.intent && (
                          <div className="mt-3 bg-neutral-900/50 rounded-lg p-3 space-y-2 border border-neutral-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">Action</span>
                            <span className="text-white font-medium">{message.intent.action}</span>
                          </div>
                          {message.intent.amount && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Amount</span>
                              <span className="text-white font-medium">{message.intent.amount}</span>
                            </div>
                          )}
                          {message.intent.recipient && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">To</span>
                              <span className="text-white font-mono text-[10px]">{message.intent.recipient}</span>
                            </div>
                          )}
                          {message.intent.from && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">From</span>
                              <span className="text-white font-medium">{message.intent.from}</span>
                            </div>
                          )}
                          {message.intent.to && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">To</span>
                              <span className="text-white font-medium">{message.intent.to}</span>
                            </div>
                          )}
                          {message.intent.route && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Route</span>
                              <span className="text-white font-medium">{message.intent.route}</span>
                            </div>
                          )}
                          {message.intent.estimatedFee && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Est. Fee</span>
                              <span className="text-neutral-300">{message.intent.estimatedFee}</span>
                            </div>
                          )}
                          {message.intent.slippage && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Slippage</span>
                              <span className="text-neutral-300">{message.intent.slippage}</span>
                            </div>
                          )}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              )}

              {/* System/Processing Messages */}
              {message.type === "system" && (
                <div className="flex justify-center">
                  <div className="bg-neutral-800/50 rounded-full px-4 py-1.5 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-white animate-pulse" />
                    <p className="text-xs text-neutral-400">{message.text}</p>
                  </div>
                </div>
              )}

              {/* EigenLayer Attestation Messages */}
              {message.type === "attestation" && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        <p className="text-sm text-green-300 font-medium">{message.text}</p>
                      </div>
                      <div className="space-y-1 pl-6">
                        {message.details.map((detail, idx) => (
                          <p key={idx} className="text-xs text-neutral-300">{detail}</p>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Typing indicator for bot messages */}
          {isTyping && typingText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  {/* Show clickable style for last message while typing */}
                  {typingMessageId === 7 ? (
                    <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                      <p className="text-sm">{typingText}<span className="animate-pulse">|</span></p>
                    </div>
                  ) : (
                    <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                      <p className="text-sm">{typingText}<span className="animate-pulse">|</span></p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input - Disabled for demo */}
      <div className="p-4 border-t border-neutral-800">
        <div className="bg-neutral-800/50 rounded-full px-4 py-2.5 flex items-center gap-2">
          <input
            type="text"
            placeholder="Demo mode - Type your transaction..."
            disabled
            className="flex-1 bg-transparent text-sm text-neutral-500 outline-none cursor-not-allowed"
          />
          <Badge variant="secondary" className="text-xs">Demo</Badge>
        </div>
      </div>
    </Card>
  );
}

