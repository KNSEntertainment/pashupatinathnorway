const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function migrateExecutiveOrder() {
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const membershipCollection = db.collection('memberships');

    // Find all executive members
    const executives = await membershipCollection.find({ 
      membershipType: 'Executive',
      membershipStatus: 'approved'
    }).sort({ createdAt: 1 }).toArray();

    console.log(`\n📋 Found ${executives.length} executive members:`);

    // Display current state
    executives.forEach((member, index) => {
      console.log(`${index + 1}. ${member.firstName} ${member.lastName} - Position: ${member.position || 'N/A'} - Current Order: ${member.displayOrder || 'NOT SET'}`);
    });

    // Check if any have displayOrder set
    const withOrder = executives.filter(m => m.displayOrder !== undefined && m.displayOrder !== null);
    const withoutOrder = executives.filter(m => !m.displayOrder || m.displayOrder === null);

    console.log(`\n📊 Statistics:`);
    console.log(`   With displayOrder set: ${withOrder.length}`);
    console.log(`   Without displayOrder: ${withoutOrder.length}`);

    if (withoutOrder.length > 0) {
      console.log(`\n🔄 Initializing displayOrder for ${withoutOrder.length} executive members...`);
      
      // Update members without displayOrder
      for (let i = 0; i < executives.length; i++) {
        const member = executives[i];
        
        if (!member.displayOrder || member.displayOrder === null) {
          // Set displayOrder based on current position in array
          // This preserves creation order as initial hierarchy
          await membershipCollection.updateOne(
            { _id: member._id },
            { $set: { displayOrder: i } }
          );
          
          console.log(`   ✅ Updated ${member.firstName} ${member.lastName} -> Order: ${i}`);
        }
      }
      
      console.log(`\n🎉 Migration completed! All executive members now have displayOrder set.`);
    } else {
      console.log(`\n✅ All executive members already have displayOrder set. No migration needed.`);
    }

    // Verify the migration
    console.log(`\n🔍 Verifying migration results:`);
    const updatedExecutives = await membershipCollection.find({ 
      membershipType: 'Executive',
      membershipStatus: 'approved'
    }).sort({ displayOrder: 1 }).toArray();

    updatedExecutives.forEach((member, index) => {
      console.log(`${index + 1}. ${member.firstName} ${member.lastName} - Position: ${member.position || 'N/A'} - Order: ${member.displayOrder}`);
    });

    await client.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    if (client) await client.close();
    process.exit(1);
  }
}

// Run the migration
migrateExecutiveOrder();
