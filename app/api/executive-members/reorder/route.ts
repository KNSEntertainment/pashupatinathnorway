import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { memberOrders } = await request.json();
    
    // Validate input
    if (!Array.isArray(memberOrders)) {
      return NextResponse.json(
        { error: "memberOrders must be an array" },
        { status: 400 }
      );
    }
    
    // Validate each item in the array
    for (const item of memberOrders) {
      if (!item.id || typeof item.displayOrder !== 'number') {
        return NextResponse.json(
          { error: "Each item must have id and displayOrder fields" },
          { status: 400 }
        );
      }
    }
    
    // Update display orders for all executive members
    const updatePromises = memberOrders.map(({ id, displayOrder }) =>
      Membership.updateOne(
        { _id: id, membershipType: "Executive" },
        { displayOrder }
      )
    );
    
    const results = await Promise.all(updatePromises);
    
    // Check if all updates were successful
    const failedUpdates = results.filter(result => result.matchedCount === 0);
    if (failedUpdates.length > 0) {
      return NextResponse.json(
        { error: "Some members were not found or are not executive members" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Executive members reordered successfully",
      updatedCount: results.length
    });
    
  } catch (error) {
    console.error("Error reordering executive members:", error);
    return NextResponse.json(
      { error: "Failed to reorder executive members" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    // Get all executive members sorted by displayOrder
    const executiveMembers = await Membership.find({ 
      membershipType: "Executive",
      membershipStatus: "approved"
    })
    .select("firstName lastName position displayOrder email phone membershipId")
    .sort({ displayOrder: 1, lastName: 1, firstName: 1 });
    
    return NextResponse.json({
      success: true,
      members: executiveMembers
    });
    
  } catch (error) {
    console.error("Error fetching executive members:", error);
    return NextResponse.json(
      { error: "Failed to fetch executive members" },
      { status: 500 }
    );
  }
}
