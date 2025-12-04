import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';

export function useAdminPendingCount(isAdmin: boolean = false) {
  const [pendingCount, setPendingCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const fetchPendingCount = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const response = await adminService.getPendingActionsCount();
      if (response.success) {
        const newCount = response.count;
        setPendingCount(prevCount => {
          if (newCount !== prevCount && newCount > prevCount) {
            // Trigger animation when count increases
            setShouldAnimate(true);
            setTimeout(() => setShouldAnimate(false), 1000);
          }
          return newCount;
        });
      }
    } catch (error) {
      console.error('Error fetching pending actions count:', error);
      // Don't show error to user, just log it
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    fetchPendingCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    
    // Listen for custom events when admin actions are taken
    const handleAdminActionChanged = () => {
      fetchPendingCount();
    };
    
    window.addEventListener('admin-action-changed', handleAdminActionChanged);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('admin-action-changed', handleAdminActionChanged);
    };
  }, [isAdmin, fetchPendingCount]);

  return { pendingCount, shouldAnimate };
}
