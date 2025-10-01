/**
 * Stake CELO - Simple router-based staking
 * Uses your deployed SimpleStCeloRouter contract
 */

import { parseUnits } from 'viem';

/**
 * Your deployed SimpleStaking contract address
 */
export const STAKING_CONTRACT = "0x95Cb4F3CA3c7B5d1fD2577Ce47F65c15b4521Fa7";

/**
 * SimpleStaking ABI - simple stake() payable function
 */
export const STAKING_ABI = [
  {
    "inputs": [],
    "name": "stake",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  }
];

/**
 * Stake CELO function definition for AI
 */
export const stakeCeloFunction = {
  name: "stake_celo",
  description: "Stake CELO tokens to earn rewards via stCELO. Use this when the user wants to save money, earn yield, stake, or earn passive income.",
  parameters: {
    type: "object",
    properties: {
      amount: {
        type: "string",
        description: "The amount of CELO to stake (e.g., '10', '50.5'). Must be a positive number.",
      },
    },
    required: ["amount"],
  },
};

/**
 * Validate stake parameters
 */
function validateStakeParams({ amount }) {
  const errors = [];
  const missing = [];
  
  if (!amount) {
    missing.push("amount");
    return {
      isValid: false,
      missing,
      error: "Missing required information: amount. Please specify how much CELO you want to stake.",
    };
  }
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push("Invalid amount. Must be a positive number");
  }
  
  if (numAmount < 1) {
    errors.push("Amount too small. Minimum recommended stake is 1 CELO");
  }
  
  return {
    isValid: errors.length === 0,
    missing: [],
    errors,
    error: errors.join(". "),
  };
}

/**
 * Prepare stake CELO action
 */
export function prepareStakeCelo({ userAddress, amount }) {
  if (!userAddress) {
    return {
      success: false,
      error: "No wallet connected. Please connect your wallet first to stake CELO.",
      needsWallet: true,
    };
  }
  
  const validation = validateStakeParams({ amount });
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      missing: validation.missing,
      errors: validation.errors,
      currentParams: { amount: amount || null },
    };
  }
  
  return {
    success: true,
    type: "stake_celo",
    userAddress,
    amount,
    status: "pending_confirmation",
    message: `Ready to stake ${amount} CELO to earn rewards`,
  };
}

/**
 * Execute CELO staking via SimpleStCeloRouter
 */
export async function executeStakeCelo({ 
  amount, 
  writeContract,
  chainId,
  userAddress,
}) {
  try {
    // Only works on Celo Mainnet (42220)
    if (chainId !== 42220) {
      return {
        success: false,
        error: "Staking is only available on Celo Mainnet. Please switch to Celo Mainnet network.",
      };
    }
    
    console.log('Staking CELO via your contract...');
    
    // Parse amount with 18 decimals
    const amountInWei = parseUnits(amount, 18);
    
    console.log('Staking details:', {
      contract: STAKING_CONTRACT,
      amount: amount,
      amountInWei: amountInWei.toString(),
    });
    
    // Call stake() function with CELO value
    const hash = await writeContract({
      address: STAKING_CONTRACT,
      abi: STAKING_ABI,
      functionName: 'stake',
      value: amountInWei,
    });
    
    console.log('Stake transaction:', hash);
    
    return {
      success: true,
      hash,
      type: 'stake',
      amount,
      contractAddress: STAKING_CONTRACT,
    };
    
  } catch (error) {
    console.error('Staking error:', error);
    
    if (error.message?.includes('User rejected') || error.code === 4001) {
      return {
        success: false,
        error: 'Staking rejected by user',
        userRejected: true,
      };
    }
    
    if (error.message?.includes('insufficient funds')) {
      return {
        success: false,
        error: 'Insufficient CELO balance for staking',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to stake CELO',
    };
  }
}

/**
 * Get block explorer URL
 */
export function getExplorerUrl(chainId, hash) {
  const explorers = {
    42220: 'https://celoscan.io',
    44787: 'https://alfajores.celoscan.io',
  };
  
  const baseUrl = explorers[chainId] || explorers[42220];
  return `${baseUrl}/tx/${hash}`;
}
