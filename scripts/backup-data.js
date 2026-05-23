#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Backup configuration
const MONGODB_URI = 'mongodb+srv://harijunkemails:1SSMbNFtQLPQuLWO@hariscluster.fydu0.mongodb.net/pashupatinath';
const BACKUP_DIR = path.join(__dirname, '../backups');

async function backupData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('pashupatinath');
    
    // Create backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });
    
    console.log(`📁 Creating backup in: ${backupPath}`);
    
    // Backup collections
    const collections = ['rituals', 'festivals'];
    
    for (const collectionName of collections) {
      console.log(`📦 Backing up ${collectionName}...`);
      
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      // Save as JSON
      const jsonPath = path.join(backupPath, `${collectionName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(documents, null, 2));
      
      console.log(`✅ ${collectionName}: ${documents.length} documents backed up`);
    }
    
    console.log('🎉 Backup completed successfully!');
    console.log(`📍 Location: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await client.close();
  }
}

// Restore function
async function restoreData(backupFolder) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('pashupatinath');
    
    const collections = ['rituals', 'festivals'];
    
    for (const collectionName of collections) {
      const jsonPath = path.join(backupFolder, `${collectionName}.json`);
      
      if (fs.existsSync(jsonPath)) {
        console.log(`📥 Restoring ${collectionName}...`);
        
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Clear existing data
        await db.collection(collectionName).deleteMany({});
        
        // Insert backup data
        if (data.length > 0) {
          await db.collection(collectionName).insertMany(data);
        }
        
        console.log(`✅ ${collectionName}: ${data.length} documents restored`);
      }
    }
    
    console.log('🎉 Restore completed successfully!');
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
  } finally {
    await client.close();
  }
}

// Command line interface
const command = process.argv[2];
const backupFolder = process.argv[3];

if (command === 'backup') {
  backupData();
} else if (command === 'restore' && backupFolder) {
  restoreData(backupFolder);
} else {
  console.log('Usage:');
  console.log('  node backup-data.js backup');
  console.log('  node backup-data.js restore <backup-folder-path>');
}
