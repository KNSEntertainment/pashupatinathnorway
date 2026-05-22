import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from "@/models/Membership.Model";
import Subscriber from "@/models/Subscriber.Model";
import Donation from "@/models/Donation.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import Message from "@/models/Message.Model";
import Order from "@/models/Order.Model";
import Attendance from "@/models/Attendance.Model";
import connectDB from "@/lib/mongodb";

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();
    
    // Ensure the email matches the authenticated user's email
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user's membership data before deletion for notification
    const membership = await Membership.findOne({ email: session.user.email });
    
    if (!membership) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Comprehensive data deletion - collect all deletion operations
    const deletedDataSummary = {
      membership: 0,
      subscriber: 0,
      donations: 0,
      eventRegistrations: 0,
      messages: 0,
      orders: 0,
      attendance: 0
    };

    try {
      // Delete from subscribers collection
      const subscriberResult = await Subscriber.deleteOne({ subscriber: session.user.email });
      deletedDataSummary.subscriber = subscriberResult.deletedCount;

      // Delete membership record (do this last to keep reference for other deletions)
      const membershipResult = await Membership.deleteOne({ email: session.user.email });
      deletedDataSummary.membership = membershipResult.deletedCount;

      // Delete all donations
      const donationResult = await Donation.deleteMany({ donorEmail: session.user.email });
      deletedDataSummary.donations = donationResult.deletedCount;

      // Delete all event registrations
      const eventRegResult = await EventRegistration.deleteMany({ email: session.user.email });
      deletedDataSummary.eventRegistrations = eventRegResult.deletedCount;

      // Delete all messages
      const messageResult = await Message.deleteMany({ email: session.user.email });
      deletedDataSummary.messages = messageResult.deletedCount;

      // Delete all orders
      const orderResult = await Order.deleteMany({ 'customerInfo.email': session.user.email });
      deletedDataSummary.orders = orderResult.deletedCount;

      // Delete all attendance records
      const attendanceResult = await Attendance.deleteMany({ email: session.user.email });
      deletedDataSummary.attendance = attendanceResult.deletedCount;

      // Log the comprehensive deletion for audit purposes
      console.log(`Comprehensive account deletion completed: ${session.user.email} at ${new Date().toISOString()}`);
      console.log(`Deletion summary:`, deletedDataSummary);

      return NextResponse.json({ 
        message: "Account successfully deleted. All your data has been permanently removed.",
        deletedDataSummary: deletedDataSummary
      });

    } catch (deletionError) {
      console.error("Error during comprehensive deletion:", deletionError);
      // If any deletion fails, we should log it but still continue
      // The user's account should still be considered deleted for security
      return NextResponse.json({ 
        message: "Account deleted with some data cleanup issues. Please contact support.",
        error: "Partial deletion completed"
      }, { status: 207 }); // 207 Multi-Status for partial success
    }

  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
