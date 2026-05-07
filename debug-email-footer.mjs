import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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

// Test the email footer functionality
const testEmailFooter = async () => {
  try {
    console.log('=== TESTING EMAIL FOOTER FUNCTIONALITY ===');
    
    await connectDB();
    
    const testEmail = 'onboarding@resend.dev';
    console.log('Testing email footer for:', testEmail);
    
    // Check if subscriber exists
    const subscriber = await Subscriber.findOne({ subscriber: testEmail });
    console.log('Subscriber found:', !!subscriber);
    
    if (subscriber) {
      console.log('Subscriber details:', {
        id: subscriber._id,
        email: subscriber.subscriber,
        createdAt: subscriber.createdAt
      });
    }
    
    // Generate footer
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/en/unsubscribe?email=${encodeURIComponent(testEmail)}`;
    
    const footer = subscriber ? `
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
    ` : "";
    
    console.log('Footer generated:', footer ? 'Yes' : 'No subscriber, no footer');
    console.log('Footer length:', footer.length);
    
    // Test adding subscriber
    if (!subscriber) {
      console.log('Creating test subscriber...');
      const newSubscriber = await Subscriber.create({ subscriber: testEmail });
      console.log('Subscriber created:', newSubscriber._id);
      
      // Generate footer again
      const footerWithSubscriber = `
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
      
      console.log('Footer with subscriber generated:', footerWithSubscriber ? 'Yes' : 'No');
      console.log('Footer with subscriber length:', footerWithSubscriber.length);
    }
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Email footer test failed:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    await mongoose.connection.close();
  }
};

testEmailFooter();
