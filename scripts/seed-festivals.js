const mongoose = require('mongoose');
const Festivals = require('../models/Festivals.Model');

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

// Festivals data from translations
const festivalsData = [
  {
    title: {
      en: "Maha Shivaratri",
      no: "Maha Shivaratri",
      ne: "महा शिवरात्रि"
    },
    description: {
      en: "A grand celebration of Lord Shiva with night-long prayers and rituals. Annual General Meeting will be arranged on this occasion.",
      no: "En stor feiring av Lord Shiva med nattlange bønner og ritualer. Årsmøte vil bli arrangert i denne anledningen.",
      ne: "भगवान शिवको ठूलो उत्सव रातभरि प्रार्थना र अनुष्ठानहरूसहित। यस अवसरमा वार्षिक साधारण बैठक आयोजना गरिनेछ।"
    },
    icon: "Star",
    features: {
      en: ["Night-long prayers and meditation", "Sacred Shiva lingam abhishek", "Annual General Meeting"],
      no: ["Nattlange bønner og meditasjon", "Hellig Shiva lingam abhishek", "Årsmøte"],
      ne: ["रातभरि प्रार्थना र ध्यान", "पवित्र शिव लिङ्ग अभिषेक", "वार्षिक साधारण बैठक"]
    },
    timing: {
      en: "February/March annually",
      no: "Februar/mars årlig",
      ne: "फेब्रुअरी/मार्च वार्षिक"
    },
    highlight: true,
    order: 0,
    isActive: true
  },
  {
    title: {
      en: "Teej",
      no: "Teej",
      ne: "तीज"
    },
    description: {
      en: "Celebrations of devotion, family, and the triumph of good over evil.",
      no: "Feiringer av fromhet, familie, og triumfen av godt over ondt.",
      ne: "भक्ति, परिवार, र असललाई बुरामाथि विजयको उत्सव।"
    },
    icon: "Heart",
    features: {
      en: ["Women's fasting and prayers", "Traditional dances and songs", "Family gatherings and blessings"],
      no: ["Kvinners faste og bønner", "Tradisjonelle danser og sanger", "Familiesamlinger og velsignelser"],
      ne: ["महिलाहरूको उपवास र प्रार्थना", "परम्परागत नृत्य र गीतहरू", "परिवारिक भेटघाट र आशीर्वाद"]
    },
    timing: {
      en: "August/September annually",
      no: "August/september årlig",
      ne: "अगस्ट/सेप्टेम्बर वार्षिक"
    },
    highlight: false,
    order: 1,
    isActive: true
  },
  {
    title: {
      en: "Dashain & Tihar",
      no: "Dashain & Tihar",
      ne: "दशैं र तिहार"
    },
    description: {
      en: "The Festival of Lights, celebrating victory and new beginnings.",
      no: "Lysenes festival, feirer seier og nye begynnelser.",
      ne: "उज्यालोको चाड, विजय र नयाँ सुरुवातको उत्सव।"
    },
    icon: "Sparkles",
    features: {
      en: ["Tika blessings and family reunions", "Diyo lighting and decorations", "Traditional feasts and celebrations"],
      no: ["Tika velsignelser og familiesammenkomster", "Diyo belysning og dekorasjoner", "Tradisjonelle fester og feiringer"],
      ne: ["टीका आशीर्वाद र परिवारिक पुनर्मिलन", "दियो बाल्ने र सजावट", "परम्परागत भोज र उत्सव"]
    },
    timing: {
      en: "October annually",
      no: "Oktober årlig",
      ne: "अक्टोबर वार्षिक"
    },
    highlight: false,
    order: 2,
    isActive: true
  },
  {
    title: {
      en: "Holi",
      no: "Holi",
      ne: "होली"
    },
    description: {
      en: "The colorful festival of love, unity, and joy.",
      no: "Den fargerike festivalen av kjærlighet, enhet og glede.",
      ne: "प्रेम, एकता र खुशीको रंगीन चाड।"
    },
    icon: "PartyPopper",
    features: {
      en: ["Colorful powders and water play", "Traditional sweets and music", "Community celebration and joy"],
      no: ["Fargerike pulvere og vannlek", "Tradisjonelle søtsaker og musikk", "Samfunnsfeiring og glede"],
      ne: ["रंगीन पाउडर र पानी खेल", "परम्परागत मिठाई र संगीत", "सामुदायिक उत्सव र खुशी"]
    },
    timing: {
      en: "March annually",
      no: "Mars årlig",
      ne: "मार्च वार्षिक"
    },
    highlight: false,
    order: 3,
    isActive: true
  }
];

// Seed festivals
const seedFestivals = async () => {
  try {
    console.log('Starting to seed festivals...');
    
    // Clear existing festivals
    await Festivals.deleteMany({});
    console.log('Cleared existing festivals');
    
    // Insert new festivals
    const insertedFestivals = await Festivals.insertMany(festivalsData);
    console.log(`Successfully inserted ${insertedFestivals.length} festivals`);
    
    // Log inserted festivals
    insertedFestivals.forEach((festival, index) => {
      console.log(`${index + 1}. ${festival.title.en} (${festival.title.no} / ${festival.title.ne})`);
    });
    
    console.log('Festivals seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding festivals:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the seed function
const main = async () => {
  await connectDB();
  await seedFestivals();
  process.exit(0);
};

main();
