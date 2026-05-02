// Migration script to encrypt existing plain text personal numbers
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { encryptPersonalNumber, isEncrypted } = require('../lib/encryption');

// Load the Donation model dynamically
let Donation;
try {
  // Try to load the model from mongoose models
  Donation = mongoose.model('Donation');
} catch (error) {
  // If model doesn't exist, load it from the file
  Donation = require('../models/Donation.Model.js').default || require('../models/Donation.Model.js');
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pashupatinath-norway';

async function migratePersonalNumbers() {
  try {
    // Validate environment variables
    if (!process.env.ENCRYPTION_KEY) {
      console.error('❌ ENCRYPTION_KEY not found in environment variables');
      console.error('Please add this to your .env.local file:');
      console.error('ENCRYPTION_KEY=your_generated_64_character_hex_key');
      process.exit(1);
    }

    console.log('✅ ENCRYPTION_KEY found');
    console.log(`🔑 Key length: ${process.env.ENCRYPTION_KEY.length} characters`);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all donations with personal numbers
    const donations = await Donation.find({ 
      personalNumber: { $exists: true, $ne: '' } 
    });

    console.log(`Found ${donations.length} donations with personal numbers`);

    let encryptedCount = 0;
    let alreadyEncryptedCount = 0;
    let errorCount = 0;

    for (const donation of donations) {
      try {
        // Check if personal number is already encrypted
        if (isEncrypted(donation.personalNumber)) {
          console.log(`Donation ${donation._id}: Personal number already encrypted`);
          alreadyEncryptedCount++;
          continue;
        }

        // Encrypt the personal number
        const encryptedPersonalNumber = encryptPersonalNumber(donation.personalNumber);
        
        // Update the donation
        await Donation.findByIdAndUpdate(donation._id, {
          personalNumber: encryptedPersonalNumber
        });

        console.log(`Donation ${donation._id}: Encrypted personal number`);
        encryptedCount++;

      } catch (error) {
        console.error(`Error encrypting donation ${donation._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total donations with personal numbers: ${donations.length}`);
    console.log(`Already encrypted: ${alreadyEncryptedCount}`);
    console.log(`Newly encrypted: ${encryptedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Migration completed');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migratePersonalNumbers();
}

module.exports = { migratePersonalNumbers };
