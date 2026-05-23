#!/usr/bin/env node

// Test script to check authentication status
console.log('🔍 Testing authentication status...');

// Check if we can access the admin API without authentication
fetch('http://localhost:3000/api/festivals')
  .then(response => response.json())
  .then(data => {
    console.log('✅ GET festivals works:', data.length, 'festivals found');
    
    // Try DELETE without authentication
    return fetch('http://localhost:3000/api/festivals?id=test', {
      method: 'DELETE'
    });
  })
  .then(response => response.json())
  .then(data => {
    console.log('❌ DELETE without auth:', data.error);
    
    if (data.error.includes('Unauthorized')) {
      console.log('✅ Authentication is working correctly');
      console.log('🔑 Solution: Make sure you are logged in as admin before trying to delete');
    } else {
      console.log('⚠️  Unexpected error:', data);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
