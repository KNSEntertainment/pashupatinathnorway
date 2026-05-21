import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import InternalMessage from "@/models/InternalMessage.Model";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";

// POST to mark message as read
export async function POST(request, { params }) {
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

    // Find and update the message
    const message = await InternalMessage.findOneAndUpdate(
      { 
        _id: params.id, 
        recipient: membership._id 
      },
      { 
        status: "read", 
        readAt: new Date() 
      },
      { new: true }
    ).populate("sender", "name email");

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Message marked as read", 
      messageData: message 
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json({ error: "Failed to mark message as read" }, { status: 500 });
  }
}
