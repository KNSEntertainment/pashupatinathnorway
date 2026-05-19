const mongoose = require('mongoose');
const connectDB = require('../lib/mongodb');
const BoardMember = require('../models/BoardMember.Model');

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

async function seedBoardMembers() {
  try {
    await connectDB();
    
    console.log('Starting to seed board members...');
    
    // Clear existing board members
    await BoardMember.deleteMany({});
    console.log('Cleared existing board members');
    
    // Insert default board members
    const insertedMembers = await BoardMember.insertMany(defaultBoardMembers);
    console.log(`Successfully inserted ${insertedMembers.length} board members`);
    
    // Print summary
    const executiveCount = insertedMembers.filter(m => m.type === 'executive').length;
    const memberCount = insertedMembers.filter(m => m.type === 'member').length;
    const advisorCount = insertedMembers.filter(m => m.type === 'advisor').length;
    
    console.log('\nSummary:');
    console.log(`- Executive Members: ${executiveCount}`);
    console.log(`- Regular Members: ${memberCount}`);
    console.log(`- Advisors: ${advisorCount}`);
    console.log(`- Total: ${insertedMembers.length}`);
    
    console.log('\nBoard members seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding board members:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedBoardMembers();
