
import { toast } from 'sonner';

export const useBalanceUpdates = (balance: number, setBalance: (newBalance: number) => void) => {
  const handleBalanceUpdate = async (newBalance: number) => {
    // Skip if no change
    if (newBalance === balance) {
      return;
    }
    
    // Show appropriate toast based on balance change
    if (newBalance > balance) {
      toast.success(`Received new ALGO deposit! Balance updated to ${newBalance.toFixed(8)} ALGO.`);
    } else if (newBalance < balance) {
      toast.info(`Balance decreased to ${newBalance.toFixed(8)} ALGO.`);
    }
    
    // Update the balance state
    setBalance(newBalance);
  };

  return {
    handleBalanceUpdate
  };
};
