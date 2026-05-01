/**
 * Norwegian Currency Formatting Utility
 * Formats amounts according to Norwegian conventions:
 * - Uses space as thousands separator (e.g., "1 234,50 kr")
 * - Uses comma as decimal separator
 * - Shows "kr" prefix for Norwegian Kroner
 * - Handles øre (cents) properly
 */

interface NorwegianCurrencyOptions {
  showCurrency?: boolean;
  currencyPosition?: 'prefix' | 'suffix';
  showCents?: boolean;
  locale?: 'nb' | 'nn' | 'en';
}

/**
 * Formats an amount in Norwegian currency format
 * @param amount - The amount to format (in NOK/øre)
 * @param options - Formatting options
 * @returns Formatted Norwegian currency string
 */
export function formatNorwegianAmount(
  amount: number,
  options: NorwegianCurrencyOptions = {}
): string {
  const {
    showCurrency = true,
    currencyPosition = 'suffix',
    showCents = true,
    locale = 'nb'
  } = options;

  // Validate input
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }

  // Determine if we should show cents based on the amount
  const hasDecimalPart = amount % 1 !== 0;
  const shouldShowCents = showCents && hasDecimalPart;

  // Format the number with Norwegian conventions
  let formattedNumber: string;
  
  if (shouldShowCents) {
    // Format with 2 decimal places for cents
    formattedNumber = amount
      .toFixed(2)
      .replace('.', ',') // Replace decimal point with comma
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add space as thousands separator
  } else {
    // Format as whole number
    formattedNumber = Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add space as thousands separator
  }

  // Add currency symbol
  if (showCurrency) {
    const currencySymbol = locale === 'en' ? 'NOK' : 'kr';
    
    if (currencyPosition === 'prefix') {
      return `${currencySymbol} ${formattedNumber}`;
    } else {
      return `${formattedNumber} ${currencySymbol}`;
    }
  }

  return formattedNumber;
}

/**
 * Formats an amount specifically for display in Norwegian
 * @param amount - The amount in NOK
 * @returns Formatted Norwegian currency string
 */
export function formatNOK(amount: number): string {
  return formatNorwegianAmount(amount, {
    showCurrency: true,
    currencyPosition: 'suffix',
    showCents: true,
    locale: 'nb'
  });
}

/**
 * Formats an amount for display in English (NOK)
 * @param amount - The amount in NOK
 * @returns Formatted currency string
 */
export function formatNOKEnglish(amount: number): string {
  return formatNorwegianAmount(amount, {
    showCurrency: true,
    currencyPosition: 'suffix',
    showCents: true,
    locale: 'en'
  });
}

/**
 * Formats an amount without currency symbol (just the number)
 * @param amount - The amount
 * @param showCents - Whether to show decimal places
 * @returns Formatted number string
 */
export function formatNorwegianNumber(amount: number, showCents: boolean = false): string {
  return formatNorwegianAmount(amount, {
    showCurrency: false,
    showCents
  });
}

/**
 * Converts an amount from øre to kroner and formats it
 * @param amountInOre - Amount in øre (cents)
 * @param options - Formatting options
 * @returns Formatted Norwegian currency string
 */
export function formatOreToNOK(amountInOre: number, options: NorwegianCurrencyOptions = {}): string {
  const amountInNOK = amountInOre / 100;
  return formatNorwegianAmount(amountInNOK, options);
}

// Common presets for different use cases
export const NorwegianCurrencyPresets = {
  // For donation buttons and forms
  donation: (amount: number) => formatNOK(amount),
  
  // For financial reports and tables
  financial: (amount: number) => formatNorwegianAmount(amount, {
    showCurrency: true,
    currencyPosition: 'prefix',
    showCents: true,
    locale: 'nb'
  }),
  
  // For compact display (e.g., in cards)
  compact: (amount: number) => formatNorwegianAmount(amount, {
    showCurrency: true,
    currencyPosition: 'suffix',
    showCents: false,
    locale: 'nb'
  }),
  
  // For international/English display
  international: (amount: number) => formatNOKEnglish(amount)
};
