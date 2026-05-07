import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import AuditLog from "@/models/AuditLog.Model";
import { encryptPersonalNumber } from "@/lib/encryption";

export async function POST(request: Request) {
  let auditLog = null;
  
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Create initial audit log entry
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'Unknown';

    auditLog = new AuditLog({
      action: 'bulk_upload_donations',
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
    
    if (lines.length < 1) {
      // Update audit log for empty file error
      await AuditLog.findByIdAndUpdate(auditLog._id, {
        status: 'failed',
        errorMessage: 'CSV file is empty or invalid'
      });

      return NextResponse.json(
        { success: false, error: "CSV file is empty or invalid" },
        { status: 400 }
      );
    }

    // Check if first line contains headers or data
    const firstLine = lines[0];
    const firstLineParts = firstLine.split(',').map(p => p.trim().replace(/"/g, ''));
    
    // Define expected column order
    const expectedHeaders = ['donorName', 'donorEmail', 'donorPhone', 'amount', 'currency', 'message', 'address', 'isAnonymous', 'paymentStatus', 'personalNumber'];
    
    let headers: string[];
    let dataRows: string[];
    
    // Check if first line looks like headers (contains expected header names)
    const hasHeaders = expectedHeaders.some(header => 
      firstLineParts.some(part => part.toLowerCase() === header.toLowerCase())
    );
    
    if (hasHeaders) {
      // First line is headers
      headers = firstLineParts;
      dataRows = lines.slice(1);
      
      // Validate required headers
      const requiredHeaders = ['donorName', 'amount', 'paymentStatus'];
      const missingHeaders = requiredHeaders.filter(header => 
        !headers.some(h => h.toLowerCase() === header.toLowerCase())
      );
      
      if (missingHeaders.length > 0) {
        // Update audit log for missing headers error
        await AuditLog.findByIdAndUpdate(auditLog._id, {
          status: 'failed',
          errorMessage: `Missing required columns: ${missingHeaders.join(', ')}`
        });

        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required columns: ${missingHeaders.join(', ')}` 
          },
          { status: 400 }
        );
      }
    } else {
      // First line is data, use expected headers
      headers = expectedHeaders;
      dataRows = lines;
    }

    const donations = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row.trim()) continue;

      try {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        
        // Create donation object
        const rawPersonalNumber = values[headers.indexOf('personalNumber')] || '';
        const donation = {
          donorName: values[headers.indexOf('donorName')] || '',
          donorEmail: values[headers.indexOf('donorEmail')] || '',
          donorPhone: values[headers.indexOf('donorPhone')] || undefined,
          amount: parseFloat(values[headers.indexOf('amount')] || '0'),
          currency: values[headers.indexOf('currency')] || 'NOK',
          message: values[headers.indexOf('message')] || '',
          address: values[headers.indexOf('address')] || '',
          isAnonymous: values[headers.indexOf('isAnonymous')] === 'true',
          paymentStatus: values[headers.indexOf('paymentStatus')] || 'pending',
          personalNumber: rawPersonalNumber ? encryptPersonalNumber(rawPersonalNumber) : '',
        };

        // Validation
        const rowErrors = [];

        // Validate donor name
        if (!donation.donorName || donation.donorName.trim().length === 0) {
          rowErrors.push('Donor name is required');
        }

        // Validate email (optional)
        if (donation.donorEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(donation.donorEmail)) {
            rowErrors.push('Email must be valid if provided');
          }
        }

        // Validate personal number (11 digits) - validate before encryption
        if (rawPersonalNumber) {
          const personalNumberRegex = /^\d{11}$/;
          if (!personalNumberRegex.test(rawPersonalNumber)) {
            rowErrors.push('Personal number must be exactly 11 digits');
          }
        }

        // Validate donation amount
        if (isNaN(donation.amount) || donation.amount <= 0) {
          rowErrors.push('Donation amount must be a positive number');
        }

        // Validate payment status
        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(donation.paymentStatus)) {
          rowErrors.push('Payment status must be one of: pending, completed, failed, refunded');
        }

        if (rowErrors.length > 0) {
          errors.push({
            row: i + 2, // +2 because of header and 1-based indexing
            errorMessages: rowErrors
          });
        } else {
          donations.push(donation);
        }

      } catch (error) {
        errors.push({
          row: i + 2,
          errorMessages: [`Error parsing row: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }

    // Handle validation errors - allow partial success if there are valid rows
    if (errors.length > 0 && donations.length === 0) {
      // All rows failed validation
      await AuditLog.findByIdAndUpdate(auditLog._id, {
        status: 'failed',
        errorMessage: `All rows failed validation: ${errors.length} errors`,
        'details.totalRows': dataRows.length,
        'details.validRows': 0,
        'details.insertedRows': 0,
        'details.skippedRows': errors.length,
        'details.validationErrors': errors
      });

      return NextResponse.json({
        success: false,
        error: "All rows failed validation",
        validationErrors: errors,
        totalRows: dataRows.length,
        validRows: 0,
        errorRows: errors.length
      }, { status: 400 });
    }

    // Insert valid donations into database
    const insertedDonations = await Donation.insertMany(donations);

    // Determine status based on results
    let uploadStatus: string;
    let message: string;
    let errorMessage: string | undefined;

    if (insertedDonations.length === 0 && errors.length > 0) {
      // All rows failed
      uploadStatus = 'failed';
      message = `All ${errors.length} rows failed to upload`;
      errorMessage = `All ${errors.length} rows had validation errors`;
    } else if (errors.length > 0) {
      // Some rows succeeded, some failed
      uploadStatus = 'partial_success';
      message = `Partially uploaded: ${insertedDonations.length} successful, ${errors.length} failed`;
      errorMessage = `${errors.length} rows had validation errors`;
    } else {
      // All rows succeeded
      uploadStatus = 'completed';
      message = `Successfully uploaded ${insertedDonations.length} donations`;
      errorMessage = undefined;
    }

    // Update audit log with results
    await AuditLog.findByIdAndUpdate(auditLog._id, {
      status: uploadStatus,
      errorMessage,
      'details.totalRows': dataRows.length,
      'details.validRows': donations.length,
      'details.insertedRows': insertedDonations.length,
      'details.skippedRows': errors.length,
      ...(errors.length > 0 && { 'details.validationErrors': errors })
    });

    return NextResponse.json({
      success: true,
      message,
      totalRows: dataRows.length,
      validRows: donations.length,
      insertedRows: insertedDonations.length,
      skippedRows: errors.length,
      validationErrors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Bulk upload donations error:", error);
    
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
      { 
        success: false, 
        error: "Failed to process bulk upload",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
