
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useMnemonicHandling = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showMnemonicDialog, setShowMnemonicDialog] = useState<boolean>(false);
  
  // Safely get location, handling the case where we might be outside Router context
  let pathname = '/';
  try {
    // This will throw if outside Router context
    const location = useLocation();
    pathname = location.pathname;
  } catch (error) {
    console.log('Router context not available, defaulting path to "/"');
  }

  const handleMnemonicReceived = (receivedMnemonic: string | null) => {
    if (receivedMnemonic) {
      console.log('Mnemonic received, checking if we should show dialog');
      // Don't show the dialog if we're already on the mnemonic page
      if (pathname === '/mnemonic') {
        console.log('Already on mnemonic page, not showing dialog');
        setMnemonic(receivedMnemonic);
        return;
      }
      
      console.log('Not on mnemonic page, will show dialog');
      setMnemonic(receivedMnemonic);
      setShowMnemonicDialog(true);
    }
  };

  const handleCloseMnemonicDialog = () => {
    setShowMnemonicDialog(false);
    // Clear the mnemonic from memory after dialog is closed
    setTimeout(() => {
      setMnemonic(null);
    }, 500);
  };

  return {
    mnemonic,
    showMnemonicDialog,
    handleMnemonicReceived,
    handleCloseMnemonicDialog
  };
};
