import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from '@/models/Membership.Model';
import AuditLog from '@/models/AuditLog.Model';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  let auditLog = null;
  
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Create initial audit log entry
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'Unknown';

    auditLog = new AuditLog({
      action: 'crosscheck_personal_numbers',
      user: {
        id: session.user.id,
        name: session.user.fullName,
        email: session.user.email,
        role: session.user.role
      },
      details: {
        fileName: file.name,
        fileSize: file.size
      },
      ipAddress,
      userAgent,
      status: 'initiated'
    });

    await auditLog.save();

    // Read and parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      // Update audit log for empty file error
      await AuditLog.findByIdAndUpdate(auditLog._id, {
        status: 'failed',
        errorMessage: 'CSV file must contain headers and at least one data row'
      });

      return NextResponse.json(
        { error: 'CSV file must contain headers and at least one data row' },
        { status: 400 }
      );
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const dataRows = lines.slice(1);

    // Find the personal number column (could be named various ways)
    const personalNumberColumn = headers.find(header => 
      header.toLowerCase().includes('personal') || 
      header.toLowerCase().includes('number') ||
      header.toLowerCase().includes('personnummer') ||
      header.toLowerCase().includes('fødselsnummer')
    );

    if (!personalNumberColumn) {
      // Update audit log for missing column error
      await AuditLog.findByIdAndUpdate(auditLog._id, {
        status: 'failed',
        errorMessage: 'CSV file must contain a personal number column'
      });

      return NextResponse.json(
        { error: 'CSV file must contain a personal number column (headers like: personalNumber, personal number, personnummer, fødselsnummer)' },
        { status: 400 }
      );
    }

    const personalNumberIndex = headers.indexOf(personalNumberColumn);

    // Extract verified personal numbers from Oslo kommune file
    const verifiedPersonalNumbers = new Set<string>();
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row.trim()) continue;

      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const personalNumber = values[personalNumberIndex];

      if (personalNumber && /^\d{11}$/.test(personalNumber)) {
        verifiedPersonalNumbers.add(personalNumber);
      }
    }

    if (verifiedPersonalNumbers.size === 0) {
      // Update audit log for no valid personal numbers error
      await AuditLog.findByIdAndUpdate(auditLog._id, {
        status: 'failed',
        errorMessage: 'No valid personal numbers (11 digits) found in the verification file'
      });

      return NextResponse.json(
        { error: 'No valid personal numbers (11 digits) found in the verification file' },
        { status: 400 }
      );
    }

    // Get all General members from database
    const allGeneralMembers = await Membership.find({ 
      membershipType: 'General' 
    }).select('firstName lastName personalNumber email');

    if (allGeneralMembers.length === 0) {
      // Update audit log for no members error
      await AuditLog.findByIdAndUpdate(auditLog._id, {
        status: 'failed',
        errorMessage: 'No General members found in the database'
      });

      return NextResponse.json(
        { error: 'No General members found in the database' },
        { status: 404 }
      );
    }

    // Crosscheck members
    const verifiedList: Array<{
      firstName: string;
      lastName: string;
      personalNumber: string;
      email: string;
    }> = [];

    const unverifiedList: Array<{
      firstName: string;
      lastName: string;
      personalNumber: string;
      email: string;
    }> = [];

    for (const member of allGeneralMembers) {
      const memberData = {
        firstName: member.firstName,
        lastName: member.lastName,
        personalNumber: member.personalNumber,
        email: member.email
      };

      if (verifiedPersonalNumbers.has(member.personalNumber)) {
        verifiedList.push(memberData);
      } else {
        unverifiedList.push(memberData);
      }
    }

    const results = {
      totalMembers: allGeneralMembers.length,
      verifiedMembers: verifiedList.length,
      unverifiedMembers: unverifiedList.length,
      verifiedList,
      unverifiedList
    };

    // Update audit log with successful results
    await AuditLog.findByIdAndUpdate(auditLog._id, {
      status: 'completed',
      'details.totalRows': allGeneralMembers.length,
      'details.validRows': verifiedList.length,
      'details.insertedRows': verifiedList.length,
      'details.skippedRows': unverifiedList.length,
      'details.verifiedCount': verifiedList.length,
      'details.unverifiedCount': unverifiedList.length,
      'details.verificationFileRows': dataRows.length
    });

    return NextResponse.json({
      success: true,
      results,
      message: `Crosscheck completed. Found ${verifiedList.length} verified and ${unverifiedList.length} unverified members out of ${allGeneralMembers.length} total General members.`
    });

  } catch (error) {
    console.error('Verification crosscheck error:', error);
    
    // Update audit log with error details if audit log exists
    try {
      if (auditLog && auditLog._id) {
        await AuditLog.findByIdAndUpdate(auditLog._id, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } catch (auditError) {
      console.error("Failed to update audit log:", auditError);
    }
    
    return NextResponse.json(
      { error: 'Internal server error during verification crosscheck' },
      { status: 500 }
    );
  }
}
