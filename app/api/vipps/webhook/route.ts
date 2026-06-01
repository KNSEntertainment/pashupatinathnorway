import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import { sendDonationThankYouEmail } from "@/lib/email";

// Vipps webhook for payment status updates
// This endpoint receives notifications from Vipps about payment status changes

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Verify webhook signature for security
    // In production, you should verify the signature using Vipps public key
    // if (!isValidSignature) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    console.log('[VIPPS Webhook] Webhook received:', body);

    // Handle different webhook events
    const { eventName, orderId } = body;

    console.log('[VIPPS Webhook] Processing event:', { eventName, orderId });

    if (eventName === 'payment.completed' || eventName === 'payment.captured') {
      await handlePaymentCompleted(orderId);
    } else if (eventName === 'payment.failed' || eventName === 'payment.cancelled') {
      await handlePaymentFailed(orderId);
    } else if (eventName === 'payment.authorized') {
      await handlePaymentAuthorized(orderId);
    } else {
      console.log('[VIPPS Webhook] Unhandled event:', eventName);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[VIPPS Webhook] Webhook error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Webhook processing failed"
    }, { status: 500 });
  }
}

async function handlePaymentCompleted(orderId: string) {
  try {
    await connectDB();
    console.log('[VIPPS Webhook] Handling payment completed for order:', orderId);

    // Check if donation already exists and is completed
    const existingDonation = await Donation.findOne({
      stripePaymentIntentId: orderId,
      paymentStatus: "completed"
    });

    if (existingDonation) {
      console.log(`[VIPPS Webhook] Donation ${orderId} already processed`);
      return;
    }

    // Find pending donation with this order ID
    const pendingDonation = await Donation.findOne({
      stripePaymentIntentId: orderId,
      paymentStatus: "pending"
    });

    if (pendingDonation) {
      // Update existing pending donation
      pendingDonation.paymentStatus = "completed";
      await pendingDonation.save();

      console.log(`[VIPPS Webhook] Updated pending donation ${orderId} to completed`);

      // Send confirmation email if needed
      await sendConfirmationEmail(pendingDonation);
    } else {
      // This might be a direct webhook without a pending record
      // In this case, we need the donation data to be passed in the webhook
      // or stored elsewhere (Redis, etc.)
      console.warn(`[VIPPS Webhook] No pending donation found for order ${orderId}`);
    }

  } catch (error) {
    console.error("[VIPPS Webhook] Error handling payment completed:", error);
    throw error;
  }
}

async function handlePaymentFailed(orderId: string) {
  try {
    await connectDB();

    // Update donation status to failed
    const donation = await Donation.findOneAndUpdate(
      { stripePaymentIntentId: orderId },
      { 
        paymentStatus: "failed",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (donation) {
      console.log(`Donation ${orderId} marked as failed`);
    }

  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}

async function handlePaymentAuthorized(orderId: string) {
  try {
    await connectDB();

    // Update donation status to authorized (ready for capture)
    const donation = await Donation.findOneAndUpdate(
      { stripePaymentIntentId: orderId },
      { 
        paymentStatus: "authorized",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (donation) {
      console.log(`Donation ${orderId} marked as authorized`);
      
      // Optionally capture automatically (if you want immediate capture)
      // const vippsService = new VippsService();
      // await vippsService.capturePayment(orderId, donation.amount);
    }

  } catch (error) {
    console.error("Error handling payment authorized:", error);
    throw error;
  }
}

async function sendConfirmationEmail(donation: Record<string, unknown>) {
  try {
    // Only send email to non-anonymous donors with valid email
    if (donation.donorEmail && donation.donorEmail !== "anonymous@rspnorway.org") {
      await sendDonationThankYouEmail({
        name: (donation.donorName as string) || "Valued Supporter",
        email: donation.donorEmail as string,
        amount: donation.amount as number,
        currency: donation.currency as string,
        transactionId: `vipps-${donation.stripePaymentIntentId as string}`,
        date: (donation.createdAt as string) || new Date().toISOString(),
        message: donation.message as string | undefined
      });
      console.log("Confirmation email sent to:", donation.donorEmail);
    }
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError);
    // Don't throw error - email failure shouldn't fail the webhook
  }
}

// TODO: Implement signature verification for security
// In production, implement proper signature verification using Vipps public key
