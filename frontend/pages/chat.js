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
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useAccount, useWriteContract, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { availableFunctions, executeFunction } from "@/lib/llmActions";
import { executeTokenTransfer, getExplorerUrl } from "@/lib/llmActions/executeTransfer";
import { useContacts } from "@/hooks/useContacts";
import { ContactAutocomplete } from "@/components/contact-autocomplete";
import { usdToCelo, parseUsdAmount } from "@/lib/currencyUtils";

/**
 * Chat Interface Page
 * Interactive chat interface for Natural Language Transaction Engine
 * Dark theme matching the landing page design
 * Mobile-optimized for PWA experience
 */
export default function Chat() {
  const { address: userAddress, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const { contacts, searchContacts, getContactByName } = useContacts();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "👋 Hello! I'm your AI-powered Natural Language Transaction assistant, running on Phala's confidential computing network. Tell me what you'd like to do with your crypto, and I'll help you execute transactions securely on Celo.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [pendingTxHash, setPendingTxHash] = useState(null);
  
  // Contact autocomplete state
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [mentionStartPos, setMentionStartPos] = useState(null);
  
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      const explorerUrl = getExplorerUrl(chain?.id || 44787, pendingTxHash);
      
      const successMessage = {
        id: Date.now(),
        type: "attestation",
        text: "Transfer completed successfully!",
        details: [
          `Transaction confirmed on blockchain`,
          `View on explorer: ${explorerUrl}`,
        ],
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, successMessage]);
      setPendingTxHash(null);
    }
  }, [isConfirmed, pendingTxHash, chain?.id]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Process input for contacts and USD amounts
    let processedInput = inputValue;
    let replacements = [];

    // Extract contact mentions (@ContactName) and replace with wallet addresses
    const mentionRegex = /@([A-Za-z\s]+)/g;
    let match;
    while ((match = mentionRegex.exec(inputValue)) !== null) {
      const contactName = match[1].trim();
      const contact = getContactByName(contactName);
      if (contact) {
        replacements.push({
          original: match[0],
          replacement: contact.wallet,
          type: 'contact',
          name: contact.name,
        });
      }
    }

    // Extract USD amounts ($100) and convert to CELO
    const usdRegex = /\$(\d+(?:\.\d+)?)/g;
    const usdMatches = [...inputValue.matchAll(usdRegex)];
    
    for (const match of usdMatches) {
      const usdAmount = parseUsdAmount(match[0]);
      if (usdAmount) {
        const celoAmount = await usdToCelo(usdAmount);
        replacements.push({
          original: match[0],
          replacement: `${celoAmount} CELO`,
          type: 'usd',
          usdAmount,
          celoAmount,
        });
      }
    }

    // Apply replacements
    for (const rep of replacements) {
      processedInput = processedInput.replace(rep.original, rep.replacement);
    }

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = processedInput; // Use processed input for AI
    setInputValue("");
    setShowContactDropdown(false);
    setIsTyping(true);

    try {
      // Build conversation history
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: currentInput }
      ];

      // Prepare messages for RedPill API (OpenAI format)
      const systemPrompt = `You are a helpful AI assistant for crypto transactions on the Celo blockchain. 
Help users understand and execute their crypto transactions using natural language. 
Be concise, friendly, and security-conscious.

${isConnected ? `The user's wallet is connected: ${userAddress}` : 'The user has not connected their wallet yet. Remind them to connect their wallet to perform transactions.'}

Available tokens: CELO, cUSD, cEUR

IMPORTANT: When the user wants to transfer funds and you have all required information (destination address, amount, and token), respond with ONLY this JSON format:
{"name": "transfer_funds", "arguments": {"destinationAddress": "0x...", "amount": "number", "tokenSymbol": "CELO|cUSD|cEUR"}}

If any information is missing, ask the user for it in natural language. Only output the JSON when you have ALL three required parameters.

Examples:
User: "Send 100 cUSD to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
You: {"name": "transfer_funds", "arguments": {"destinationAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "amount": "100", "tokenSymbol": "cUSD"}}

User: "Send 50 CELO"
You: To complete the transfer, I need to know the destination address. Where would you like to send the 50 CELO?`;

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...newHistory.slice(-10), // Keep last 10 exchanges for context
      ];

      // Call our API route (without native function calling, using JSON in text instead)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          // Don't send functions to RedPill API - it might not support it
          // Instead, we instruct the AI via system prompt to output JSON
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Handle function call
      if (data.type === 'function_call') {
        await handleFunctionCall(data.function_call, newHistory);
      } 
      // Handle regular message
      else if (data.type === 'message') {
        const botResponse = {
          id: messages.length + 2,
          type: "bot",
          text: data.message,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages(prev => [...prev, botResponse]);
        setConversationHistory([
          ...newHistory,
          { role: "assistant", content: data.message }
        ]);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Error message
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle function calls from the AI
  const handleFunctionCall = async (functionCall, currentHistory) => {
    const { name: functionName, arguments: argsString } = functionCall;
    
    try {
      // Parse function arguments
      const args = JSON.parse(argsString);
      
      // Execute the function
      const result = executeFunction(functionName, args, userAddress);
      
      // Handle the result
      if (result.success) {
        // Show confirmation message with transfer details
        const confirmMessage = {
          id: messages.length + 2,
          type: "action",
          text: result.message,
          action: {
            type: result.type,
            data: result,
            args: args, // Store args for execution
          },
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages(prev => [...prev, confirmMessage]);
        
        // Update conversation history with function result
        setConversationHistory([
          ...currentHistory,
          { role: "assistant", content: null, function_call: functionCall },
          { role: "function", name: functionName, content: JSON.stringify(result) }
        ]);
      } else {
        // Show error or ask for missing parameters
        const errorText = result.missing && result.missing.length > 0
          ? `I need some more information. ${result.error}`
          : result.error;
        
        const errorMessage = {
          id: messages.length + 2,
          type: "bot",
          text: errorText,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        // Send error back to AI for follow-up
        setConversationHistory([
          ...currentHistory,
          { role: "assistant", content: null, function_call: functionCall },
          { role: "function", name: functionName, content: JSON.stringify(result) }
        ]);
      }
      
    } catch (error) {
      console.error('Error executing function:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle input change with contact autocomplete
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Check for @ mention
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      // Check if there's no space after @
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionStartPos(lastAtSymbol);
        setContactSearchQuery(textAfterAt);
        setFilteredContacts(searchContacts(textAfterAt));
        setShowContactDropdown(true);
        return;
      }
    }
    
    setShowContactDropdown(false);
  };

  // Handle contact selection
  const handleContactSelect = (contact) => {
    if (mentionStartPos === null) return;
    
    const beforeMention = inputValue.slice(0, mentionStartPos);
    const afterMention = inputValue.slice(mentionStartPos + contactSearchQuery.length + 1);
    
    // Replace @query with @ContactName
    const newValue = `${beforeMention}@${contact.name}${afterMention}`;
    setInputValue(newValue);
    setShowContactDropdown(false);
    setMentionStartPos(null);
    
    // Focus back on input
    inputRef.current?.focus();
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    // If dropdown is open, handle arrow keys and enter
    if (showContactDropdown && filteredContacts.length > 0) {
      if (e.key === 'Escape') {
        setShowContactDropdown(false);
        return;
      }
      // Could add arrow key navigation here
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!showContactDropdown) {
        handleSendMessage();
      }
    }
  };

  // Handle transaction execution
  const handleExecuteTransfer = async (transferData) => {
    const { destinationAddress, amount, tokenSymbol } = transferData;
    
    // Show processing message
    const processingMessage = {
      id: Date.now(),
      type: "system",
      text: "Processing transaction... Please confirm in your wallet.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, processingMessage]);
    
    try {
      const result = await executeTokenTransfer({
        destinationAddress,
        amount,
        tokenSymbol,
        writeContract: writeContractAsync,
        sendTransaction: sendTransactionAsync,
        chainId: chain?.id || 44787,
        userAddress,
      });
      
      if (result.success) {
        setPendingTxHash(result.hash);
        
        const explorerUrl = getExplorerUrl(chain?.id || 44787, result.hash);
        
        const pendingMessage = {
          id: Date.now() + 1,
          type: "system",
          text: `Transaction submitted! Waiting for confirmation...`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, pendingMessage]);
        
        // Add a clickable link message
        const linkMessage = {
          id: Date.now() + 2,
          type: "bot",
          text: `View transaction: ${explorerUrl}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, linkMessage]);
        
      } else {
        // Handle error
        const errorMessage = {
          id: Date.now() + 1,
          type: "bot",
          text: result.userRejected 
            ? "Transaction was cancelled. Let me know if you'd like to try again!"
            : `Transaction failed: ${result.error}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } catch (error) {
      console.error('Transaction execution error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Sorry, there was an error executing the transaction. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
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
              Natural Language Chat
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
            <Card className="flex-1 flex flex-col bg-neutral-900/90 border-neutral-800 backdrop-blur-lg overflow-hidden">
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
                            <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-3">
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 text-right">{message.timestamp}</p>
                          </div>
                          <Avatar className="h-8 w-8 bg-blue-600 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </Avatar>
                        </div>
                      )}

                      {/* Bot Messages */}
                      {message.type === "bot" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
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
                          <Avatar className="h-8 w-8 bg-green-600 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-white" />
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

                      {/* Action Messages (Transfer Confirmation) */}
                      {message.type === "action" && message.action?.type === "transfer_funds" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-white" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl rounded-tl-md px-4 py-3">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-white" />
                                <p className="text-sm text-purple-300 font-medium">Transfer Confirmation Required</p>
                              </div>
                              
                              <div className="space-y-2 text-xs text-neutral-300 mb-3">
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">From:</span>
                                  <span className="font-mono">{message.action.data.userAddress?.substring(0, 10)}...</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">To:</span>
                                  <span className="font-mono">{message.action.data.destinationAddress?.substring(0, 10)}...</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Amount:</span>
                                  <span className="font-medium text-white">{message.action.data.amount} {message.action.data.tokenSymbol}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs"
                                  disabled={isConfirming}
                                  onClick={() => handleExecuteTransfer(message.action.args)}
                                >
                                  {isConfirming ? 'Confirming...' : 'Confirm Transfer'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 text-xs"
                                  disabled={isConfirming}
                                  onClick={() => {
                                    const cancelMsg = {
                                      id: messages.length + 1,
                                      type: "bot",
                                      text: "Transfer cancelled. How else can I help you?",
                                      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                    };
                                    setMessages(prev => [...prev, cancelMsg]);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
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
                      <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
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
                      ref={inputRef}
                      type="text"
                      placeholder="Type @ for contacts, $ for USD amount..."
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 rounded-full pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {/* Contact Autocomplete Dropdown */}
                    {showContactDropdown && (
                      <ContactAutocomplete
                        contacts={filteredContacts}
                        onSelect={handleContactSelect}
                        position={{ bottom: '100%', left: 0 }}
                      />
                    )}
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full h-10 w-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
                
                {/* Info Badge */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-neutral-800 text-neutral-400 border-neutral-700">
                    AI-Powered Transactions
                  </Badge>
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
                onClick={() => setInputValue("Send $10 to @Alice")}
                className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs"
              >
                Send to Contact
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Send $25 to @Bob")}
                className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs"
              >
                Pay $25
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Transfer $50 to @Carol")}
                className="bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs"
              >
                Transfer $50
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

