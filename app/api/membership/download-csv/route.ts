import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from '@/models/Membership.Model';
import AuditLog from '@/models/AuditLog.Model';
import connectDB from '@/lib/mongodb';
import * as XLSX from 'xlsx';

const calculateAgeFromPersonalNumber = (personalNumber: string): number | null => {
  if (!personalNumber || personalNumber.length !== 11 || !/^\d{11}$/.test(personalNumber)) {
    return null;
  }

  const day = parseInt(personalNumber.substring(0, 2));
  const month = parseInt(personalNumber.substring(2, 4)) - 1;
  const yearShort = parseInt(personalNumber.substring(4, 6));
  const individualNumber = parseInt(personalNumber.substring(6, 9));
  const currentYear = new Date().getFullYear();

  let fullYear: number;

  // Individual number 750–999 with year 00–39 → born 2000–2039
  if (individualNumber >= 750 && individualNumber <= 999 && yearShort <= 39) {
    fullYear = 2000 + yearShort;
  } else {
    // Everyone else in 0-99 age range → born 1900–1999
    fullYear = 1900 + yearShort;
  }

  // Safety check: if resolved year is somehow in the future, step back
  if (fullYear > currentYear) {
    fullYear -= 100;
  }

  // Calculate exact age
  const birthDate = new Date(fullYear, month, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Reject if outside supported range
  if (age < 0 || age > 99) {
    return null;
  }

  return age;
};

export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || '';
    const typeFilter = searchParams.get('type') || '';

    // Create initial audit log entry
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'Unknown';

    auditLog = new AuditLog({
      action: 'download_members_csv',
      user: {
        id: session.user.id,
        name: session.user.fullName,
        email: session.user.email,
        role: session.user.role
      },
      details: {
        filters: {
          search,
          statusFilter,
          typeFilter
        }
      },
      ipAddress,
      userAgent,
      status: 'initiated'
    });

    await auditLog.save();

    // Fetch memberships with filters
    const query: {
      membershipStatus?: string;
      membershipType?: string;
      $or?: Array<{
        firstName?: { $regex: string; $options: string };
        lastName?: { $regex: string; $options: string };
        email?: { $regex: string; $options: string };
        phone?: { $regex: string; $options: string };
      }>;
    } = {};
    
    if (statusFilter) {
      query.membershipStatus = statusFilter;
    }
    
    if (typeFilter) {
      query.membershipType = typeFilter;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const memberships = await Membership.find(query).sort({ createdAt: -1 });

    // Prepare data for CSV
    const csvData = memberships.map(member => {
      const age = calculateAgeFromPersonalNumber(member.personalNumber || '');
      return {
        'First Name': member.firstName,
        'Middle Name': member.middleName || '',
        'Last Name': member.lastName,
        'Email': member.email,
        'Phone': member.phone,
        'Address': member.address,
        'City': member.city,
        'Postal Code': member.postalCode,
        'Fylke': member.fylke || '',
        'Kommune': member.kommune || '',
        'Personal Number': member.personalNumber,
        'Gender': member.gender || '',
        'Membership Type': member.membershipType,
        'Membership Status': member.membershipStatus,
        'Age': age !== null ? `${age} years` : 'Unknown',
        'Registration Date': member.createdAt ? new Date(member.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) : '',
      };
    });

    // Convert to CSV string
    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `members_${timestamp}.csv`;

    // Create blob
    const buffer = Buffer.from(csv, 'utf-8');

    // Update audit log with successful results
    await AuditLog.findByIdAndUpdate(auditLog._id, {
      status: 'completed',
      'details.totalRows': memberships.length,
      'details.fileName': filename,
      'details.fileSize': buffer.length
    });

    // Return the CSV file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Download CSV error:', error);
    
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
      { error: 'Internal server error during CSV download' },
      { status: 500 }
    );
  }
}
