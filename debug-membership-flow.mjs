import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Resend } from 'resend';
import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Simple Subscriber model for testing
const SubscriberSchema = new mongoose.Schema({
  subscriber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);

// Email footer function
const addEmailFooter = async (email, emailContent) => {
  console.log('=== ADDING EMAIL FOOTER ===');
  console.log('Email:', email);
  console.log('Content length:', emailContent.length);
  
  try {
    // Check if subscriber exists
    const subscriber = await Subscriber.findOne({ subscriber: email });
    console.log('Subscriber found:', !!subscriber);
    
    if (!subscriber) {
      console.log('No subscriber found, returning empty footer');
      return emailContent; // Return original content if no subscriber
    }
    
    // Generate unsubscribe link with token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/en/unsubscribe?email=${encodeURIComponent(email)}`;
    
    const footer = `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          You received this email because you subscribed to our newsletter.
        </p>
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 8px;">
          <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline;">
            Unsubscribe
          </a>
        </p>
      </div>
    `;
    
    console.log('Footer length:', footer.length);
    const result = emailContent + footer;
    console.log('Final content length:', result.length);
    return result;
  } catch (error) {
    console.error('Error in addEmailFooter:', error);
    // Return original content if footer generation fails
    return emailContent;
  }
};

// Welcome email function with footer
const sendGeneralMemberWelcomeEmail = async ({ name, email, membershipId, familyMembers }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const familyMembersText = familyMembers && familyMembers.length > 0 
    ? `\n\nFamily Members Registered: ${familyMembers.join(', ')}`
    : '';

  const mailOptions = {
    from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Pashupatinath Norway Temple - General Member Registration Received",
    text: `Hello ${name},\n\nThank you for registering as a General Member with Pashupatinath Norway Temple! Your membership application has been successfully received.${familyMembersText}\n\nYour Membership ID: ${membershipId}\nPlease save this ID for your records. You'll need it for tax document generation and membership verification.\n\nYou are now part of our sacred mission to build the first Nepali Hindu temple in Norway and unite our community. Together, we are creating a spiritual home where our cultural heritage and religious traditions can thrive for generations to come.\n\nWhat happens next:\n• Your application is currently under review by our admin team\n• Once approved, you will become an Active Member with full access to member benefits\n• If you are 15 years or older, you will be eligible for Active Member status upon approval\n• Members under 15 will remain as General Members until they turn 15\n\nAs a General Member, you are already part of our community and will receive updates about temple events and activities.\n\nBest regards,\nPashupatinath Temple Norway Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffc445 0%, #FF7722 100%); color: #000000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: #ffffff; border-left: 4px solid #ffc445; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .next-steps { background: #ffffff; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .step-item { display: flex; align-items: center; margin: 15px 0; }
          .step-icon { width: 30px; height: 30px; background: #ffc445; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000000; margin-right: 15px; flex-shrink: 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Pashupatinath Norway Temple!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your General Member Registration Received</p>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for registering as a <strong>General Member</strong> with Pashupatinath Norway Temple! Your membership application has been successfully received and you are now part of our sacred community.</p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; color: #0ea5e9; font-weight: bold;">🎫 Your Membership ID</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold; font-family: monospace;">${membershipId}</p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Please save this ID for your records. You'll need it for tax document generation and membership verification.</p>
            </div>
            
            ${familyMembers && familyMembers.length > 0 ? `
            <div style="background: #ffffff; border-left: 4px solid #ffc445; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; color: #ffc445; font-weight: bold;">Family Members Registered</h3>
              <p style="margin: 0; font-weight: bold;">${familyMembers.join(', ')}</p>
            </div>
            ` : ''}
    
            <div class="next-steps">
              <h3 style="margin: 0 0 15px 0;">What Happens Next:</h3>
              <div style="margin: 20px 0;">
                <p><strong>1. Application Review</strong><br>
                <span style="color: #666;">Your application is under review by our admin team</span></p>
              </div>
              <div style="margin: 20px 0;">
                <p><strong>2. Active Member Approval</strong><br>
                <span style="color: #666;">Once approved, you'll become an Active Member with full benefits</span></p>
              </div>
              <div style="margin: 20px 0;">
                <p><strong>3. Age-Based Eligibility</strong><br>
                <span style="color: #666;">Members 15+ become Active Members; under 15 remain General until they turn 15</span></p>
              </div>
            </div>
            
            <p>As a General Member, you are already an important part of our community and will stay connected with our temple activities and cultural programs.</p>
            
            <p>If you have any questions, feel free to reach out to us.</p>
            <p>Best regards,<br><strong>Pashupatinath Norway Temple Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log('Sending welcome email with data:', { name, email, membershipId, familyMembers });
    
    // Add unsubscribe footer if user is subscribed
    const htmlContentWithFooter = await addEmailFooter(email, mailOptions.html);
    console.log('HTML content with footer length:', htmlContentWithFooter.length);
    
    const { error } = await resend.emails.send({
      from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
      to: [email],
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: htmlContentWithFooter,
    });
    
    if (error) {
      console.error("Error sending General Member welcome email:", error);
      throw new Error("Failed to send General Member welcome email");
    }
    
    console.log("General Member welcome email sent to:", email);
  } catch (error) {
    console.error("Error sending General Member welcome email:", error);
    throw new Error("Failed to send General Member welcome email");
  }
};

// Test the complete flow
const testCompleteFlow = async () => {
  try {
    console.log('=== TESTING COMPLETE MEMBERSHIP FLOW ===');
    
    await connectDB();
    
    const testEmail = 'test@example.com'; // Use a different email for testing
    const testData = {
      name: 'Test Member',
      email: testEmail,
      membershipId: 'TEST-67890',
      familyMembers: ['Family Member 1', 'Family Member 2']
    };
    
    console.log('1. Testing welcome email without subscriber...');
    await sendGeneralMemberWelcomeEmail(testData);
    console.log('✓ Welcome email sent successfully without subscriber');
    
    console.log('2. Creating subscriber...');
    const subscriber = await Subscriber.create({ subscriber: testEmail });
    console.log('✓ Subscriber created:', subscriber._id);
    
    console.log('3. Testing welcome email with subscriber...');
    await sendGeneralMemberWelcomeEmail(testData);
    console.log('✓ Welcome email sent successfully with subscriber');
    
    console.log('4. Cleaning up test data...');
    await Subscriber.deleteOne({ subscriber: testEmail });
    console.log('✓ Test data cleaned up');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    console.log('\n🎉 ALL TESTS PASSED! Email functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Complete flow test failed:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    await mongoose.connection.close();
  }
};

testCompleteFlow();
