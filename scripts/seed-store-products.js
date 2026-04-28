const mongoose = require('mongoose');
const Product = require('../models/Product.Model');

// Sample products for testing
const sampleProducts = [
  // Digital Products
  {
    name: {
      en: "Digital Puja Guide",
      ne: "डिजिटल पूजा गाइड",
      no: "Digital Puja Guide"
    },
    description: {
      en: "Complete guide for performing daily puja rituals at home with step-by-step instructions and videos.",
      ne: "घरमा दैनिक पूजा गर्ने पूर्ण गाइड, चरण-चरण निर्देशन र भिडियोहरू सहित।",
      no: "Komplett guide for utførelse av daglige puja-ritualer hjemme med steg-for-steg-instruksjoner og videoer."
    },
    price: 299,
    currency: "NOK",
    category: "product",
    type: "digital",
    imageUrl: "/api/placeholder/400/300",
    images: ["/api/placeholder/400/300", "/api/placeholder/400/301"],
    inStock: true,
    isDigital: true,
    downloadUrl: "https://example.com/puja-guide",
    features: [
      { en: "Step-by-step video tutorials", ne: "चरण-चरण भिडियो ट्युटोरियल", no: "Steg-for-steg video-tutorials" },
      { en: "Printable prayer materials", ne: "प्रिन्ट गर्न मिल्ने प्रार्थना सामग्री", no: "Utskrivningsvennlige bønnematerialer" },
      { en: "Audio mantras", ne: "अडियो मन्त्रहरू", no: "Lyd-mantraer" }
    ],
    tags: ["digital", "puja", "guide", "beginner"],
    isActive: true
  },
  {
    name: {
      en: "Bhagavad Gita E-book",
      ne: "भगवद्गीता ई-बुक",
      no: "Bhagavad Gita E-bok"
    },
    description: {
      en: "Digital version of Bhagavad Gita with translations in English, Nepali, and Norwegian.",
      ne: "अंग्रेजी, नेपाली र नर्वेजियनमा अनुवादसहित भगवद्गीताको डिजिटल संस्करण।",
      no: "Digital versjon av Bhagavad Gita med oversettelser på engelsk, nepalsk og norsk."
    },
    price: 199,
    currency: "NOK",
    category: "product",
    type: "book",
    imageUrl: "/api/placeholder/400/302",
    images: ["/api/placeholder/400/302"],
    inStock: true,
    isDigital: true,
    downloadUrl: "https://example.com/bhagavad-gita",
    features: [
      { en: "Multi-language translations", ne: "बहु-भाषा अनुवाद", no: "Flerspråklige oversettelser" },
      { en: "Searchable text", ne: "खोज्न मिल्ने पाठ", no: "Søkbar tekst" },
      { en: "Commentary by scholars", ne: "विद्वानहरूको टिप्पणी", no: "Kommentarer av lærde" }
    ],
    tags: ["digital", "book", "scripture", "spiritual"],
    isActive: true
  },
  
  // Physical Products
  {
    name: {
      en: "Puja Thali Set",
      ne: "पूजा थाली सेट",
      no: "Puja Thali Sett"
    },
    description: {
      en: "Complete puja thali set with all essential items for daily worship including brass diya, incense holder, and containers.",
      ne: "पित्तलको दिया, धूपदान र कन्टेनरहरू सहित दैनिक पूजाका लागि सबै आवश्यक सामग्रीहरूसहित पूर्ण पूजा थाली सेट।",
      no: "Komplett puja thali-sett med alle essensielle gjenstander for daglig tilbedelse, inkludert messing-diya, røkelsesholder og beholdere."
    },
    price: 899,
    currency: "NOK",
    category: "product",
    type: "ritual-items",
    imageUrl: "/api/placeholder/400/303",
    images: ["/api/placeholder/400/303", "/api/placeholder/400/304", "/api/placeholder/400/305"],
    inStock: true,
    stockQuantity: 25,
    isDigital: false,
    features: [
      { en: "High quality brass materials", ne: "उच्च गुणस्तरका पित्तल सामग्री", no: "Høykvalitets messingmaterialer" },
      { en: "Traditional design", ne: "परम्परागत डिजाइन", no: "Tradisjonelt design" },
      { en: "Includes 7 essential items", ne: "७ आवश्यक सामग्रीहरू समावेश", no: "Inkluderer 7 essensielle gjenstander" }
    ],
    tags: ["physical", "puja", "brass", "ritual"],
    isActive: true
  },
  {
    name: {
      en: "Mala Beads - Rudraksha",
      ne: "माला बीज - रुद्राक्ष",
      no: "Mala-perler - Rudraksha"
    },
    description: {
      en: "Traditional 108-bead rudraksha mala for meditation and japa. Authentic Himalayan rudraksha seeds.",
      ne: "ध्यान र जपका लागि परम्परागत १०८ बीचका रुद्राक्ष माला। प्रामाणिक हिमालयन रुद्राक्ष बीजहरू।",
      no: "Tradisjonell 108-perlers rudraksha mala for meditasjon og japa. Ekte Himalaya-rudraksha-frø."
    },
    price: 599,
    currency: "NOK",
    category: "product",
    type: "meditation",
    imageUrl: "/api/placeholder/400/306",
    images: ["/api/placeholder/400/306", "/api/placeholder/400/307"],
    inStock: true,
    stockQuantity: 50,
    isDigital: false,
    features: [
      { en: "108+1 traditional beads", ne: "१०८+१ परम्परागत बीजहरू", no: "108+1 tradisjonelle perler" },
      { en: "Authentic Himalayan source", ne: "प्रामाणिक हिमालयन स्रोत", no: "Ekte Himalaya-kilde" },
      { en: "Cotton pouch included", ne: "कपडाको थैली समावेश", no: "Cotton-pose inkludert" }
    ],
    tags: ["physical", "meditation", "rudraksha", "spiritual"],
    isActive: true
  },
  
  // Services
  {
    name: {
      en: "Online Puja Service",
      ne: "अनलाइन पूजा सेवा",
      no: "Online Puja-tjeneste"
    },
    description: {
      en: "Professional pandit will perform puja on your behalf for specific occasions. Live streaming available.",
      ne: "विशिष्ट अवसरहरूका लागि व्यावसायिक पण्डितले तपाईंको तर्फबाट पूजा गर्नेछन्। लाइभ स्ट्रिमिङ उपलब्ध।",
      no: "Profesjonell pandit vil utføre puja på dine vegne for spesifikke anledninger. Direktestrømming tilgjengelig."
    },
    price: 1500,
    currency: "NOK",
    category: "service",
    type: "puja-service",
    imageUrl: "/api/placeholder/400/308",
    images: ["/api/placeholder/400/308", "/api/placeholder/400/309"],
    inStock: true,
    isDigital: true,
    features: [
      { en: "Experienced pandits", ne: "अनुभवी पण्डितहरू", no: "Erfarne pandits" },
      { en: "Live streaming option", ne: "लाइभ स्ट्रिमिङ विकल्प", no: "Direktestrømmingsvalg" },
      { en: "Prasad delivery", ne: "प्रसाद डेलिभरी", no: "Prasad-levering" }
    ],
    specifications: {
      duration: { en: "2-3 hours", ne: "२-३ घण्टा", no: "2-3 timer" },
      language: { en: "Sanskrit & Local Language", ne: "संस्कृत र स्थानीय भाषा", no: "Sanskrit & Lokalt språk" }
    },
    tags: ["service", "puja", "online", "ceremony"],
    isActive: true
  },
  {
    name: {
      en: "Astrology Consultation",
      ne: "ज्योतिष परामर्श",
      no: "Astrologi-konsultasjon"
    },
    description: {
      en: "Personal astrology consultation with experienced Vedic astrologer. Birth chart analysis and future predictions.",
      ne: "अनुभवी वैदिक ज्योतिषीसँग व्यक्तिगत ज्योतिष परामर्श। जन्म कुण्डली विश्लेषण र भविष्यको भविष्यवाणी।",
      no: "Personlig astrologi-konsultasjon med erfaren vedisk astrolog. Fødselskart-analyse og fremtidsprediksjoner."
    },
    price: 1200,
    currency: "NOK",
    category: "service",
    type: "consultation",
    imageUrl: "/api/placeholder/400/310",
    images: ["/api/placeholder/400/310"],
    inStock: true,
    isDigital: true,
    features: [
      { en: "Detailed birth chart analysis", ne: "विस्तृत जन्म कुण्डली विश्लेषण", no: "Detaljert fødselskart-analyse" },
      { en: "Personalized remedies", ne: "व्यक्तिगत उपायहरू", no: "Personliggjorte rettsmidler" },
      { en: "Follow-up support", ne: "अनुवर्ती समर्थन", no: "Oppfølgingssupport" }
    ],
    specifications: {
      duration: { en: "60 minutes", ne: "६० मिनेट", no: "60 minutter" },
      format: { en: "Video Call", ne: "भिडियो कल", no: "Videosamtale" }
    },
    tags: ["service", "astrology", "consultation", "spiritual"],
    isActive: true
  },
  {
    name: {
      en: "Temple Membership - Annual",
      ne: "मन्दिर सदस्यता - वार्षिक",
      no: "Tempelmedlemskap - Årlig"
    },
    description: {
      en: "Annual temple membership with benefits including free event entry, special puja privileges, and community access.",
      ne: "निःशुल्क कार्यक्रम प्रवेश, विशेष पूजा विशेषाधिकार र समुदाय पहुँचसहित वार्षिक मन्दिर सदस्यता।",
      no: "Årlig tempelmedlemskap med fordeler inkludert gratis arrangementstilgang, spesielle puja-privilegier og samfunnstilgang."
    },
    price: 2500,
    currency: "NOK",
    category: "service",
    type: "membership",
    imageUrl: "/api/placeholder/400/311",
    images: ["/api/placeholder/400/311"],
    inStock: true,
    isDigital: true,
    features: [
      { en: "Free event entry", ne: "निःशुल्क कार्यक्रम प्रवेश", no: "Gratis arrangementstilgang" },
      { en: "Monthly newsletter", ne: "मासिक न्यूजलेटर", no: "Månedlig nyhetsbrev" },
      { en: "Discount on services", ne: "सेवाहरूमा छुट", no: "Rabatt på tjenester" }
    ],
    specifications: {
      validity: { en: "365 days", ne: "३६५ दिन", no: "365 dager" },
      benefits: { en: "10+ benefits", ne: "१०+ लाभहरू", no: "10+ fordeler" }
    },
    tags: ["service", "membership", "community", "annual"],
    isActive: true
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pashupatinath-norway');
    console.log('Connected to MongoDB');

    // Clear existing products (optional - comment out if you want to keep existing products)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully inserted ${insertedProducts.length} products`);

    // Display inserted products
    console.log('\nInserted products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name.en} - ${product.category} (${product.type}) - ${product.price} NOK`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedProducts();
