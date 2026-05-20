const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import models
const Cause = require('../models/Cause.Model.ts');
const Donation = require('../models/Donation.Model.js');

async function associateDonationsToCause() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all causes
    const causes = await Cause.find({});
    console.log(`Found ${causes.length} causes:`);
    
    causes.forEach((cause, index) => {
      console.log(`${index + 1}. ${cause._id} - ${cause.title.en || 'No title'}`);
    });

    // For this example, let's use the first active cause
    // You can modify this to select a specific cause
    const targetCause = causes.find(cause => cause.status === 'active') || causes[0];
    
    if (!targetCause) {
      console.log('No causes found. Please create a cause first.');
      return;
    }

    console.log(`\nTarget cause: ${targetCause.title.en || 'No title'} (${targetCause._id})`);

    // Find all donations that don't have a causeId (general donations)
    const generalDonations = await Donation.find({ 
      causeId: { $exists: false },
      paymentStatus: 'completed'
    });

    console.log(`Found ${generalDonations.length} general donations to associate`);

    if (generalDonations.length === 0) {
      console.log('No general donations found to associate.');
      return;
    }

    // Update all general donations to associate with the target cause
    const result = await Donation.updateMany(
      { 
        causeId: { $exists: false },
        paymentStatus: 'completed'
      },
      { 
        $set: { 
          causeId: targetCause._id,
          donationType: 'cause_specific'
        }
      }
    );

    console.log(`Successfully updated ${result.modifiedCount} donations to be associated with cause: ${targetCause.title.en}`);

    // Verify the update
    const updatedDonations = await Donation.find({ causeId: targetCause._id });
    console.log(`Total donations now associated with this cause: ${updatedDonations.length}`);

  } catch (error) {
    console.error('Error associating donations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
associateDonationsToCause();
