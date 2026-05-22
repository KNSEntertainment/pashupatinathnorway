import { NextResponse } from "next/server";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    await connectDB();
    
    // Get all members first to see what's in the database
    const allMembers = await Membership.find({}).limit(5);
    console.log("All members count:", allMembers.length);
    
    // Get approved members
    const approvedMembers = await Membership.find({ membershipStatus: "approved" }).limit(5);
    console.log("Approved members count:", approvedMembers.length);
    
    // Test search
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "test";
    
    const searchResults = await Membership.find({
      membershipStatus: "approved",
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { membershipId: { $regex: query, $options: "i" } }
      ]
    }).limit(5);
    
    return NextResponse.json({
      allMembers: allMembers.map(m => ({
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        membershipStatus: m.membershipStatus,
        membershipType: m.membershipType
      })),
      approvedMembers: approvedMembers.map(m => ({
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        membershipStatus: m.membershipStatus,
        membershipType: m.membershipType
      })),
      searchResults: searchResults.map(m => ({
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        membershipStatus: m.membershipStatus,
        membershipType: m.membershipType
      })),
      counts: {
        all: allMembers.length,
        approved: approvedMembers.length,
        search: searchResults.length
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
