// lib/postalCodeLookup.ts
import postnummerData from './data/postnummer.json';

interface PostalCodeInfo {
  poststed: string;
  bydel: string;
  kommune: string;
  fylke: string;
  type: string;
}

type PostalCodeData = Record<string, PostalCodeInfo>;

/**
 * Lookup postal code information from Norwegian postal codes
 * @param postalCode - 4-digit Norwegian postal code
 * @returns Postal code information or null if not found
 */
export function lookupPostalCode(postalCode: string): PostalCodeInfo | null {
  // Clean input: remove spaces, ensure 4 digits
  const cleanCode = postalCode.replace(/\s/g, '').trim();
  
  // Validate format: exactly 4 digits
  if (!/^\d{4}$/.test(cleanCode)) {
    return null;
  }

  const data = postnummerData as PostalCodeData;
  return data[cleanCode] || null;
}

/**
 * Get all information for a postal code
 * @param postalCode - 4-digit Norwegian postal code
 * @returns Object with poststed, kommune, fylke or empty object if not found
 */
export function getPostalCodeInfo(postalCode: string) {
  const info = lookupPostalCode(postalCode);
  
  if (!info) {
    return {
      poststed: '',
      bydel: '',
      kommune: '',
      fylke: ''
    };
  }

  return {
    poststed: info.poststed,
    bydel: info.bydel,
    kommune: info.kommune,
    fylke: info.fylke
  };
}

/**
 * Validate Norwegian postal code format
 * @param postalCode - Postal code to validate
 * @returns true if valid format (4 digits)
 */
export function isValidPostalCodeFormat(postalCode: string): boolean {
  const cleanCode = postalCode.replace(/\s/g, '').trim();
  return /^\d{4}$/.test(cleanCode);
}

/**
 * Format postal code with proper spacing (XXXX format)
 * @param postalCode - Postal code to format
 * @returns Formatted postal code
 */
export function formatPostalCode(postalCode: string): string {
  const cleanCode = postalCode.replace(/\s/g, '').trim();
  return cleanCode;
}
