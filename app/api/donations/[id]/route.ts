import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const donation = await Donation.findById(id);
    
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }
    
    return NextResponse.json(donation, { status: 200 });
  } catch (error) {
    console.error("Error fetching donation:", error);
    return NextResponse.json({ error: "Failed to fetch donation" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const updateData = await request.json();
    
    // Log incoming data for debugging
    console.log("Update data received:", updateData);
    console.log("Donation ID:", id);
    
    // Validate fields - allow partial updates, only validate if provided
    const { donorName, donorEmail, amount, paymentStatus } = updateData;
    
    // Only validate if the field is provided in the update
    if (donorName !== undefined) {
      if (typeof donorName !== 'string' || donorName.trim().length === 0) {
        return NextResponse.json({ 
          error: "Invalid donorName provided - must be a non-empty string" 
        }, { status: 400 });
      }
    }
    
    if (donorEmail !== undefined) {
      if (typeof donorEmail !== 'string') {
        return NextResponse.json({ 
          error: "Invalid donorEmail provided - must be a string" 
        }, { status: 400 });
      }
      // Basic email validation if provided
      if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
        return NextResponse.json({ 
          error: "Invalid email format" 
        }, { status: 400 });
      }
    }
    
    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ 
          error: "Invalid amount provided - must be a positive number" 
        }, { status: 400 });
      }
      // Convert to number if it was passed as string
      updateData.amount = numAmount;
    }
    
    if (paymentStatus !== undefined) {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(paymentStatus)) {
        return NextResponse.json({ 
          error: "Invalid paymentStatus provided - must be one of: " + validStatuses.join(', ')
        }, { status: 400 });
      }
    }
    
    // Validate boolean fields
    if (updateData.isAnonymous !== undefined && typeof updateData.isAnonymous !== 'boolean') {
      return NextResponse.json({ 
        error: "Invalid isAnonymous provided - must be true or false" 
      }, { status: 400 });
    }
    
    // Find and update the donation
    const donation = await Donation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }
    
    console.log("Donation updated successfully:", donation);
    
    return NextResponse.json({ 
      message: "Donation updated successfully", 
      donation 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating donation:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    
    // Return more detailed error information
    return NextResponse.json({ 
      error: "Failed to update donation",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const donation = await Donation.findByIdAndDelete(id);
    
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "Donation deleted successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting donation:", error);
    return NextResponse.json({ error: "Failed to delete donation" }, { status: 500 });
  }
}
