
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SendFormInputsProps {
  recipient: string;
  setRecipient: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  balance: number;
  loading: boolean;
}

const SendFormInputs = ({
  recipient,
  setRecipient,
  amount,
  setAmount,
  balance,
  loading,
}: SendFormInputsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input
          id="recipient"
          placeholder="Enter Algorand address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (ALGO)</Label>
        <Input
          id="amount"
          type="number"
          step="0.000001"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Available balance: {balance.toFixed(8)} ALGO
        </p>
      </div>
    </>
  );
};

export default SendFormInputs;
