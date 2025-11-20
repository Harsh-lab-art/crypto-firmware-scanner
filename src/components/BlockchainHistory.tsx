import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, ExternalLink, RefreshCw, Loader2, FileText, Shield, Database } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface BlockchainTransaction {
  id: string;
  filename: string;
  cryptoFunctions: number;
  totalFunctions: number;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  analysisId: string;
}

const BlockchainHistory = () => {
  const { account, chainId, isConnected } = useWeb3();
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactionHistory = async () => {
    if (!account || !isConnected) return;

    setIsLoading(true);
    try {
      // Fetch analyses with blockchain transactions from the database
      const { data, error } = await supabase
        .from('firmware_analyses')
        .select('*')
        .not('blockchain_tx_hash', 'is', null)
        .order('blockchain_logged_at', { ascending: false });

      if (error) throw error;

      const txData: BlockchainTransaction[] = (data || []).map((analysis) => ({
        id: analysis.id,
        filename: analysis.filename,
        cryptoFunctions: analysis.crypto_functions || 0,
        totalFunctions: analysis.total_functions || 0,
        txHash: analysis.blockchain_tx_hash!,
        blockNumber: analysis.blockchain_block_number || 0,
        timestamp: new Date(analysis.blockchain_logged_at || analysis.created_at),
        analysisId: analysis.id,
      }));

      setTransactions(txData);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      toast.error('Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchTransactionHistory();
    } else {
      setTransactions([]);
    }
  }, [isConnected, account]);

  const getExplorerUrl = (txHash: string) => {
    if (!chainId) return '#';
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      5: 'https://goerli.etherscan.io/tx/',
      11155111: 'https://sepolia.etherscan.io/tx/',
      137: 'https://polygonscan.com/tx/',
      80001: 'https://mumbai.polygonscan.com/tx/',
      56: 'https://bscscan.com/tx/',
      97: 'https://testnet.bscscan.com/tx/',
    };
    
    return (explorers[chainId] || '#') + txHash;
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
      56: 'BSC',
      97: 'BSC Testnet',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <History className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Transaction History</h3>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view blockchain transaction history
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Transaction History</h3>
              <p className="text-sm text-muted-foreground">
                {transactions.length} analyses logged on-chain
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactionHistory}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No blockchain transactions found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Log your first analysis to the blockchain to see it here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{tx.filename}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {chainId && getChainName(chainId)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-crypto" />
                      <div>
                        <p className="text-xs text-muted-foreground">Crypto Functions</p>
                        <p className="text-sm font-medium text-crypto">{tx.cryptoFunctions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3 text-non-crypto" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Functions</p>
                        <p className="text-sm font-medium text-non-crypto">{tx.totalFunctions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Transaction Hash:</span>
                      <a
                        href={getExplorerUrl(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Block Number:</span>
                      <span className="text-xs font-medium">#{tx.blockNumber}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Logged:</span>
                      <span className="text-xs font-medium">
                        {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-confidence-high rounded-full" />
            <span>
              All transactions are permanently stored on the blockchain
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BlockchainHistory;
