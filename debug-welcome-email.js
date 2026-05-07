require('dotenv').config({ path: '.env.local' });

// Import the actual email function
const { sendGeneralMemberWelcomeEmail } = require('./lib/email');

console.log('=== DEBUGGING WELCOME EMAIL FUNCTION ===');

const testWelcomeEmail = async () => {
  try {
    console.log('Testing sendGeneralMemberWelcomeEmail function...');
    
    const testData = {
      name: 'Test User',
      email: 'onboarding@resend.dev', // Send to self for testing
      membershipId: 'TEST-12345',
      familyMembers: ['Family Member 1', 'Family Member 2']
    };
    
    console.log('Test data:', testData);
    
    await sendGeneralMemberWelcomeEmail(testData);
    
    console.log('Welcome email sent successfully!');
  } catch (error) {
    console.error('Welcome email failed:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
};

testWelcomeEmail();
