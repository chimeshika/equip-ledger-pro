/**
 * Currency formatting utilities for Sri Lankan Rupees (LKR)
 */

/**
 * Format a number as Sri Lankan Rupees
 * @param amount - The numeric amount to format
 * @param showCurrency - Whether to show the Rs. prefix (default: true)
 * @returns Formatted currency string (e.g., "Rs. 25,000.00")
 */
export const formatLKR = (amount: number | null | undefined, showCurrency = true): string => {
  if (amount === null || amount === undefined) {
    return showCurrency ? "Rs. 0.00" : "0.00";
  }
  
  const formatted = amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return showCurrency ? `Rs. ${formatted}` : formatted;
};

/**
 * Format a number as Sri Lankan Rupees for display (no decimals for whole numbers)
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "Rs. 25,000")
 */
export const formatLKRShort = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return "N/A";
  }
  
  const formatted = amount.toLocaleString('en-LK');
  return `Rs. ${formatted}`;
};

/**
 * Currency code for Sri Lanka
 */
export const CURRENCY_CODE = 'LKR';

/**
 * Currency symbol for Sri Lanka
 */
export const CURRENCY_SYMBOL = 'Rs.';
