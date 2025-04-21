import { useCallback } from 'react';

export const useTimezoneConversion = () => {
  const getTimezoneOffset = useCallback((tz: string): number => {
    switch(tz) {
      case 'IST': return 330;
      case 'EST': return -300;
      case 'PST': return -480;
      case 'UTC': 
      default: return 0;
    }
  }, []);

  const isSameDay = useCallback((date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  const toUTCString = useCallback((date: Date, tz: string, isToDate: boolean): string => {
    const tzOffsetMinutes = getTimezoneOffset(tz);
    const userDate = new Date(date.getTime());
    
    if (isToDate) {
      if (isSameDay(userDate, new Date())) {
        // Keep current time if it's today
      } else {
        userDate.setHours(23, 59, 59, 999);
      }
    } else {
      if (isSameDay(new Date(), new Date())) {
        const currentTime = new Date();
        userDate.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), currentTime.getMilliseconds());
      } else {
        userDate.setHours(0, 0, 0, 0);
      }
    }
    
    const utcTime = new Date(
      userDate.getTime() + 
      tzOffsetMinutes * 60 * 1000 - 
      userDate.getTimezoneOffset() * 60 * 1000
    );
    
    console.log(`${isToDate ? 'To' : 'From'} date: ${userDate.toLocaleString()} → UTC: ${utcTime.toISOString()}`);
    return utcTime.toISOString();
  }, [getTimezoneOffset, isSameDay]);

  return {
    toUTCString,
    isSameDay,
    getTimezoneOffset
  };
};
