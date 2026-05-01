import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from "@/models/Membership.Model";
import Subscriber from "@/models/Subscriber.Model";
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

    // Delete from subscribers collection
    await Subscriber.deleteOne({ subscriber: session.user.email });

    // Delete membership record
    await Membership.deleteOne({ email: session.user.email });

    // Log the deletion for audit purposes
    console.log(`Account deleted: ${session.user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      message: "Account successfully deleted. All your data has been permanently removed." 
    });

  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
