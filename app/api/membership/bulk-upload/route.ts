import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Membership from '@/models/Membership.Model';
import AuditLog from '@/models/AuditLog.Model';
import connectDB from '@/lib/mongodb';
import generateMembershipId from '@/lib/membershipIdGenerator';
import { sendWelcomeEmail } from '@/lib/email';
import crypto from 'crypto';

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
  position?: string;
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
      action: 'bulk_upload_memberships',
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

    // Read CSV content
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
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

    // Parse headers and data
    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);

    console.log('CSV Headers:', headers);
    console.log('Total data rows:', dataRows.length);

    // Helper function to parse CSV row with quoted fields
    const parseCSVRow = (row: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
      processedMembers: [] as ProcessedMember[]
    };

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row.trim()) continue;

      const values = parseCSVRow(row);

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
            case 'timestamp':
              // Parse timestamp and use it for createdAt
              try {
                const parsedDate = new Date(value);
                
                // Check if the date is valid
                if (isNaN(parsedDate.getTime())) {
                  // Try parsing as date-only format (DD.MM.YYYY or DD/MM/YYYY or YYYY-MM-DD)
                  const dateOnlyMatch = value.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/) || 
                                        value.match(/^(\d{4})[./-](\d{2})[./-](\d{2})$/);
                  
                  if (dateOnlyMatch) {
                    // Reconstruct as YYYY-MM-DD and set time to 00:00:00
                    let year, month, day;
                    if (dateOnlyMatch[0].startsWith(dateOnlyMatch[1])) {
                      // YYYY-MM-DD format
                      year = dateOnlyMatch[1];
                      month = dateOnlyMatch[2];
                      day = dateOnlyMatch[3];
                    } else {
                      // DD.MM.YYYY or DD/MM/YYYY format
                      day = dateOnlyMatch[1];
                      month = dateOnlyMatch[2];
                      year = dateOnlyMatch[3];
                    }
                    
                    const dateStr = `${year}-${month}-${day}T00:00:00.000Z`;
                    const dateWithTime = new Date(dateStr);
                    
                    if (!isNaN(dateWithTime.getTime())) {
                      memberData.createdAt = dateWithTime;
                    } else {
                      console.warn(`Invalid timestamp format in row ${i + 2}: ${value}`);
                    }
                  } else {
                    console.warn(`Invalid timestamp format in row ${i + 2}: ${value}`);
                  }
                } else {
                  memberData.createdAt = parsedDate;
                }
              } catch (error) {
                // If timestamp is invalid, it will be set to current date later
                console.warn(`Invalid timestamp format in row ${i + 2}: ${value}`, error);
              }
              break;
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
            case 'position':
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
              if (['General', 'Active', 'Executive'].includes(value)) {
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

        // Validate personal number format (only validation)
        // Strip all non-digit characters before validation
        const cleanPersonalNumber = memberData.personalNumber?.replace(/\D/g, '');
        if (!cleanPersonalNumber || cleanPersonalNumber.length !== 11) {
          results.failed++;
          const originalValue = memberData.personalNumber || '(empty)';
          console.log(`Row ${i + 2} error - Headers:`, headers);
          console.log(`Row ${i + 2} error - Values:`, values);
          console.log(`Row ${i + 2} error - MemberData:`, memberData);
          results.errors.push(`Row ${i + 2}: Personal number must be exactly 11 digits (found: ${cleanPersonalNumber?.length || 0} digits, original value: "${originalValue}")`);
          continue;
        }
        memberData.personalNumber = cleanPersonalNumber;

        // Check for existing member with same personal number
        const existingMember = await Membership.findOne({
          personalNumber: memberData.personalNumber
        });

        if (existingMember) {
          // Update existing member's firstName, middleName, lastName, and city
          const updateData: Partial<MemberData> = {};
          
          if (memberData.firstName) updateData.firstName = memberData.firstName;
          if (memberData.middleName) updateData.middleName = memberData.middleName;
          if (memberData.lastName) updateData.lastName = memberData.lastName;
          if (memberData.city) updateData.city = memberData.city;

          await Membership.findByIdAndUpdate(existingMember._id, updateData);
          
          results.success++;
          results.processedMembers.push({
            firstName: memberData.firstName || existingMember.firstName || '',
            lastName: memberData.lastName || existingMember.lastName || '',
            email: memberData.email || existingMember.email || ''
          });
          continue;
        }

        // Set default values
        memberData.membershipType = memberData.membershipType || 'General';
        
        // For Active Members, set status to approved and generate password setup token
        const isActiveMember = memberData.membershipType === 'Active';
        if (isActiveMember) {
          memberData.membershipStatus = 'approved';
          
          // Generate password setup token (valid for 24 hours)
          const setupToken = crypto.randomBytes(32).toString('hex');
          const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
          
          memberData.passwordSetupToken = setupToken;
          memberData.passwordSetupTokenExpiry = tokenExpiry;
        } else {
          memberData.membershipStatus = memberData.membershipStatus || 'pending';
        }
        
        // Only set createdAt to current date if not already provided from CSV or if invalid
        if (!memberData.createdAt || isNaN((memberData.createdAt as Date).getTime())) {
          memberData.createdAt = new Date();
        }

        // Generate membership ID
        memberData.membershipId = await generateMembershipId();

        // Insert member (all types including Executive/Advisor with positions)
        await Membership.create(memberData);
        
        // Send welcome email with password setup link to Active Members
        if (isActiveMember && memberData.email) {
          try {
            // Extract family member names if they exist
            const familyMemberNames = memberData.familyMembers && memberData.familyMembers.length > 0
              ? memberData.familyMembers.map((member: FamilyMemberData) => `${member.firstName} ${member.lastName}`)
              : [];

            await sendWelcomeEmail({ 
              name: `${memberData.firstName} ${memberData.lastName}`, 
              email: memberData.email, 
              setupToken: memberData.passwordSetupToken as string,
              familyMembers: familyMemberNames
            });
            
            console.log(`Welcome email sent to Active Member: ${memberData.email}`);
          } catch (emailError) {
            console.error(`Failed to send welcome email to Active Member ${memberData.email}:`, emailError);
            // Don't fail the bulk upload process, just log the error
          }
        }
        
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

    // Update audit log with final results
    let uploadStatus: string;
    let errorMessage: string | undefined;

    if (results.success === 0 && results.failed > 0) {
      // All rows failed
      uploadStatus = 'failed';
      errorMessage = `${results.failed} members failed to process`;
    } else if (results.failed > 0) {
      // Some rows succeeded, some failed
      uploadStatus = 'partial_success';
      errorMessage = `${results.failed} members failed to process`;
    } else {
      // All rows succeeded
      uploadStatus = 'completed';
      errorMessage = undefined;
    }

    await AuditLog.findByIdAndUpdate(auditLog._id, {
      status: uploadStatus,
      errorMessage,
      'details.totalRows': dataRows.length,
      'details.validRows': results.success,
      'details.insertedRows': results.success,
      'details.skippedRows': results.failed,
      'details.validationErrors': results.errors.map((error, index) => ({
        row: index + 2, // +2 because of header and 1-based indexing
        errorMessages: [error]
      }))
    });

    return NextResponse.json({
      message: `Bulk upload completed. Success: ${results.success}, Failed: ${results.failed}`,
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    
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
      { error: 'Internal server error during bulk upload' },
      { status: 500 }
    );
  }
}
