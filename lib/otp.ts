import { Twilio } from 'twilio';
import connectDB from '@/lib/mongodb';
import PhoneOTP from '@/models/PhoneOTP.Model';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = accountSid && authToken && accountSid.startsWith('AC') ? new Twilio(accountSid, authToken) : null;

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function formatNorwegianPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's 8 digits, format as Norwegian number
  if (cleaned.length === 8) {
    return `+47${cleaned}`;
  }
  
  // If it already starts with 47 and length is 10 digits
  if (cleaned.startsWith('47') && cleaned.length === 10) {
    return `+${cleaned}`;
  }
  
  return phone;
}

export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!phoneNumber) {
      return { success: false, error: 'Phone number is required' };
    }

    // Validate phone number format (8 digits for Norwegian numbers)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 8) {
      return { success: false, error: 'Invalid Norwegian phone number. Must be 8 digits.' };
    }

    const formattedPhone = formatNorwegianPhoneNumber(phoneNumber);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check Twilio configuration
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    // Validate Account SID format
    if (!accountSid.startsWith('AC')) {
      return { success: false, error: 'Invalid Twilio Account SID format' };
    }

    if (!twilioClient) {
      return { success: false, error: 'Twilio client not initialized' };
    }

    // Connect to database and store OTP in MongoDB
    await connectDB();
    await PhoneOTP.deleteMany({ phoneNumber: formattedPhone });
    await PhoneOTP.create({
      phoneNumber: formattedPhone,
      code: otp,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Pashupatinath Norway Temple verification code is: ${otp}`,
        from: twilioPhoneNumber,
        to: formattedPhone,
      });

      console.log(`OTP sent to ${formattedPhone}`);
      return { success: true };
    } catch (twilioError: unknown) {
      console.error('Twilio SMS delivery failed:', twilioError);

      // Clean up the OTP record if SMS sending failed
      await PhoneOTP.deleteMany({ phoneNumber: formattedPhone });

      const err = twilioError as { code?: number; message?: string } | null;
      if (err?.code === 21608) {
        return {
          success: false,
          error: `Twilio Trial restriction: ${formattedPhone} is unverified. Add this number to Twilio Console (Verified Caller IDs) or upgrade your Twilio account to a paid plan.`,
        };
      }

      return {
        success: false,
        error: err?.message || 'Failed to send SMS via Twilio',
      };
    }
  } catch (error: unknown) {
    console.error('Error in sendOTP:', error);
    const err = error instanceof Error ? error.message : 'Failed to send OTP';
    return { success: false, error: err };
  }
}

export async function verifyOTP(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
  console.log("verifyOTP called with:", { phoneNumber, code });
  
  if (!phoneNumber || !code) {
    return { success: false, error: 'Phone number and code are required' };
  }

  // Validate code format (4 digits)
  if (!/^\d{4}$/.test(code)) {
    return { success: false, error: 'Invalid verification code format (must be 4 digits)' };
  }

  const formattedPhone = formatNorwegianPhoneNumber(phoneNumber);
  
  try {
    await connectDB();

    const stored = await PhoneOTP.findOne({ phoneNumber: formattedPhone });
    
    if (!stored) {
      return { success: false, error: 'No verification code found for this number or code expired. Please request a new one.' };
    }

    if (Date.now() > new Date(stored.expiresAt).getTime()) {
      await PhoneOTP.deleteMany({ phoneNumber: formattedPhone });
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    if (stored.attempts >= 5) {
      await PhoneOTP.deleteMany({ phoneNumber: formattedPhone });
      return { success: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
    }

    if (stored.code !== code) {
      stored.attempts += 1;
      await stored.save();
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    console.log("OTP verification successful for", formattedPhone);
    // Clean up after successful verification
    await PhoneOTP.deleteMany({ phoneNumber: formattedPhone });
    return { success: true };
  } catch (error: unknown) {
    console.error('Error verifying OTP:', error);
    const err = error instanceof Error ? error.message : 'Database error verifying OTP';
    return { success: false, error: err };
  }
}
