import { NextResponse } from "next/server";
import Subscriber from "@/models/Subscriber.Model";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await connectDB();

    // Check if user is already subscribed
    const existingSubscriber = await Subscriber.findOne({ subscriber: email.toLowerCase() });
    
    if (existingSubscriber) {
      return NextResponse.json({ 
        message: "You are already subscribed to our newsletter" 
      }, { status: 200 });
    }

    // Get user's membership data for additional info (optional)
    const membership = await Membership.findOne({ email: email.toLowerCase() });
    
    // Create new subscriber
    const subscriber = new Subscriber({
      subscriber: email.toLowerCase(),
    });

    await subscriber.save();

    console.log(`New subscription: ${email}${membership ? ` (Member: ${membership.firstName} ${membership.lastName})` : ''}`);

    return NextResponse.json({ 
      message: "Successfully subscribed to our newsletter! Welcome back!" 
    });

  } catch (error) {
    console.error("Error subscribing user:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
