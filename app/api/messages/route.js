import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import InternalMessage from "@/models/InternalMessage.Model";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the user's membership record
    const membership = await Membership.findOne({ email: session.user.email });
    
    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Get user's internal messages
    const messages = await InternalMessage.find({ 
      recipient: membership._id,
      isDeleted: { $ne: true }
    })
    .populate('sender', 'firstName lastName email')
    .populate('threadMessages')
    .sort({ createdAt: -1 });

    // Count unread messages
    const unreadCount = messages.filter(msg => msg.status !== 'read').length;

    return NextResponse.json({ 
      messages: messages,
      count: messages.length,
      unreadCount: unreadCount
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, content, recipientEmail, type = "personal" } = await request.json();

    // Validate required fields
    if (!subject || !content || !recipientEmail) {
      return NextResponse.json(
        { error: "Subject, content, and recipient email are required" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find sender and recipient memberships
    const senderMembership = await Membership.findOne({ email: session.user.email });
    const recipientMembership = await Membership.findOne({ email: recipientEmail });

    if (!senderMembership) {
      return NextResponse.json({ error: "Sender membership not found" }, { status: 404 });
    }

    if (!recipientMembership) {
      return NextResponse.json({ error: "Recipient membership not found" }, { status: 404 });
    }

    // Create new internal message
    const newMessage = await InternalMessage.create({
      recipient: recipientMembership._id,
      sender: senderMembership._id,
      subject,
      content,
      type
    });

    // Populate sender info for response
    await newMessage.populate('sender', 'firstName lastName email');

    return NextResponse.json(
      { 
        message: "Message sent successfully",
        data: newMessage 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
