// Simple test script to verify postal code lookup functionality
const { getPostalCodeInfo } = require('./lib/postalCodeLookup.ts');

// Test some common Norwegian postal codes
const testPostalCodes = [
  '0001', // Oslo
  '5003', // Bergen
  '7011', // Trondheim
  '9001', // Tromsø
  '4001', // Stavanger
  '9999', // Invalid (should return empty)
];

console.log('Testing postal code lookup functionality:\n');

testPostalCodes.forEach(code => {
  const info = getPostalCodeInfo(code);
  console.log(`Postal Code: ${code}`);
  console.log(`  Poststed: ${info.poststed || 'Not found'}`);
  console.log(`  Kommune: ${info.kommune || 'Not found'}`);
  console.log(`  Fylke: ${info.fylke || 'Not found'}`);
  console.log('---');
});

console.log('\nTest completed!');
