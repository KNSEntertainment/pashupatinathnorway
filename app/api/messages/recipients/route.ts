import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";

// GET available recipients for composing messages
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's membership record
    const membership = await Membership.findOne({ email: session.user.email });
    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const membershipType = searchParams.get("membershipType");

    // Build query for approved members (excluding self)
    const query: Record<string, unknown> = { 
      membershipStatus: "approved",
      _id: { $ne: membership._id }
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (membershipType && membershipType !== "all") {
      query.membershipType = membershipType;
    }

    const recipients = await Membership.find(query)
      .select("firstName lastName email membershipType")
      .sort({ firstName: 1, lastName: 1 })
      .limit(50);

    return NextResponse.json({ recipients });
  } catch (error) {
    console.error("Error fetching recipients:", error);
    return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
  }
}
