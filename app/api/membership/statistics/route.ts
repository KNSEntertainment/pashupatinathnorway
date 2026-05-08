import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function GET() {
  try {
    await connectDB();
    
    // Get total counts by membership type
    const generalMembersCount = await Membership.countDocuments({ 
      membershipType: "General" 
    });
    
    const activeMembersCount = await Membership.countDocuments({ 
      membershipType: "Active" 
    });
    
    // Get total members
    const totalMembers = generalMembersCount + activeMembersCount;
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await Membership.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get members by fylke (county) for geographic distribution
    const membersByFylke = await Membership.aggregate([
      {
        $match: {
          fylke: { $nin: [null, ""] }
        }
      },
      {
        $group: {
          _id: "$fylke",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Calculate growth percentage (comparing last 30 days to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previousPeriodRegistrations = await Membership.countDocuments({
      createdAt: { 
        $gte: sixtyDaysAgo,
        $lt: thirtyDaysAgo
      }
    });
    
    let growthPercentage = 0;
    if (previousPeriodRegistrations > 0) {
      growthPercentage = Math.round(((recentRegistrations - previousPeriodRegistrations) / previousPeriodRegistrations) * 100);
    } else if (recentRegistrations > 0) {
      growthPercentage = 100; // First members in this period
    }
    
    return NextResponse.json({
      totalMembers,
      generalMembersCount,
      activeMembersCount,
      recentRegistrations,
      growthPercentage,
      topFylke: membersByFylke,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error fetching membership statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership statistics" },
      { status: 500 }
    );
  }
}
