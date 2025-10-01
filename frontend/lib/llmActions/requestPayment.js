/**
 * Request Payment - Payment request and split functionality
 * Handles creating payment requests that can be split among multiple users
 */

/**
 * Request Payment function definition for AI
 * This defines the schema that the AI will use to call the request payment function
 */
export const requestPaymentFunction = {
  name: "request_payment",
  description: "Request payment from one or more users. Can split a total amount equally among users, or specify individual amounts for each user. Use this when someone wants to request money, split a bill, or ask for payment.",
  parameters: {
    type: "object",
    properties: {
      fromAddresses: {
        type: "array",
        description: "Array of wallet addresses to request payment from (0x... format). These are the people who need to pay.",
        items: {
          type: "string"
        }
      },
      totalAmount: {
        type: "string",
        description: "The total amount being requested (e.g., '100', '45.50'). If splitting equally, this will be divided among all users. Optional if individualAmounts is provided.",
      },
      individualAmounts: {
        type: "object",
        description: "Optional: Specific amounts for each address. Keys are wallet addresses, values are amounts as strings. Use this when different people owe different amounts.",
        additionalProperties: {
          type: "string"
        }
      },
      tokenSymbol: {
        type: "string",
        description: "The token symbol for the payment request (e.g., 'CELO', 'cUSD', 'cEUR'). Default is 'cUSD'.",
        enum: ["CELO", "cUSD", "cEUR"],
      },
      description: {
        type: "string",
        description: "Optional description of what the payment is for (e.g., 'Dinner at restaurant', 'Movie tickets')",
      }
    },
    required: ["fromAddresses", "tokenSymbol"],
  },
};

/**
 * Validate request payment parameters
 */
function validateRequestParams({ fromAddresses, totalAmount, individualAmounts, tokenSymbol }) {
  const errors = [];
  const missing = [];
  
  // Check for missing required parameters
  if (!fromAddresses || fromAddresses.length === 0) {
    missing.push("recipient addresses (people to request from)");
  }
  
  if (!tokenSymbol) {
    missing.push("token symbol");
  }
  
  // Must have either totalAmount or individualAmounts
  if (!totalAmount && !individualAmounts) {
    missing.push("amount (either total amount to split or individual amounts)");
  }
  
  if (missing.length > 0) {
    return {
      isValid: false,
      missing,
      error: `Missing required information: ${missing.join(", ")}. Please provide these details.`,
    };
  }
  
  // Validate addresses
  if (fromAddresses) {
    for (const addr of fromAddresses) {
      if (!addr.match(/^0x[a-fA-F0-9]{40}$/)) {
        errors.push(`Invalid address format: ${addr}. Must be a valid Ethereum address starting with 0x`);
      }
    }
  }
  
  // Validate totalAmount if provided
  if (totalAmount) {
    const numAmount = parseFloat(totalAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push("Invalid total amount. Must be a positive number");
    }
  }
  
  // Validate individualAmounts if provided
  if (individualAmounts) {
    for (const [addr, amount] of Object.entries(individualAmounts)) {
      if (!addr.match(/^0x[a-fA-F0-9]{40}$/)) {
        errors.push(`Invalid address in individualAmounts: ${addr}`);
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.push(`Invalid amount for ${addr}: ${amount}. Must be a positive number`);
      }
    }
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
 * Calculate individual amounts based on total and split
 */
function calculateSplitAmounts(totalAmount, addresses) {
  const total = parseFloat(totalAmount);
  const count = addresses.length;
  const amountPerPerson = (total / count).toFixed(6); // Keep precision
  
  const splitAmounts = {};
  addresses.forEach(addr => {
    splitAmounts[addr] = amountPerPerson;
  });
  
  return splitAmounts;
}

/**
 * Prepare request payment action
 * This validates and prepares the payment request
 * 
 * @param {string} userAddress - The connected user's wallet address (person requesting payment)
 * @param {string[]} fromAddresses - Array of addresses to request payment from
 * @param {string} totalAmount - Optional total amount to split equally
 * @param {Object} individualAmounts - Optional specific amounts for each address
 * @param {string} tokenSymbol - The token to request
 * @param {string} description - Optional description of the payment
 * @returns {Object} - Payment request details or validation errors
 */
export function prepareRequestPayment({ 
  userAddress, 
  fromAddresses, 
  totalAmount, 
  individualAmounts,
  tokenSymbol,
  description 
}) {
  // Check if wallet is connected
  if (!userAddress) {
    return {
      success: false,
      error: "No wallet connected. Please connect your wallet first to create payment requests.",
      needsWallet: true,
    };
  }
  
  // Validate parameters
  const validation = validateRequestParams({ 
    fromAddresses, 
    totalAmount, 
    individualAmounts, 
    tokenSymbol 
  });
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      missing: validation.missing,
      errors: validation.errors,
      currentParams: {
        fromAddresses: fromAddresses || null,
        totalAmount: totalAmount || null,
        individualAmounts: individualAmounts || null,
        tokenSymbol: tokenSymbol || null,
      },
    };
  }
  
  // Calculate amounts
  let amounts;
  let splitType;
  
  if (individualAmounts && Object.keys(individualAmounts).length > 0) {
    // Use provided individual amounts
    amounts = individualAmounts;
    splitType = "individual";
  } else if (totalAmount) {
    // Split total amount equally
    amounts = calculateSplitAmounts(totalAmount, fromAddresses);
    splitType = "equal_split";
  } else {
    return {
      success: false,
      error: "Either totalAmount or individualAmounts must be provided",
    };
  }
  
  // Calculate total if individual amounts were provided
  const calculatedTotal = Object.values(amounts)
    .reduce((sum, amt) => sum + parseFloat(amt), 0)
    .toFixed(6);
  
  // All valid - return payment request details
  return {
    success: true,
    type: "request_payment",
    userAddress,
    fromAddresses,
    amounts,
    totalAmount: totalAmount || calculatedTotal,
    tokenSymbol,
    description: description || "Payment request",
    splitType,
    status: "pending_confirmation",
    message: `Ready to request ${calculatedTotal} ${tokenSymbol} from ${fromAddresses.length} user(s)`,
  };
}

/**
 * Format a payment request for display or storage
 * Returns a structured object that can be saved to notifications or displayed
 */
export function formatPaymentRequest(requestData) {
  const { userAddress, fromAddresses, amounts, totalAmount, tokenSymbol, description, splitType } = requestData;
  
  // Create individual request items
  const requests = fromAddresses.map(addr => ({
    from: addr,
    to: userAddress,
    amount: amounts[addr],
    tokenSymbol,
    status: "pending",
  }));
  
  return {
    id: Date.now(),
    type: "payment_request",
    timestamp: new Date().toISOString(),
    requester: userAddress,
    description,
    totalAmount,
    tokenSymbol,
    splitType,
    requests,
  };
}

