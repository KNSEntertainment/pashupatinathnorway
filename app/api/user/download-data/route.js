import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from "@/models/Membership.Model";
import Subscriber from "@/models/Subscriber.Model";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user's membership data
    const membership = await Membership.findOne({ email: session.user.email });
    if (!membership) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    // Check if user is subscribed
    const isSubscribed = await Subscriber.findOne({ subscriber: session.user.email });

    // Prepare comprehensive user data
    const userData = {
      "Personal Information": {
        "First Name": membership.firstName || "",
        "Middle Name": membership.middleName || "",
        "Last Name": membership.lastName || "",
        "Email": membership.email || "",
        "Phone": membership.phone || "",
        "Address": membership.address || "",
        "City": membership.city || "",
        "Postal Code": membership.postalCode || "",
        "Fylke": membership.fylke || "",
        "Kommune": membership.kommune || "",
        "Personal Number": membership.personalNumber || "",
        "Gender": membership.gender || "",
      },
      "Membership Details": {
        "Membership Type": membership.membershipType || "",
        "Membership Status": membership.membershipStatus || "",
        "Oslo Verification Status": membership.osloVerificationStatus || "",
        "Member Since": membership.createdAt ? new Date(membership.createdAt).toISOString() : "",
        "Profile Photo": membership.profilePhoto || "",
      },
      "Account Settings": {
        "Email Subscription": isSubscribed ? "Active" : "Not Subscribed",
        "Terms Agreed": membership.agreeTerms ? "Yes" : "No",
        "Last Updated": membership.updatedAt ? new Date(membership.updatedAt).toISOString() : "",
      },
      "Family Members": membership.familyMembers ? membership.familyMembers.map((member, index) => ({
        [`Family Member ${index + 1} - First Name`]: member.firstName || "",
        [`Family Member ${index + 1} - Middle Name`]: member.middleName || "",
        [`Family Member ${index + 1} - Last Name`]: member.lastName || "",
        [`Family Member ${index + 1} - Personal Number`]: member.personalNumber || "",
        [`Family Member ${index + 1} - Email`]: member.email || "",
        [`Family Member ${index + 1} - Phone`]: member.phone || "",
      })) : {}
    };

    // Convert to CSV format
    const csvRows = [];
    csvRows.push("Data Category,Field,Value");
    
    // Add personal information
    Object.entries(userData["Personal Information"]).forEach(([field, value]) => {
      csvRows.push(`Personal Information,"${field}","${value}"`);
    });
    
    // Add membership details
    Object.entries(userData["Membership Details"]).forEach(([field, value]) => {
      csvRows.push(`Membership Details,"${field}","${value}"`);
    });
    
    // Add account settings
    Object.entries(userData["Account Settings"]).forEach(([field, value]) => {
      csvRows.push(`Account Settings,"${field}","${value}"`);
    });
    
    // Add family members if any
    if (userData["Family Members"] && userData["Family Members"].length > 0) {
      userData["Family Members"].forEach(familyMember => {
        Object.entries(familyMember).forEach(([field, value]) => {
          csvRows.push(`Family Members,"${field}","${value}"`);
        });
      });
    }

    const csvContent = csvRows.join("\n");
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `my-data_${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error downloading user data:", error);
    return NextResponse.json(
      { error: "Failed to download user data" },
      { status: 500 }
    );
  }
}
