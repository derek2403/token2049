/**
 * Currency Utilities
 * Simple 1:1 conversion - $1 = 1 USDC
 */

/**
 * Convert USD amount to USDC (1:1 ratio)
 * $1 = 1 USDC
 */
export async function usdToUsdc(usdAmount) {
  const amount = parseFloat(usdAmount);
  if (isNaN(amount) || amount <= 0) return "0";
  
  // 1:1 conversion - $1 = 1 USDC
  return amount.toString();
}

/**
 * Convert USDC amount to USD (1:1 ratio)
 * 1 USDC = $1
 */
export async function usdcToUsd(usdcAmount) {
  const amount = parseFloat(usdcAmount);
  if (isNaN(amount) || amount <= 0) return "0";
  
  // 1:1 conversion - 1 USDC = $1
  return amount.toFixed(2);
}

/**
 * Parse USD input from text (handles $100, 100, etc.)
 */
export function parseUsdAmount(text) {
  // Remove $ and whitespace, parse as float
  const cleaned = text.replace(/[$\s,]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
}

