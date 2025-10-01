import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

/**
 * Chat Response Manager Page
 * Shows all hardcoded responses from chat.js in an organized way
 * Allows you to easily find and modify chat responses
 */
export default function ChatResponseManager() {
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // All responses organized by category with color schemes matching chat.js
  const responses = {
    "Initial Messages": [
      {
        id: "initial-greeting",
        location: "Line 124",
        text: "👋 Hello! I'm your LeftAI assistant. Tell me what you'd like to do with your crypto.",
        category: "Bot",
        colorScheme: "bot"
      }
    ],
    
    "System Prompt": [
      {
        id: "system-prompt-main",
        location: "Lines 329-395",
        text: `You are a helpful AI assistant for crypto transactions on the Celo blockchain. 
Help users understand and execute their crypto transactions using natural language. 
Be concise, friendly, and security-conscious.`,
        category: "AI Instructions",
        colorScheme: "bot"
      },
      {
        id: "system-prompt-features",
        location: "Lines 335-339",
        text: `IMPORTANT FEATURES:
- Users can type @ to select contacts by name (frontend handles conversion to wallet address)
- Users can type $ for USD amounts (frontend auto-converts to USDC at 1:1 ratio)
- You will receive wallet addresses (not contact names) in the processed input
- When parsing amounts, look for patterns like "30 USDC" or "50 CELO"`,
        category: "AI Instructions",
        colorScheme: "bot"
      }
    ],

    "Processing Messages": [
      {
        id: "processing-transfer",
        location: "Line 742",
        text: "Processing transaction... Please confirm in your wallet.",
        category: "System",
        colorScheme: "system"
      },
      {
        id: "processing-stake-celo",
        location: "Line 674",
        text: "Preparing to stake CELO... Please confirm in your wallet.",
        category: "System",
        colorScheme: "system"
      },
      {
        id: "processing-stake-eth",
        location: "Line 607",
        text: "Depositing ETH into Yearn vault... This requires 2 transactions: Approve WETH and Deposit.",
        category: "System",
        colorScheme: "system"
      },
      {
        id: "processing-payment-request",
        location: "Line 813",
        text: "Creating payment request...",
        category: "System",
        colorScheme: "system"
      }
    ],

    "Success Messages": [
      {
        id: "success-transfer-submitted",
        location: "Line 766",
        text: "Transaction submitted! Waiting for confirmation...",
        category: "System",
        colorScheme: "system"
      },
      {
        id: "success-transfer-confirmed",
        location: "Line 236",
        text: "Transfer completed successfully!",
        category: "Attestation",
        colorScheme: "attestation"
      },
      {
        id: "success-stake-celo-submitted",
        location: "Line 695",
        text: "Staking transaction submitted! Waiting for confirmation...",
        category: "System",
        colorScheme: "system"
      },
      {
        id: "success-stake-eth-complete",
        location: "Line 628",
        text: "ETH staking complete! Waiting for blockchain confirmation...",
        category: "System",
        colorScheme: "system"
      },
      {
        id: "success-payment-request",
        location: "Line 872",
        text: "Payment request sent successfully!",
        category: "Attestation",
        colorScheme: "attestation"
      }
    ],

    "Error Messages": [
      {
        id: "error-ai-connection",
        location: "Line 457",
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again.",
        category: "Bot Error",
        colorScheme: "bot"
      },
      {
        id: "error-function-execution",
        location: "Line 530",
        text: "Sorry, I encountered an error processing your request. Please try again.",
        category: "Bot Error",
        colorScheme: "bot"
      },
      {
        id: "error-transfer-execution",
        location: "Line 799",
        text: "Sorry, there was an error executing the transaction. Please try again.",
        category: "Bot Error",
        colorScheme: "bot"
      },
      {
        id: "error-stake-celo-execution",
        location: "Line 727",
        text: "Sorry, there was an error executing the stake. Please try again.",
        category: "Bot Error",
        colorScheme: "bot"
      },
      {
        id: "error-stake-eth-execution",
        location: "Line 659",
        text: "Sorry, there was an error executing the ETH stake. Please try again.",
        category: "Bot Error",
        colorScheme: "bot"
      },
      {
        id: "error-payment-request",
        location: "Line 892",
        text: "Sorry, there was an error creating the payment request. Please try again.",
        category: "Bot Error",
        colorScheme: "bot"
      }
    ],

    "Cancellation Messages": [
      {
        id: "cancel-transfer",
        location: "Line 1069",
        text: "Transfer cancelled. How else can I help you?",
        category: "Bot",
        colorScheme: "bot"
      },
      {
        id: "cancel-stake",
        location: "Line 1201",
        text: "Staking cancelled. How else can I help you?",
        category: "Bot",
        colorScheme: "bot"
      },
      {
        id: "cancel-payment-request",
        location: "Line 1271",
        text: "Payment request cancelled. How else can I help you?",
        category: "Bot",
        colorScheme: "bot"
      }
    ],

    "User Rejection Messages": [
      {
        id: "reject-transfer",
        location: "Line 786",
        text: "Transaction was cancelled. Let me know if you'd like to try again!",
        category: "Bot",
        colorScheme: "bot"
      },
      {
        id: "reject-stake-celo",
        location: "Line 714",
        text: "Staking was cancelled. Let me know if you'd like to try again!",
        category: "Bot",
        colorScheme: "bot"
      },
      {
        id: "reject-stake-eth",
        location: "Line 646",
        text: "ETH staking was cancelled. Let me know if you'd like to try again!",
        category: "Bot",
        colorScheme: "bot"
      }
    ],

    "UI Labels & Buttons": [
      {
        id: "input-placeholder",
        location: "Line 1353",
        text: "Type @ for contacts, $ for USD amount...",
        category: "UI",
        colorScheme: "ui"
      },
      {
        id: "quick-action-1",
        location: "Line 1323",
        text: "Send USDC",
        category: "Quick Action Button",
        colorScheme: "ui"
      },
      {
        id: "quick-action-2",
        location: "Line 1332",
        text: "Split Bill",
        category: "Quick Action Button",
        colorScheme: "ui"
      },
      {
        id: "quick-action-3",
        location: "Line 1341",
        text: "Stake CELO",
        category: "Quick Action Button",
        colorScheme: "ui"
      },
      {
        id: "recent-actions-label",
        location: "Line 1314",
        text: "Recent actions:",
        category: "UI Label",
        colorScheme: "ui"
      }
    ],

    "Confirmation Cards": [
      {
        id: "transfer-confirm-title",
        location: "Line 1033",
        text: "Transfer Confirmation Required",
        category: "Transfer Action",
        colorScheme: "transfer-action"
      },
      {
        id: "transfer-confirm-button",
        location: "Line 1058",
        text: "Confirm Transfer",
        category: "Transfer Button",
        colorScheme: "transfer-action"
      },
      {
        id: "stake-eth-confirm-title",
        location: "Line 1094",
        text: "Stake ETH via Yearn Vault",
        category: "ETH Stake Action",
        colorScheme: "eth-stake-action"
      },
      {
        id: "stake-eth-confirm-button",
        location: "Line 1124",
        text: "Confirm Stake",
        category: "ETH Stake Button",
        colorScheme: "eth-stake-action"
      },
      {
        id: "stake-eth-info",
        location: "Line 1112",
        text: "💡 Earn yield on your ETH via Yearn's battle-tested strategies. Fully ERC-4626 compliant.",
        category: "ETH Stake Info",
        colorScheme: "eth-stake-action"
      },
      {
        id: "stake-celo-confirm-title",
        location: "Line 1160",
        text: "Stake CELO Confirmation",
        category: "CELO Stake Action",
        colorScheme: "stake-action"
      },
      {
        id: "stake-celo-confirm-button",
        location: "Line 1190",
        text: "Confirm Stake",
        category: "CELO Stake Button",
        colorScheme: "stake-action"
      },
      {
        id: "stake-celo-info",
        location: "Line 1178",
        text: "💡 Earn rewards by staking CELO. Your stCELO can be unstaked anytime.",
        category: "CELO Stake Info",
        colorScheme: "stake-action"
      },
      {
        id: "payment-confirm-title",
        location: "Line 1226",
        text: "Payment Request Confirmation",
        category: "Payment Action",
        colorScheme: "payment-action"
      },
      {
        id: "payment-confirm-button",
        location: "Line 1261",
        text: "Send Request",
        category: "Payment Button",
        colorScheme: "payment-action"
      }
    ],

  };

  // Get color scheme based on message type (matching chat.js exactly)
  const getColorScheme = (colorScheme) => {
    const schemes = {
      'bot': {
        bg: 'bg-neutral-800 text-neutral-100',
        border: 'border-neutral-700'
      },
      'system': {
        bg: 'bg-neutral-800/50 text-neutral-400',
        border: 'border-neutral-700'
      },
      'attestation': {
        bg: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 text-green-300',
        border: 'border-green-500/30'
      },
      'transfer-action': {
        bg: 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 text-purple-300',
        border: 'border-purple-500/30'
      },
      'eth-stake-action': {
        bg: 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 text-blue-300',
        border: 'border-blue-500/30'
      },
      'stake-action': {
        bg: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 text-green-300',
        border: 'border-green-500/30'
      },
      'payment-action': {
        bg: 'bg-gradient-to-br from-orange-900/30 to-yellow-900/30 text-orange-300',
        border: 'border-orange-500/30'
      },
      'ui': {
        bg: 'bg-neutral-800 text-neutral-300',
        border: 'border-neutral-700'
      }
    };
    return schemes[colorScheme] || schemes.bot;
  };

  // Copy text to clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter responses based on search
  const filteredResponses = Object.entries(responses).reduce((acc, [category, items]) => {
    const filtered = items.filter(item => 
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Chat Response Manager</h1>
          <p className="text-neutral-400">All hardcoded responses from chat.js organized by category</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-neutral-900 border-neutral-700 text-white"
          />
        </div>

        {/* Responses by Category */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-6">
            {Object.entries(filteredResponses).map(([category, items]) => (
              <Card key={category} className="bg-neutral-900/50 border-neutral-700/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
                <div className="space-y-4">
                  {items.map((response) => {
                    const colors = getColorScheme(response.colorScheme);
                    return (
                      <div 
                        key={response.id} 
                        className={`${colors.bg} border ${colors.border} rounded-2xl p-4 hover:brightness-110 transition-all`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-neutral-700/50 text-neutral-200 border-neutral-600 text-xs">
                                {response.category}
                              </Badge>
                              <span className="text-xs text-neutral-500">{response.location}</span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm">{response.text}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(response.text, response.id)}
                            className="flex-shrink-0 text-neutral-400 hover:text-white"
                          >
                            {copiedId === response.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-neutral-900/50 border border-neutral-700/50 rounded-lg">
          <p className="text-sm text-neutral-400">
            💡 <strong>How to use:</strong> Find the response you want to change, note its line number, 
            then open <code className="bg-neutral-800 px-1 py-0.5 rounded">chat.js</code> and navigate to that line to edit it.
          </p>
        </div>
      </div>
    </div>
  );
}

