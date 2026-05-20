import { NextResponse } from "next/server";
import VippsService from "@/lib/vipps";

export async function POST(request: Request) {
  try {
    const { 
      amount, 
      donorName, 
      donorEmail, 
      donorPhone, 
      personalNumber, 
      address, 
      message, 
      isAnonymous, 
      causeId, 
      donationType 
    } = await request.json();

    // Validate amount
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Minimum donation amount is 50 NOK" }, { status: 400 });
    }

    // Validate required fields (only if not anonymous)
    if (!isAnonymous && (!donorName || !donorEmail)) {
      return NextResponse.json({ error: "Name and email are required for non-anonymous donations" }, { status: 400 });
    }

    // Validate phone number if provided
    if (donorPhone && !VippsService.validatePhoneNumber(donorPhone)) {
      return NextResponse.json({ error: "Invalid Norwegian phone number" }, { status: 400 });
    }

    // Generate reference for this donation
    const reference = VippsService.generateReference('DONATION');
    
    // Create return URL for Vipps redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/donate/confirm?reference=${reference}`;

    // Initialize Vipps service
    const vippsService = new VippsService();

    // Create Vipps payment
    const vippsPayment = await vippsService.createPayment(
      amount,
      reference,
      returnUrl,
      donorPhone || undefined
    );

    // Store donation details in session/database for later confirmation
    // For now, we'll store in a temporary storage (in production, use Redis or database)
    const donationData = {
      reference,
      orderId: vippsPayment.orderId,
      amount,
      donorName: isAnonymous ? "Anonymous" : donorName,
      donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
      donorPhone,
      personalNumber,
      address,
      message,
      isAnonymous,
      causeId,
      donationType: donationType || "general",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // Store donation data temporarily (in production, use proper session storage)
    // For now, we'll return it in the response and handle it on the frontend
    console.log('Donation data stored:', donationData);

    return NextResponse.json({
      success: true,
      payment: {
        orderId: vippsPayment.orderId,
        reference: vippsPayment.reference,
        redirectUrl: vippsPayment.redirectUrl,
        paymentLink: vippsPayment.paymentLink,
      },
      donationData,
    });

  } catch (error) {
    console.error("Vipps payment creation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to create Vipps payment" 
    }, { status: 500 });
  }
}
