import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { BorderBeam } from "@/components/ui/border-beam";

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
  const messagesEndRef = useRef(null);
  const hasStartedRef = useRef(false); // Track if animation has started
  const initialRenderRef = useRef(true); // Track initial render

  // Auto-scroll to bottom when new messages arrive (only after first message)
  useEffect(() => {
    // Skip scroll on initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Only scroll after messages have started appearing
    if (hasStartedRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
      }, currentIndex === 0 ? 500 : 800);
      
      return () => clearTimeout(timer);
    }
    
    // Bot messages type letter by letter
    if (currentMessage.type === "bot") {
      setIsTyping(true);
      const fullText = currentMessage.text;
      let charIndex = 0;
      
      const typeTimer = setInterval(() => {
        if (charIndex <= fullText.length) {
          setTypingText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeTimer);
          setIsTyping(false);
          setTypingText("");
          setMessages(prev => [...prev, currentMessage]);
          setCurrentIndex(prev => prev + 1);
        }
      }, 30); // 30ms per character for smooth typing
      
      return () => clearInterval(typeTimer);
    }
  }, [currentIndex]); // Removed allMessages from deps since it's now constant

  return (
    <Card className="w-full max-w-md mx-auto bg-neutral-900/50 border-neutral-700/50 backdrop-blur-lg relative overflow-hidden">
      {/* Border Beam Effect */}
      <BorderBeam 
        size={200}
        duration={8}
        delay={2}
        colorFrom="#737373"
        colorTo="#525252"
      />
      
      {/* Chat Messages - Scrollable area for mobile */}
      <ScrollArea className="h-[450px] p-4">
        <div className="space-y-4">
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
                  <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5">
                    <p className="text-sm">{typingText}<span className="animate-pulse">|</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Only render scroll target after messages have started */}
          {hasStartedRef.current && <div ref={messagesEndRef} />}
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

