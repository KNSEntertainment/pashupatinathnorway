import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Membership from "@/models/Membership.Model";

export async function GET() {
  try {
    console.log("=== USER DONATIONS API CALLED ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", session.user.email);

    await connectDB();

    // Use the user ID from session directly (handle both _id and id)
    const userId = (session.user as { _id?: string; id?: string })._id || session.user.id;
    console.log("Using user ID from session:", userId);
    console.log("Session user keys:", Object.keys(session.user));

    // Try to find member record with personal number and phone as primary identifiers
    let personalNumber = null;
    let phoneNumber = null;
    try {
      const membership = await Membership.findOne({ email: session.user.email });
      if (membership) {
        personalNumber = membership.personalNumber;
        phoneNumber = membership.phone;
        console.log("Found personal number for member:", personalNumber);
        console.log("Found phone number for member:", phoneNumber);
      }
    } catch {
      console.log("No membership record found for user:", session.user.email);
    }

    // Build donation query - prioritize personal number and phone as primary identifiers
    let donationQuery: Record<string, unknown>;

    if (personalNumber || phoneNumber) {
      // Primary: Use personal number and phone for exact member identification
      const orConditions = [];
      
      if (personalNumber) {
        orConditions.push({ personalNumber: personalNumber });
      }
      
      if (phoneNumber) {
        orConditions.push({ donorPhone: phoneNumber });
      }
      
      // Always include email and userId as fallbacks
      orConditions.push({ donorEmail: session.user.email });
      orConditions.push({ userId: userId });
      
      donationQuery = {
        $or: orConditions
      };
    } else {
      // Fallback: Use email and userId if no personal number or phone found
      donationQuery = {
        $or: [
          { donorEmail: session.user.email },
          { userId: userId }
        ]
      };
    }

    // Fetch user's donations
    // Note: Removed populate('causeId') due to missing Cause schema
    const donations = await Donation.find(donationQuery)
    .sort({ createdAt: -1 });
    
    console.log("Found donations:", donations.length);

    // Calculate stats
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const completedDonations = donations.filter(d => d.paymentStatus === "completed");
    
    const totalDonated = completedDonations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = donations.length;
    
    const thisYearDonations = completedDonations.filter(d => 
      new Date(d.createdAt).getFullYear() === currentYear
    );
    const thisYear = thisYearDonations.reduce((sum, d) => sum + d.amount, 0);
    
    const thisMonthDonations = completedDonations.filter(d => {
      const donationDate = new Date(d.createdAt);
      return donationDate.getFullYear() === currentYear && donationDate.getMonth() === currentMonth;
    });
    const thisMonth = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);

    const stats = {
      totalDonated,
      donationCount,
      thisYear,
      thisMonth,
    };

    console.log("Returning donation data");

    return NextResponse.json({
      donations,
      stats,
      personalNumber: personalNumber, // Include personal number info for UI
      phoneNumber: phoneNumber, // Include phone number info for debugging
    });

  } catch (error) {
    console.error("Error fetching user donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
