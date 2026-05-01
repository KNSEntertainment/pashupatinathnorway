import { NextRequest, NextResponse } from 'next/server';
import Membership from '@/models/Membership.Model';

export async function POST(request: NextRequest) {
  try {
    const { unverifiedPersonalNumbers } = await request.json();

    if (!unverifiedPersonalNumbers || !Array.isArray(unverifiedPersonalNumbers)) {
      return NextResponse.json(
        { error: 'unverifiedPersonalNumbers array is required' },
        { status: 400 }
      );
    }

    // Get unverified members details for export
    const unverifiedMembers = await Membership.find({
      personalNumber: { $in: unverifiedPersonalNumbers },
      membershipType: 'General'
    }).select('firstName lastName email phone address city postalCode personalNumber osloVerificationStatus createdAt').lean();

    if (unverifiedMembers.length === 0) {
      return NextResponse.json(
        { error: 'No unverified members found' },
        { status: 404 }
      );
    }

    // Create CSV content
    const headers = [
      'FirstName',
      'LastName', 
      'Email',
      'Phone',
      'Address',
      'City',
      'PostalCode',
      'PersonalNumber',
      'VerificationStatus',
      'RegistrationDate'
    ];

    const csvRows = [
      headers.join(','),
      ...unverifiedMembers.map(member => [
        `"${member.firstName}"`,
        `"${member.lastName}"`,
        `"${member.email}"`,
        `"${member.phone}"`,
        `"${member.address}"`,
        `"${member.city}"`,
        `"${member.postalCode}"`,
        `"${member.personalNumber}"`,
        `"${member.osloVerificationStatus}"`,
        `"${member.createdAt.toISOString().split('T')[0]}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    // Create buffer and return as CSV file
    const buffer = Buffer.from(csvContent, 'utf-8');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="unverified-members-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export unverified members error:', error);
    return NextResponse.json(
      { error: 'Internal server error while exporting unverified members' },
      { status: 500 }
    );
  }
}
