import { NextRequest, NextResponse } from 'next/server';
import Membership from '@/models/Membership.Model';
import connectDB from '@/lib/mongodb';

interface FamilyMemberData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  personalNumber?: string;
  email?: string;
  phone?: string;
}

interface MemberData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  kommune?: string;
  fylke?: string;
  personalNumber?: string;
  profilePhoto?: string;
  membershipStatus?: string;
  membershipType?: string;
  agreeTerms?: boolean;
  familyMembers?: FamilyMemberData[];
  createdAt?: Date;
  [key: string]: string | boolean | number | Date | FamilyMemberData[] | undefined;
}

interface ProcessedMember {
  firstName: string;
  lastName: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Read CSV content
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain headers and at least one data row' },
        { status: 400 }
      );
    }

    // Parse headers and data
    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      processedMembers: [] as ProcessedMember[]
    };

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row.trim()) continue;

      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

      // Skip completely empty rows
      if (values.every(value => !value || value.trim() === '')) {
        continue;
      }

      try {
        const memberData: MemberData = {};

        // Map CSV columns to member fields
        headers.forEach((header, index) => {
          const value = values[index];
          if (!value) return;

          switch (header) {
            case 'firstName':
            case 'lastName':
            case 'email':
            case 'phone':
            case 'address':
            case 'city':
            case 'postalCode':
            case 'kommune':
            case 'fylke':
            case 'personalNumber':
            case 'profilePhoto':
              memberData[header] = value;
              break;
            case 'middleName':
              memberData.middleName = value || undefined;
              break;
            case 'membershipStatus':
              if (['blocked', 'pending', 'approved'].includes(value)) {
                memberData.membershipStatus = value;
              }
              break;
            case 'membershipType':
              if (['General', 'Active'].includes(value)) {
                memberData.membershipType = value;
              }
              break;
            case 'agreeTerms':
              memberData.agreeTerms = value.toLowerCase() === 'true';
              break;
            case 'familyMembers':
              try {
                memberData.familyMembers = JSON.parse(value);
              } catch {
                // Skip if invalid JSON
                console.warn(`Invalid family members JSON in row ${i + 2}`);
              }
              break;
          }
        });

        // Helper function to get member name for error messages
        const getMemberName = () => {
          const firstName = memberData.firstName || '';
          const lastName = memberData.lastName || '';
          return (firstName && lastName) ? `${firstName} ${lastName}` : 
                 firstName || lastName || `Row ${i + 2}`;
        };

        // Validate required fields (removed agreeTerms, membershipStatus, membershipType since they have defaults)
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'personalNumber'];
        const missingFields = requiredFields.filter(field => {
          const value = memberData[field];
          return value === undefined || value === null || value === '';
        });
        
        if (missingFields.length > 0) {
          results.failed++;
          results.errors.push(`${getMemberName()}: Missing required fields: ${missingFields.join(', ')}`);
          continue;
        }

        // Validate personal number format
        if (!memberData.personalNumber || !/^\d{11}$/.test(memberData.personalNumber)) {
          results.failed++;
          results.errors.push(`${getMemberName()}: Personal number must be exactly 11 digits`);
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!memberData.email || !emailRegex.test(memberData.email)) {
          results.failed++;
          results.errors.push(`${getMemberName()}: Email address is not valid`);
          continue;
        }

        // Flexible phone number validation - accept up to 11 characters including +
        let cleanPhone = memberData.phone || '';
        
        // Remove any whitespace
        cleanPhone = cleanPhone.replace(/\s/g, '');
        
        // Validate phone number format (8 digits without country code, or up to 11 with +)
        if (cleanPhone.startsWith('+47')) {
          // Norwegian format with country code
          const digitsOnly = cleanPhone.substring(3).replace(/\D/g, '');
          if (digitsOnly.length !== 8) {
            results.failed++;
            results.errors.push(`${getMemberName()}: Norwegian phone number must have 8 digits after +47`);
            continue;
          }
          memberData.phone = digitsOnly; // Store only the 8 digits
        } else if (/^\d{8}$/.test(cleanPhone)) {
          // 8 digits without country code - accept as is
          memberData.phone = cleanPhone;
        } else if (/^\d{9,11}$/.test(cleanPhone)) {
          // 9-11 digits (could be other formats) - accept as is
          memberData.phone = cleanPhone;
        } else {
          results.failed++;
          results.errors.push(`${getMemberName()}: Phone number must be 8 digits (Norwegian) or up to 11 digits including country code`);
          continue;
        }

        // Check for existing member with same personal number or email
        const existingMember = await Membership.findOne({
          $or: [
            { personalNumber: memberData.personalNumber },
            { email: memberData.email }
          ]
        });

        if (existingMember) {
          results.failed++;
          results.errors.push(`${getMemberName()}: Member with this personal number or email already exists`);
          continue;
        }

        // Set default values
        memberData.membershipType = memberData.membershipType || 'General';
        memberData.membershipStatus = memberData.membershipStatus || 'pending';
        memberData.createdAt = new Date();

        // Insert member
        await Membership.create(memberData);
        
        results.success++;
        results.processedMembers.push({
          firstName: memberData.firstName || '',
          lastName: memberData.lastName || '',
          email: memberData.email || ''
        });

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: `Bulk upload completed. Success: ${results.success}, Failed: ${results.failed}`,
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk upload' },
      { status: 500 }
    );
  }
}
