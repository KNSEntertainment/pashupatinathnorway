import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../lib/mongodb.js';
import User from '../models/User.Model.js';
import ReportType from '../models/ReportType.Model.js';

dotenv.config({ path: '.env.local' });

async function seedReportTypes() {
  try {
    await connectDB();
    
    // Find an admin user (or create one if needed)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // Create a default admin user for seeding
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@pashupatinath.no',
        role: 'admin',
        membershipId: 'ADMIN001',
        isActive: true
      });
      await adminUser.save();
      console.log('Created admin user for seeding');
    }
    
    // Clear existing report types
    await ReportType.deleteMany({});
    console.log('Cleared existing report types');
    
    // Default report types
    const defaultReportTypes = [
      {
        name: 'financial',
        label: 'Financial Reports',
        description: 'Annual financial statements, budgets, and financial analyses',
        color: 'green',
        sortOrder: 1,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'activity',
        label: 'Activity Reports',
        description: 'Annual activity summaries, event reports, and community activities',
        color: 'blue',
        sortOrder: 2,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'membership',
        label: 'Membership Reports',
        description: 'Membership statistics, growth reports, and member engagement data',
        color: 'purple',
        sortOrder: 3,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'audit',
        label: 'Audit Reports',
        description: 'Independent audit reports, compliance reports, and internal audits',
        color: 'orange',
        sortOrder: 4,
        isActive: true,
        createdBy: adminUser._id
      }
    ];
    
    // Insert default report types
    await ReportType.insertMany(defaultReportTypes);
    console.log(`Successfully seeded ${defaultReportTypes.length} report types`);
    
    // Verify the seeding
    const count = await ReportType.countDocuments();
    console.log(`Total report types in database: ${count}`);
    
    // Display the seeded report types
    const seededTypes = await ReportType.find({}).sort({ sortOrder: 1 });
    console.log('\nSeeded report types:');
    seededTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.label} (${type.name}) - Color: ${type.color}`);
    });
    
  } catch (error) {
    console.error('Error seeding report types:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedReportTypes();
