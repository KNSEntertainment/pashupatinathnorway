import { NextResponse } from "next/server";
import Membership from "@/models/Membership.Model";
import connectDB from "@/lib/mongodb";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    await connectDB();
    
    // Get some sample phone numbers from the database
    const members = await Membership.find({ 
      membershipStatus: "approved",
      phone: { $exists: true, $ne: "" }
    }).select("firstName lastName phone").limit(10);

    const phoneNumbers = members.map(member => ({
      name: `${member.firstName} ${member.lastName}`,
      phone: member.phone,
      length: member.phone?.length || 0,
      digitsOnly: member.phone?.replace(/\D/g, '') || "",
      digitCount: member.phone?.replace(/\D/g, '').length || 0
    }));

    return NextResponse.json({
      phoneNumbers,
      totalFound: members.length
    });
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
