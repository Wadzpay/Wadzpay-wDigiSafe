
import React from 'react';
import { IndianRupee } from 'lucide-react';
import { Asset } from '@/types/asset';

export const createAssetDefinitions = (
  algoBalance: number,
  inrValue: number | null
): Asset[] => {
  return [
    {
      id: 'algo',
      name: 'Algorand',
      symbol: 'ALGO',
      icon: (
        <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-700">
          <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor">
            <path d="M22.5 23.5H18l-5.4-9h-2.2v3.5h3.5v5.5h-9v-5.5h2v-14h2v-4h5l5.4 9h2.2v-3.5h-3.5v-5.5h9v5.5h-2v14h-2z"/>
          </svg>
        </div>
      ),
      balance: algoBalance,
      enabled: true,
      decimals: 6
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDCa',
      icon: (
        <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-700">
          <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor">
            <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm0 2.327C8.45 2.327 2.326 8.45 2.326 16c0 7.55 6.124 13.673 13.674 13.673 7.55 0 13.674-6.123 13.674-13.673 0-7.55-6.124-13.673-13.674-13.673zm3.542 7.583c2.081 0 3.797 1.681 3.797 3.814 0 2.134-1.716 3.814-3.797 3.814a3.766 3.766 0 01-3.31-1.954h-1.406C11.697 17.42 9.86 19.17 7.64 19.17c-2.08 0-3.797-1.68-3.797-3.814 0-2.133 1.717-3.814 3.798-3.814 2.22 0 4.056 1.75 4.887 3.585h1.406a3.766 3.766 0 013.31-1.954v-.001h1.148v1.58h-1.148c-1.207 0-2.194 1.06-2.194 2.369s.987 2.37 2.194 2.37c1.208 0 2.195-1.061 2.195-2.37 0-.35-.071-.676-.2-.975h1.773c.07.317.102.646.102.975 0 2.133-1.716 3.814-3.796 3.814-2.08 0-3.797-1.681-3.797-3.814 0-.001 0-.002 0-.003h-1.723s0 .002 0 .003c0 .35-.07.677-.2.975H9.414a3.063 3.063 0 01-.2-.975c0-1.308.987-2.369 2.194-2.369 1.208 0 2.194 1.06 2.194 2.37 0 .35-.071.676-.199.975h1.773c.07-.317.103-.646.103-.975 0-.001 0-.002 0-.003h1.723s0 .002 0 .003c0 2.133-1.717 3.814-3.797 3.814-2.081 0-3.797-1.681-3.797-3.814 0-2.134 1.716-3.814 3.797-3.814h1.148v1.58h-1.148c-1.207 0-2.194 1.06-2.194 2.369 0 .329.072.643.2.935h1.406a3.766 3.766 0 013.31-1.954c2.081 0 3.797 1.68 3.797 3.814 0 2.133-1.716 3.814-3.796 3.814-2.081 0-3.797-1.681-3.797-3.814 0-.001 0-.002 0-.003h-1.723s0 .002 0 .003c0 2.133-1.717 3.814-3.797 3.814-2.081 0-3.797-1.681-3.797-3.814 0-2.134 1.716-3.814 3.797-3.814 2.22 0 4.056 1.75 4.886 3.585h1.407a3.766 3.766 0 013.31-1.954h1.147v1.58h-1.147c-1.208 0-2.195 1.06-2.195 2.369s.987 2.369 2.195 2.369c1.207 0 2.194-1.06 2.194-2.369 0-.35-.072-.676-.2-.975h1.774c.07.317.102.646.102.975 0 2.133-1.717 3.814-3.797 3.814-2.08 0-3.797-1.681-3.797-3.814 0-.001 0-.002 0-.003h-1.723s0 .002 0 .003c0 .35-.07.677-.2.975H9.414a3.063 3.063 0 01-.2-.975c0-1.308.987-2.369 2.194-2.369 1.208 0 2.194 1.06 2.194 2.37 0 .35-.071.676-.199.975h1.773c.07-.317.103-.646.103-.975 0-.001 0-.002 0-.003h1.723s0 .002 0 .003c0 2.133-1.717 3.814-3.797 3.814z" />
          </svg>
        </div>
      ),
      balance: 0,
      enabled: false,
      decimals: 6
    },
    {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDTa',
      icon: (
        <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center text-green-700">
          <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor">
            <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm0 7.5c-5.068 0-9.189 1.074-9.189 2.398 0 .364 0 2.043 0 2.043 0 1.317 4.05 2.384 9.048 2.398v3.946h-3.13v6.126h6.306v-6.126h-3.13V14.34c5.027 0 9.152-1.06 9.152-2.398V9.897c0-1.324-4.121-2.398-9.189-2.398h.132zm0 .765c4.386 0 7.945.683 7.945 1.526s-3.559 1.526-7.945 1.526c-4.386 0-7.945-.683-7.945-1.526S11.614 8.265 16 8.265z" />
          </svg>
        </div>
      ),
      balance: 0,
      enabled: false,
      decimals: 6
    },
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTCa',
      icon: (
        <div className="bg-orange-100 w-8 h-8 rounded-full flex items-center justify-center text-orange-700">
          <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor">
            <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm4.5 8h-4.663v11.027c-2.018-.128-3.532-.822-3.532-1.66 0-.628.914-1.178 2.318-1.458v-2.414c-2.927.456-4.854 1.606-4.854 2.944 0 1.494 2.367 2.75 5.642 3.044.05.013.101.026.152.039v-2.566h2.492c.607 0 1.076-.527 1.076-1.12V13.38h1.056V11.3h-1.056v-1.677h2.37V8h-.001z"/>
          </svg>
        </div>
      ),
      balance: 0,
      enabled: false,
      decimals: 8
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETHa',
      icon: (
        <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center text-purple-700">
          <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor">
            <g clipRule="evenodd" fillRule="evenodd">
              <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0z"/>
              <path d="M16.498 4v8.87l7.497 3.35z" fill="currentColor" fillOpacity=".4"/>
              <path d="M16.498 4L9 16.22l7.498-3.35z" fill="currentColor" fillOpacity=".6"/>
              <path d="M16.498 21.968v6.027L24 17.616z" fill="currentColor" fillOpacity=".4"/>
              <path d="M16.498 27.995v-6.028L9 17.616z" fill="currentColor" fillOpacity=".6"/>
              <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="currentColor" fillOpacity=".2"/>
              <path d="M9 16.22l7.498 4.353v-7.701z" fill="currentColor" fillOpacity=".3"/>
            </g>
          </svg>
        </div>
      ),
      balance: 0,
      enabled: false,
      decimals: 18
    },
    {
      id: 'inr',
      name: 'Indian Rupee',
      symbol: 'INR',
      icon: (
        <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center text-red-700">
          <IndianRupee size={16} />
        </div>
      ),
      balance: inrValue || 0,
      enabled: false,
      decimals: 2
    }
  ];
};
