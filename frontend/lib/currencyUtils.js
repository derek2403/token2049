/**
 * Currency Utilities
 * Handle USD to CELO conversion
 */

/**
 * Get current CELO price in USD
 * In production, this should call a real price API (e.g., CoinGecko, CoinMarketCap)
 */
export async function getCeloPrice() {
  try {
    // Using CoinGecko API as an example
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd'
    );
    const data = await response.json();
    return data.celo?.usd || 0.50; // Fallback to ~$0.50 if API fails
  } catch (error) {
    console.error('Error fetching CELO price:', error);
    return 0.50; // Fallback price
  }
}

/**
 * Convert USD amount to CELO
 */
export async function usdToCelo(usdAmount) {
  const celoPrice = await getCeloPrice();
  if (celoPrice === 0) return 0;
  
  const celoAmount = parseFloat(usdAmount) / celoPrice;
  return celoAmount.toFixed(4); // Return with 4 decimal places
}

/**
 * Convert CELO amount to USD
 */
export async function celoToUsd(celoAmount) {
  const celoPrice = await getCeloPrice();
  const usdAmount = parseFloat(celoAmount) * celoPrice;
  return usdAmount.toFixed(2); // Return with 2 decimal places
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

