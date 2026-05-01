/**
 * Test file for Norwegian Currency Formatting
 * This file demonstrates the usage and verifies the output of the formatting functions
 */

import { 
  formatNorwegianAmount, 
  formatNOK, 
  formatNOKEnglish, 
  formatNorwegianNumber,
  formatOreToNOK,
  NorwegianCurrencyPresets 
} from './norwegianCurrency';

// Test cases to demonstrate Norwegian currency formatting
const testCases = [
  { amount: 100, description: "Simple amount" },
  { amount: 1000, description: "Thousand" },
  { amount: 10000, description: "Ten thousand" },
  { amount: 1234.5, description: "With decimal" },
  { amount: 1234567.89, description: "Large amount with decimals" },
  { amount: 50, description: "Minimum donation" },
  { amount: 2500, description: "Medium donation" },
  { amount: 20000, description: "Large donation" }
];

console.log("=== Norwegian Currency Formatting Tests ===\n");

// Test basic formatting
testCases.forEach(({ amount, description }) => {
  console.log(`${description} (${amount}):`);
  console.log(`  Norwegian: ${formatNOK(amount)}`);
  console.log(`  English: ${formatNOKEnglish(amount)}`);
  console.log(`  Number only: ${formatNorwegianNumber(amount)}`);
  console.log(`  Compact: ${NorwegianCurrencyPresets.compact(amount)}`);
  console.log(`  Financial: ${NorwegianCurrencyPresets.financial(amount)}`);
  console.log('');
});

// Test øre to NOK conversion
console.log("=== Øre to NOK Conversion Tests ===\n");
const oreTestCases = [
  { ore: 100, description: "1 krone" },
  { ore: 150, description: "1.50 kroner" },
  { ore: 123456, description: "1234.56 kroner" }
];

oreTestCases.forEach(({ ore, description }) => {
  console.log(`${description} (${ore} øre): ${formatOreToNOK(ore)}`);
});

// Test different options
console.log("\n=== Different Formatting Options ===\n");
const testAmount = 1234567.89;

console.log(`Amount: ${testAmount}`);
console.log(`Default: ${formatNorwegianAmount(testAmount)}`);
console.log(`Prefix currency: ${formatNorwegianAmount(testAmount, { currencyPosition: 'prefix' })}`);
console.log(`No cents: ${formatNorwegianAmount(testAmount, { showCents: false })}`);
console.log(`No currency: ${formatNorwegianAmount(testAmount, { showCurrency: false })}`);
console.log(`English locale: ${formatNorwegianAmount(testAmount, { locale: 'en' })}`);

// Export test function for manual testing
export function runCurrencyTests() {
  console.log("Running Norwegian currency formatting tests...");
  
  // Verify basic functionality
  const basicTests = [
    { input: 100, expected: "100 kr" },
    { input: 1000, expected: "1 000 kr" },
    { input: 1234.5, expected: "1 234,50 kr" },
    { input: 1234567.89, expected: "1 234 567,89 kr" }
  ];

  basicTests.forEach(({ input, expected }) => {
    const result = formatNOK(input);
    const passed = result === expected;
    console.log(`${input} → ${result} ${passed ? '✅' : '❌'} (expected: ${expected})`);
  });
}
