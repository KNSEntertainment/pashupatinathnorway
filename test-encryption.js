// Test script for personal number encryption
const { encryptPersonalNumber, decryptPersonalNumber, isEncrypted } = require('./lib/encryption');

// Test cases
const testCases = [
  '12345678901', // Valid 11-digit personal number
  '98765432109', // Another valid personal number
  '', // Empty string
  '123', // Invalid personal number (too short)
];

console.log('=== Testing Personal Number Encryption ===\n');

testCases.forEach((testCase, index) => {
  console.log(`Test Case ${index + 1}: "${testCase}"`);
  
  if (!testCase) {
    console.log('  Empty input - skipping encryption\n');
    return;
  }
  
  try {
    // Test encryption
    const encrypted = encryptPersonalNumber(testCase);
    console.log(`  Encrypted: ${encrypted}`);
    
    // Test if isEncrypted works correctly
    const encryptedCheck = isEncrypted(encrypted);
    console.log(`  Is encrypted: ${encryptedCheck}`);
    
    // Test decryption
    const decrypted = decryptPersonalNumber(encrypted);
    console.log(`  Decrypted: ${decrypted}`);
    
    // Verify round-trip
    const isCorrect = decrypted === testCase;
    console.log(`  Round-trip correct: ${isCorrect}`);
    
    if (!isCorrect) {
      console.log(`  ❌ ERROR: Expected "${testCase}", got "${decrypted}"`);
    } else {
      console.log(`  ✅ SUCCESS`);
    }
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }
  
  console.log('');
});

// Test with invalid encrypted data
console.log('=== Testing Invalid Encrypted Data ===\n');
const invalidEncrypted = 'invalid:encrypted:data';
try {
  const decrypted = decryptPersonalNumber(invalidEncrypted);
  console.log(`Decrypted invalid data: "${decrypted}"`);
} catch (error) {
  console.log(`Error handling invalid data: ${error.message}`);
}

console.log('\n=== Testing isEncrypted Function ===\n');
const isEncryptedTests = [
  '', // Empty
  '12345678901', // Plain text
  'abcdef1234567890abcdef1234567890:abcdef1234567890abcdef1234567890:encrypteddata', // Valid encrypted
  'invalid:format', // Invalid format
];

isEncryptedTests.forEach((test, index) => {
  const result = isEncrypted(test);
  console.log(`Test ${index + 1}: "${test}" -> isEncrypted: ${result}`);
});

console.log('\n=== Test Complete ===');
