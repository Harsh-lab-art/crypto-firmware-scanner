import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Link2, CheckCircle2, ExternalLink, Loader2, Edit2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BrowserProvider } from 'ethers';

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
    contractAddress,
  } = useWeb3();

  const [balance, setBalance] = useState<string>('0');
  const [isLogging, setIsLogging] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAccount, setManualAccount] = useState('');
  const [manualChainId, setManualChainId] = useState<number | null>(null);
  const [isLoadingManual, setIsLoadingManual] = useState(false);

  useEffect(() => {
    if (isConnected && account && !manualMode) {
      getBalance().then(setBalance);
    }
  }, [isConnected, account, getBalance, manualMode]);

  const fetchManualAccountDetails = async () => {
    if (!manualAccount || !manualAccount.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    setIsLoadingManual(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        
        // Get balance
        const balanceWei = await provider.getBalance(manualAccount);
        const balanceEth = (Number(balanceWei) / 1e18).toString();
        setBalance(balanceEth);
        
        // Get network
        const network = await provider.getNetwork();
        setManualChainId(Number(network.chainId));
        
        toast.success('Account details loaded successfully');
      } else {
        toast.error('MetaMask not found. Please install MetaMask.');
      }
    } catch (error: any) {
      console.error('Error fetching account details:', error);
      toast.error('Failed to fetch account details');
    } finally {
      setIsLoadingManual(false);
    }
  };

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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Connect your MetaMask wallet to log firmware analysis data on the blockchain with complete transparency and immutability.
              </p>
              {!contractAddress && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Setup Required
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Configure smart contract address in settings below to enable blockchain logging
                  </p>
                </div>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Account Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setManualMode(!manualMode);
                  if (!manualMode) {
                    setManualAccount('');
                    setManualChainId(null);
                    if (isConnected && account) {
                      getBalance().then(setBalance);
                    }
                  }
                }}
              >
                <Edit2 className="w-3 h-3 mr-1" />
                {manualMode ? 'Use Wallet' : 'Manual Entry'}
              </Button>
            </div>

            {manualMode ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="manual-account">Account Address</Label>
                  <Input
                    id="manual-account"
                    placeholder="0x..."
                    value={manualAccount}
                    onChange={(e) => setManualAccount(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={fetchManualAccountDetails}
                  disabled={isLoadingManual}
                  variant="outline"
                  className="w-full"
                >
                  {isLoadingManual ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Fetch Account Details'
                  )}
                </Button>

                {manualChainId && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {manualAccount?.slice(0, 6)}...{manualAccount?.slice(-4)}
                      </code>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-medium">{getChainName(manualChainId)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="font-medium">{parseFloat(balance).toFixed(4)} ETH</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )}

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
