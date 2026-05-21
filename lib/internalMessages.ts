import InternalMessage from "@/models/InternalMessage.Model";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Internal message sender function
type sendInternalMessage = {
  recipient: string; // Membership ID
  senderEmail: string; // Sender email
  subject: string;
  content: string;
  relatedBroadcast?: string; // Broadcast ID (optional)
};

export async function sendInternalMessage({ 
  recipient, 
  senderEmail, 
  subject, 
  content, 
  relatedBroadcast 
}: sendInternalMessage) {
  try {
    await connectDB();
    
    // Find the sender's Membership record using their email
    let senderMembership = await Membership.findOne({ email: senderEmail });
    
    // If no membership found for admin, create a fallback sender
    if (!senderMembership) {
      // For admin users without membership records, we'll use a special admin sender
      // Create a temporary sender object that matches the expected structure
      senderMembership = {
        _id: new mongoose.Types.ObjectId(), // Generate a temporary ID
        firstName: 'Admin',
        lastName: 'User',
        email: senderEmail
      };
    }
    
    const message = new InternalMessage({
      recipient,
      sender: senderMembership._id, // Use Membership ID instead of User ID
      subject,
      content,
      type: "broadcast",
      relatedBroadcast,
      status: "sent"
    });

    await message.save();
    
    return { success: true, messageId: message._id };
  } catch (error) {
    console.error('Error sending internal message:', error);
    throw new Error(`Failed to send internal message: ${error instanceof Error ? error.message : String(error)}`);
  }
}
