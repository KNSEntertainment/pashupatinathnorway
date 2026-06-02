import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

// Helper function to extract birth date from Norwegian personal number
// Simplified: only use first 4 digits (day and month), ignore year
const extractBirthDateFromPersonalNumber = (personalNumber: string): Date | null => {
    if (!personalNumber || personalNumber.length < 4) {
        return null;
    }

    const day = parseInt(personalNumber.substring(0, 2));
    const month = parseInt(personalNumber.substring(2, 4)) - 1; // JavaScript months are 0-indexed
    const currentYear = new Date().getFullYear();

    // Validate day and month
    if (day < 1 || day > 31 || month < 0 || month > 11) {
        return null;
    }

    // Create date with current year (will be adjusted in getDaysUntilNextBirthday)
    return new Date(currentYear, month, day);
};

// Function to calculate days until next birthday
const getDaysUntilNextBirthday = (birthDate: Date): number => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create birthday for current year
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, use next year
    if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    // Calculate difference in days
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
};

export async function GET() {
    try {
        await connectDB();

        // Get all members with personal numbers (removed approved status requirement)
        const members = await Membership.find({ 
            personalNumber: { $exists: true, $ne: "" }
        }).select('firstName middleName lastName email phone personalNumber profilePhoto membershipType membershipStatus');


        const upcomingBirthdays = [];
        let skippedCount = 0;
        let invalidPersonalNumberCount = 0;

        for (const member of members) {
            const birthDate = extractBirthDateFromPersonalNumber(member.personalNumber);
            if (!birthDate) {
                invalidPersonalNumberCount++;
                console.log(`Invalid personal number for ${member.firstName} ${member.lastName}: ${member.personalNumber}`);
                continue;
            }

            const daysUntilBirthday = getDaysUntilNextBirthday(birthDate);
            
            console.log(`${member.firstName} ${member.lastName}: Birth date ${birthDate.toISOString()}, Days until: ${daysUntilBirthday}`);
            
            // Only include birthdays within next 30 days
            if (daysUntilBirthday >= 0 && daysUntilBirthday <= 30) {
                const age = new Date().getFullYear() - birthDate.getFullYear();
                
                upcomingBirthdays.push({
                    _id: member._id,
                    firstName: member.firstName,
                    middleName: member.middleName,
                    lastName: member.lastName,
                    email: member.email,
                    phone: member.phone,
                    personalNumber: member.personalNumber,
                    profilePhoto: member.profilePhoto,
                    membershipType: member.membershipType,
                    birthDate: birthDate.toISOString(),
                    daysUntilBirthday,
                    age: age,
                    fullName: `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`
                });
            } else {
                skippedCount++;
            }
        }

        console.log(`Total members: ${members.length}, Invalid personal numbers: ${invalidPersonalNumberCount}, Skipped (outside 30 days): ${skippedCount}, Upcoming birthdays: ${upcomingBirthdays.length}`);

        // Sort by days until birthday (ascending)
        upcomingBirthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

        return NextResponse.json({
            success: true,
            data: upcomingBirthdays,
            count: upcomingBirthdays.length
        });

    } catch (error) {
        console.error("Error fetching upcoming birthdays:", error);
        return NextResponse.json(
            { error: "Failed to fetch upcoming birthdays" },
            { status: 500 }
        );
    }
}
