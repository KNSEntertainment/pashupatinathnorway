#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://harijunkemails:1SSMbNFtQLPQuLWO@hariscluster.fydu0.mongodb.net/pashupatinath';

const defaultRituals = [
  {
    title: { 
      en: "Rudrabhishek", 
      no: "Rudrabhishek", 
      ne: "रुद्राभिषेक" 
    },
    description: { 
      en: "Special offering to Lord Shiva for blessings and protection.",
      no: "Spesielt tilbud til Lord Shiva for velsignelser og beskyttelse.",
      ne: "भगवान शिवलाई आशीर्वाद र सुरक्षाको लागि विशेष अर्पण।"
    },
    features: {
      en: ["Abhishek with sacred waters", "Chanting of powerful mantras", "Divine protection blessings"],
      no: ["Abhishek med hellige vann", "Kanting av kraftfulle mantran", "Guddommelige beskyttelsesvelsignelser"],
      ne: ["पवित्र जलसँग अभिषेक", "शक्तिशाली मन्त्रहरूको जाप", "दिव्य सुरक्षा आशीर्वाद"]
    },
    timing: {
      en: "By appointment",
      no: "Etter avtale",
      ne: "अपोइन्टमेन्ट अनुसार"
    },
    order: 1,
    isActive: true
  },
  {
    title: { 
      en: "Satyanarayan Katha", 
      no: "Satyanarayan Katha", 
      ne: "सत्यनारायण कथा" 
    },
    description: { 
      en: "A ritual for well-being, success, and family harmony.",
      no: "Et ritual for velvære, suksess og familiarmoni.",
      ne: "समृद्धि, सफलता र परिवारिक सद्भावको लागि एक अनुष्ठान।"
    },
    features: {
      en: ["Story of Lord Satyanarayan", "Prasad distribution", "Family blessings"],
      no: ["Historien om Lord Satyanarayan", "Prasad-distribusjon", "Familiens velsignelser"],
      ne: ["भगवान सत्यनारायणको कथा", "प्रसाद वितरण", "परिवारको आशीर्वाद"]
    },
    timing: {
      en: "Weekends & Full Moon Days",
      no: "Helger & Fullmånedsdager",
      ne: "सप्ताहान्त र पूर्णिमाको दिन"
    },
    order: 2,
    isActive: true
  },
  {
    title: { 
      en: "Hawan & Yangya", 
      no: "Hawan & Yangya", 
      ne: "हवन र यज्ञ" 
    },
    description: { 
      en: "Fire rituals for purification and divine blessings.",
      no: "Ild-ritualer for renselse og guddommelige velsignelser.",
      ne: "शुद्धिकरण र दिव्य आशीर्वादको लागि आगुन अनुष्ठानहरू।"
    },
    features: {
      en: ["Sacred fire ceremony", "Offering to divine energies", "Environmental purification"],
      no: ["Hellig ild-seremoni", "Tilbud til guddommelige energier", "Miljømessig renselse"],
      ne: ["पवित्र आगुन समारोह", "दिव्य ऊर्जाहरूमा अर्पण", "वातावरणीय शुद्धिकरण"]
    },
    timing: {
      en: "Special occasions",
      no: "Spesielle anledninger",
      ne: "विशेष अवसरहरू"
    },
    order: 3,
    isActive: true
  }
];

async function restoreDefaultRituals() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('pashupatinath');
    const collection = db.collection('rituals');
    
    // Check existing rituals
    const existingRituals = await collection.find({}).toArray();
    console.log(`📊 Found ${existingRituals.length} existing rituals`);
    
    // Add missing default rituals
    for (const ritual of defaultRituals) {
      const existing = await collection.findOne({ 
        'title.en': ritual.title.en 
      });
      
      if (!existing) {
        console.log(`➕ Adding ritual: ${ritual.title.en}`);
        await collection.insertOne({
          ...ritual,
          isDeleted: false,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        console.log(`✅ Ritual already exists: ${ritual.title.en}`);
      }
    }
    
    // Verify total count
    const totalRituals = await collection.countDocuments();
    console.log(`🎉 Total rituals after restore: ${totalRituals}`);
    
  } catch (error) {
    console.error('❌ Error restoring rituals:', error);
  } finally {
    await client.close();
  }
}

restoreDefaultRituals();
