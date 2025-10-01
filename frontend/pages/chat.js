import { useState, useRef, useEffect } from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  Bot, 
  User,
  Sparkles
} from "lucide-react";

/**
 * Chat Interface Page
 * Interactive chat interface for LeftAI
 * Dark theme matching the landing page design
 * Mobile-optimized for PWA experience
 */
export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "👋 Hello! I'm your LeftAI assistant. Tell me what you'd like to do with your crypto.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Track if screen is mobile size
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(messages.length); // Track previous message count

  // Set a reliable mobile viewport height CSS variable (--vh)
  // This fixes iOS/Chrome mobile where 100vh includes browser UI
  // Also detects mobile screen size for responsive border beam speed
  useEffect(() => {
    const setViewportHeightVar = () => {
      const viewportHeight = typeof window !== 'undefined' && window.visualViewport
        ? window.visualViewport.height
        : (typeof window !== 'undefined' ? window.innerHeight : 0);
      if (viewportHeight) {
        const vhUnit = viewportHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vhUnit}px`);
      }
    };

    // Check if screen is mobile size (width < 768px for faster border beam)
    const checkMobileSize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    setViewportHeightVar();
    checkMobileSize();

    // Update on viewport changes (rotation, URL bar show/hide, etc.)
    const onResize = () => {
      setViewportHeightVar();
      checkMobileSize();
    };
    const onVisibility = () => setViewportHeightVar();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);
      window.addEventListener('focus', onResize);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onResize);
        window.visualViewport.addEventListener('scroll', onResize);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        window.removeEventListener('focus', onResize);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', onResize);
          window.visualViewport.removeEventListener('scroll', onResize);
        }
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll if messages were actually added (not on initial mount)
    if (messages.length > prevMessageCountRef.current) {
      scrollToBottom();
    }
    // Update the previous count
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: "bot",
        text: "I understand you want to make a transaction. Let me help you with that.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        intent: {
          action: "Analyzing request...",
          status: "processing"
        }
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="font-sans flex flex-col overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)', minHeight: '100dvh' }}>
      {/* Main Layout - Fixed Height Container */}
      <div className="flex-1 flex flex-col bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden min-h-0">
        {/* Navbar - Fixed at top */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>
        
        {/* Spotlight effect - animated background with left and right gradients */}
        <Spotlight />
        
        {/* Main Content Container - Flexible height with minimal spacing */}
        <div className="flex-1 flex flex-col px-2 py-1.5 md:px-8 md:py-8 max-w-5xl mx-auto relative z-10 w-full min-h-0">
          
          {/* Chat Container - Takes all remaining space */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex flex-col w-full max-w-4xl mx-auto min-h-0"
          >
            <Card className="flex-1 flex flex-col bg-neutral-900/50 border-neutral-700/50 backdrop-blur-lg overflow-hidden min-h-0 relative">
              {/* Animated white border beam effect - faster on mobile (1.5x speed) */}
              <BorderBeam 
                size={200}
                duration={isMobile ? 4 : 6}
                delay={0}
                colorFrom="#ffffff"
                colorTo="#ffffff"
                borderWidth={2}
              />
              
              {/* Messages Area - Scrollable within fixed container */}
              <ScrollArea className="flex-1 p-2 md:p-6 min-h-0">
                <div className="space-y-2">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* User Messages */}
                      {message.type === "user" && (
                        <div className="flex justify-end items-start gap-2">
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-neutral-600 text-white rounded-2xl rounded-tr-md px-3 py-2 border border-neutral-500/30">
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 text-right">{message.timestamp}</p>
                          </div>
                          <Avatar className="h-7 w-7 bg-neutral-600 border border-neutral-500/30 flex items-center justify-center flex-shrink-0">
                            <User className="h-3.5 w-3.5 text-white" />
                          </Avatar>
                        </div>
                      )}

                      {/* Bot Messages */}
                      {message.type === "bot" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-7 w-7 bg-neutral-700 border border-neutral-600/30 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-3.5 w-3.5 text-neutral-300" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-3 py-2">
                              <p className="text-sm">{message.text}</p>
                              
                              {/* Intent Details */}
                              {message.intent && (
                                <div className="mt-2 bg-neutral-900/50 rounded-lg p-2 border border-neutral-700">
                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                    <Clock className="h-3 w-3 text-white" />
                                    <span>{message.intent.action}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      )}

                      {/* System Messages */}
                      {message.type === "system" && (
                        <div className="flex justify-center">
                          <div className="bg-neutral-800/50 rounded-full px-3 py-1 flex items-center gap-2">
                            <Clock className="h-3 w-3 text-white animate-pulse" />
                            <p className="text-xs text-neutral-400">{message.text}</p>
                          </div>
                        </div>
                      )}

                      {/* Attestation Messages */}
                      {message.type === "attestation" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-7 w-7 bg-green-900/50 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl rounded-tl-md px-3 py-2">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                <p className="text-sm text-green-300 font-medium">{message.text}</p>
                              </div>
                              {message.details && (
                                <div className="space-y-1 pl-5">
                                  {message.details.map((detail, idx) => (
                                    <p key={idx} className="text-xs text-neutral-300">{detail}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start items-start gap-2"
                    >
                      <Avatar className="h-7 w-7 bg-neutral-700 border border-neutral-600/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3.5 w-3.5 text-neutral-300" />
                      </Avatar>
                      <div className="bg-neutral-800 rounded-2xl rounded-tl-md px-3 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions - Compact but clickable */}
              <div className="px-3 py-2 border-t border-neutral-800 bg-neutral-900/30 flex-shrink-0">
                <p className="text-xs text-neutral-500 text-center mb-1.5">Quick actions:</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue("Send 100 cUSD to my friend")}
                    className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs px-3 py-1.5 h-8"
                  >
                    Send cUSD
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue("Swap CELO for best price")}
                    className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs px-3 py-1.5 h-8"
                  >
                    Swap Tokens
                  </Button>
                </div>
              </div>

              {/* Input Area - Bigger typing space */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Type your transaction request..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 rounded-full px-5 py-3 focus:ring-2 focus:ring-neutral-600 focus:border-transparent text-base h-12"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-full h-12 w-12 p-0 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

