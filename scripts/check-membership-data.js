// Check current state of membership documents
async function checkMembershipData() {
  try {
    console.log('Checking current membership data...');
    
    // Get all memberships via API
    const getResponse = await fetch('http://localhost:3000/api/membership');
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch memberships: ${getResponse.status}`);
    }
    
    const memberships = await getResponse.json();
    console.log(`Found ${memberships.length} membership documents`);
    
    // Check each document for permission fields
    memberships.forEach((membership, index) => {
      console.log(`\n--- Membership ${index + 1} ---`);
      console.log('ID:', membership._id);
      console.log('Email:', membership.email);
      console.log('Name:', membership.fullName);
      console.log('Has permissionPhotos:', 'permissionPhotos' in membership);
      console.log('Has permissionPhone:', 'permissionPhone' in membership);
      console.log('Has permissionEmail:', 'permissionEmail' in membership);
      
      if ('permissionPhotos' in membership) {
        console.log('permissionPhotos value:', membership.permissionPhotos);
      }
      if ('permissionPhone' in membership) {
        console.log('permissionPhone value:', membership.permissionPhone);
      }
      if ('permissionEmail' in membership) {
        console.log('permissionEmail value:', membership.permissionEmail);
      }
      
      // Show all available fields
      console.log('Available fields:', Object.keys(membership));
    });
    
  } catch (error) {
    console.error('Error checking membership data:', error);
  }
}

// Run check
checkMembershipData().catch(console.error);
