import { useState, useRef, useEffect } from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(messages.length); // Track previous message count

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
    <div className="font-sans min-h-screen overflow-x-hidden">
      {/* Main Layout with Spotlight Effect */}
      <div className="min-h-screen w-full flex flex-col bg-black/[0.96] antialiased bg-grid-white/[0.02] relative">
        {/* Navbar */}
        <Navbar />
        
        {/* Spotlight effect - animated background */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto relative z-10 w-full">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-2">
              LeftAI Chat
            </h1>
            <p className="text-xs md:text-sm text-neutral-400">
              Chat with AI to make crypto transactions
            </p>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex flex-col w-full max-w-4xl mx-auto"
          >
            <Card className="flex-1 flex flex-col bg-neutral-900/50 border-neutral-700/50 backdrop-blur-lg overflow-hidden">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4">
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
                            <div className="bg-neutral-600 text-white rounded-2xl rounded-tr-md px-4 py-3 border border-neutral-500/30">
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 text-right">{message.timestamp}</p>
                          </div>
                          <Avatar className="h-8 w-8 bg-neutral-600 border border-neutral-500/30 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </Avatar>
                        </div>
                      )}

                      {/* Bot Messages */}
                      {message.type === "bot" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-8 w-8 bg-neutral-700 border border-neutral-600/30 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-neutral-300" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-4 py-3">
                              <p className="text-sm">{message.text}</p>
                              
                              {/* Intent Details */}
                              {message.intent && (
                                <div className="mt-3 bg-neutral-900/50 rounded-lg p-3 border border-neutral-700">
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
                          <div className="bg-neutral-800/50 rounded-full px-4 py-1.5 flex items-center gap-2">
                            <Clock className="h-3 w-3 text-white animate-pulse" />
                            <p className="text-xs text-neutral-400">{message.text}</p>
                          </div>
                        </div>
                      )}

                      {/* Attestation Messages */}
                      {message.type === "attestation" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-8 w-8 bg-green-900/50 border border-green-500/30 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl rounded-tl-md px-4 py-3">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                                <p className="text-sm text-green-300 font-medium">{message.text}</p>
                              </div>
                              {message.details && (
                                <div className="space-y-1 pl-6">
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
                      <Avatar className="h-8 w-8 bg-neutral-700 border border-neutral-600/30 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-neutral-300" />
                      </Avatar>
                      <div className="bg-neutral-800 rounded-2xl rounded-tl-md px-4 py-3">
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

              {/* Input Area */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Type your transaction request..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 rounded-full pr-4 focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-full h-10 w-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4"
          >
            <p className="text-xs text-neutral-500 text-center mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Send 100 cUSD to my friend")}
                className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs"
              >
                Send cUSD
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Swap CELO for best price")}
                className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs"
              >
                Swap Tokens
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

