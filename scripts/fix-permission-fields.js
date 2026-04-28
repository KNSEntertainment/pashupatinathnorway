// Fix permission fields by preserving existing values
async function fixPermissionFields() {
  try {
    console.log('Fixing permission fields...');
    
    // Get all memberships via API
    const getResponse = await fetch('http://localhost:3000/api/membership');
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch memberships: ${getResponse.status}`);
    }
    
    const memberships = await getResponse.json();
    console.log(`Found ${memberships.length} membership documents`);
    
    let fixCount = 0;
    let errorCount = 0;
    
    // Update each document, preserving existing permission values
    for (const membership of memberships) {
      try {
        const updateData = {
          // Preserve existing permission values if they exist
          permissionPhotos: membership.permissionPhotos !== undefined ? membership.permissionPhotos : false,
          permissionPhone: membership.permissionPhone !== undefined ? membership.permissionPhone : false,
          permissionEmail: membership.permissionEmail !== undefined ? membership.permissionEmail : false,
        };
        
        const response = await fetch(`http://localhost:3000/api/membership/${membership._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (response.ok) {
          fixCount++;
          console.log(`✓ Fixed permission fields for membership ${membership._id}`);
          console.log(`  permissionPhotos: ${updateData.permissionPhotos}`);
          console.log(`  permissionPhone: ${updateData.permissionPhone}`);
          console.log(`  permissionEmail: ${updateData.permissionEmail}`);
        } else {
          errorCount++;
          console.error(`✗ Failed to fix membership ${membership._id}:`, await response.text());
        }
        
        // Add delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        errorCount++;
        console.error(`✗ Error fixing membership ${membership._id}:`, error.message);
      }
    }
    
    console.log(`\nPermission field fix completed!`);
    console.log(`✓ Successfully fixed: ${fixCount} documents`);
    console.log(`✗ Failed to fix: ${errorCount} documents`);
    
  } catch (error) {
    console.error('Fix error:', error);
    throw error;
  }
}

// Run fix
fixPermissionFields().catch(console.error);
