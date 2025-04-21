
import { getWalletInfo } from "./wallet-info";
import { logBalanceChange } from "./balance-tracking";
import { syncTransactionHistory } from "./transaction-logging";
import { getNewTransactions } from "./transactions";

// Setup wallet websocket connection with improved accuracy and reduced polling
export const setupBalanceWebsocket = (
  onUpdate: (balance: number) => void,
  onNewTransactions: () => void
) => {
  // Store the last known balance to compare with future checks
  let lastKnownBalance: number | null = null;
  let lastWalletAddress: string | null = null;
  
  // Use adaptive polling interval based on user activity
  let pollingInterval = 120000; // Start with 120 seconds (increased from 60)
  let userActive = true;
  let lastActivityTime = Date.now();
  let checkingBalanceInProgress = false;
  
  // Add last balance check timestamp to limit frequency
  let lastBalanceCheckTime = 0;
  const MIN_CHECK_INTERVAL = 25000; // 25 seconds minimum between checks (decreased from 30)
  
  // Add last transaction sync timestamp to limit frequency
  let lastTransactionSyncTime = 0;
  const MIN_TRANSACTION_SYNC_INTERVAL = 120000; // 2 minutes minimum between transaction syncs
  
  // Track user activity
  const trackUserActivity = () => {
    userActive = true;
    lastActivityTime = Date.now();
    
    // Check if minimum interval has elapsed since last check
    const currentTime = Date.now();
    if (currentTime - lastBalanceCheckTime >= MIN_CHECK_INTERVAL) {
      // Immediate balance check on user activity, with debounce
      clearTimeout(activityTimeoutId);
      activityTimeoutId = setTimeout(checkBalanceAfterActivity, 2000); // Increased debounce from 1s to 2s
    }
  };
  
  // Separate function to check balance after activity
  const checkBalanceAfterActivity = async () => {
    if (checkingBalanceInProgress) return;
    
    try {
      const currentTime = Date.now();
      if (currentTime - lastBalanceCheckTime < MIN_CHECK_INTERVAL) {
        console.log(`Skipping balance check - only ${(currentTime - lastBalanceCheckTime)/1000}s since last check (limit: 25s)`);
        return;
      }
      
      checkingBalanceInProgress = true;
      lastBalanceCheckTime = currentTime;
      
      console.log('Checking balance after user activity');
      const response = await getWalletInfo();
      const walletInfo = response.walletInfo;
      const currentBalance = walletInfo.balance;
      const currentAddress = walletInfo.address;
      
      await checkAndUpdateBalance(currentBalance, currentAddress);
    } catch (error) {
      console.error('Error checking balance after user activity:', error);
    } finally {
      checkingBalanceInProgress = false;
    }
  };
  
  let activityTimeoutId: ReturnType<typeof setTimeout>;
  let inactivityTimeoutId: ReturnType<typeof setTimeout>;
  
  // Function to check and update balance
  const checkAndUpdateBalance = async (currentBalance: number, currentAddress: string) => {
    // First time initialization
    if (lastKnownBalance === null || lastWalletAddress !== currentAddress) {
      lastKnownBalance = currentBalance;
      lastWalletAddress = currentAddress;
      return;
    }
    
    // Check if balance has changed
    if (currentBalance !== lastKnownBalance) {
      console.log(`Balance changed: ${lastKnownBalance} → ${currentBalance}`);
      
      // Log the balance change to our database
      if (lastWalletAddress === currentAddress) {
        await logBalanceChange(
          { address: currentAddress, balance: currentBalance },
          lastKnownBalance,
          'websocket_polling'
        );
      }
      
      // Update the balance display
      onUpdate(currentBalance);
      
      // Only sync transactions if enough time has passed since last sync
      const currentTime = Date.now();
      if (currentTime - lastTransactionSyncTime >= MIN_TRANSACTION_SYNC_INTERVAL) {
        console.log('Balance changed, fetching new transactions');
        lastTransactionSyncTime = currentTime;
        
        // Fetch new transactions for any balance change
        onNewTransactions();
        
        // Also sync transactions with our history table
        if (currentAddress) {
          await syncTransactionHistory(currentAddress, getNewTransactions);
        }
      } else {
        console.log(`Skipping transaction sync after balance change - only ${(currentTime - lastTransactionSyncTime)/1000}s since last sync (limit: 120s)`);
      }
      
      // Update the last known balance
      lastKnownBalance = currentBalance;
    }
  };
  
  // Set up event listeners for user activity with throttling
  let lastTrackedActivityTime = 0;
  const ACTIVITY_TRACKING_THROTTLE = 5000; // 5 seconds between activity tracking
  
  const throttledTrackActivity = () => {
    const now = Date.now();
    if (now - lastTrackedActivityTime >= ACTIVITY_TRACKING_THROTTLE) {
      lastTrackedActivityTime = now;
      trackUserActivity();
    }
  };
  
  window.addEventListener('mousemove', throttledTrackActivity);
  window.addEventListener('keypress', throttledTrackActivity);
  window.addEventListener('click', throttledTrackActivity);
  window.addEventListener('scroll', throttledTrackActivity);
  window.addEventListener('touchstart', throttledTrackActivity);
  
  // Set up inactivity detection
  const checkInactivity = () => {
    inactivityTimeoutId = setTimeout(() => {
      if (Date.now() - lastActivityTime > 300000) { // 5 minutes
        userActive = false;
      }
      checkInactivity(); // Set up next check
    }, 300000); // Check every 5 minutes
  };
  
  checkInactivity();
  
  // Set up periodic polling with adaptive interval
  let isPollingInProgress = false;
  
  const pollWalletInfo = async () => {
    if (isPollingInProgress) return;
    
    try {
      const currentTime = Date.now();
      // Skip if not enough time has passed since the last check
      if (currentTime - lastBalanceCheckTime < MIN_CHECK_INTERVAL) {
        console.log(`Skipping balance poll - only ${(currentTime - lastBalanceCheckTime)/1000}s since last check (limit: 25s)`);
        setTimeout(pollWalletInfo, MIN_CHECK_INTERVAL);
        return;
      }
      
      isPollingInProgress = true;
      lastBalanceCheckTime = currentTime;
      
      // Adjust polling interval based on user activity
      pollingInterval = userActive ? 120000 : 300000; // 2 minutes if active, 5 minutes if inactive (increased from 1/2 minutes)
      
      const response = await getWalletInfo();
      const walletInfo = response.walletInfo;
      const currentBalance = walletInfo.balance;
      const currentAddress = walletInfo.address;
      
      await checkAndUpdateBalance(currentBalance, currentAddress);
    } catch (error) {
      console.error('Error polling balance updates:', error);
    } finally {
      isPollingInProgress = false;
      // Schedule next poll
      setTimeout(pollWalletInfo, pollingInterval);
    }
  };
  
  // Start initial polling with a random delay to prevent all clients polling at the same time
  setTimeout(pollWalletInfo, Math.random() * 10000 + pollingInterval);
  
  // Return cleanup function
  return () => {
    clearTimeout(activityTimeoutId);
    clearTimeout(inactivityTimeoutId);
    window.removeEventListener('mousemove', throttledTrackActivity);
    window.removeEventListener('keypress', throttledTrackActivity);
    window.removeEventListener('click', throttledTrackActivity);
    window.removeEventListener('scroll', throttledTrackActivity);
    window.removeEventListener('touchstart', throttledTrackActivity);
  };
};
