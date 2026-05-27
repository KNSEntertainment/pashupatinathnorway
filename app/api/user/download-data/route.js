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

    // Fetch additional user data
    const donations = await Donation.find({ donorEmail: session.user.email }).sort({ createdAt: -1 });
    const eventRegistrations = await EventRegistration.find({ email: session.user.email })
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 });
    const messages = await Message.find({ email: session.user.email }).sort({ createdAt: -1 });
    const orders = await Order.find({ 'customerInfo.email': session.user.email }).sort({ createdAt: -1 });
    const attendance = await Attendance.find({ email: session.user.email })
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 });

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
        "BRREG Verification Status": membership.osloVerificationStatus || "",
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
      })) : {},
      "Donations": donations.length > 0 ? donations.map((donation, index) => ({
        [`Donation ${index + 1} - Amount`]: `${donation.amount} ${donation.currency}`,
        [`Donation ${index + 1} - Date`]: donation.createdAt ? new Date(donation.createdAt).toISOString() : "",
        [`Donation ${index + 1} - Status`]: donation.paymentStatus || "",
        [`Donation ${index + 1} - Type`]: donation.donationType || "",
        [`Donation ${index + 1} - Purpose`]: donation.donationPurpose || "",
        [`Donation ${index + 1} - Message`]: donation.message || "",
        [`Donation ${index + 1} - Is Anonymous`]: donation.isAnonymous ? "Yes" : "No",
      })) : {},
      "Event Registrations": eventRegistrations.length > 0 ? eventRegistrations.map((registration, index) => ({
        [`Registration ${index + 1} - Event`]: registration.eventId?.title || "",
        [`Registration ${index + 1} - Date`]: registration.createdAt ? new Date(registration.createdAt).toISOString() : "",
        [`Registration ${index + 1} - Event Date`]: registration.eventId?.date ? new Date(registration.eventId.date).toISOString() : "",
        [`Registration ${index + 1} - Location`]: registration.eventId?.location || "",
        [`Registration ${index + 1} - Type`]: registration.registrationType || "",
        [`Registration ${index + 1} - Status`]: registration.registrationStatus || "",
        [`Registration ${index + 1} - Payment Status`]: registration.paymentStatus || "",
        [`Registration ${index + 1} - Attendee Count`]: registration.attendeeCount || 1,
        [`Registration ${index + 1} - Donation Amount`]: registration.donationAmount || 0,
      })) : {},
      "Messages": messages.length > 0 ? messages.map((message, index) => ({
        [`Message ${index + 1} - Date`]: message.createdAt ? new Date(message.createdAt).toISOString() : "",
        [`Message ${index + 1} - Subject`]: "Contact Form Submission",
        [`Message ${index + 1} - Content`]: message.message || "",
      })) : {},
      "Orders": orders.length > 0 ? orders.map((order, index) => ({
        [`Order ${index + 1} - ID`]: order._id || "",
        [`Order ${index + 1} - Date`]: order.createdAt ? new Date(order.createdAt).toISOString() : "",
        [`Order ${index + 1} - Total`]: `${order.total} ${order.currency}`,
        [`Order ${index + 1} - Status`]: order.status || "",
        [`Order ${index + 1} - Payment Status`]: order.paymentStatus || "",
        [`Order ${index + 1} - Payment Method`]: order.paymentMethod || "",
        [`Order ${index + 1} - Items Count`]: order.items ? order.items.length : 0,
        [`Order ${index + 1} - Notes`]: order.notes || "",
      })) : {},
      "Attendance Records": attendance.length > 0 ? attendance.map((record, index) => ({
        [`Attendance ${index + 1} - Event`]: record.eventId?.title || "",
        [`Attendance ${index + 1} - Date`]: record.createdAt ? new Date(record.createdAt).toISOString() : "",
        [`Attendance ${index + 1} - Event Date`]: record.eventId?.date ? new Date(record.eventId.date).toISOString() : "",
        [`Attendance ${index + 1} - Location`]: record.eventId?.location || "",
        [`Attendance ${index + 1} - Status`]: record.status || "",
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
    
    // Add donations if any
    if (userData["Donations"] && userData["Donations"].length > 0) {
      userData["Donations"].forEach(donation => {
        Object.entries(donation).forEach(([field, value]) => {
          csvRows.push(`Donations,"${field}","${value}"`);
        });
      });
    }
    
    // Add event registrations if any
    if (userData["Event Registrations"] && userData["Event Registrations"].length > 0) {
      userData["Event Registrations"].forEach(registration => {
        Object.entries(registration).forEach(([field, value]) => {
          csvRows.push(`Event Registrations,"${field}","${value}"`);
        });
      });
    }
    
    // Add messages if any
    if (userData["Messages"] && userData["Messages"].length > 0) {
      userData["Messages"].forEach(message => {
        Object.entries(message).forEach(([field, value]) => {
          csvRows.push(`Messages,"${field}","${value}"`);
        });
      });
    }
    
    // Add orders if any
    if (userData["Orders"] && userData["Orders"].length > 0) {
      userData["Orders"].forEach(order => {
        Object.entries(order).forEach(([field, value]) => {
          csvRows.push(`Orders,"${field}","${value}"`);
        });
      });
    }
    
    // Add attendance records if any
    if (userData["Attendance Records"] && userData["Attendance Records"].length > 0) {
      userData["Attendance Records"].forEach(record => {
        Object.entries(record).forEach(([field, value]) => {
          csvRows.push(`Attendance Records,"${field}","${value}"`);
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
