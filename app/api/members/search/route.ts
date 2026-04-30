import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query || query.trim() === "") {
      return NextResponse.json({ members: [] });
    }

    await connectMongoDB();

    // Search for members by name, email, phone, or personal number
    const searchRegex = new RegExp(query.trim(), "i");
    
    const members = await Membership.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { personalNumber: searchRegex }
      ],
      membershipStatus: "approved" // Only return active members
    })
    .select("firstName lastName fullName email phone personalNumber membershipStatus createdAt")
    .limit(20) // Limit results to 20 for performance
    .sort({ fullName: 1 });

    // Format the response
    const formattedMembers = members.map(member => ({
      _id: member._id.toString(),
      fullName: member.fullName || `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone,
      personalNumber: member.personalNumber,
      membershipStatus: member.membershipStatus,
      createdAt: member.createdAt
    }));

    return NextResponse.json({ 
      success: true,
      members: formattedMembers 
    });

  } catch (error) {
    console.error("Error searching members:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to search members" 
      },
      { status: 500 }
    );
  }
}
