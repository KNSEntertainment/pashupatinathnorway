const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function migrateFestivalRelationships() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas
    const eventSchema = new mongoose.Schema({
      eventname: { type: String, required: true },
      eventdescription: { type: String, required: false },
      eventvenue: { type: String, required: false },
      eventdate: { type: String, required: false },
      eventtime: { type: String, required: false },
      eventposterUrl: { type: String, required: true },
      // Old fields for migration
      category: { type: String, required: false, default: "general" },
      festivalTags: [{ type: String }],
      // New field
      festivalId: { type: mongoose.Schema.Types.ObjectId, ref: "Festivals", default: null },
      memberPrice: { type: Number, default: 0 },
      guestPrice: { type: Number, default: 0 },
      allowGuestRegistration: { type: Boolean, default: true },
      registrationDeadline: { type: Date },
      enableAttendance: { type: Boolean, default: false },
      attendanceStatus: { type: String, enum: ["not_started", "active", "closed"], default: "not_started" },
      maxAttendees: { type: Number },
      createdBy: { type: String },
      updatedAt: { type: Date, default: Date.now },
      createdAt: { type: Date, default: Date.now },
    });

    const festivalSchema = new mongoose.Schema({
      title: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: { en: '', no: '', ne: '' }
      },
      description: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: { en: '', no: '', ne: '' }
      },
      imageUrl: {
        type: String,
        required: false
      },
      features: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: { en: [], no: [], ne: [] }
      },
      timing: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: { en: '', no: '', ne: '' }
      },
      highlight: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true
      },
      isDeleted: {
        type: Boolean,
        default: false
      },
      deletedAt: {
        type: Date,
        default: null
      },
      events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
    });

    const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
    const Festival = mongoose.models.Festivals || mongoose.model("Festivals", festivalSchema);

    console.log('\n🔄 Starting migration from category/tags to direct festival relationships...');

    // Get all festivals for mapping
    const festivals = await Festival.find({ isActive: true, isDeleted: false });
    console.log(`📋 Found ${festivals.length} festivals`);

    // Create category to festival mapping
    const categoryToFestival = {};
    festivals.forEach(festival => {
      const title = festival.title?.en || festival.title?.no || festival.title?.ne || '';
      const categoryKey = title.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      categoryToFestival[categoryKey] = festival._id;
      categoryToFestival[categoryKey.replace('-', '')] = festival._id; // Also map without dashes
      
      console.log(`   Mapping: "${categoryKey}" -> "${title}"`);
    });

    console.log('\n📊 Category to Festival Mappings:');
    Object.entries(categoryToFestival).forEach(([category, festivalId]) => {
      console.log(`   ${category} -> ${festivalId}`);
    });

    // Get all events
    const events = await Event.find({});
    console.log(`\n🎯 Processing ${events.length} events...`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      // Skip if already has festivalId
      if (event.festivalId) {
        console.log(`   ⏭️  Skipping "${event.eventname}" - already has festivalId`);
        skippedCount++;
        continue;
      }

      // Try to map by category
      let festivalId = null;
      
      if (event.category && event.category !== 'general') {
        const categoryKey = event.category.toLowerCase();
        festivalId = categoryToFestival[categoryKey] || categoryToFestival[categoryKey.replace('-', '')];
      }

      // If no category match, try tags
      if (!festivalId && event.festivalTags && event.festivalTags.length > 0) {
        for (const tag of event.festivalTags) {
          const tagKey = tag.toLowerCase();
          if (categoryToFestival[tagKey]) {
            festivalId = categoryToFestival[tagKey];
            break;
          }
        }
      }

      // Update event if festival found
      if (festivalId) {
        await Event.findByIdAndUpdate(event._id, {
          festivalId: festivalId,
          updatedAt: new Date()
        });
        
        // Add event to festival's events array
        await Festival.findByIdAndUpdate(festivalId, {
          $addToSet: { events: event._id }
        });

        const festival = festivals.find(f => f._id.toString() === festivalId.toString());
        const festivalName = festival?.title?.en || festival?.title?.no || festival?.title?.ne || 'Unknown';
        
        console.log(`   ✅ Migrated "${event.eventname}" -> "${festivalName}"`);
        migratedCount++;
      } else {
        console.log(`   ⚠️  No festival match for "${event.eventname}" (category: ${event.category || 'none'})`);
        skippedCount++;
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} events`);
    console.log(`   ⚠️  Skipped/no match: ${skippedCount} events`);
    console.log(`   📊 Total processed: ${events.length} events`);

    // Update festivals with event counts
    console.log('\n🔄 Updating festival event counts...');
    for (const festival of festivals) {
      const eventCount = await Event.countDocuments({ festivalId: festival._id });
      console.log(`   📋 ${festival.title?.en || festival.title?.no || festival.title?.ne}: ${eventCount} events`);
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
migrateFestivalRelationships();
