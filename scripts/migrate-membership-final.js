// Simple migration script that uses existing API endpoints
// This avoids MongoDB connection issues by using your existing API

async function migrateMembershipFields() {
  try {
    console.log('Starting migration via API endpoints...');
    
    // First, get all existing memberships via GET endpoint
    const getResponse = await fetch('http://localhost:3000/api/membership');
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch memberships: ${getResponse.status}`);
    }
    
    const memberships = await getResponse.json();
    console.log(`Found ${memberships.length} existing membership documents`);
    
    // Update each document via PUT endpoint
    let successCount = 0;
    let errorCount = 0;
    
    for (const membership of memberships) {
      try {
        const updateData = {
          // Add new fields with default values if they don't exist
          province: membership.province || membership.addressNepal?.province || '',
          district: membership.district || membership.addressNepal?.district || '',
          profession: membership.occupation || '',
          skills: membership.skillsExpertise || '',
          volunteerInterest: membership.areasOfInterests || [],
          membershipType: membership.membershipType || 'general',
          membershipStatus: membership.membershipStatus || 'pending',
          // Keep existing fields
        };
        
        const response = await fetch(`http://localhost:3000/api/membership/${membership._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (response.ok) {
          successCount++;
          console.log(`✓ Updated membership ${membership._id} successfully`);
        } else {
          errorCount++;
          console.error(`✗ Failed to update membership ${membership._id}:`, await response.text());
        }
        
        // Add delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        errorCount++;
        console.error(`✗ Error updating membership ${membership._id}:`, error.message);
      }
    }
    
    console.log(`\nMigration completed!`);
    console.log(`✓ Successfully updated: ${successCount} documents`);
    console.log(`✗ Failed to update: ${errorCount} documents`);
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Run migration
migrateMembershipFields().catch(console.error);
