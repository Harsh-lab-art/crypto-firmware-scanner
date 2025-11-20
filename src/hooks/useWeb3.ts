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

// Smart contract ABI for FirmwareAnalysisLogger
const ANALYSIS_LOGGER_ABI = [
  "function logAnalysis(string memory analysisId, string memory filename, uint256 cryptoFunctions, uint256 totalFunctions) public returns (uint256)",
  "function updateAnalysis(string memory analysisId, uint256 cryptoFunctions, uint256 totalFunctions) public",
  "function getAnalysisCount(address user) public view returns (uint256)",
  "function getAnalysis(address user, uint256 index) public view returns (string memory analysisId, string memory filename, uint256 cryptoFunctions, uint256 totalFunctions, uint256 timestamp)",
  "function getAnalysisById(string memory analysisId) public view returns (string memory filename, uint256 cryptoFunctions, uint256 totalFunctions, uint256 timestamp, address user)",
  "function getAllUserAnalyses(address user) public view returns (tuple(string analysisId, string filename, uint256 cryptoFunctions, uint256 totalFunctions, uint256 timestamp, address user)[])",
  "function analysisExists(string memory analysisId) public view returns (bool)",
  "function totalAnalyses() public view returns (uint256)",
  "event AnalysisLogged(address indexed user, string indexed analysisId, string filename, uint256 cryptoFunctions, uint256 totalFunctions, uint256 timestamp)",
  "event AnalysisUpdated(address indexed user, string indexed analysisId, uint256 cryptoFunctions, uint256 totalFunctions, uint256 timestamp)"
];

// Get contract address from localStorage or environment variable
const getContractAddress = (): string | null => {
  const savedAddress = localStorage.getItem('contractAddress');
  if (savedAddress) return savedAddress;
  
  const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (envAddress) return envAddress;
  
  return null;
};

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
    totalFunctions: number
  ) => {
    if (!state.provider || !state.account) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const contractAddress = getContractAddress();
    
    if (!contractAddress) {
      toast.error('Smart contract not configured. Please set the contract address in settings.');
      return null;
    }

    try {
      const signer = await state.provider.getSigner();
      const contract = new Contract(contractAddress, ANALYSIS_LOGGER_ABI, signer);
      
      // Check if analysis already exists
      const exists = await contract.analysisExists(analysisId);
      
      let tx;
      if (exists) {
        // Update existing analysis
        tx = await contract.updateAnalysis(
          analysisId,
          cryptoFunctions,
          totalFunctions
        );
        toast.info('Updating analysis on blockchain...');
      } else {
        // Log new analysis
        tx = await contract.logAnalysis(
          analysisId,
          filename,
          cryptoFunctions,
          totalFunctions
        );
        toast.info('Logging analysis to blockchain...');
      }
      
      const receipt = await tx.wait();
      
      toast.success('Transaction confirmed on blockchain!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('Error logging to blockchain:', error);
      
      // Better error messages
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fees');
      } else {
        toast.error(error.reason || error.message || 'Failed to log analysis to blockchain');
      }
      
      return null;
    }
  };

  const getContractAnalysisCount = async (): Promise<number> => {
    if (!state.provider || !state.account) return 0;
    
    const contractAddress = getContractAddress();
    if (!contractAddress) return 0;

    try {
      const contract = new Contract(contractAddress, ANALYSIS_LOGGER_ABI, state.provider);
      const count = await contract.getAnalysisCount(state.account);
      return Number(count);
    } catch (error) {
      console.error('Error getting analysis count:', error);
      return 0;
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
    getContractAnalysisCount,
    contractAddress: getContractAddress(),
  };
};
