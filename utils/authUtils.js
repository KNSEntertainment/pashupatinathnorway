// Authentication utilities for complete session management

import { signOut } from 'next-auth/react';

/**
 * Complete sign out function that clears all session data
 * @param {string} redirectUrl - URL to redirect to after sign out
 * @param {Function} callback - Optional callback function after sign out
 */
export const completeSignOut = async (redirectUrl = '/', callback) => {
  try {
    // Sign out from NextAuth (clears cookies and session)
    await signOut({ 
      redirect: false,
      callbackUrl: redirectUrl
    });

    // Clear all client-side storage
    if (typeof window !== 'undefined') {
      // Clear session storage
      sessionStorage.clear();
      
      // Clear local storage
      localStorage.clear();
      
      // Clear any cookies that might be set manually
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }

    // Execute callback if provided
    if (callback && typeof callback === 'function') {
      await callback();
    }

    // Force redirect to ensure clean state
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  } catch (error) {
    console.error('Error during sign out:', error);
    // Fallback redirect in case of error
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('next-auth.session-token') || 
           localStorage.getItem('next-auth.session-token') ||
           document.cookie.includes('next-auth.session-token');
  }
  return false;
};

/**
 * Clear all authentication-related data without signing out
 * Useful for debugging or forced session cleanup
 */
export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
    localStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }
};
