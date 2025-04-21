
import React from 'react';
import { motion } from 'framer-motion';
import SendForm from '@/components/SendForm';

// This component is kept for backward compatibility but is no longer used in the Dashboard
// The send functionality has been moved to the WithdrawDialog
const SendFormSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="hidden" // Hide this component as it's now replaced by the WithdrawDialog
    >
      <SendForm />
    </motion.div>
  );
};

export default SendFormSection;
