import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import Link from "next/link";

/**
 * Highlight Tagged Users and USD Amounts Component
 * Parses text and highlights @mentions and $amounts
 */
function HighlightedText({ text }) {
  // List of known user names to highlight (with and without @)
  const userNames = ['James ETHGlobal', 'derek eth', 'Derek'];
  
  // Build regex pattern to match usernames OR $amounts
  const escapedNames = userNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const withAt = escapedNames.map(name => '@' + name);
  const allPatterns = [...withAt, ...escapedNames].join('|');
  const pattern = new RegExp(`(${allPatterns})|(\\\$\\d+(?:\\.\\d+)?)`, 'gi');
  
  const parts = text.split(pattern);
  
  return (
    <span>
      {parts.map((part, index) => {
        if (!part) return null;
        
        // Check if it's a $amount
        if (part.match(/^\$\d+(?:\.\d+)?$/)) {
          return (
            <span
              key={index}
              className="text-green-300 font-semibold underline decoration-green-300/50 underline-offset-2"
            >
              {part}
            </span>
          );
        }
        
        // Check if it's a mention (starts with @) or matches a known user name
        const trimmedPart = part.trim();
        const isMention = trimmedPart.startsWith('@');
        const isUserName = userNames.some(name => 
          trimmedPart.toLowerCase() === name.toLowerCase() ||
          trimmedPart.toLowerCase() === '@' + name.toLowerCase()
        );
        
        if (isMention || isUserName) {
          // Highlight the mention with gradient
          return (
            <span
              key={index}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-1.5 py-0.5 rounded-md font-medium shadow-sm"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

// All messages in the conversation - defined outside component to prevent re-creation
const allMessages = [
    {
      id: 1,
      type: "user",
      text: "Send $20 to @derek eth",
      timestamp: "2:34 PM",
    },
    {
      id: 2,
      type: "bot",
      text: "I'll prepare this transfer for you. Please review the details and confirm.",
      timestamp: "2:34 PM",
      intent: {
        action: "Transfer Confirmation",
        amount: "20 USDC",
        recipient: "@derek eth",
        status: "Awaiting Confirmation",
      },
    },
    {
      id: 3,
      type: "system",
      text: "Transaction submitted! Waiting for confirmation...",
      timestamp: "2:34 PM",
    },
    {
      id: 4,
      type: "bot",
      text: "✅ Transfer completed successfully! 20 USDC sent to @derek eth.",
      timestamp: "2:35 PM",
    },
    {
      id: 5,
      type: "user",
      text: "I paid $60 for dinner with @James ETHGlobal, split it equally",
      timestamp: "2:35 PM",
    },
    {
      id: 6,
      type: "bot",
      text: "I'll create a payment request for 30 USDC from @James ETHGlobal (splitting $60 between 2 people).",
      timestamp: "2:35 PM",
      intent: {
        action: "Payment Request",
        amount: "30 USDC each",
        from: "James ETHGlobal",
        description: "dinner",
      },
  },
  {
    id: 7,
    type: "bot",
    text: "✅ Payment request sent! @James ETHGlobal will receive a notification when they connect their wallet.",
    timestamp: "2:36 PM",
  },
  {
    id: 8,
    type: "user",
    text: "This is amazing! How can I try this out?",
    timestamp: "2:36 PM",
  },
  {
    id: 9,
    type: "bot",
    text: "Glad you asked! You can try it out here!",
    timestamp: "2:36 PM",
  },
];

/**
 * ChatDemo Component
 * Streaming chatbot demo showing LeftAI
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
    // Only trigger on messages change, not typingText to reduce lag
    if (hasStartedRef.current) {
      scrollToBottom();
    }
  }, [messages]); // Removed typingText from dependencies

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
        // All messages scroll smoothly for better mobile performance
        setTimeout(() => scrollToBottom(false), 10);
      }, currentIndex === 0 ? 700 : 600); // Added 500ms delay to first message
      
      return () => clearTimeout(timer);
    }
    
    // Bot messages type letter by letter
    if (currentMessage.type === "bot") {
      // Add extra delay for all bot messages
      const extraDelay = 300;
      
      const delayTimer = setTimeout(() => {
        setIsTyping(true);
        setTypingMessageId(currentMessage.id); // Track which message is typing
        const fullText = currentMessage.text;
        let charIndex = 0;
        
        const typeTimer = setInterval(() => {
          if (charIndex <= fullText.length) {
            setTypingText(fullText.slice(0, charIndex));
            charIndex++;
            // Scroll less frequently while typing to reduce lag
            if (charIndex % 20 === 0) {
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
            setTimeout(scrollToBottom, 100);
          }
        }, 25); // 25ms per character for faster typing
      }, extraDelay);
      
      return () => clearTimeout(delayTimer);
    }
  }, [currentIndex, scrollToBottom]); // Include scrollToBottom in deps

  return (
    <Card className="w-full max-w-md mx-auto bg-neutral-900/50 border-neutral-700/50 backdrop-blur-lg relative overflow-hidden mb-4">
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
                      <p className="text-sm">
                        <HighlightedText text={message.text} />
                      </p>
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
                    {message.id === 9 ? (
                      <div>
                        <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                          <p className="text-sm mb-3">{message.text}</p>
                          <Link href="/chat">
                            <PulsatingButton 
                              pulseColor="rgba(255, 255, 255, 0.3)"
                              duration="2s"
                              className="w-full bg-white hover:bg-gray-100 text-black transition-colors font-bold"
                            >
                              Try it Now →
                            </PulsatingButton>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                        <p className="text-sm">
                          <HighlightedText text={message.text} />
                        </p>
                        
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
                          {message.intent.status && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Status</span>
                              <span className="text-white font-medium">{message.intent.status}</span>
                            </div>
                          )}
                          {message.intent.txId && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">Transaction ID</span>
                              <span className="text-blue-400 font-mono text-[10px]">{message.intent.txId}</span>
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
                  {typingMessageId === 9 ? (
                    <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                      <p className="text-sm">
                        <HighlightedText text={typingText} />
                        <span className="animate-pulse">|</span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                      <p className="text-sm">
                        <HighlightedText text={typingText} />
                        <span className="animate-pulse">|</span>
                      </p>
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
            placeholder="Start today for free!"
            disabled
            className="flex-1 bg-transparent text-sm text-neutral-500 outline-none cursor-not-allowed"
          />
          {/* Use same Send icon style as full chat page */}
          <button
            type="button"
            disabled
            aria-label="Send"
            className="bg-neutral-700 text-white rounded-full h-10 w-10 p-0 opacity-60 cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </Card>
  );
}

