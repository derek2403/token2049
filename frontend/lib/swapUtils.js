/**
 * Swap Utilities - Squid Router Integration
 * Handle cross-chain swaps using Squid Router API
 */

import { parseUnits } from 'viem';

/**
 * Get swap route from Squid Router API
 * 
 * @param {Object} params - Swap parameters
 * @returns {Promise<Object>} - Route data and request ID
 */
export async function getSwapRoute(params) {
  try {
    console.log('Requesting swap route with params:', params);
    
    const response = await fetch('/api/squid-route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Swap route API error:', {
        status: response.status,
        statusText: response.statusText,
        error: error
      });
      throw new Error(error.error || error.details?.message || `API Error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Swap route response:', result);
    return result;
  } catch (error) {
    console.error('Error getting swap route:', error);
    throw error;
  }
}

/**
 * Execute USDC to CELO swap using Squid Router
 * 
 * @param {Object} params - Swap execution parameters
 * @param {string} params.amount - Amount of CELO needed (will calculate USDC amount)
 * @param {string} params.userAddress - User's wallet address
 * @param {Function} params.writeContract - Wagmi write contract function
 * @param {Function} params.sendTransaction - Wagmi send transaction function
 * @param {number} params.chainId - Current chain ID
 * @returns {Promise<Object>} - Swap result
 */
export async function swapUsdcToCelo({
  amount,
  userAddress,
  writeContract,
  sendTransaction,
  chainId,
}) {
  try {
    // Define tokens based on chain
    // IMPORTANT: Using actual USDC (Circle), not cUSD
    const USDC_ADDRESS = chainId === 42220 
      ? "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" // USDC (Circle) on Celo Mainnet
      : "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B"; // USDC on Alfajores

    const CELO_ADDRESS = chainId === 42220
      ? "0x471EcE3750Da237f93B8E339c536989b8978a438" // Wrapped CELO on Mainnet
      : "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"; // Wrapped CELO on Alfajores

    // Convert amount to wei (assuming 1:1 USDC:CELO for simplicity)
    const amountInWei = parseUnits(amount, 18);

    // Get swap route from Squid Router
    const routeParams = {
      fromAddress: userAddress,
      fromChain: chainId.toString(),
      fromToken: USDC_ADDRESS,
      fromAmount: amountInWei.toString(),
      toChain: chainId.toString(), // Same chain swap
      toToken: CELO_ADDRESS,
      toAddress: userAddress,
      slippage: 1, // 1% slippage tolerance
    };

    console.log('Getting swap route:', routeParams);
    const { route, requestId } = await getSwapRoute(routeParams);

    if (!route || !route.transactionRequest) {
      throw new Error('Invalid route response from Squid Router');
    }

    const transactionRequest = route.transactionRequest;

    // Step 1: Approve Squid Router to spend USDC
    console.log('Approving USDC spend...');
    const erc20Abi = [
      {
        "inputs": [
          { "name": "spender", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

    const approvalHash = await writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [transactionRequest.target, BigInt(amountInWei.toString())],
    });

    console.log('Approval transaction:', approvalHash);

    // Wait a moment for approval to be mined
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Execute swap transaction
    console.log('Executing swap...');
    const swapHash = await sendTransaction({
      to: transactionRequest.target,
      data: transactionRequest.data,
      value: BigInt(transactionRequest.value || 0),
      gas: BigInt(transactionRequest.gasLimit || 500000),
    });

    console.log('Swap transaction:', swapHash);

    return {
      success: true,
      hash: swapHash,
      requestId,
      amount,
    };

  } catch (error) {
    console.error('Swap error:', error);

    // Handle user rejection
    if (error.message?.includes('User rejected') || error.code === 4001) {
      return {
        success: false,
        error: 'Swap rejected by user',
        userRejected: true,
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to swap USDC to CELO',
    };
  }
}

/**
 * Check swap transaction status
 * 
 * @param {Object} params - Status check parameters
 * @returns {Promise<Object>} - Transaction status
 */
export async function checkSwapStatus(params) {
  try {
    const response = await fetch('/api/squid-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check swap status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking swap status:', error);
    throw error;
  }
}

