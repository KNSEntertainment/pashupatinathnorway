const mongoose = require('mongoose');
const Rituals = require('../models/Rituals.Model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pashupatinath-norway';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Rituals data from translations
const ritualsData = [
  {
    title: {
      en: "Daily Puja & Aarti",
      no: "Daglig Puja & Aarti",
      ne: "दैनिक पूजा र आरती"
    },
    description: {
      en: "Worship and prayers for peace and prosperity.",
      no: "Tilbeding og bønner for fred og velstand.",
      ne: "शान्ति र समृद्धिको लागि पूजा र प्रार्थना।"
    },
    icon: "Building",
    features: {
      en: ["Morning and evening prayers", "Sacred fire ceremony", "Blessings for devotees"],
      no: ["Morgen- og kveldsbønner", "Hellig ild-seremoni", "Velsignelser for tilbedere"],
      ne: ["बिहान र बेलुकीको प्रार्थना", "पवित्र आगुन समारोह", "भक्तहरूको लागि आशीर्वाद"]
    },
    timing: {
      en: "Daily: 6:00 AM & 6:00 PM",
      no: "Daglig: 06:00 & 18:00",
      ne: "दैनिक: बिहान ६:०० र बेलुका ६:००"
    },
    order: 0,
    isActive: true
  },
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
    icon: "Flame",
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
    icon: "Heart",
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
    icon: "Sparkles",
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

// Seed rituals
const seedRituals = async () => {
  try {
    console.log('Starting to seed rituals...');
    
    // Clear existing rituals
    await Rituals.deleteMany({});
    console.log('Cleared existing rituals');
    
    // Insert new rituals
    const insertedRituals = await Rituals.insertMany(ritualsData);
    console.log(`Successfully inserted ${insertedRituals.length} rituals`);
    
    // Log inserted rituals
    insertedRituals.forEach((ritual, index) => {
      console.log(`${index + 1}. ${ritual.title.en} (${ritual.title.no} / ${ritual.title.ne})`);
    });
    
    console.log('Rituals seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding rituals:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the seed function
const main = async () => {
  await connectDB();
  await seedRituals();
  process.exit(0);
};

main();
