
import { ReactNode } from 'react';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon: ReactNode;
  balance: number;
  enabled: boolean;
  decimals: number;
  network?: string;
  minDeposit?: number;
}
