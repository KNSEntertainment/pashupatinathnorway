import { NextResponse } from "next/server";
import Subscriber from "@/models/Subscriber.Model";
import connectDB from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await connectDB();

    // Check if user is subscribed
    const subscriber = await Subscriber.findOne({ subscriber: email.toLowerCase() });
    
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
