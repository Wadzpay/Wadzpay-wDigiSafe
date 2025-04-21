
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  light?: boolean;
}

const LoadingSpinner = ({ size = 'md', className, light = false }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div className={cn(
      'inline-block animate-spin-slow rounded-full border-solid',
      light ? 'border-white border-t-transparent' : 'border-algorand-blue border-t-transparent',
      sizeClasses[size],
      className
    )}/>
  );
};

export default LoadingSpinner;
