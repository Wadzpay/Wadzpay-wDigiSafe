
import React, { useState } from 'react';
import { Check, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MnemonicDisplayProps {
  mnemonic: string;
}

const MnemonicDisplay: React.FC<MnemonicDisplayProps> = ({ mnemonic }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      toast.success('Mnemonic phrase copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Important: Save Your Recovery Phrase
        </CardTitle>
        <CardDescription className="text-base">
          This is your wallet recovery phrase. It can be used to recover your wallet if you lose access to your account.
          <strong className="block mt-2 text-foreground">
            Write it down and keep it in a secure location. We don't store this information.
          </strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="p-6 bg-muted rounded-md my-4 border border-muted-foreground/20">
          <p className="text-center font-mono text-lg break-all">{mnemonic}</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
          <p className="font-medium mb-2">⚠️ WARNING:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Never share your recovery phrase with anyone</li>
            <li>Never enter this phrase into any website or app</li>
            <li>Anyone with this phrase can take your funds</li>
            <li>If you lose this phrase, you won't be able to recover your wallet</li>
          </ul>
        </div>
        
        <button 
          className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? 'Copied to clipboard' : 'Copy to clipboard'}
        </button>
      </CardContent>
    </>
  );
};

export default MnemonicDisplay;
