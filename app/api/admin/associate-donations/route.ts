import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cause from "@/models/Cause.Model";
import Donation from "@/models/Donation.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { causeId } = body;

    if (!causeId) {
      return NextResponse.json(
        { error: "Cause ID is required" },
        { status: 400 }
      );
    }

    // Verify the cause exists
    const cause = await Cause.findById(causeId);
    if (!cause) {
      return NextResponse.json(
        { error: "Cause not found" },
        { status: 404 }
      );
    }

    // Find all general donations (without causeId) that are completed
    const generalDonations = await Donation.find({
      causeId: { $exists: false },
      paymentStatus: "completed"
    });

    if (generalDonations.length === 0) {
      return NextResponse.json({
        message: "No general donations found to associate",
        donationsUpdated: 0,
        causeTitle: cause.title.en || 'Unknown Cause'
      });
    }

    // Update all general donations to associate with the specified cause
    const result = await Donation.updateMany(
      {
        causeId: { $exists: false },
        paymentStatus: "completed"
      },
      {
        $set: {
          causeId: causeId,
          donationType: "cause_specific"
        }
      }
    );

    // Verify the update
    const updatedDonations = await Donation.find({ causeId: causeId });

    return NextResponse.json({
      message: `Successfully associated ${result.modifiedCount} donations with cause`,
      donationsUpdated: result.modifiedCount,
      causeTitle: cause.title.en || 'Unknown Cause',
      totalDonationsForCause: updatedDonations.length
    });

  } catch (error) {
    console.error("Error associating donations:", error);
    return NextResponse.json(
      { error: "Failed to associate donations" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all causes
    const causes = await Cause.find({}).select('_id title.en status');
    
    // Count general donations
    const generalDonationCount = await Donation.countDocuments({
      causeId: { $exists: false },
      paymentStatus: "completed"
    });

    return NextResponse.json({
      causes: causes.map(cause => ({
        id: cause._id,
        title: cause.title.en || 'No title',
        status: cause.status
      })),
      generalDonationCount
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
