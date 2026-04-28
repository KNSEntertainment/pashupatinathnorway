/**
 * Utility functions for handling member permissions
 */

/**
 * Check if member's photo can be displayed publicly
 * @param {Object} member - Member object with permission fields
 * @returns {boolean} - True if photo can be displayed
 */
export function canDisplayPhoto(member) {
  return member?.permissionPhotos === true;
}

/**
 * Check if member's phone number can be displayed publicly
 * @param {Object} member - Member object with permission fields
 * @returns {boolean} - True if phone can be displayed
 */
export function canDisplayPhone(member) {
  return member?.permissionPhone === true;
}

/**
 * Check if member's email address can be displayed publicly
 * @param {Object} member - Member object with permission fields
 * @returns {boolean} - True if email can be displayed
 */
export function canDisplayEmail(member) {
  return member?.permissionEmail === true;
}

/**
 * Get member's public information based on permissions
 * @param {Object} member - Member object with permission fields
 * @returns {Object} - Public information that can be displayed
 */
export function getPublicMemberInfo(member) {
  const publicInfo = {
    fullName: member.fullName,
    membershipType: member.membershipType,
    membershipStatus: member.membershipStatus,
    profession: member.profession,
    volunteerInterest: member.volunteerInterest,
    skills: member.skills,
    profilePhoto: canDisplayPhoto(member) ? member.profilePhoto : null,
    phone: canDisplayPhone(member) ? member.phone : null,
    email: canDisplayEmail(member) ? member.email : null,
    createdAt: member.createdAt,
  };

  return publicInfo;
}

/**
 * Filter member list based on permission requirements
 * @param {Array} members - Array of member objects
 * @param {Object} requirements - Permission requirements (e.g., { showPhotos: true, showContact: false })
 * @returns {Array} - Filtered member list with appropriate information
 */
export function filterMembersByPermissions(members, requirements = {}) {
  return members.map(member => {
    const publicInfo = getPublicMemberInfo(member);
    
    // Apply additional filtering based on requirements
    if (requirements.showPhotos === false) {
      publicInfo.profilePhoto = null;
    }
    
    if (requirements.showContact === false) {
      publicInfo.phone = null;
      publicInfo.email = null;
    }
    
    return publicInfo;
  });
}
