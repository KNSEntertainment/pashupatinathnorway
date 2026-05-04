import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    const result = await sendOTP(phoneNumber);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      phoneNumber
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
