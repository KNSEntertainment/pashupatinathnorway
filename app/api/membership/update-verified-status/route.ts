import { NextRequest, NextResponse } from 'next/server';
import Membership from '@/models/Membership.Model';
import { sendOsloVerificationApprovalEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { verifiedPersonalNumbers } = await request.json();

    if (!verifiedPersonalNumbers || !Array.isArray(verifiedPersonalNumbers)) {
      return NextResponse.json(
        { error: 'verifiedPersonalNumbers array is required' },
        { status: 400 }
      );
    }

    // Get verified members details for email sending
    const verifiedMembers = await Membership.find({
      personalNumber: { $in: verifiedPersonalNumbers },
      membershipType: 'General'
    }).select('firstName lastName email personalNumber');

    // Generate setup tokens and update verified members
    const emailPromises = [];
    const updatedMembers = [];

    for (const member of verifiedMembers) {
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

      // Update member with approval status and setup token
      await Membership.updateOne(
        { _id: member._id },
        {
          $set: {
            membershipStatus: 'approved',
            osloVerificationStatus: 'verified',
            passwordSetupToken: setupToken,
            passwordSetupTokenExpiry: setupTokenExpiry
          }
        }
      );

      // Add email sending promise
      emailPromises.push(
        sendOsloVerificationApprovalEmail({
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          setupToken
        }).catch(error => {
          console.error(`Failed to send email to ${member.email}:`, error);
          return { email: member.email, status: 'failed', error: error.message };
        })
      );

      updatedMembers.push({
        email: member.email,
        name: `${member.firstName} ${member.lastName}`
      });
    }

    // Update unverified General members: set osloVerificationStatus to "follow_up_needed"
    const unverifiedUpdateResult = await Membership.updateMany(
      {
        personalNumber: { $nin: verifiedPersonalNumbers },
        membershipType: 'General',
        osloVerificationStatus: { $ne: 'verified' } // Don't update already verified ones
      },
      {
        $set: {
          osloVerificationStatus: 'follow_up_needed'
        }
      }
    );

    // Send all emails
    const emailResults = await Promise.allSettled(emailPromises);
    const successfulEmails = emailResults.filter(result => result.status === 'fulfilled').length;
    const failedEmails = emailResults.filter(result => result.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      results: {
        verifiedUpdated: verifiedMembers.length,
        unverifiedUpdated: unverifiedUpdateResult.modifiedCount,
        emailsSent: successfulEmails,
        emailsFailed: failedEmails,
        message: `Updated ${verifiedMembers.length} members to approved status and sent ${successfulEmails} approval emails. ${failedEmails} emails failed. ${unverifiedUpdateResult.modifiedCount} members marked for follow-up.`
      }
    });

  } catch (error) {
    console.error('Update verified status error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating verification status' },
      { status: 500 }
    );
  }
}
