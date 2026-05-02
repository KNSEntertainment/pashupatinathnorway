import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function POST(request: Request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 1) {
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
      const requiredHeaders = ['donorName', 'donorEmail', 'amount', 'paymentStatus'];
      const missingHeaders = requiredHeaders.filter(header => 
        !headers.some(h => h.toLowerCase() === header.toLowerCase())
      );
      
      if (missingHeaders.length > 0) {
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
          personalNumber: values[headers.indexOf('personalNumber')] || '',
        };

        // Validation
        const rowErrors = [];

        // Validate donor name
        if (!donation.donorName || donation.donorName.trim().length === 0) {
          rowErrors.push('Donor name is required');
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!donation.donorEmail || !emailRegex.test(donation.donorEmail)) {
          rowErrors.push('Valid email is required');
        }

        // Validate personal number (11 digits)
        if (donation.personalNumber) {
          const personalNumberRegex = /^\d{11}$/;
          if (!personalNumberRegex.test(donation.personalNumber)) {
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
            errors: rowErrors
          });
        } else {
          donations.push(donation);
        }

      } catch (error) {
        errors.push({
          row: i + 2,
          errors: [`Error parsing row: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Validation errors found",
        validationErrors: errors,
        totalRows: dataRows.length,
        validRows: donations.length,
        errorRows: errors.length
      }, { status: 400 });
    }

    // Insert valid donations into database
    const insertedDonations = await Donation.insertMany(donations);

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${donations.length} donations`,
      totalRows: dataRows.length,
      validRows: donations.length,
      insertedRows: insertedDonations.length,
      skippedRows: errors.length
    });

  } catch (error) {
    console.error("Bulk upload donations error:", error);
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
