import { NextResponse } from "next/server";
import Subscriber from "@/models/Subscriber.Model";
import connectDB from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { email, reason } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await connectDB();

    // Check if user is subscribed
    const subscriber = await Subscriber.findOne({ subscriber: email.toLowerCase() });
    
    if (!subscriber) {
      return NextResponse.json({ 
        message: "You are not currently subscribed to our newsletter" 
      }, { status: 200 });
    }

    // Log the unsubscribe reason if provided
    if (reason) {
      console.log(`Unsubscribe reason for ${email}: ${reason}`);
    }

    // Remove user from subscribers
    await Subscriber.deleteOne({ subscriber: email.toLowerCase() });

    return NextResponse.json({ 
      message: "Successfully unsubscribed from newsletter. We're sorry to see you go!" 
    });

  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from newsletter" },
      { status: 500 }
    );
  }
}
