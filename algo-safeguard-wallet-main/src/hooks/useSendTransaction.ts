
import { useState } from 'react';
import { sendTransaction } from '@/lib/transactions';
import { toast } from 'sonner';
import { Transaction } from '@/lib/types';
import { logTransactions } from '@/lib/transaction-logging';
import { logBalanceChange } from '@/lib/balance-tracking';

export const useSendTransaction = (fetchWalletInfo: () => Promise<any>, fetchTransactions: () => Promise<any>) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendTransaction = async (to: string, amount: number, note?: string): Promise<Transaction> => {
    setIsLoading(true);
    try {
      // Get the current balance before sending
      const walletInfoBefore = await fetchWalletInfo();
      const balanceBefore = walletInfoBefore?.balance || 0;
      
      // Send the transaction
      const txResponse = await sendTransaction(to, amount, note);
      
      // Get the updated balance after sending
      const walletInfoAfter = await fetchWalletInfo();
      
      // Log the balance change if there is one
      if (walletInfoAfter && walletInfoBefore && walletInfoAfter.balance !== balanceBefore) {
        await logBalanceChange(
          { address: walletInfoAfter.address, balance: walletInfoAfter.balance },
          balanceBefore,
          'send_transaction'
        );
      }
      
      // Log the transaction to our history
      if (walletInfoAfter?.address) {
        await logTransactions([txResponse], walletInfoAfter.address);
      }
      
      // Update transaction list
      await fetchTransactions();
      
      toast.success("Transaction sent successfully!");
      return txResponse;
    } catch (error) {
      console.error('Error sending transaction:', error);
      let errorMessage = "Failed to send transaction. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to complete this transaction.";
        } else if (error.message.includes("invalid address")) {
          errorMessage = "Invalid recipient address. Please check and try again.";
        }
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendTransaction
  };
};
