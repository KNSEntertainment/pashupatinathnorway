import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../lib/mongodb.js';
import User from '../models/User.Model.js';
import Publication from '../models/Publication.Model.js';

dotenv.config({ path: '.env.local' });

async function seedPublications() {
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
    
    // Clear existing publications
    await Publication.deleteMany({});
    console.log('Cleared existing publications');
    
    // Sample publications
    const samplePublications = [
      {
        title: "Annual Financial Report 2024",
        type: "financial",
        description: "Comprehensive financial statement including income, expenses, and balance sheet for the fiscal year 2024.",
        fileSize: "2.4 MB",
        pages: 45,
        publishedDate: new Date("2024-03-15"),
        downloadUrl: "/reports/financial-2024.pdf",
        language: "en",
        createdBy: adminUser._id
      },
      {
        title: "Annual Activity Summary 2024",
        type: "activity",
        description: "Complete overview of all temple activities, festivals, and community events conducted in 2024.",
        fileSize: "5.1 MB",
        pages: 78,
        publishedDate: new Date("2024-04-20"),
        downloadUrl: "/reports/activity-2024.pdf",
        language: "en",
        createdBy: adminUser._id
      },
      {
        title: "Membership Statistics 2024",
        type: "membership",
        description: "Detailed membership growth analysis, demographic breakdown, and engagement metrics for 2024.",
        fileSize: "1.8 MB",
        pages: 32,
        publishedDate: new Date("2024-02-10"),
        downloadUrl: "/reports/membership-2024.pdf",
        language: "en",
        createdBy: adminUser._id
      },
      {
        title: "Audit Report 2024",
        type: "audit",
        description: "Independent audit report for the fiscal year 2024, including compliance and financial controls assessment.",
        fileSize: "3.2 MB",
        pages: 56,
        publishedDate: new Date("2024-05-01"),
        downloadUrl: "/reports/audit-2024.pdf",
        language: "en",
        createdBy: adminUser._id
      },
      {
        title: "वार्षिक वित्तीय प्रतिवेदन २०२४",
        type: "financial",
        description: "वित्तीय वर्ष २०२४ को लागि आम्दानी, खर्च, र ब्यालेन्स शीट सहित व्यापक वित्तीय विवरण।",
        fileSize: "2.1 MB",
        pages: 42,
        publishedDate: new Date("2024-03-20"),
        downloadUrl: "/reports/financial-2024-ne.pdf",
        language: "ne",
        createdBy: adminUser._id
      },
      {
        title: "Annual Financial Report 2023",
        type: "financial",
        description: "Comprehensive financial statement including income, expenses, and balance sheet for the fiscal year 2023.",
        fileSize: "2.2 MB",
        pages: 43,
        publishedDate: new Date("2023-03-15"),
        downloadUrl: "/reports/financial-2023.pdf",
        language: "en",
        createdBy: adminUser._id
      },
      {
        title: "Årsrapport 2024",
        type: "activity",
        description: "Komplett oversikt over alle tempelaktiviteter, festivaler og samfunnsarrangementer gjennomført i 2024.",
        fileSize: "4.8 MB",
        pages: 75,
        publishedDate: new Date("2024-04-25"),
        downloadUrl: "/reports/activity-2024-no.pdf",
        language: "no",
        createdBy: adminUser._id
      }
    ];
    
    // Insert sample publications
    await Publication.insertMany(samplePublications);
    console.log(`Successfully seeded ${samplePublications.length} publications`);
    
    // Verify the seeding
    const count = await Publication.countDocuments();
    console.log(`Total publications in database: ${count}`);
    
  } catch (error) {
    console.error('Error seeding publications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedPublications();
