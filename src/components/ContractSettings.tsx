import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const ContractSettings = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load saved contract address from localStorage
    const saved = localStorage.getItem('contractAddress');
    if (saved) {
      setContractAddress(saved);
      setIsValid(isValidAddress(saved));
      setIsSaved(true);
    } else {
      // Check for env variable
      const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (envAddress) {
        setContractAddress(envAddress);
        setIsValid(isValidAddress(envAddress));
        setIsSaved(true);
      }
    }
  }, []);

  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddressChange = (value: string) => {
    setContractAddress(value);
    setIsValid(isValidAddress(value));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!isValid) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    localStorage.setItem('contractAddress', contractAddress);
    setIsSaved(true);
    toast.success('Contract address saved successfully');
  };

  const handleClear = () => {
    localStorage.removeItem('contractAddress');
    setContractAddress('');
    setIsValid(false);
    setIsSaved(false);
    toast.info('Contract address cleared');
  };

  const getExplorerUrl = () => {
    // Default to Sepolia if no specific chain is detected
    return `https://sepolia.etherscan.io/address/${contractAddress}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Smart Contract Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure your deployed FirmwareAnalysisLogger contract
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract-address">Contract Address</Label>
          <div className="flex gap-2">
            <Input
              id="contract-address"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="font-mono text-sm"
            />
            {isValid && (
              <Badge variant="outline" className="bg-confidence-high/10 text-confidence-high border-confidence-high/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Valid
              </Badge>
            )}
          </div>
          {contractAddress && !isValid && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Invalid Ethereum address format</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaved}
            className="flex-1"
          >
            {isSaved ? 'Saved' : 'Save Contract Address'}
          </Button>
          {isSaved && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        {isValid && (
          <div className="pt-3 border-t border-border space-y-3">
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View contract on Etherscan
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="p-3 bg-muted rounded-lg space-y-2">
              <p className="text-xs font-medium">Contract Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-confidence-high rounded-full" />
                <span className="text-xs text-muted-foreground">
                  Contract configured and ready to use
                </span>
              </div>
            </div>
          </div>
        )}

        {!contractAddress && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">Haven't deployed yet?</p>
            <p className="text-xs text-muted-foreground">
              Follow the deployment guide in the <code className="bg-background px-1 py-0.5 rounded">contracts/README.md</code> file
              to deploy the FirmwareAnalysisLogger smart contract.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Deploy using Remix IDE (easiest)</li>
              <li>Copy the deployed contract address</li>
              <li>Paste it here to start logging analyses on-chain</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContractSettings;
