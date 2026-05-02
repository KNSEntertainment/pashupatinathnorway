import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

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

        // Get all approved members
        const members = await Membership.find({ 
            membershipStatus: "approved",
            personalNumber: { $exists: true, $ne: "" }
        }).select('firstName middleName lastName email phone personalNumber profilePhoto membershipType');

        const upcomingBirthdays = [];

        for (const member of members) {
            const birthDate = extractBirthDateFromPersonalNumber(member.personalNumber);
            if (!birthDate) continue;

            const daysUntilBirthday = getDaysUntilNextBirthday(birthDate);
            
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
            }
        }

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
