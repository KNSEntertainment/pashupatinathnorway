require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import the Membership model - require the model file to register the schema
require('../models/Membership.Model');
const Membership = mongoose.model('Membership');

async function initializeOsloVerificationStatus() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pashupatinath';
    await mongoose.connect(mongoUri);
    
    console.log(`Connecting to: ${mongoUri}`);
    console.log('Connected to MongoDB');

    // Update all General members to have osloVerificationStatus = "pending"
    const result = await Membership.updateMany(
      { 
        membershipType: 'General',
        osloVerificationStatus: { $exists: false } // Only update those without the field
      },
      { 
        $set: { 
          osloVerificationStatus: 'pending' 
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} General members to pending status`);

    // Get summary of current verification status
    const summary = await Membership.aggregate([
      { $match: { membershipType: 'General' } },
      { $group: { 
        _id: '$osloVerificationStatus', 
        count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]);

    console.log('\nCurrent Oslo Verification Status Summary:');
    summary.forEach(item => {
      console.log(`${item._id}: ${item.count} members`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
initializeOsloVerificationStatus();
