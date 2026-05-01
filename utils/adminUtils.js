/**
 * Admin utility functions for client-side access control
 */

import { useSession } from 'next-auth/react';

/**
 * Check if the current user has admin role
 * @returns {boolean} True if user is admin
 */
export function useIsAdmin() {
  const { data: session } = useSession();
  return session?.user?.role === 'admin';
}

/**
 * Check if a given user object has admin role
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user is admin
 */
export function isAdmin(user) {
  return user?.role === 'admin';
}

/**
 * Higher-order component that wraps content and only renders it for admins
 * @param {Object} props - Component props
 * @param {boolean} props.isAdmin - Whether current user is admin
 * @param {React.ReactNode} props.children - Content to render for admins
 * @param {React.ReactNode} props.fallback - Optional fallback content for non-admins
 * @returns {React.ReactNode} Rendered content
 */
export function AdminOnly({ isAdmin, children, fallback = null }) {
  return isAdmin ? children : fallback;
}

/**
 * Hook for admin-only content rendering
 * @returns {Object} Admin state and helper component
 */
export function useAdminContent() {
  const isAdmin = useIsAdmin();
  
  return {
    isAdmin,
    AdminOnly: ({ children, fallback = null }) => (
      <AdminOnly isAdmin={isAdmin}>
        {children}
      </AdminOnly>
    )
  };
}
