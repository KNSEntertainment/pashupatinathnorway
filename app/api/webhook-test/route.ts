import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET() {
	try {
		await connectDB();
		
		// Get donation statistics
		// const stats = await Donation.aggregate([
		// 	{
		// 		$group: {
		// 			_id: "$paymentStatus",
		// 			count: { $sum: 1 },
		// 			totalAmount: { $sum: "$amount" }
		// 		}
		// 	}
		// ]);

		const totalDonations = await Donation.countDocuments();
		const completedDonations = await Donation.countDocuments({ paymentStatus: "completed" });
		const pendingDonations = await Donation.countDocuments({ paymentStatus: "pending" });
		const failedDonations = await Donation.countDocuments({ paymentStatus: "failed" });

		return NextResponse.json({ 
			message: "Webhook test endpoint is working",
			timestamp: new Date().toISOString(),
			webhookInfo: {
				endpoint: "/api/donations/webhook",
				method: "POST",
				expectedEvents: ["checkout.session.completed", "checkout.session.expired", "payment_intent.payment_failed"]
			},
			donationStats: {
				total: totalDonations,
				completed: completedDonations,
				pending: pendingDonations,
				failed: failedDonations,
				completionRate: totalDonations > 0 ? ((completedDonations / totalDonations) * 100).toFixed(2) + "%" : "0%"
			},
			recentDonations: await Donation.find()
				.sort({ createdAt: -1 })
				.limit(5)
				.select('donorName amount paymentStatus createdAt stripeSessionId')
		});
	} catch (error) {
		return NextResponse.json({ 
			error: "Database connection failed",
			message: error instanceof Error ? error.message : "Unknown error"
		}, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { action } = body;

		if (action === "simulate-webhook") {
			// Simulate a webhook event for testing
			await connectDB();
			
			// Find a pending donation to update
			const pendingDonation = await Donation.findOne({ paymentStatus: "pending" });
			
			if (!pendingDonation) {
				return NextResponse.json({ 
					message: "No pending donations found to simulate webhook",
					suggestion: "Create a test donation first"
				}, { status: 404 });
			}

			// Simulate webhook completion
			const updatedDonation = await Donation.findByIdAndUpdate(
				pendingDonation._id,
				{
					paymentStatus: "completed",
					stripePaymentIntentId: `pi_test_${Date.now()}`,
				},
				{ new: true }
			);

			return NextResponse.json({ 
				message: "Webhook simulation successful",
				donation: {
					id: updatedDonation._id,
					donorName: updatedDonation.donorName,
					amount: updatedDonation.amount,
					status: updatedDonation.paymentStatus,
					previousStatus: "pending"
				},
				timestamp: new Date().toISOString()
			});
		}

		return NextResponse.json({ 
			message: "Webhook POST endpoint is working",
			timestamp: new Date().toISOString(),
			receivedBody: body
		});
	} catch (error) {
		return NextResponse.json({ 
			error: "Webhook test failed",
			message: error instanceof Error ? error.message : "Unknown error"
		}, { status: 500 });
	}
}
