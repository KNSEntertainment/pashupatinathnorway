const { MongoClient } = require('mongodb');

// MongoDB connection - using same connection as app
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrateMembershipFields() {
  try {
    await client.connect();
    const db = client.db('rspnorway');
    const collection = db.collection('memberships');
    
    console.log('Starting migration: Adding new fields to existing membership documents...');
    
    // Find all existing membership documents
    const existingMemberships = await collection.find({}).toArray();
    console.log(`Found ${existingMemberships.length} existing membership documents`);
    
    // Update each document with new fields
    const updateOperations = existingMemberships.map(membership => {
      const updateDoc = {
        $set: {
          // Add new fields with default values if they don't exist
          province: membership.province || membership.addressNepal?.province || '',
          district: membership.district || membership.addressNepal?.district || '',
          profession: membership.occupation || '',
          skills: membership.skillsExpertise || '',
          volunteerInterest: membership.areasOfInterests || [],
          membershipType: membership.membershipType || 'general',
          membershipStatus: membership.membershipStatus || 'pending',
          // Keep existing fields
        }
      };
      
      return {
        updateOne: {
          filter: { _id: membership._id },
          update: updateDoc
        }
      };
    });
    
    // Execute bulk update
    if (updateOperations.length > 0) {
      const result = await collection.bulkWrite(updateOperations);
      console.log(`Successfully updated ${result.modifiedCount} membership documents`);
      
      // Log some examples of updated documents
      const sampleUpdated = await collection.find({}).limit(3).toArray();
      console.log('Sample updated documents:', JSON.stringify(sampleUpdated, null, 2));
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run migration
migrateMembershipFields().catch(console.error);
