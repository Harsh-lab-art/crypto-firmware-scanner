import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Link2, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BlockchainLoggerProps {
  analysisId: string;
  filename: string;
  cryptoFunctions: number;
  totalFunctions: number;
}

const BlockchainLogger = ({
  analysisId,
  filename,
  cryptoFunctions,
  totalFunctions,
}: BlockchainLoggerProps) => {
  const {
    account,
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    logAnalysisToBlockchain,
    getBalance,
  } = useWeb3();

  const [balance, setBalance] = useState<string>('0');
  const [isLogging, setIsLogging] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if (isConnected && account) {
      getBalance().then(setBalance);
    }
  }, [isConnected, account, getBalance]);

  const handleLogToBlockchain = async () => {
    setIsLogging(true);
    
    try {
      const result = await logAnalysisToBlockchain(
        analysisId,
        filename,
        cryptoFunctions,
        totalFunctions
      );

      if (result) {
        setTxHash(result.transactionHash);
        setBlockNumber(result.blockNumber);
        
        toast.success('Analysis logged to blockchain successfully!', {
          description: `Transaction: ${result.transactionHash.slice(0, 10)}...`,
        });

        // Store the transaction hash in the database
        const { error: updateError } = await supabase
          .from('firmware_analyses')
          .update({ 
            blockchain_tx_hash: result.transactionHash,
            blockchain_block_number: result.blockNumber,
            blockchain_logged_at: new Date().toISOString()
          })
          .eq('id', analysisId);

        if (updateError) {
          console.error('Error updating analysis with blockchain data:', updateError);
        }
      }
    } catch (error) {
      console.error('Error logging to blockchain:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      80001: 'Mumbai Testnet',
      56: 'BSC',
      97: 'BSC Testnet',
    };
    return chains[chainId] || `Chain ID: ${chainId}`;
  };

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

  return (
    <Card className="p-6 border-l-4 border-l-primary">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Blockchain Logger</h3>
              <p className="text-sm text-muted-foreground">
                Log analysis data to blockchain
              </p>
            </div>
          </div>
          
          {isConnected && (
            <Badge variant="outline" className="bg-confidence-high/10 text-confidence-high border-confidence-high/20">
              <div className="w-2 h-2 bg-confidence-high rounded-full mr-2" />
              Connected
            </Badge>
          )}
        </div>

        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your MetaMask wallet to log firmware analysis data on the blockchain with complete transparency and immutability.
            </p>
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Account:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">{chainId && getChainName(chainId)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium">{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
            </div>

            {txHash ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-confidence-high">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Logged to Blockchain</span>
                </div>
                
                <div className="p-3 bg-confidence-high/10 border border-confidence-high/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Transaction:</span>
                    <a
                      href={getExplorerUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {txHash.slice(0, 10)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {blockNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Block:</span>
                      <span className="font-medium">#{blockNumber}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTxHash(null);
                    setBlockNumber(null);
                  }}
                  className="w-full"
                >
                  Log Another Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleLogToBlockchain}
                  disabled={isLogging}
                  className="w-full"
                >
                  {isLogging ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging to Blockchain...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Log Analysis to Blockchain
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground">
                  This will create a blockchain transaction containing the analysis metadata
                  (ID, filename, function counts, timestamp). Gas fees apply.
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={disconnectWallet}
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BlockchainLogger;
