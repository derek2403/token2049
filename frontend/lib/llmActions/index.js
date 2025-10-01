/**
 * LLM Actions - Central registry for AI agent capabilities
 * This module exports all available functions that the AI can call
 */

import { transferFundsFunction, prepareTransferFunds, TOKEN_ADDRESSES } from "./executeTransfer";
import { requestPaymentFunction, prepareRequestPayment } from "./requestPayment";

/**
 * All available functions that the AI agent can call
 * Add new functions here as you expand the agent's capabilities
 */
export const availableFunctions = [transferFundsFunction, requestPaymentFunction];

/**
 * Function executor - maps function names to their implementations
 */
export const functionExecutors = {
  transfer_funds: prepareTransferFunds,
  request_payment: prepareRequestPayment,
  // Add more function executors here as you add new capabilities
};

/**
 * Execute a function call from the AI
 * 
 * @param {string} functionName - Name of the function to execute
 * @param {Object} args - Arguments for the function
 * @param {string} userAddress - The connected wallet address (if any)
 * @returns {Object} - Result of the function execution
 */
export function executeFunction(functionName, args, userAddress = null) {
  const executor = functionExecutors[functionName];
  
  if (!executor) {
    return {
      success: false,
      error: `Unknown function: ${functionName}`,
    };
  }
  
  try {
    // Add userAddress to args if provided
    const fullArgs = userAddress ? { ...args, userAddress } : args;
    return executor(fullArgs);
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to execute function",
    };
  }
}

// Re-export everything for convenience
export { transferFundsFunction, prepareTransferFunds, TOKEN_ADDRESSES };

