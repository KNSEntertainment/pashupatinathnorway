import twilio from 'twilio';

// Twilio client initialization
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// SMS sender function
type sendSMS = {
  to: string;
  body: string;
};

export async function sendSMS({ to, body }: sendSMS) {
  try {
    // Clean and format phone number
    let cleanedPhone = to.replace(/\D/g, ''); // Remove all non-digit characters
    
    // Add country code if missing (assuming Norway: +47)
    if (cleanedPhone.length === 8) {
      cleanedPhone = `47${cleanedPhone}`;
    }
    
    // Ensure minimum length for a valid phone number (at least 10 digits with country code)
    if (cleanedPhone.length < 10) {
      throw new Error(`Invalid phone number: ${to}. Phone number must have at least 10 digits including country code.`);
    }
    
    const formattedPhone = `+${cleanedPhone}`;
    
    const message = await client.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : String(error)}`);
  }
}
