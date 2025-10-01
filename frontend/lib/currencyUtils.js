/**
 * Currency Utilities
 * Simple 1:1 conversion - $1 = 1 CELO
 */

/**
 * Convert USD amount to CELO (1:1 ratio)
 * $1 = 1 CELO
 */
export async function usdToCelo(usdAmount) {
  const amount = parseFloat(usdAmount);
  if (isNaN(amount) || amount <= 0) return "0";
  
  // 1:1 conversion - $1 = 1 CELO
  return amount.toString();
}

/**
 * Convert CELO amount to USD (1:1 ratio)
 * 1 CELO = $1
 */
export async function celoToUsd(celoAmount) {
  const amount = parseFloat(celoAmount);
  if (isNaN(amount) || amount <= 0) return "0";
  
  // 1:1 conversion - 1 CELO = $1
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

