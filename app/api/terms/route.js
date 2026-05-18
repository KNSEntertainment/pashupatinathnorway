import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Terms from '@/models/Terms.Model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// GET - Fetch current terms content
export async function GET() {
  try {
    await connectDB();
    
    const terms = await Terms.getCurrentTerms();
    
    if (!terms) {
      // Return default terms if none exist
      return NextResponse.json({
        success: true,
        data: getDefaultTerms()
      });
    }
    
    return NextResponse.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch terms'
    }, { status: 500 });
  }
}

// PUT - Update terms content (admin only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }
    
    const { content } = await request.json();
    
    if (!content || typeof content !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid content provided'
      }, { status: 400 });
    }
    
    await connectDB();
    
    const terms = await Terms.upsertTerms(content, session.user.id);
    
    return NextResponse.json({
      success: true,
      data: terms,
      message: 'Terms updated successfully'
    });
  } catch (error) {
    console.error('Error updating terms:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update terms'
    }, { status: 500 });
  }
}

// Default terms structure
function getDefaultTerms() {
  return {
    title: "Pashupatinath Norway Temple Membership Terms and Conditions",
    subtitle: "Membership Agreement",
    importantNotice: "BEFORE SUBMITTING YOUR MEMBERSHIP APPLICATION, YOU MUST READ AND AGREE TO THESE TERMS AND CONDITIONS, WHICH GOVERN YOUR MEMBERSHIP WITH PASHUPATINATH NORWAY TEMPLE (ORGANIZATION NUMBER: 926 499 211).",
    aboutOrganization: "Pashupatinath Norway Temple is a registered organization in Norway (registration number: 926 499 211) with the main purpose of preserving and promoting Nepali Hindu religion and culture in Norway. More information about our activities can be found at www.nepalihindu.no.\n\nBecoming a member is completely free of charge. Your membership helps us strengthen our community and continue our cultural and religious activities.",
    membershipTerms: {
      free: "Membership in Pashupatinath Norway Temple is completely free. No membership fees are required to join or maintain your membership status.",
      age: "Membership forms for children under 15 years of age must be filled out and submitted by their parents or legal guardians.",
      individual: "Each person must submit a separate membership application. Parents cannot include their children in their own application form.",
      accurate: "You must provide accurate, complete, and current information in your membership application. You are responsible for updating your information when it changes.",
      single: "You may only hold membership with one religious organization at a time. If you are currently a member of another religious organization, you should cancel that membership before joining ours."
    },
    dataProtection: "Your personal data will only be used by Pashupatinath Norway Temple for membership administration and communication purposes. We will not share your personal information with third parties without your explicit consent, except as required by law.\n\nYou have the right to access, update, or delete your personal information at any time by contacting us or through your member portal. For detailed information about how we handle your data, please refer to our Privacy Policy.",
    membershipRights: {
      participation: "As a member, you have the right to participate in our religious ceremonies, cultural events, and general meetings.",
      voting: "Active members have voting rights in organizational matters as specified in our bylaws and during general meetings.",
      conduct: "Members are expected to respect our cultural and religious traditions, maintain respectful behavior towards other members, and support the organization's mission.",
      communication: "We will communicate with members primarily through email and our member portal. Please keep your contact information updated to receive important announcements."
    },
    cancellation: "You may cancel your membership at any time by sending a written request to our organization. We will process your cancellation within 48 hours and confirm the completion of the process.\n\nTo cancel your membership, please email us at norwaynepalihindutemple@gmail.com with your full name, personal number, and a clear statement that you wish to cancel your membership.",
    modification: "We may update these terms and conditions from time to time. Any changes will be communicated to members through email and posted on our website. Continued membership after such changes constitutes acceptance of the modified terms.",
    contact: {
      email: "norwaynepalihindutemple@gmail.com",
      website: "www.nepalihindu.no",
      organizationNumber: "926 499 211"
    }
  };
}
