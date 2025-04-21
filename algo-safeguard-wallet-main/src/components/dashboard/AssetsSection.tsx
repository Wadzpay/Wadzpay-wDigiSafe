
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { useCryptoConversion } from '@/hooks/useCryptoConversion';
import { useWallet } from '@/context/WalletContext';
import DepositDialog from './DepositDialog';
import AssetRow from './AssetRow';
import { createAssetDefinitions } from '@/data/assetDefinitions';
import { Asset } from '@/types/asset';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const AssetsSection = () => {
  const { balance } = useWallet();
  const { inrValue } = useCryptoConversion(balance);
  const [depositOpen, setDepositOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const isMobile = useIsMobile();

  // Create asset definitions
  const assets = createAssetDefinitions(balance, inrValue);

  // Handle deposit button click
  const handleDepositClick = (assetSymbol: string) => {
    const asset = assets.find(a => a.symbol === assetSymbol) || null;
    setSelectedAsset(asset);
    setDepositOpen(true);
  };

  // Handle withdraw button click
  const handleWithdrawClick = (assetSymbol: string) => {
    // For now, just show a toast. This would be expanded in future to handle actual withdrawals
    toast.info(`Withdrawal for ${assetSymbol} will be implemented in a future update.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Assets</span>
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                Testnet
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage your crypto and fiat assets
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isMobile ? "w-[100px]" : "w-[180px]"}>Asset</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  {!isMobile && <TableHead className="text-right">Total</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <AssetRow 
                    key={asset.id} 
                    asset={asset} 
                    inrValue={inrValue} 
                    onDepositClick={handleDepositClick}
                    onWithdrawClick={handleWithdrawClick}
                    isMobile={isMobile}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Deposit Dialog */}
      <DepositDialog 
        open={depositOpen} 
        onOpenChange={setDepositOpen} 
        asset={selectedAsset}
      />
    </motion.div>
  );
};

export default AssetsSection;
