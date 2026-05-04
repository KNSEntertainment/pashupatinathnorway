import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// In-memory storage for OTPs (in production, use Redis or database)
// Using global scope to ensure persistence between API calls
declare global {
  // eslint-disable-next-line no-var
  var otpStore: Record<string, { code: string; expiresAt: number }> | undefined;
}

const otpStore: Record<string, { code: string; expiresAt: number }> = global.otpStore || {};

// Store in global scope to persist between API calls
if (!global.otpStore) {
  global.otpStore = otpStore;
}

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
  
  // If it already starts with +47, return as is
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
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

    // Store OTP
    otpStore[formattedPhone] = { code: otp, expiresAt };

    // Check Twilio configuration
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    // Validate Account SID format
    if (!accountSid.startsWith('AC')) {
      return { success: false, error: 'Invalid Twilio Account SID format' };
    }

    // Send SMS via Twilio
    if (!twilioClient) {
      return { success: false, error: 'Twilio client not initialized' };
    }

    await twilioClient.messages.create({
      body: `Your Pashupatinath Norway Temple verification code is: ${otp}`,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log(`OTP sent to ${formattedPhone}: ${otp}`);

    return { success: true };

  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: 'Failed to send OTP' };
  }
}

export function verifyOTP(phoneNumber: string, code: string): { success: boolean; error?: string } {
  console.log("verifyOTP called with:", { phoneNumber, code });
  
  if (!phoneNumber || !code) {
    console.log("Missing phone or code");
    return { success: false, error: 'Phone number and code are required' };
  }

  // Validate code format (4 digits)
  if (!/^\d{4}$/.test(code)) {
    console.log("Invalid code format:", code);
    return { success: false, error: 'Invalid verification code format' };
  }

  const formattedPhone = formatNorwegianPhoneNumber(phoneNumber);
  console.log("Formatted phone:", formattedPhone);
  console.log("OTP store contents:", otpStore);
  
  const stored = otpStore[formattedPhone];
  
  if (!stored) {
    console.log("No OTP found for phone:", formattedPhone);
    return { success: false, error: 'No verification code found for this number' };
  }
  
  console.log("Stored OTP:", { code: stored.code, expiresAt: stored.expiresAt, now: Date.now() });
  
  if (Date.now() > stored.expiresAt) {
    console.log("OTP expired");
    delete otpStore[formattedPhone];
    return { success: false, error: 'Verification code has expired' };
  }
  
  if (stored.code !== code) {
    console.log("Code mismatch:", { expected: stored.code, received: code });
    return { success: false, error: 'Invalid verification code' };
  }
  
  console.log("OTP verification successful");
  // Clean up after successful verification
  delete otpStore[formattedPhone];
  return { success: true };
}
