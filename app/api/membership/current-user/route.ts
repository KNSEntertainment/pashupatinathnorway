import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // First try to find membership by email (to get the personal number)
    const membership = await Membership.findOne({ email: session.user.email });
    
    if (!membership) {
      return NextResponse.json({ membership: null }, { status: 200 });
    }

    // Return the full membership data
    return NextResponse.json({ 
      membership: {
        firstName: membership.firstName,
        lastName: membership.lastName,
        email: membership.email,
        phone: membership.phone,
        personalNumber: membership.personalNumber,
        membershipStatus: membership.membershipStatus,
        membershipType: membership.membershipType
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching current user membership:", error);
    return NextResponse.json({ error: "Failed to fetch membership data" }, { status: 500 });
  }
}
