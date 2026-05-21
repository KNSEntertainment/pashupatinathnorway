const mongoose = require('mongoose');
const connectDB = require('../lib/mongodb');

// Index definitions for optimal performance
const indexes = [
  // Budget indexes
  {
    collection: 'budgets',
    indexes: [
      { eventId: 1 }, // For finding budgets by event
      { createdBy: 1 }, // For finding budgets by creator
      { category: 1 }, // For filtering by category
      { status: 1 }, // For filtering by status
      { startDate: 1, endDate: 1 }, // For date range queries
      { createdAt: -1 }, // For sorting by creation date
    ]
  },
  
  // Income indexes
  {
    collection: 'incomes',
    indexes: [
      { eventId: 1 }, // For finding income by event
      { sourceType: 1 }, // For filtering by source type
      { date: -1 }, // For date-based queries and sorting
      { createdBy: 1 }, // For finding income by creator
      { createdAt: -1 }, // For sorting by creation date
      { eventId: 1, date: -1 }, // Compound index for event income trends
    ]
  },
  
  // Expense indexes
  {
    collection: 'expenses',
    indexes: [
      { eventId: 1 }, // For finding expenses by event
      { expenseCategory: 1 }, // For filtering by category
      { date: -1 }, // For date-based queries and sorting
      { createdBy: 1 }, // For finding expenses by creator
      { createdAt: -1 }, // For sorting by creation date
      { eventId: 1, date: -1 }, // Compound index for event expense trends
    ]
  },
  
  // Donation indexes
  {
    collection: 'donations',
    indexes: [
      { eventId: 1 }, // For finding donations by event
      { donationPurpose: 1 }, // For filtering by purpose
      { donorEmail: 1 }, // For finding donations by donor
      { paymentStatus: 1 }, // For filtering by payment status
      { createdAt: -1 }, // For sorting by creation date
      { donationPurpose: 1, createdAt: -1 }, // Compound index for donation trends
    ]
  },
  
  // Event indexes
  {
    collection: 'events',
    indexes: [
      { eventdate: 1 }, // For sorting by event date
      { enableAttendance: 1 }, // For filtering attendance-enabled events
      { attendanceStatus: 1 }, // For filtering by attendance status
      { createdAt: -1 }, // For sorting by creation date
      { eventdate: -1, createdAt: -1 }, // Compound index for upcoming events
    ]
  },
  
  // EventRegistration indexes
  {
    collection: 'eventregistrations',
    indexes: [
      { eventId: 1 }, // For finding registrations by event
      { registrationType: 1 }, // For filtering by registration type
      { email: 1 }, // For finding registrations by email
      { membershipId: 1 }, // For finding registrations by membership
      { registrationStatus: 1 }, // For filtering by status
      { paymentStatus: 1 }, // For filtering by payment status
      { createdAt: -1 }, // For sorting by creation date
      // Compound indexes for duplicate prevention
      { eventId: 1, membershipId: 1 }, // Unique for member registrations
      { eventId: 1, email: 1 }, // Unique for guest registrations
      { eventId: 1, registrationStatus: 1 }, // For active registrations by event
    ]
  },
  
  // Membership indexes
  {
    collection: 'memberships',
    indexes: [
      { membershipId: 1 }, // Unique membership ID lookup
      { email: 1 }, // For finding members by email
      { membershipStatus: 1 }, // For filtering by status
      { membershipType: 1 }, // For filtering by type
      { osloVerificationStatus: 1 }, // For filtering by verification status
      { createdAt: -1 }, // For sorting by creation date
      { membershipStatus: 1, createdAt: -1 }, // Compound index for member trends
    ]
  }
];

async function createIndexes() {
  try {
    await connectDB();
    
    console.log('Starting index creation...');
    
    for (const { collection, indexes } of indexes) {
      console.log(`Creating indexes for ${collection}...`);
      
      const db = mongoose.connection.db;
      const collectionObj = db.collection(collection);
      
      for (const index of indexes) {
        try {
          await collectionObj.createIndex(index, { background: true });
          console.log(`✓ Created index on ${collection}: ${JSON.stringify(index)}`);
        } catch (error) {
          if (error.code === 11000) {
            console.log(`⚠ Index already exists on ${collection}: ${JSON.stringify(index)}`);
          } else {
            console.error(`✗ Failed to create index on ${collection}:`, error);
          }
        }
      }
    }
    
    console.log('✓ Index creation completed successfully');
    
    // Create text indexes for search functionality
    console.log('Creating text search indexes...');
    
    // Events text search
    await mongoose.connection.db.collection('events').createIndex({
      eventname: 'text',
      eventdescription: 'text',
      eventvenue: 'text'
    }, { background: true });
    console.log('✓ Created text search index for events');
    
    // Memberships text search
    await mongoose.connection.db.collection('memberships').createIndex({
      firstName: 'text',
      lastName: 'text',
      email: 'text'
    }, { background: true });
    console.log('✓ Created text search index for memberships');
    
    console.log('✓ All indexes created successfully');
    
  } catch (error) {
    console.error('Failed to create indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Validation rules and constraints
const validationRules = {
  budgets: {
    allocatedAmount: { min: 0 },
    spentAmount: { min: 0 },
    remainingAmount: { min: 0 }
  },
  incomes: {
    amount: { min: 0 }
  },
  expenses: {
    amount: { min: 0 }
  },
  donations: {
    amount: { min: 0 }
  },
  eventregistrations: {
    attendeeCount: { min: 1, max: 50 },
    donationAmount: { min: 0 },
    paymentAmount: { min: 0 }
  }
};

async function addValidationRules() {
  try {
    await connectDB();
    
    console.log('Adding validation rules...');
    
    // Add validation rules using MongoDB schema validation
    const db = mongoose.connection.db;
    
    // Budget validation
    await db.command({
      collMod: 'budgets',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'category', 'allocatedAmount', 'period', 'startDate', 'endDate', 'status'],
          properties: {
            allocatedAmount: { bsonType: 'number', minimum: 0 },
            spentAmount: { bsonType: 'number', minimum: 0 },
            remainingAmount: { bsonType: 'number', minimum: 0 }
          }
        }
      },
      validationLevel: 'moderate'
    });
    
    // Income validation
    await db.command({
      collMod: 'incomes',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title', 'amount', 'sourceType'],
          properties: {
            amount: { bsonType: 'number', minimum: 0 }
          }
        }
      },
      validationLevel: 'moderate'
    });
    
    // Expense validation
    await db.command({
      collMod: 'expenses',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title', 'amount', 'expenseCategory'],
          properties: {
            amount: { bsonType: 'number', minimum: 0 }
          }
        }
      },
      validationLevel: 'moderate'
    });
    
    // Donation validation
    await db.command({
      collMod: 'donations',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['donorName', 'amount'],
          properties: {
            amount: { bsonType: 'number', minimum: 0 }
          }
        }
      },
      validationLevel: 'moderate'
    });
    
    // EventRegistration validation
    await db.command({
      collMod: 'eventregistrations',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['eventId', 'registrationType', 'name', 'email'],
          properties: {
            attendeeCount: { bsonType: 'number', minimum: 1, maximum: 50 },
            donationAmount: { bsonType: 'number', minimum: 0 },
            paymentAmount: { bsonType: 'number', minimum: 0 }
          }
        }
      },
      validationLevel: 'moderate'
    });
    
    console.log('✓ Validation rules added successfully');
    
  } catch (error) {
    console.error('Failed to add validation rules:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run both index creation and validation
async function setupDatabase() {
  await createIndexes();
  await addValidationRules();
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { createIndexes, addValidationRules, setupDatabase };
