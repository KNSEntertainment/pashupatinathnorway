// Debug script to test About Us API
const testAboutUsAPI = async () => {
  console.log('=== Testing About Us API ===');
  
  try {
    // Test basic API
    console.log('\n1. Testing basic API...');
    const basicResponse = await fetch('http://localhost:3000/api/about-us');
    const basicData = await basicResponse.json();
    console.log('Basic API Status:', basicResponse.status);
    console.log('Basic Data Keys:', Object.keys(basicData));
    console.log('Title:', basicData.title);
    
    // Test edit API
    console.log('\n2. Testing edit API...');
    const editResponse = await fetch('http://localhost:3000/api/about-us?edit=true');
    const editData = await editResponse.json();
    console.log('Edit API Status:', editResponse.status);
    console.log('Edit Data Keys:', Object.keys(editData));
    console.log('Title (EN):', editData.title?.en);
    console.log('Title (NO):', editData.title?.no);
    
    // Test localized API
    console.log('\n3. Testing localized API...');
    const locales = ['en', 'no', 'ne'];
    for (const locale of locales) {
      const localeResponse = await fetch(`http://localhost:3000/api/about-us?locale=${locale}`);
      const localeData = await localeResponse.json();
      console.log(`${locale.toUpperCase()} Title:`, localeData.title);
      console.log(`${locale.toUpperCase()} Subtitle:`, localeData.subtitle);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the test
testAboutUsAPI();
