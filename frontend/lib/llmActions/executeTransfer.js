/**
 * Execute Transfer - Complete transfer functionality
 * Handles validation, preparation, and blockchain execution of token transfers
 */

import { parseUnits, erc20Abi } from 'viem';

/**
 * Token contract addresses on Celo networks
 */
export const TOKEN_ADDRESSES = {
  // Celo Mainnet
  42220: {
    CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438", // Native CELO (wrapped)
    cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    cEUR: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  },
  // Celo Alfajores Testnet
  44787: {
    CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9", // Native CELO (wrapped)
    cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    cEUR: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F",
  },
};

/**
 * Transfer funds function definition for AI
 * This defines the schema that the AI will use to call the transfer function
 */
export const transferFundsFunction = {
  name: "transfer_funds",
  description: "Transfer cryptocurrency tokens from the connected wallet to a destination address. Use this when the user wants to send, transfer, or pay tokens to someone.",
  parameters: {
    type: "object",
    properties: {
      destinationAddress: {
        type: "string",
        description: "The recipient's wallet address (0x... format). Must be a valid Ethereum/Celo address.",
      },
      amount: {
        type: "string",
        description: "The amount of tokens to transfer (e.g., '100', '0.5'). Must be a positive number.",
      },
      tokenSymbol: {
        type: "string",
        description: "The token symbol to transfer (e.g., 'CELO', 'cUSD', 'cEUR'). Default is 'cUSD'.",
        enum: ["CELO", "cUSD", "cEUR"],
      },
    },
    required: ["destinationAddress", "amount", "tokenSymbol"],
  },
};

/**
 * Validate transfer parameters
 */
function validateTransferParams({ destinationAddress, amount, tokenSymbol }) {
  const errors = [];
  const missing = [];
  
  // Check for missing required parameters
  if (!destinationAddress) missing.push("destination address");
  if (!amount) missing.push("amount");
  if (!tokenSymbol) missing.push("token symbol");
  
  if (missing.length > 0) {
    return {
      isValid: false,
      missing,
      error: `Missing required information: ${missing.join(", ")}. Please provide these details.`,
    };
  }
  
  // Validate destination address format
  if (!destinationAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    errors.push("Invalid destination address format. Must be a valid Ethereum address starting with 0x");
  }
  
  // Validate amount
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push("Invalid amount. Must be a positive number");
  }
  
  // Validate token symbol
  if (!["CELO", "cUSD", "cEUR"].includes(tokenSymbol)) {
    errors.push("Invalid token symbol. Must be CELO, cUSD, or cEUR");
  }
  
  return {
    isValid: errors.length === 0,
    missing: [],
    errors,
    error: errors.join(". "),
  };
}

/**
 * Prepare transfer funds action
 * This validates and prepares the transfer for execution
 * 
 * @param {string} userAddress - The connected user's wallet address
 * @param {string} destinationAddress - The recipient's address
 * @param {string} amount - The amount to transfer
 * @param {string} tokenSymbol - The token to transfer
 * @returns {Object} - Transfer details for confirmation or validation errors
 */
export function prepareTransferFunds({ userAddress, destinationAddress, amount, tokenSymbol }) {
  // Check if wallet is connected
  if (!userAddress) {
    return {
      success: false,
      error: "No wallet connected. Please connect your wallet first to make transfers.",
      needsWallet: true,
    };
  }
  
  // Validate parameters
  const validation = validateTransferParams({ destinationAddress, amount, tokenSymbol });
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      missing: validation.missing,
      errors: validation.errors,
      currentParams: {
        destinationAddress: destinationAddress || null,
        amount: amount || null,
        tokenSymbol: tokenSymbol || null,
      },
    };
  }
  
  // All valid - return transfer details for confirmation
  return {
    success: true,
    type: "transfer_funds",
    userAddress,
    destinationAddress,
    amount,
    tokenSymbol,
    status: "pending_confirmation",
    message: `Ready to transfer ${amount} ${tokenSymbol} to ${destinationAddress}`,
  };
}

/**
 * Execute a token transfer on Celo blockchain
 * 
 * @param {Object} params - Transfer parameters
 * @param {string} params.destinationAddress - Recipient address
 * @param {string} params.amount - Amount to transfer
 * @param {string} params.tokenSymbol - Token symbol (CELO, cUSD, cEUR)
 * @param {Object} wagmiConfig - Wagmi write contract function
 * @param {number} chainId - Current chain ID
 * @returns {Promise<Object>} - Transaction result
 */
export async function executeTokenTransfer({ 
  destinationAddress, 
  amount, 
  tokenSymbol,
  writeContract,
  sendTransaction,
  chainId,
  userAddress
}) {
  try {

    // For CELO (native token), use sendTransaction
    if (tokenSymbol === "CELO") {
      const amountInWei = parseUnits(amount, 18); // CELO has 18 decimals
      
      const hash = await sendTransaction({
        to: destinationAddress,
        value: amountInWei,
      });
      
      return {
        success: true,
        hash,
        type: 'native',
        amount,
        tokenSymbol,
        destinationAddress,
      };
    }
    
    // For ERC20 tokens (cUSD, cEUR), use writeContract
    const tokenAddress = TOKEN_ADDRESSES[chainId]?.[tokenSymbol];
    
    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not supported on chain ${chainId}`);
    }
    
    // Parse amount with 18 decimals (cUSD and cEUR use 18 decimals)
    const amountInWei = parseUnits(amount, 18);
    
    const hash = await writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [destinationAddress, amountInWei],
    });
    
    return {
      success: true,
      hash,
      type: 'erc20',
      amount,
      tokenSymbol,
      destinationAddress,
      tokenAddress,
    };
    
  } catch (error) {
    console.error('Transfer error:', error);
    
    // Handle user rejection
    if (error.message?.includes('User rejected') || error.code === 4001) {
      return {
        success: false,
        error: 'Transaction rejected by user',
        userRejected: true,
      };
    }
    
    // Handle insufficient funds
    if (error.message?.includes('insufficient funds')) {
      return {
        success: false,
        error: 'Insufficient funds for this transfer',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to execute transfer',
    };
  }
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerUrl(chainId, hash) {
  const explorers = {
    42220: 'https://celoscan.io',
    44787: 'https://alfajores.celoscan.io',
  };
  
  const baseUrl = explorers[chainId] || explorers[44787];
  return `${baseUrl}/tx/${hash}`;
}

