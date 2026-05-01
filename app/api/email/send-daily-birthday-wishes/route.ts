import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { sendBirthdayWishEmail } from "@/lib/email";

// Helper function to extract birth date from Norwegian personal number
const extractBirthDateFromPersonalNumber = (personalNumber: string): Date | null => {
    if (!personalNumber || personalNumber.length !== 11 || !/^\d{11}$/.test(personalNumber)) {
        return null;
    }

    const day = parseInt(personalNumber.substring(0, 2));
    const month = parseInt(personalNumber.substring(2, 4)) - 1; // JavaScript months are 0-indexed
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

    return new Date(fullYear, month, day);
};

// Function to check if today is someone's birthday
const isBirthdayToday = (birthDate: Date): boolean => {
    const today = new Date();
    return (
        birthDate.getDate() === today.getDate() &&
        birthDate.getMonth() === today.getMonth()
    );
};

export async function POST() {
    try {
        await connectDB();

        console.log("Starting daily birthday wish process...");
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        console.log(`Processing birthday wishes for: ${today}`);

        // Get all approved members with personal numbers
        const members = await Membership.find({ 
            membershipStatus: "approved",
            personalNumber: { $exists: true, $ne: "" }
        }).select('firstName middleName lastName email phone personalNumber membershipType');

        console.log(`Found ${members.length} approved members to check`);

        const birthdayMembers = [];
        const emailResults = [];

        for (const member of members) {
            const birthDate = extractBirthDateFromPersonalNumber(member.personalNumber);
            if (!birthDate) {
                console.log(`Skipping ${member.fullName} - invalid personal number`);
                continue;
            }

            if (isBirthdayToday(birthDate)) {
                const age = new Date().getFullYear() - birthDate.getFullYear();
                birthdayMembers.push({
                    ...member.toObject(),
                    birthDate: birthDate.toISOString(),
                    age: age,
                    fullName: `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`
                });
            }
        }

        console.log(`Found ${birthdayMembers.length} members with birthdays today`);

        if (birthdayMembers.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No birthdays today",
                date: today,
                processed: 0,
                results: []
            });
        }

        // Send birthday wishes to all members with birthdays today
        for (const member of birthdayMembers) {
            try {
                await sendBirthdayWishEmail({
                    name: member.fullName,
                    email: member.email,
                    age: member.age
                });

                emailResults.push({
                    memberId: member._id,
                    name: member.fullName,
                    email: member.email,
                    status: "success",
                    message: "Birthday wish sent successfully"
                });

                console.log(`✅ Birthday wish sent to ${member.fullName} (${member.email})`);

                // Add a small delay between emails to avoid overwhelming the email server
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (emailError) {
                console.error(`❌ Failed to send birthday wish to ${member.fullName}:`, emailError);
                
                emailResults.push({
                    memberId: member._id,
                    name: member.fullName,
                    email: member.email,
                    status: "error",
                    message: emailError instanceof Error ? emailError.message : "Unknown error"
                });
            }
        }

        const successfulEmails = emailResults.filter(r => r.status === "success").length;
        const failedEmails = emailResults.filter(r => r.status === "error").length;

        console.log(`Daily birthday wish process completed: ${successfulEmails} successful, ${failedEmails} failed`);

        return NextResponse.json({
            success: true,
            message: `Processed ${birthdayMembers.length} birthdays today`,
            date: today,
            processed: birthdayMembers.length,
            successful: successfulEmails,
            failed: failedEmails,
            results: emailResults
        });

    } catch (error) {
        console.error("Error in daily birthday wish process:", error);
        return NextResponse.json(
            { 
                error: "Failed to process daily birthday wishes",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// GET method for testing/logging
export async function GET() {
    try {
        await connectDB();

        const today = new Date();
        const members = await Membership.find({ 
            membershipStatus: "approved",
            personalNumber: { $exists: true, $ne: "" }
        }).select('firstName middleName lastName email personalNumber');

        const birthdayMembers = [];

        for (const member of members) {
            const birthDate = extractBirthDateFromPersonalNumber(member.personalNumber);
            if (!birthDate) continue;

            if (isBirthdayToday(birthDate)) {
                const age = new Date().getFullYear() - birthDate.getFullYear();
                birthdayMembers.push({
                    _id: member._id,
                    fullName: `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`,
                    email: member.email,
                    age: age,
                    birthDate: birthDate.toISOString()
                });
            }
        }

        return NextResponse.json({
            success: true,
            date: today.toISOString().split('T')[0],
            birthdayCount: birthdayMembers.length,
            birthdayMembers: birthdayMembers
        });

    } catch (error) {
        console.error("Error checking today's birthdays:", error);
        return NextResponse.json(
            { error: "Failed to check today's birthdays" },
            { status: 500 }
        );
    }
}
