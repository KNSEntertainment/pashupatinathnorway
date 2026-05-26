const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Import models
const Event = require('../models/Event.Model');
const Festivals = require('../models/Festivals.Model');

async function checkExistingEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all events
    const events = await Event.find().lean();
    console.log(`\n📊 Found ${events.length} events in database:`);

    events.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.eventname}`);
      console.log(`   ID: ${event._id}`);
      console.log(`   Date: ${event.eventdate}`);
      console.log(`   Description: ${event.eventdescription || 'No description'}`);
      console.log(`   Category: ${event.category || 'NOT SET'}`);
      console.log(`   Tags: ${event.festivalTags?.join(', ') || 'NONE'}`);
    });

    // Get all festivals for reference
    const festivals = await Festivals.find({ isActive: true }).lean();
    console.log(`\n🎉 Available festivals for matching:`);
    
    festivals.forEach((festival, index) => {
      const titleEn = festival.title?.en || festival.title;
      console.log(`\n${index + 1}. ${titleEn}`);
      console.log(`   ID: ${festival._id}`);
      console.log(`   Expected category: "${titleEn.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkExistingEvents();
