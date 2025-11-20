import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { toast } from 'sonner';

export interface Web3State {
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  isConnected: boolean;
  isConnecting: boolean;
}

// Simple smart contract ABI for logging analysis data
const ANALYSIS_LOGGER_ABI = [
  "function logAnalysis(string memory analysisId, string memory filename, uint256 cryptoFunctions, uint256 totalFunctions) public returns (uint256)",
  "function getAnalysisCount(address user) public view returns (uint256)",
  "function getAnalysis(address user, uint256 index) public view returns (string memory analysisId, string memory filename, uint256 cryptoFunctions, uint256 totalFunctions, uint256 timestamp)",
  "event AnalysisLogged(address indexed user, string analysisId, string filename, uint256 timestamp)"
];

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    account: null,
    chainId: null,
    provider: null,
    isConnected: false,
    isConnecting: false,
  });

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setState({
            account: accounts[0].address,
            chainId: Number(network.chainId),
            provider,
            isConnected: true,
            isConnecting: false,
          });
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setState(prev => ({
            ...prev,
            account: accounts[0],
            isConnected: true,
          }));
          toast.success('Account changed');
        } else {
          setState({
            account: null,
            chainId: null,
            provider: null,
            isConnected: false,
            isConnecting: false,
          });
          toast.info('Wallet disconnected');
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection]);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setState({
        account: accounts[0],
        chainId: Number(network.chainId),
        provider,
        isConnected: true,
        isConnecting: false,
      });

      toast.success('Wallet connected successfully');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    setState({
      account: null,
      chainId: null,
      provider: null,
      isConnected: false,
      isConnecting: false,
    });
    toast.info('Wallet disconnected');
  };

  const logAnalysisToBlockchain = async (
    analysisId: string,
    filename: string,
    cryptoFunctions: number,
    totalFunctions: number,
    contractAddress?: string
  ) => {
    if (!state.provider || !state.account) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      // If no contract address provided, create a transaction to log data
      // In production, you'd deploy a smart contract and use its address
      const signer = await state.provider.getSigner();
      
      if (contractAddress) {
        // Interact with deployed contract
        const contract = new Contract(contractAddress, ANALYSIS_LOGGER_ABI, signer);
        const tx = await contract.logAnalysis(
          analysisId,
          filename,
          cryptoFunctions,
          totalFunctions
        );
        
        toast.info('Transaction submitted. Waiting for confirmation...');
        const receipt = await tx.wait();
        
        return {
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        };
      } else {
        // Send a simple transaction with data encoded in the transaction
        const data = JSON.stringify({
          analysisId,
          filename,
          cryptoFunctions,
          totalFunctions,
          timestamp: Date.now(),
        });
        
        const tx = await signer.sendTransaction({
          to: state.account, // Send to self as a data log
          value: parseEther('0'),
          data: '0x' + Buffer.from(data).toString('hex'),
        });

        toast.info('Transaction submitted. Waiting for confirmation...');
        const receipt = await tx.wait();

        return {
          transactionHash: receipt?.hash || '',
          blockNumber: receipt?.blockNumber || 0,
          gasUsed: receipt?.gasUsed.toString() || '0',
        };
      }
    } catch (error: any) {
      console.error('Error logging to blockchain:', error);
      toast.error(error.message || 'Failed to log analysis to blockchain');
      return null;
    }
  };

  const getBalance = async () => {
    if (!state.provider || !state.account) return '0';
    
    try {
      const balance = await state.provider.getBalance(state.account);
      return formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    logAnalysisToBlockchain,
    getBalance,
  };
};
