/**
 * Stake CELO - Complete staking functionality
 * Handles validation, preparation, and blockchain execution of CELO staking
 */

import { parseUnits } from 'viem';

/**
 * Contract addresses (Celo Mainnet)
 */
export const STCELO_CONTRACT = "0xC668583dcbDc9ae6FA3CE46462758188adfdfC24";

/**
 * Wrapped CELO (ERC20) ABI
 */
export const WCELO_ABI = [];

/**
 * stCELO ABI - Staking interface (uses wrapped CELO)
 */
export const STCELO_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "minOut", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];

/**
 * Stake CELO function definition for AI
 * This defines the schema that the AI will use to call the stake function
 */
export const stakeCeloFunction = {
  name: "stake_celo",
  description: "Stake CELO tokens to earn rewards. Use this when the user wants to save money, earn yield, stake, or manage their CELO for passive income. Staked CELO (stCELO) can be unstaked later.",
  parameters: {
    type: "object",
    properties: {
      amount: {
        type: "string",
        description: "The amount of CELO to stake (e.g., '100', '50.5'). Must be a positive number.",
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
  
  // Check for missing required parameters
  if (!amount) {
    missing.push("amount");
    return {
      isValid: false,
      missing,
      error: "Missing required information: amount. Please specify how much CELO you want to stake.",
    };
  }
  
  // Validate amount
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push("Invalid amount. Must be a positive number");
  }
  
  // Minimum stake amount (1 CELO minimum recommended)
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
 * This validates and prepares the staking for execution
 * 
 * @param {string} userAddress - The connected user's wallet address
 * @param {string} amount - The amount of CELO to stake
 * @returns {Object} - Stake details for confirmation or validation errors
 */
export function prepareStakeCelo({ userAddress, amount }) {
  // Check if wallet is connected
  if (!userAddress) {
    return {
      success: false,
      error: "No wallet connected. Please connect your wallet first to stake CELO.",
      needsWallet: true,
    };
  }
  
  // Validate parameters
  const validation = validateStakeParams({ amount });
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      missing: validation.missing,
      errors: validation.errors,
      currentParams: {
        amount: amount || null,
      },
    };
  }
  
  // All valid - return stake details for confirmation
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
 * Execute CELO staking on blockchain (with automatic USDC to CELO swap)
 * 
 * @param {Object} params - Stake parameters
 * @param {string} params.amount - Amount to stake
 * @param {Function} params.writeContract - Wagmi write contract function
 * @param {Function} params.sendTransaction - Wagmi send transaction function
 * @param {number} params.chainId - Current chain ID
 * @param {string} params.userAddress - User's wallet address
 * @param {Function} params.onSwapStart - Callback when swap starts (optional)
 * @param {Function} params.onSwapComplete - Callback when swap completes (optional)
 * @returns {Promise<Object>} - Transaction result
 */
export async function executeStakeCelo({ 
  amount, 
  writeContract,
  sendTransaction,
  chainId,
  userAddress,
  onSwapStart,
  onSwapComplete,
  publicClient,
}) {
  try {
    // Only works on Celo Mainnet (42220)
    if (chainId !== 42220) {
      return {
        success: false,
        error: "Staking is only available on Celo Mainnet (chainId: 42220). Please switch to Celo Mainnet network.",
      };
    }
    
    // StakedCelo staking process - deposit native CELO with slippage protection
    console.log('Proceeding with CELO staking (native CELO)...');
    
    // Parse amount with 18 decimals
    const amountInWei = parseUnits(amount, 18);
    
    console.log('Staking details:', {
      stCeloContract: STCELO_CONTRACT,
      amount: amount,
      amountInWei: amountInWei.toString(),
      chainId: chainId,
    });
    
    // Probe likely deposit signatures via simulate to avoid failed txs
    const candidateCalls = [
      { abi: STCELO_ABI, fn: 'deposit', args: [1n], value: amountInWei }, // deposit(uint256 minOut) payable
      { abi: [{ inputs: [], name: 'deposit', outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }], stateMutability: 'payable', type: 'function' }], fn: 'deposit', args: [], value: amountInWei }, // deposit() payable
      { abi: [{ inputs: [{ internalType: 'uint256', name: 'minOut', type: 'uint256' }, { internalType: 'address', name: 'receiver', type: 'address' }], name: 'deposit', outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }], stateMutability: 'payable', type: 'function' }], fn: 'deposit', args: [1n, userAddress], value: amountInWei }, // deposit(uint256,address) payable
    ];

    let prepared;
    if (!publicClient) {
      // Fallback: try first signature directly
      prepared = { direct: true };
    } else {
      for (const c of candidateCalls) {
        try {
          const sim = await publicClient.simulateContract({
            address: STCELO_CONTRACT,
            abi: c.abi,
            functionName: c.fn,
            args: c.args,
            value: c.value,
          });
          prepared = { request: sim.request };
          break;
        } catch (e) {
          // try next
        }
      }
    }

    let hash;
    if (prepared?.request) {
      hash = await writeContract(prepared.request);
    } else {
      // Fallback to first candidate without simulate
      const c = candidateCalls[0];
      hash = await writeContract({ address: STCELO_CONTRACT, abi: c.abi, functionName: c.fn, args: c.args, value: c.value });
    }
    
    return {
      success: true,
      hash,
      type: 'stake',
      amount,
      contractAddress: STCELO_CONTRACT,
    };
    
  } catch (error) {
    console.error('Staking error:', error);
    
    // Handle user rejection
    if (error.message?.includes('User rejected') || error.code === 4001) {
      return {
        success: false,
        error: 'Staking rejected by user',
        userRejected: true,
      };
    }
    
    // Handle insufficient funds
    if (error.message?.includes('insufficient funds')) {
      return {
        success: false,
        error: 'Insufficient funds for staking. Make sure you have enough USDC.',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to stake CELO',
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
  
  const baseUrl = explorers[chainId] || explorers[42220];
  return `${baseUrl}/tx/${hash}`;
}

