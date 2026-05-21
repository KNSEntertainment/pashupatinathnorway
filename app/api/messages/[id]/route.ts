import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import InternalMessage from "@/models/InternalMessage.Model";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

interface ThreadMessage {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  subject: string;
  content: string;
  type: "broadcast" | "personal" | "system" | "reply";
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

// GET single message
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params;
    const message = await InternalMessage.findOne({ 
      _id: id,
      recipient: membership._id,
      isDeleted: { $ne: true }
    })
      .populate({
        path: "threadMessages",
        populate: {
          path: "sender",
          select: "firstName lastName email"
        }
      });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Manually populate sender to handle both User and Membership models
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
          // Final fallback
          messageObj.sender = null;
        }
      }
    } catch (error) {
      console.error('Error populating sender:', error);
      messageObj.sender = null;
    }

    // Also handle thread messages senders
    if (messageObj.threadMessages) {
      messageObj.threadMessages = await Promise.all(
        messageObj.threadMessages.map(async (threadMessage: ThreadMessage) => {
          try {
            const membershipSender = await Membership.findById(threadMessage.sender, "firstName lastName email");
            if (membershipSender) {
              threadMessage.sender = membershipSender;
            } else {
              const User = mongoose.models.User || mongoose.model("User");
              const userSender = await User.findById(threadMessage.sender, "fullName email");
              if (userSender) {
                threadMessage.sender = {
                  firstName: userSender.fullName?.split(' ')[0] || 'Unknown',
                  lastName: userSender.fullName?.split(' ').slice(1).join(' ') || 'Sender',
                  email: userSender.email
                };
              } else {
                threadMessage.sender = {
                  firstName: 'Admin',
                  lastName: '',
                  email: 'admin@pashupatinath.no'
                };
              }
            }
          } catch (error) {
            console.error('Error populating thread message sender:', error);
            threadMessage.sender = {
              firstName: 'Admin',
              lastName: '',
              email: 'admin@pashupatinath.no'
            };
          }
          return threadMessage;
        })
      );
    }

    return NextResponse.json({ message: messageObj });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 });
  }
}

// PUT update message (mark as read/unread, star/unstar, mark as important)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params;
    const body = await request.json();
    const { action } = body;

    const message = await InternalMessage.findOne({ 
      _id: id,
      recipient: membership._id,
      isDeleted: { $ne: true }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    let updateData: {
      status?: string;
      readAt?: Date | null;
      isStarred?: boolean;
      isImportant?: boolean;
      updatedAt?: Date;
    } = {};
    let responseMessage = "";

    switch (action) {
      case "markAsRead":
        updateData = { status: "read", readAt: new Date(), updatedAt: new Date() };
        responseMessage = "Message marked as read";
        break;
      case "markAsUnread":
        updateData = { status: "sent", readAt: null, updatedAt: new Date() };
        responseMessage = "Message marked as unread";
        break;
      case "star":
        updateData = { isStarred: true, updatedAt: new Date() };
        responseMessage = "Message starred";
        break;
      case "unstar":
        updateData = { isStarred: false, updatedAt: new Date() };
        responseMessage = "Message unstarred";
        break;
      case "markImportant":
        updateData = { isImportant: true, updatedAt: new Date() };
        responseMessage = "Message marked as important";
        break;
      case "unmarkImportant":
        updateData = { isImportant: false, updatedAt: new Date() };
        responseMessage = "Message unmarked as important";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedMessage = await InternalMessage.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    // Manually populate sender to handle both User and Membership models
    const messageObj = updatedMessage.toObject();
    
    try {
      const membershipSender = await Membership.findById(updatedMessage.sender, "firstName lastName email");
      if (membershipSender) {
        messageObj.sender = membershipSender;
      } else {
        const User = mongoose.models.User || mongoose.model("User");
        const userSender = await User.findById(updatedMessage.sender, "fullName email");
        if (userSender) {
          messageObj.sender = {
            firstName: userSender.fullName?.split(' ')[0] || 'Unknown',
            lastName: userSender.fullName?.split(' ').slice(1).join(' ') || 'Sender',
            email: userSender.email
          };
        } else {
          messageObj.sender = null;
        }
      }
    } catch (error) {
      console.error('Error populating sender:', error);
      messageObj.sender = null;
    }

    return NextResponse.json({ 
      message: responseMessage, 
      data: messageObj 
    });

  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

// DELETE message (soft delete)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params;
    const message = await InternalMessage.findOne({ 
      _id: id,
      recipient: membership._id,
      isDeleted: { $ne: true }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Soft delete the message
    await InternalMessage.findByIdAndUpdate(
      id,
      { 
        isDeleted: true, 
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    );

    return NextResponse.json({ message: "Message deleted successfully" });

  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
