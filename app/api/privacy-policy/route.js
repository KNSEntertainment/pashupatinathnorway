import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PrivacyPolicy from '@/models/PrivacyPolicy.Model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// GET - Fetch current privacy policy content
export async function GET() {
  try {
    await connectDB();
    
    const privacyPolicy = await PrivacyPolicy.getCurrentPrivacyPolicy();
    
    if (!privacyPolicy) {
      // Return default privacy policy if none exist
      return NextResponse.json({
        success: true,
        data: getDefaultPrivacyPolicy()
      });
    }
    
    return NextResponse.json({
      success: true,
      data: privacyPolicy
    });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch privacy policy'
    }, { status: 500 });
  }
}

// PUT - Update privacy policy content (admin only)
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
    
    const privacyPolicy = await PrivacyPolicy.upsertPrivacyPolicy(content, session.user.id);
    
    return NextResponse.json({
      success: true,
      data: privacyPolicy,
      message: 'Privacy policy updated successfully'
    });
  } catch (error) {
    console.error('Error updating privacy policy:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update privacy policy'
    }, { status: 500 });
  }
}

// Default privacy policy structure
function getDefaultPrivacyPolicy() {
  return {
    title: "Pashupatinath Norway Temple Membership Privacy Policy",
    lastUpdated: "December 2025",
    introduction: "This Privacy Policy explains how Pashupatinath Norway Temple (Organization Number: 926 499 211) collects, uses, and protects your personal information when you apply for membership or interact with our organization. We are committed to protecting your privacy and ensuring transparency in our data handling practices.",
    informationWeCollect: {
      title: "Information We Collect",
      description: "When you apply for membership or interact with our organization, we collect the following information:",
      items: [
        {
          title: "Personal Information",
          description: "First name, middle name, last name, date of birth, and gender"
        },
        {
          title: "Contact Information", 
          description: "Email address, phone number, and residential addresses in Norway and Nepal"
        },
        {
          title: "Identification",
          description: "Personal number (personnummer) and other identification details"
        },
        {
          title: "Family Information",
          description: "Parents' names, spouse's name, and children's information"
        },
        {
          title: "Professional Information",
          description: "Education, occupation, and professional details"
        },
        {
          title: "Membership Details",
          description: "Membership application date, status, and participation in activities"
        }
      ]
    },
    howWeUseInformation: {
      title: "How We Use Your Information",
      description: "We use your personal information only for the following purposes:",
      items: [
        {
          type: "Membership Administration",
          purpose: "To process and manage your membership application and maintain accurate membership records"
        },
        {
          type: "Communication",
          purpose: "To send important announcements, event invitations, and organizational updates via email or phone"
        },
        {
          type: "Event Organization",
          purpose: "To organize religious ceremonies, cultural events, and community activities"
        },
        {
          type: "Legal Compliance",
          purpose: "To comply with Norwegian laws and regulations regarding religious organizations"
        },
        {
          type: "Community Building",
          purpose: "To connect members and foster a sense of community within our organization"
        }
      ]
    },
    dataProtection: {
      title: "Data Protection and Security",
      description: "We implement appropriate technical and organizational measures to protect your personal information:",
      items: [
        "Secure storage of personal data with limited access",
        "Regular security updates and monitoring",
        "Staff training on data protection best practices",
        "Compliance with GDPR and Norwegian data protection laws"
      ]
    },
    dataSharing: {
      title: "Data Sharing",
      description: "We do not sell, rent, or share your personal information with third parties for marketing purposes. Your information may only be shared in the following circumstances:",
      items: [
        {
          type: "Legal Requirements",
          purpose: "When required by Norwegian law, court order, or government authorities"
        },
        {
          type: "Organizational Purpose",
          purpose: "With other members for community building and event organization (with your consent)"
        },
        {
          type: "Service Providers",
          purpose: "With trusted third-party service providers who assist in membership administration"
        }
      ]
    },
    yourRights: {
      title: "Your Rights",
      description: "As a member, you have the following rights regarding your personal information:",
      items: [
        {
          title: "Access",
          description: "You can request a copy of all personal information we hold about you"
        },
        {
          title: "Correction",
          description: "You can request correction of inaccurate or incomplete information"
        },
        {
          title: "Deletion",
          description: "You can request deletion of your personal information when you cancel membership"
        },
        {
          title: "Portability",
          description: "You can request your data in a machine-readable format"
        },
        {
          title: "Objection",
          description: "You can object to certain uses of your personal information"
        }
      ]
    },
    dataRetention: {
      title: "Data Retention",
      description: "We retain your personal information only as long as necessary for the purposes outlined in this policy:",
      items: [
        "Active members: Information retained throughout membership period",
        "Cancelled membership: Information deleted within 48 hours of request",
        "Legal requirements: Some information may be retained longer if required by law"
      ]
    },
    childrensPrivacy: {
      title: "Children's Privacy",
      content: "For children under 15 years of age, membership applications must be submitted by parents or legal guardians. We only collect minimal necessary information about children and ensure their privacy is protected in accordance with applicable laws."
    },
    policyUpdates: {
      title: "Policy Updates",
      content: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any significant changes will be communicated to members via email and posted on our website at least 30 days before taking effect."
    },
    contact: {
      title: "Contact Information",
      description: "If you have any questions about this Privacy Policy or wish to exercise your rights regarding your personal information, please contact us:",
      email: "norwaynepalihindutemple@gmail.com",
      website: "www.nepalihindu.no",
      organizationNumber: "926 499 211"
    }
  };
}
