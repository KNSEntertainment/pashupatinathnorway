require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

console.log('=== DEBUGGING EMAIL FUNCTIONALITY ===');
console.log('Environment Variables:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set (length: ' + process.env.RESEND_API_KEY.length + ')' : 'Not set');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');

// Test Resend client initialization
try {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('Resend client initialized successfully');
  
  // Test sending a simple email
  const testEmail = async () => {
    try {
      console.log('Attempting to send test email...');
      
      const { data, error } = await resend.emails.send({
        from: `"Test" <${process.env.EMAIL_USER}>`,
        to: [process.env.EMAIL_USER], // Send to self for testing
        subject: 'Test Email from Pashupatinath Norway',
        text: 'This is a test email to verify the email functionality is working.',
        html: '<p>This is a test email to verify the email functionality is working.</p>',
      });
      
      if (error) {
        console.error('Email sending failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('Email sent successfully:', data);
      }
    } catch (err) {
      console.error('Exception during email sending:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
  };
  
  testEmail();
  
} catch (err) {
  console.error('Failed to initialize Resend client:', err);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
}
