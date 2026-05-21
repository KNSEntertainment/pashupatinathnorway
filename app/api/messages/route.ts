import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import InternalMessage from "@/models/InternalMessage.Model";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// GET all messages for the logged-in user
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const isStarred = searchParams.get("starred");
    const isImportant = searchParams.get("important");

    // Build query
    const query: Record<string, unknown> = { 
      recipient: membership._id,
      isDeleted: { $ne: true }
    };
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (type && type !== "all") {
      query.type = type;
    }
    
    if (isStarred === "true") {
      query.isStarred = true;
    }
    
    if (isImportant === "true") {
      query.isImportant = true;
    }

    // Get messages with sender info - handle both User and Membership references
    const messages = await InternalMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Manually populate sender to handle both User and Membership models
    const populatedMessages = await Promise.all(
      messages.map(async (message) => {
        const messageObj = message.toObject();
        
        try {
          // Try to populate as Membership first
          const membershipSender = await Membership.findById(message.sender, "firstName lastName email");
          if (membershipSender) {
            messageObj.sender = membershipSender;
          } else {
            // Fallback: try to populate as User
            const User = mongoose.models.User || mongoose.model("User");
            const userSender = await User.findById(message.sender, "fullName email");
            if (userSender) {
              // Convert User format to match Membership format for consistency
              messageObj.sender = {
                firstName: userSender.fullName?.split(' ')[0] || 'Unknown',
                lastName: userSender.fullName?.split(' ').slice(1).join(' ') || 'Sender',
                email: userSender.email
              };
            } else {
              // Final fallback - set sender to a safe default object
              messageObj.sender = {
                firstName: 'Admin',
                lastName: '',
                email: 'admin@pashupatinath.no'
              };
            }
          }
        } catch (error) {
          console.error('Error populating sender:', error);
          // Set safe default instead of null to prevent runtime errors
          messageObj.sender = {
            firstName: 'Admin',
            lastName: '',
            email: 'admin@pashupatinath.no'
          };
        }
        
        return messageObj;
      })
    );

    const total = await InternalMessage.countDocuments(query);

    // Count unread messages
    const unreadCount = await InternalMessage.countDocuments({
      recipient: membership._id,
      status: { $ne: "read" },
      isDeleted: { $ne: true }
    });

    return NextResponse.json({
      messages: populatedMessages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST send a new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's membership record (as sender)
    const senderMembership = await Membership.findOne({ email: session.user.email });
    if (!senderMembership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    const body = await request.json();
    const { recipients, subject, content, type = "personal", parentMessageId } = body;

    // Validate required fields
    if (!recipients || recipients.length === 0 || !subject || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get recipient memberships
    const recipientMemberships = await Membership.find({ 
      _id: { $in: recipients },
      membershipStatus: "approved"
    });

    if (recipientMemberships.length === 0) {
      return NextResponse.json({ error: "No valid recipients found" }, { status: 400 });
    }

    const messages = [];
    
    // Create messages for each recipient
    for (const recipient of recipientMemberships) {
      const message = new InternalMessage({
        recipient: recipient._id,
        sender: senderMembership._id,
        subject,
        content,
        type,
        status: "sent"
      });

      // If this is a reply, link to parent message
      if (parentMessageId) {
        message.parentMessage = parentMessageId;
        
        // Add this message to the parent's thread
        await InternalMessage.findByIdAndUpdate(
          parentMessageId,
          { $push: { threadMessages: message._id } }
        );
      }

      await message.save();
      messages.push(message);
    }

    return NextResponse.json({ 
      message: "Messages sent successfully", 
      messages,
      recipientCount: recipientMemberships.length 
    }, { status: 201 });

  } catch (error) {
    console.error("Error sending messages:", error);
    return NextResponse.json({ error: "Failed to send messages" }, { status: 500 });
  }
}
