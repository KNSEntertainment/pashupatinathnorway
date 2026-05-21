import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Broadcast, BroadcastTracking } from "@/models/Broadcast.Model";
import connectDB from "@/lib/mongodb";

// GET single broadcast with tracking
export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const broadcast = await Broadcast.findById(params.id)
      .populate("sender", "fullName email")
      .populate("individualRecipients", "firstName lastName email");

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Get tracking information
    const tracking = await BroadcastTracking.find({ broadcast: params.id })
      .populate("recipient", "firstName lastName email membershipType")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: tracking.length,
      pending: tracking.filter(t => t.status === "pending").length,
      sent: tracking.filter(t => t.status === "sent").length,
      delivered: tracking.filter(t => t.status === "delivered").length,
      read: tracking.filter(t => t.status === "read").length,
      failed: tracking.filter(t => t.status === "failed").length
    };

    return NextResponse.json({ broadcast, tracking, stats });
  } catch (error) {
    console.error("Error fetching broadcast:", error);
    return NextResponse.json({ error: "Failed to fetch broadcast" }, { status: 500 });
  }
}

// PUT update broadcast
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const broadcast = await Broadcast.findById(params.id);

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Only allow updating draft broadcasts
    if (broadcast.status !== "draft") {
      return NextResponse.json({ error: "Cannot update sent broadcast" }, { status: 400 });
    }

    const updatedBroadcast = await Broadcast.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({ message: "Broadcast updated successfully", broadcast: updatedBroadcast });
  } catch (error) {
    console.error("Error updating broadcast:", error);
    return NextResponse.json({ error: "Failed to update broadcast" }, { status: 500 });
  }
}

// DELETE broadcast
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const broadcast = await Broadcast.findById(params.id);

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Only allow deleting draft broadcasts
    if (broadcast.status !== "draft") {
      return NextResponse.json({ error: "Cannot delete sent broadcast" }, { status: 400 });
    }

    // Delete tracking records
    await BroadcastTracking.deleteMany({ broadcast: params.id });
    
    // Delete broadcast
    await Broadcast.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Broadcast deleted successfully" });
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    return NextResponse.json({ error: "Failed to delete broadcast" }, { status: 500 });
  }
}
