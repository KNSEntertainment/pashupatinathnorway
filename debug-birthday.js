// Test script to debug birthday calculation for personal number 02058725542

// Helper function to extract birth date from Norwegian personal number
const extractBirthDateFromPersonalNumber = (personalNumber) => {
    if (!personalNumber || personalNumber.length !== 11 || !/^\d{11}$/.test(personalNumber)) {
        return null;
    }

    const day = parseInt(personalNumber.substring(0, 2));
    const month = parseInt(personalNumber.substring(2, 4)) - 1; // JavaScript months are 0-indexed
    const yearShort = parseInt(personalNumber.substring(4, 6));
    const individualNumber = parseInt(personalNumber.substring(6, 9));
    const currentYear = new Date().getFullYear();

    console.log(`Personal Number: ${personalNumber}`);
    console.log(`Day: ${day}`);
    console.log(`Month: ${month} (0-indexed, so ${month + 1} in human terms)`);
    console.log(`Year Short: ${yearShort}`);
    console.log(`Individual Number: ${individualNumber}`);
    console.log(`Current Year: ${currentYear}`);

    let fullYear;

    // Individual number 750–999 with year 00–39 → born 2000–2039
    if (individualNumber >= 750 && individualNumber <= 999 && yearShort <= 39) {
        fullYear = 2000 + yearShort;
        console.log(`Logic: Individual number ${individualNumber} >= 750 and yearShort ${yearShort} <= 39, so fullYear = 2000 + ${yearShort} = ${fullYear}`);
    } else {
        // Everyone else in 0-99 age range → born 1900–1999
        fullYear = 1900 + yearShort;
        console.log(`Logic: Using default rule, fullYear = 1900 + ${yearShort} = ${fullYear}`);
    }

    // Safety check: if resolved year is somehow in the future, step back
    if (fullYear > currentYear) {
        console.log(`Safety check: fullYear ${fullYear} > currentYear ${currentYear}, subtracting 100`);
        fullYear -= 100;
    }

    console.log(`Final Full Year: ${fullYear}`);
    
    const birthDate = new Date(fullYear, month, day);
    console.log(`Birth Date: ${birthDate.toDateString()}`);
    console.log(`Birth Date (ISO): ${birthDate.toISOString()}`);
    
    return birthDate;
};

// Function to calculate days until next birthday
const getDaysUntilNextBirthday = (birthDate) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    console.log(`\n--- Days Until Birthday Calculation ---`);
    console.log(`Today: ${today.toDateString()}`);
    console.log(`Current Year: ${currentYear}`);
    
    // Create birthday for current year
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    console.log(`Birthday this year: ${nextBirthday.toDateString()}`);
    
    // If birthday has passed this year, use next year
    if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
        console.log(`Birthday passed this year, using next year: ${nextBirthday.toDateString()}`);
    }
    
    // Calculate difference in days
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`Time difference: ${diffTime}ms`);
    console.log(`Days until birthday: ${diffDays}`);
    
    return diffDays;
};

// Test the specific personal number
console.log("=== Testing Personal Number 02058725542 ===");
const personalNumber = "02058725542";
const birthDate = extractBirthDateFromPersonalNumber(personalNumber);

if (birthDate) {
    const daysUntil = getDaysUntilNextBirthday(birthDate);
    console.log(`\n=== RESULT ===`);
    console.log(`Personal Number: ${personalNumber}`);
    console.log(`Birth Date: ${birthDate.toDateString()}`);
    console.log(`Days until next birthday: ${daysUntil}`);
    console.log(`Should show in birthdays list: ${daysUntil >= 0 && daysUntil <= 7 ? 'YES' : 'NO'}`);
} else {
    console.log("ERROR: Could not extract birth date");
}

// Also test edge case - what if today is May 1st and birthday is May 2nd
console.log(`\n=== Edge Case Test (Today = May 1, Birthday = May 2) ===`);
const today = new Date();
console.log(`Actual today: ${today.toDateString()}`);
console.log(`Today's month: ${today.getMonth()} (0-indexed)`);
console.log(`Today's date: ${today.getDate()}`);

// Create test dates for May 1st and May 2nd
const may1 = new Date(2026, 4, 1); // May 1, 2026
const may2 = new Date(2026, 4, 2); // May 2, 2026
console.log(`May 1: ${may1.toDateString()}`);
console.log(`May 2: ${may2.toDateString()}`);
console.log(`May 1 < May 2: ${may1 < may2}`);
console.log(`May 2 < May 1: ${may2 < may1}`);
