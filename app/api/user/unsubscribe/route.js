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

    // Check if user is subscribed
    const subscriber = await Subscriber.findOne({ subscriber: session.user.email });
    
    if (!subscriber) {
      return NextResponse.json({ 
        message: "You are not currently subscribed to our newsletter" 
      }, { status: 200 });
    }

    // Remove user from subscribers
    await Subscriber.deleteOne({ subscriber: session.user.email });

    return NextResponse.json({ 
      message: "Successfully unsubscribed from newsletter. You will no longer receive email updates." 
    });

  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from newsletter" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is subscribed
    const subscriber = await Subscriber.findOne({ subscriber: session.user.email });
    
    return NextResponse.json({ 
      isSubscribed: !!subscriber,
      subscriptionDate: subscriber?.createdAt || null
    });

  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
