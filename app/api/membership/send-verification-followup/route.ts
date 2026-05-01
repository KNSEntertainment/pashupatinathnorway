import { NextRequest, NextResponse } from 'next/server';
import Membership from '@/models/Membership.Model';
import { sendVerificationFollowupEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { unverifiedPersonalNumbers } = await request.json();

    if (!unverifiedPersonalNumbers || !Array.isArray(unverifiedPersonalNumbers)) {
      return NextResponse.json(
        { error: 'unverifiedPersonalNumbers array is required' },
        { status: 400 }
      );
    }

    // Get unverified members details
    const unverifiedMembers = await Membership.find({
      personalNumber: { $in: unverifiedPersonalNumbers },
      membershipType: 'General'
    }).select('firstName lastName email personalNumber');

    if (unverifiedMembers.length === 0) {
      return NextResponse.json(
        { error: 'No unverified members found' },
        { status: 404 }
      );
    }

    // Send follow-up emails to all unverified members
    const emailResults = [];
    for (const member of unverifiedMembers) {
      try {
        await sendVerificationFollowupEmail({
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          personalNumber: member.personalNumber
        });
        emailResults.push({
          email: member.email,
          status: 'sent',
          name: `${member.firstName} ${member.lastName}`
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${member.email}:`, emailError);
        emailResults.push({
          email: member.email,
          status: 'failed',
          name: `${member.firstName} ${member.lastName}`,
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
      }
    }

    // Update osloVerificationStatus to "follow_up_needed" for all
    await Membership.updateMany(
      {
        personalNumber: { $in: unverifiedPersonalNumbers },
        membershipType: 'General'
      },
      {
        $set: {
          osloVerificationStatus: 'follow_up_needed'
        }
      }
    );

    const successfulEmails = emailResults.filter(r => r.status === 'sent').length;
    const failedEmails = emailResults.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      results: {
        totalMembers: unverifiedMembers.length,
        emailsSent: successfulEmails,
        emailsFailed: failedEmails,
        emailResults,
        message: `Sent ${successfulEmails} follow-up emails successfully. ${failedEmails} emails failed.`
      }
    });

  } catch (error) {
    console.error('Send verification followup error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending follow-up emails' },
      { status: 500 }
    );
  }
}
