
import { useState, useEffect, useCallback, useRef } from 'react';

export const useUserActivity = () => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [hasNewActivity, setHasNewActivity] = useState<boolean>(false);
  
  // Use ref to prevent dependency changes triggering useEffect loops
  const lastActivityRef = useRef<number>(Date.now());
  
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  
  const handleActivity = useCallback(() => {
    setIsActive(true);
    const now = Date.now();
    lastActivityRef.current = now;
    setLastActivity(now);
    setHasNewActivity(true);
  }, []);
  
  useEffect(() => {
    // Set up activity tracking
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    
    // Set up inactivity detection
    const checkActivity = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > INACTIVITY_TIMEOUT) {
        setIsActive(false);
      }
    }, 60000); // Check every minute
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(checkActivity);
    };
  }, [handleActivity, INACTIVITY_TIMEOUT]);
  
  // Reset hasNewActivity flag after it's been consumed
  const resetNewActivity = useCallback(() => {
    setHasNewActivity(false);
  }, []);
  
  return { 
    isActive, 
    lastActivity, 
    hasNewActivity, 
    resetNewActivity 
  };
};
