// Test script to check database for the specific member
import connectDB from './lib/mongodb.js';
import Membership from './models/Membership.Model.js';

async function debugDatabase() {
    try {
        await connectDB();
        console.log("Connected to database");

        // Find the specific member by personal number
        const member = await Membership.findOne({ personalNumber: "02058725542" });
        
        if (member) {
            console.log("Member found:");
            console.log(`Name: ${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`);
            console.log(`Email: ${member.email}`);
            console.log(`Phone: ${member.phone}`);
            console.log(`Personal Number: ${member.personalNumber}`);
            console.log(`Membership Status: ${member.membershipStatus}`);
            console.log(`Membership Type: ${member.membershipType}`);
            console.log(`Profile Photo: ${member.profilePhoto || 'None'}`);
            console.log(`Created At: ${member.createdAt}`);
            
            // Check if they should appear in birthdays
            if (member.membershipStatus === "approved") {
                console.log("\n✅ Member has approved status - should appear in birthdays list");
            } else {
                console.log(`\n❌ Member has status "${member.membershipStatus}" - will NOT appear in birthdays list`);
                console.log("Only approved members appear in the birthdays list");
            }
        } else {
            console.log("❌ Member with personal number 02058725542 not found in database");
            
            // Search for similar personal numbers
            const similarMembers = await Membership.find({ 
                personalNumber: { $regex: "020587" }
            });
            
            if (similarMembers.length > 0) {
                console.log("\nFound members with similar personal numbers:");
                similarMembers.forEach(m => {
                    console.log(`- ${m.personalNumber}: ${m.firstName} ${m.lastName} (${m.membershipStatus})`);
                });
            }
        }

        // Check all approved members to see the total count
        const approvedCount = await Membership.countDocuments({ membershipStatus: "approved" });
        console.log(`\nTotal approved members in database: ${approvedCount}`);

        // Check for any members with birthdays in next 7 days
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        console.log(`\nChecking for birthdays between ${today.toDateString()} and ${sevenDaysFromNow.toDateString()}`);

    } catch (error) {
        console.error("Database error:", error);
    } finally {
        process.exit(0);
    }
}

debugDatabase();
