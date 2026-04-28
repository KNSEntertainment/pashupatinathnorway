const mongoose = require('mongoose');

// MongoDB connection - using same connection as app
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

async function migrateMembershipFields() {
  try {
    console.log('Starting migration via API endpoints...');
    
    // First, get all existing membership IDs
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('memberships');
    const existingMemberships = await collection.find({}).toArray();
    
    console.log(`Found ${existingMemberships.length} existing membership documents`);
    
    // Update each document via API PUT endpoint
    for (const membership of existingMemberships) {
      try {
        const updateData = {
          // Add new fields with default values if they don't exist
          province: membership.province || membership.addressNepal?.province || '',
          district: membership.district || membership.addressNepal?.district || '',
          profession: membership.occupation || '',
          skills: membership.skillsExpertise || '',
          volunteerInterest: membership.areasOfInterests || [],
          membershipType: membership.membershipType || 'general',
          membershipStatus: membership.membershipStatus || 'pending',
          // Keep existing fields
        };
        
        const response = await fetch(`http://localhost:3000/api/membership/${membership._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (response.ok) {
          console.log(`Updated membership ${membership._id} successfully`);
        } else {
          console.error(`Failed to update membership ${membership._id}:`, await response.text());
        }
        
        // Add delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error updating membership ${membership._id}:`, error.message);
      }
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    if (cached.conn) {
      await mongoose.connection.close();
    }
  }
}

// Run migration
migrateMembershipFields().catch(console.error);
