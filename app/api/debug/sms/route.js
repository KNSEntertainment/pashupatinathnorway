import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(request) {
  try {
    const { to, message } = await request.json();
    
    if (!to || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 });
    }

    console.log("Testing SMS with:", { to, message });
    console.log("Twilio credentials:", {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? "Set" : "Not set",
      authToken: process.env.TWILIO_AUTH_TOKEN ? "Set" : "Not set",
      phoneNumber: process.env.TWILIO_PHONE_NUMBER ? "Set" : "Not set"
    });

    const result = await sendSMS({ to, body: message });
    
    return NextResponse.json({ 
      message: "SMS sent successfully", 
      sid: result.sid 
    });
  } catch (error) {
    console.error("Error in debug SMS:", error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
