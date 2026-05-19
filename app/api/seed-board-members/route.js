import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BoardMember from "@/models/BoardMember.Model";

const defaultBoardMembers = [
  // Executive Members
  { name: "Jitendra Bikram Shahi", position: "Chairperson", type: "executive" },
  { name: "Anush Khadka", position: "Secretary", type: "executive" },
  { name: "Bikram Basnet", position: "Treasurer", type: "executive" },
  { name: "Hemanta Bhandari", position: "Joint Secretary", type: "executive" },
  { name: "Sagar Aryal", position: "Joint Treasurer", type: "executive" },
  
  // Regular Members
  { name: "Abishkar Bastola", position: "Member", type: "member" },
  { name: "Bishnu Gautam", position: "Member", type: "member" },
  { name: "Biswas Bajgai", position: "Member", type: "member" },
  { name: "Geeban Uprety", position: "Member", type: "member" },
  { name: "Ghanashyam Bartaula", position: "Member", type: "member" },
  { name: "Hari Bahadur Baniya", position: "Member", type: "member" },
  { name: "Ishwori Prasad Khanal", position: "Member", type: "member" },
  { name: "Khumanand S. Dhungana", position: "Member", type: "member" },
  { name: "Paban Acharya", position: "Member", type: "member" },
  { name: "Prabina Munakarmi", position: "Member", type: "member" },
  { name: "Ratna Prasad Sapkota", position: "Member", type: "member" },
  { name: "Siddhant Ghale", position: "Member", type: "member" },
  { name: "Sita Shiwani Shrestha", position: "Member", type: "member" },
  { name: "Sunil Dhungana", position: "Member", type: "member" },
  { name: "Suresh Kumar Yadav", position: "Member", type: "member" },
  { name: "Tika Acharya", position: "Member", type: "member" },
  { name: "Youbaraj Bhandari", position: "Member", type: "member" },
  
  // Advisors
  { name: "Manish Budhathoki", position: "Advisor", type: "advisor" },
  { name: "Kumar Pandit", position: "Advisor", type: "advisor" },
  { name: "Sanjeev Kumar Thapa", position: "Advisor", type: "advisor" },
  { name: "Jiban Bahadur Shahi", position: "Advisor", type: "advisor" },
  { name: "Saligram Aryal", position: "Advisor", type: "advisor" },
  { name: "Deependra Acharya", position: "Advisor", type: "advisor" }
];

export async function POST() {
  try {
    await connectDB();
    
    console.log('Starting to seed board members...');
    
    // Check if board members already exist
    const existingCount = await BoardMember.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: `Board members already exist (${existingCount} found). Use DELETE endpoint to clear first if you want to reseed.`,
        existingCount 
      }, { status: 200 });
    }
    
    // Insert default board members
    const insertedMembers = await BoardMember.insertMany(defaultBoardMembers);
    console.log(`Successfully inserted ${insertedMembers.length} board members`);
    
    // Print summary
    const executiveCount = insertedMembers.filter(m => m.type === 'executive').length;
    const memberCount = insertedMembers.filter(m => m.type === 'member').length;
    const advisorCount = insertedMembers.filter(m => m.type === 'advisor').length;
    
    const summary = {
      total: insertedMembers.length,
      executive: executiveCount,
      regular: memberCount,
      advisors: advisorCount,
      members: insertedMembers
    };
    
    return NextResponse.json({ 
      message: 'Board members seeded successfully!',
      summary 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error seeding board members:', error);
    return NextResponse.json(
      { error: 'Failed to seed board members' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();
    
    // Clear existing board members
    const result = await BoardMember.deleteMany({});
    console.log(`Cleared ${result.deletedCount} existing board members`);
    
    return NextResponse.json({ 
      message: `Successfully cleared ${result.deletedCount} board members`,
      deletedCount: result.deletedCount
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error clearing board members:', error);
    return NextResponse.json(
      { error: 'Failed to clear board members' },
      { status: 500 }
    );
  }
}
