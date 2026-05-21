import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";

// GET search members for broadcast recipients
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const membershipType = searchParams.get("membershipType");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    // Build search query
    const searchQuery = { membershipStatus: "approved" };
    
    if (query) {
      searchQuery.$or = [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { membershipId: { $regex: query, $options: "i" } }
      ];
    }

    if (membershipType && membershipType !== "all") {
      searchQuery.membershipType = membershipType;
    }

    const members = await Membership.find(searchQuery)
      .select("firstName lastName email membershipType membershipId phone")
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Membership.countDocuments(searchQuery);

    return NextResponse.json({
      members,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error searching members:", error);
    return NextResponse.json({ error: "Failed to search members" }, { status: 500 });
  }
}
