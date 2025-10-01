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
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useAccount, useWriteContract, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { availableFunctions, executeFunction } from "@/lib/llmActions";
import { executeTokenTransfer, getExplorerUrl } from "@/lib/llmActions/executeTransfer";
import { executeStakeCelo, getExplorerUrl as getStakeExplorerUrl } from "@/lib/llmActions/stakeCelo";
import { useContacts } from "@/hooks/useContacts";
import { ContactAutocomplete } from "@/components/contact-autocomplete";
import { usdToUsdc, parseUsdAmount } from "@/lib/currencyUtils";
import { useNotifications } from "@/components/notification-toast";

/**
 * Highlight Tagged Users and USD Amounts Component
 * Parses text and highlights @mentions and $amounts
 */
function HighlightedText({ text }) {
  // Combined pattern to match both @mentions (full names) and $amounts
  // Pattern: @FirstName or @FirstName LastName (max 2 words)
  // Stops at 2 words to avoid matching regular text after the name
  const pattern = /(@[A-Za-z]+(?:\s+[A-Za-z]+)?)|(\$\d+(?:\.\d+)?)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }
    
    // Add the matched part
    if (match[1]) {
      // @mention
      parts.push({
        type: 'mention',
        content: match[1],
      });
    } else if (match[2]) {
      // $amount
      parts.push({
        type: 'dollar',
        content: match[2],
      });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={index}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-1.5 py-0.5 rounded-md font-medium"
            >
              {part.content}
            </span>
          );
        } else if (part.type === 'dollar') {
          return (
            <span
              key={index}
              className="text-green-300 font-semibold underline decoration-green-300/50 underline-offset-2"
            >
              {part.content}
            </span>
          );
        } else {
          return <span key={index}>{part.content}</span>;
        }
      })}
    </>
  );
}

/**
 * Chat Interface Page
 * Interactive chat interface for LeftAI
 * Dark theme matching the landing page design
 * Mobile-optimized for PWA experience
 */
export default function Chat() {
  const { address: userAddress, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const { contacts, searchContacts, getContactByName } = useContacts();
  const { showNotification } = useNotifications();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! Let me know what you'd like to do with your funds!",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Track if screen is mobile size
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
  const prevMessageCountRef = useRef(messages.length); // Track previous message count
  
  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

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
    // Use requestAnimationFrame to ensure DOM has updated after message render
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "auto", // Changed to "auto" for instant scroll to avoid jank
          block: "nearest" 
        });
      }
    });
  };

  useEffect(() => {
    // Only scroll if messages were actually added (not on initial mount)
    if (messages.length > prevMessageCountRef.current) {
      scrollToBottom();
    }
    // Update the previous count
    prevMessageCountRef.current = messages.length;
  }, [messages.length]); // Only depend on length, not entire messages array

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
    // Match @ followed by letters/spaces until we hit a non-letter/space or end of string
    const mentionRegex = /@([A-Za-z\s]+?)(?=\s|$|\$|[^A-Za-z\s])/g;
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

    // Extract USD amounts ($100) and convert to USDC (1:1)
    const usdRegex = /\$(\d+(?:\.\d+)?)/g;
    const usdMatches = [...inputValue.matchAll(usdRegex)];
    
    for (const match of usdMatches) {
      const usdAmount = parseUsdAmount(match[0]);
      if (usdAmount) {
        const usdcAmount = await usdToUsdc(usdAmount);
        replacements.push({
          original: match[0],
          replacement: `${usdcAmount} USDC`,
          type: 'usd',
          usdAmount,
          usdcAmount,
        });
      }
    }

    // Apply replacements (do this in order to avoid conflicts)
    for (const rep of replacements) {
      processedInput = processedInput.replace(rep.original, rep.replacement);
    }
    
    // Debug log to verify replacements
    if (replacements.length > 0) {
      console.log('Original input:', inputValue);
      console.log('Replacements:', replacements);
      console.log('Processed input:', processedInput);
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
      // Build conversation history - filter out function calls and function messages
      const cleanHistory = conversationHistory.filter(msg => 
        msg.role !== 'function' && !msg.function_call
      );
      
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: currentInput }
      ];

      // Prepare messages for RedPill API (OpenAI format) - use clean history
      const systemPrompt = `You are a helpful AI assistant for crypto transactions on the Celo blockchain. 
Help users understand and execute their crypto transactions using natural language. 
Be concise, friendly, and security-conscious.

${isConnected ? `The user's wallet is connected: ${userAddress}` : 'The user has not connected their wallet yet. Remind them to connect their wallet to perform transactions.'}

IMPORTANT FEATURES:
- Users can type @ to select contacts by name (frontend handles conversion to wallet address)
- Users can type $ for USD amounts (frontend auto-converts to USDC at 1:1 ratio)
- You will receive wallet addresses (not contact names) in the processed input
- When parsing amounts, look for patterns like "30 USDC" or "50 CELO"

AVAILABLE FUNCTIONS:

1. TRANSFER FUNDS - When the user wants to send/transfer money TO someone:
{"name": "transfer_funds", "arguments": {"destinationAddress": "0x...", "amount": "number", "tokenSymbol": "USDC"}}
Note: $ amounts convert to USDC (1:1). For CELO, user must specify "CELO" explicitly.

2. REQUEST PAYMENT - When the user wants to REQUEST money FROM someone(s), split bills, or ask for payment:
{"name": "request_payment", "arguments": {"fromAddresses": ["0x...", "0x..."], "totalAmount": "number", "tokenSymbol": "USDC", "description": "optional text"}}
Note: $ amounts convert to USDC (1:1).

3. STAKE CELO - When the user wants to stake/save CELO, earn rewards, earn yield, passive income:
{"name": "stake_celo", "arguments": {"amount": "number"}}
CRITICAL: If user mentions "stake", "save money", "earn rewards", "earn yield" → USE this function DIRECTLY

PAYMENT REQUEST RULES:
- CRITICAL: When user says "I paid X with @User1 and @User2", there are 3 people TOTAL (user + 2 others)
- Each person's share = Total / Number of people INCLUDING the user
- Request each person's share from EACH mentioned person, NOT the full total split between them
- For EQUAL split among mentioned users: calculate per-person amount first, then use individualAmounts
- For CUSTOM amounts: use individualAmounts object with address-amount pairs
- If user mentions total AND some specific amounts but NOT all: calculate remaining amount for unspecified users
- Parse patterns like "I paid X for Y, @User1 amount1, @User2 amount2, @User3" - User3 gets remainder
- Extract context like "dinner", "movie", "lunch" for the description field

If any information is missing, ask the user for it in natural language. Only output the JSON when you have ALL required parameters.

EXAMPLES:

User: "Send 20 CELO to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
You: {"name": "transfer_funds", "arguments": {"destinationAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "amount": "20", "tokenSymbol": "CELO"}}

User: "I paid 60 CELO for dinner with 0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6 and 0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092"
Analysis: 3 people total (user + 2 others), 60 CELO / 3 = 20 CELO per person
You: {"name": "request_payment", "arguments": {"fromAddresses": ["0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092"], "individualAmounts": {"0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6": "20", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092": "20"}, "tokenSymbol": "CELO", "description": "dinner"}}

User: "i paid for dinner 30 CELO 0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6 15 CELO 0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092 10 CELO 0x41Db99b9A098Af28A06C0af238799c08076Af2f7"
Analysis: Total = 30 CELO, Alice = 15 CELO, Bob = 10 CELO, Carol = remainder = 5 CELO
You: {"name": "request_payment", "arguments": {"fromAddresses": ["0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092", "0x41Db99b9A098Af28A06C0af238799c08076Af2f7"], "individualAmounts": {"0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6": "15", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092": "10", "0x41Db99b9A098Af28A06C0af238799c08076Af2f7": "5"}, "tokenSymbol": "CELO", "description": "dinner"}}

User: "Request 10 CELO from 0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6 and 25 CELO from 0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092"
You: {"name": "request_payment", "arguments": {"fromAddresses": ["0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092"], "individualAmounts": {"0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6": "10", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092": "25"}, "tokenSymbol": "CELO"}}

User: "I paid 90 CELO for movie tickets with 0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6 0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092 0x41Db99b9A098Af28A06C0af238799c08076Af2f7"
Analysis: 4 people total (user + 3 others), 90 / 4 = 22.5 CELO per person
You: {"name": "request_payment", "arguments": {"fromAddresses": ["0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092", "0x41Db99b9A098Af28A06C0af238799c08076Af2f7"], "individualAmounts": {"0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6": "22.5", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092": "22.5", "0x41Db99b9A098Af28A06C0af238799c08076Af2f7": "22.5"}, "tokenSymbol": "CELO", "description": "movie tickets"}}

User: "I had dinner with 0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6 and 0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092, I paid 99 CELO help me split bill"
Analysis: 3 people total (user + Alice + Bob), 99 / 3 = 33 CELO per person, request 33 from each
You: {"name": "request_payment", "arguments": {"fromAddresses": ["0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092"], "individualAmounts": {"0x1C4e764e1748CFe74EC579fa7C83AB081df6D6C6": "33", "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092": "33"}, "tokenSymbol": "CELO", "description": "dinner"}}

User: "I have extra money, help me earn rewards"
You: How much CELO would you like to stake to earn rewards?

User: "Stake 10 CELO"
You: {"name": "stake_celo", "arguments": {"amount": "10"}}`;

      // Filter API messages to only include valid message formats
      const cleanApiHistory = cleanHistory
        .filter(msg => msg.role && msg.content)
        .slice(-8); // Keep last 8 clean exchanges
      
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...cleanApiHistory,
        { role: "user", content: currentInput }
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to get AI response (${response.status})`);
      }

      const data = await response.json();
      console.log('AI Response:', data);
      
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
      
      // Error message with more details
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: `Sorry, I'm having trouble connecting to the AI service. ${error.message || 'Please try again.'}`,
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
    
    // Replace @query with @ContactName and add space after
    const newValue = `${beforeMention}@${contact.name} ${afterMention}`;
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

  // Handle ETH staking execution
  const handleExecuteStakeEth = async (stakeData) => {
    const { amount } = stakeData;
    
    // Show processing message
    const processingMessage = {
      id: Date.now(),
      type: "system",
      text: "Depositing ETH into Yearn vault... This requires 2 transactions: Approve WETH and Deposit.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, processingMessage]);
    
    try {
      const result = await executeStakeEth({
        amount,
        writeContract: writeContractAsync,
        chainId: chain?.id || 42220,
        userAddress,
      });
      
      if (result.success) {
        setPendingTxHash(result.hash);
        
        const explorerUrl = getStakeEthExplorerUrl(chain?.id || 42220, result.hash);
        
        const pendingMessage = {
          id: Date.now() + 1,
          type: "system",
          text: `ETH staking complete! Waiting for blockchain confirmation...`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, pendingMessage]);
        
        const stakeLinkMessage = {
          id: Date.now() + 2,
          type: "bot",
          text: `View transaction: ${explorerUrl}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, stakeLinkMessage]);
        
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: "bot",
          text: result.userRejected 
            ? "ETH staking was cancelled. Let me know if you'd like to try again!"
            : `ETH staking failed: ${result.error}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } catch (error) {
      console.error('ETH staking execution error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Sorry, there was an error executing the ETH stake. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle CELO staking execution
  const handleExecuteStake = async (stakeData) => {
    const { amount } = stakeData;
    
    // Show processing message
    const processingMessage = {
      id: Date.now(),
      type: "system",
      text: "Preparing to stake CELO... Please confirm in your wallet.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, processingMessage]);
    
    try {
      const result = await executeStakeCelo({
        amount,
        writeContract: writeContractAsync,
        chainId: chain?.id || 42220,
        userAddress,
      });
      
      if (result.success) {
        setPendingTxHash(result.hash);
        
        const explorerUrl = getStakeExplorerUrl(chain?.id || 42220, result.hash);
        
        const pendingMessage = {
          id: Date.now() + 1,
          type: "system",
          text: `Staking transaction submitted! Waiting for confirmation...`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, pendingMessage]);
        
        const stakeLinkMessage = {
          id: Date.now() + 2,
          type: "bot",
          text: `View transaction: ${explorerUrl}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, stakeLinkMessage]);
        
      } else {
        // Handle error
        const errorMessage = {
          id: Date.now() + 1,
          type: "bot",
          text: result.userRejected 
            ? "Staking was cancelled. Let me know if you'd like to try again!"
            : `Staking failed: ${result.error}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } catch (error) {
      console.error('Staking execution error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Sorry, there was an error executing the stake. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // Handle creating payment request
  const handleCreatePaymentRequest = async (requestData) => {
    try {
      // Show processing message
      const processingMessage = {
        id: Date.now(),
        type: "system",
        text: "Creating payment request...",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, processingMessage]);

      // Get sender name (current user) - try to find in contacts or use address
      const senderContact = contacts.find(c => c.wallet.toLowerCase() === userAddress?.toLowerCase());
      const senderName = senderContact?.name || `${userAddress?.substring(0, 6)}...${userAddress?.substring(38)}`;

      // Create notifications for each recipient
      const notificationsToSave = requestData.fromAddresses.map((addr) => {
        // Find recipient name
        const recipientContact = contacts.find(c => c.wallet.toLowerCase() === addr.toLowerCase());
        const recipientName = recipientContact?.name || `${addr.substring(0, 6)}...${addr.substring(38)}`;

        return {
          id: `${Date.now()}-${addr}-${Math.random()}`,
          type: 'payment_request',
          title: 'Payment Request Received',
          message: `${senderName} has requested payment from ${recipientName}`,
          from: userAddress,
          fromName: senderName,
          to: addr,
          toName: recipientName,
          amount: requestData.amounts[addr],
          tokenSymbol: requestData.tokenSymbol,
          description: requestData.description || "Payment request",
          timestamp: new Date().toISOString(),
          status: 'pending',
        };
      });

      // Save notifications to backend (JSON file)
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notifications: notificationsToSave,
          }),
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error('Failed to save notifications');
        }

        console.log('Payment request notifications saved:', result);
      } catch (apiError) {
        console.error('Failed to save notifications:', apiError);
        throw apiError;
      }

      const successMessage = {
        id: Date.now() + 1,
        type: "attestation",
        text: "Payment request sent successfully!",
        details: [
          `Requesting ${requestData.totalAmount} ${requestData.tokenSymbol} total`,
          `Sent to ${requestData.fromAddresses.length} user(s)`,
          requestData.splitType === 'equal_split' 
            ? `Each person owes ${requestData.amounts[requestData.fromAddresses[0]]} ${requestData.tokenSymbol}`
            : 'Custom amounts assigned',
          `Recipients will receive notifications when they connect their wallets`,
        ],
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, successMessage]);

    } catch (error) {
      console.error('Payment request error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Sorry, there was an error creating the payment request. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
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
              <div className="absolute inset-0 pointer-events-none z-0">
                <BorderBeam 
                  size={200}
                  duration={isMobile ? 4 : 6}
                  delay={0}
                  colorFrom="#ffffff"
                  colorTo="#ffffff"
                  borderWidth={2}
                />
              </div>
              
              {/* Messages Area - Scrollable within fixed container */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-2 p-2 md:p-6 pb-4">
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
                              <p className="text-sm">
                                <HighlightedText text={message.text} />
                              </p>
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
                          <Avatar className="h-7 w-7 bg-neutral-700 border border-neutral-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src="/celo.png" alt="Celo" className="w-full h-full object-cover" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-md px-3 py-2">
                              <p className="text-sm">
                                <HighlightedText text={message.text} />
                              </p>
                              
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

                      {/* Action Messages (Stake ETH Confirmation) */}
                      {message.type === "action" && message.action?.type === "stake_eth" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-2xl rounded-tl-md px-4 py-3">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-4 w-4 text-white" />
                                <p className="text-sm text-blue-300 font-medium">Stake ETH via Yearn Vault</p>
                              </div>
                              
                              <div className="space-y-2 text-xs text-neutral-300 mb-3">
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Amount to Stake:</span>
                                  <span className="font-medium text-white">{message.action.data.amount} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Vault:</span>
                                  <span className="text-xs">Yearn V3 WETH Vault</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Network:</span>
                                  <span className="text-xs">Celo Mainnet</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-neutral-700">
                                  <p className="text-neutral-400 text-xs">
                                    💡 Earn yield on your ETH via Yearn&apos;s battle-tested strategies. Fully ERC-4626 compliant.
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs"
                                  disabled={isConfirming}
                                  onClick={() => handleExecuteStakeEth(message.action.args)}
                                >
                                  {isConfirming ? 'Staking...' : 'Confirm Stake'}
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
                                      text: "Staking cancelled. How else can I help you?",
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

                      {/* Action Messages (Stake CELO Confirmation) */}
                      {message.type === "action" && message.action?.type === "stake_celo" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-8 w-8 bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl rounded-tl-md px-4 py-3">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-4 w-4 text-white" />
                                <p className="text-sm text-green-300 font-medium">Stake CELO Confirmation</p>
                              </div>
                              
                              <div className="space-y-2 text-xs text-neutral-300 mb-3">
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Amount to Stake:</span>
                                  <span className="font-medium text-white">{message.action.data.amount} CELO</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">You&apos;ll Receive:</span>
                                  <span className="font-medium text-green-300">~{message.action.data.amount} stCELO</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Network:</span>
                                  <span className="text-xs">Celo Mainnet</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-neutral-700">
                                  <p className="text-neutral-400 text-xs">
                                    💡 Earn rewards by staking CELO. Your stCELO can be unstaked anytime.
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs"
                                  disabled={isConfirming}
                                  onClick={() => handleExecuteStake(message.action.args)}
                                >
                                  {isConfirming ? 'Staking...' : 'Confirm Stake'}
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
                                      text: "Staking cancelled. How else can I help you?",
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

                      {/* Action Messages (Payment Request Confirmation) */}
                      {message.type === "action" && message.action?.type === "request_payment" && (
                        <div className="flex justify-start items-start gap-2">
                          <Avatar className="h-8 w-8 bg-gradient-to-br from-orange-600 to-yellow-600 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-white" />
                          </Avatar>
                          <div className="max-w-[80%] md:max-w-[70%]">
                            <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-500/30 rounded-2xl rounded-tl-md px-4 py-3">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-white" />
                                <p className="text-sm text-orange-300 font-medium">Payment Request Confirmation</p>
                              </div>
                              
                              <div className="space-y-2 text-xs text-neutral-300 mb-3">
                                {message.action.data.description && (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-400">For:</span>
                                    <span>{message.action.data.description}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Total Amount:</span>
                                  <span className="font-medium text-white">{message.action.data.totalAmount} {message.action.data.tokenSymbol}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-400">Split Type:</span>
                                  <span>{message.action.data.splitType === 'equal_split' ? 'Equal Split' : 'Custom Amounts'}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-neutral-700">
                                  <p className="text-neutral-400 mb-1">Requesting from:</p>
                                  {message.action.data.fromAddresses?.map((addr, idx) => (
                                    <div key={idx} className="flex justify-between ml-2">
                                      <span className="font-mono text-xs">{addr.substring(0, 10)}...</span>
                                      <span className="font-medium text-orange-300">{message.action.data.amounts[addr]} {message.action.data.tokenSymbol}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white text-xs"
                                  onClick={() => handleCreatePaymentRequest(message.action.data)}
                                >
                                  Send Request
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 text-xs"
                                  onClick={() => {
                                    const cancelMsg = {
                                      id: messages.length + 1,
                                      type: "bot",
                                      text: "Payment request cancelled. How else can I help you?",
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
                      <Avatar className="h-7 w-7 bg-neutral-700 border border-neutral-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src="/celo.png" alt="Celo" className="w-full h-full object-cover" />
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
              <div className="px-3 py-2 border-t border-neutral-800 bg-neutral-900/30 flex-shrink-0 relative z-20">
                <p className="text-xs text-neutral-500 text-center mb-1.5">Recent actions:</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputValue("Send $0.01 to @Alice Johnson");
                    }}
                    className="bg-neutral-900/50 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs px-3 py-1.5 h-8 rounded-md transition-colors cursor-pointer relative z-30"
                  >
                    Send USDC
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputValue("I paid $60 for dinner with @Bob Smith and @Carol Lee, split it equally");
                    }}
                    className="bg-neutral-900/50 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs px-3 py-1.5 h-8 rounded-md transition-colors cursor-pointer relative z-30"
                  >
                    Split Bill
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputValue("I want to stake 10 CELO to earn rewards");
                    }}
                    className="bg-neutral-900/50 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs px-3 py-1.5 h-8 rounded-md transition-colors cursor-pointer relative z-30"
                  >
                    Stake CELO
                  </button>
                </div>
              </div>

              {/* Input Area - Bigger typing space */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex-shrink-0 relative z-20">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Type @ for contacts, $ for USD amount..."
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 rounded-full px-5 py-3 focus:ring-2 focus:ring-neutral-600 focus:border-transparent text-base h-12"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendMessage();
                    }}
                    disabled={!inputValue.trim()}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-full h-12 w-12 p-0 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 relative z-30"
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

