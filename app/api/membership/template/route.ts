import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Define CSV headers based on the Membership and BoardMember models
    const headers = [
      'firstName',
      'middleName', 
      'lastName',
      'email',
      'phone',
      'address',
      'city',
      'postalCode',
      'kommune',
      'fylke',
      'personalNumber',
      'profilePhoto',
      'membershipType',
      'membershipStatus',
      'position'
    ];

    // Create CSV content with headers and example data
    const csvContent = [
      headers.join(','),
      // Example regular member
      'John,Doe,Smith,john.smith@example.com,+4712345678,Main Street 123,Oslo,0150,Oslo,Oslo,12345678901,,Active,pending,',
      // Example board member with position
      'Jane,Marie,Johnson,jane.johnson@example.com,+4798765432,Executive Street 456,Bergen,5003,Hordaland,Vestland,98765432109,,Executive,approved,Chairperson',
      // Empty template row
      ',,,,,,,,,,,,,,,'
    ].join('\n');

    // Create response with CSV file
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="membership-template.csv"',
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
