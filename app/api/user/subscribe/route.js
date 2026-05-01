import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Subscriber from "@/models/Subscriber.Model";
import connectDB from "@/lib/mongodb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is already subscribed
    const existingSubscriber = await Subscriber.findOne({ subscriber: session.user.email });
    
    if (existingSubscriber) {
      return NextResponse.json({ 
        message: "You are already subscribed to our newsletter" 
      }, { status: 200 });
    }

    // Get user's membership data for additional info
    // const membership = await Membership.findOne({ email: session.user.email });
    
    // Create new subscriber
    const subscriber = new Subscriber({
      subscriber: session.user.email,
    });

    await subscriber.save();

    return NextResponse.json({ 
      message: "Successfully subscribed to our newsletter! You will now receive email updates about events, news, and announcements." 
    });

  } catch (error) {
    console.error("Error subscribing user:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
