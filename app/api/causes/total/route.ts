import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cause from "@/models/Cause.Model";
import Donation from "@/models/Donation.Model";

export async function GET() {
  try {
    await connectDB();
    
    // Get total goal amount from all active causes
    const causesResult = await Cause.aggregate([
      {
        $match: { status: "active" }
      },
      {
        $group: {
          _id: null,
          totalGoalAmount: { $sum: "$goalAmount" }
        }
      }
    ]);
    
    // Get total donated amount from completed donations
    const donationsResult = await Donation.aggregate([
      {
        $match: { 
          paymentStatus: "completed",
          causeId: { $exists: true } // Only include donations that have a cause
        }
      },
      {
        $group: {
          _id: null,
          totalDonatedAmount: { $sum: "$amount" },
          totalDonations: { $sum: 1 }
        }
      }
    ]);
    
    const totalGoalAmount = causesResult.length > 0 ? causesResult[0].totalGoalAmount : 0;
    const totalDonatedAmount = donationsResult.length > 0 ? donationsResult[0].totalDonatedAmount : 0;
    const totalDonations = donationsResult.length > 0 ? donationsResult[0].totalDonations : 0;
    
    return NextResponse.json({ 
      totalGoalAmount,
      totalDonatedAmount,
      totalDonations
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching total goals and donations:", error);
    return NextResponse.json({ error: "Failed to fetch totals" }, { status: 500 });
  }
}
