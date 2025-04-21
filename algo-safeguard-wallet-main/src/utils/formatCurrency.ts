
/**
 * Format currency values based on decimals
 */
export const formatValue = (value: number, decimals: number): string => {
  if (value === 0) return '0.00';
  
  if (decimals > 6) {
    // For high precision tokens like BTC or ETH
    return value.toFixed(value >= 0.00001 ? 5 : 8);
  }
  
  // For standard tokens
  return value.toFixed(value >= 1 ? 2 : 6);
};

/**
 * Format for INR values
 */
export const formatINR = (value: number): string => {
  if (value === 0) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Generic function to format currency
 */
export const formatCurrency = (value: number, currency: string = 'INR'): string => {
  if (currency === 'INR') {
    return formatINR(value);
  }
  
  // Default formatting for other currencies
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(value);
};
