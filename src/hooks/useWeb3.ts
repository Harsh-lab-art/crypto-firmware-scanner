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
    console.log('=== Starting blockchain logging ===');
    console.log('Analysis ID:', analysisId);
    console.log('Filename:', filename);
    console.log('Account:', state.account);
    console.log('Connected:', state.isConnected);
    
    if (!state.provider || !state.account) {
      toast.error('Please connect your wallet first');
      return null;
    }

    const contractAddress = getContractAddress();
    console.log('Contract Address:', contractAddress);
    
    if (!contractAddress) {
      toast.error('Smart contract not configured. Please deploy the contract and set the address in settings.');
      return null;
    }

    try {
      console.log('Getting signer...');
      const signer = await state.provider.getSigner();
      console.log('Signer obtained:', await signer.getAddress());
      
      console.log('Creating contract instance...');
      const contract = new Contract(contractAddress, ANALYSIS_LOGGER_ABI, signer);
      console.log('Contract instance created');
      
      // Verify contract exists
      console.log('Verifying contract code...');
      const code = await state.provider.getCode(contractAddress);
      if (code === '0x') {
        toast.error('No contract found at the specified address. Please verify the contract is deployed.');
        console.error('No contract code found at address:', contractAddress);
        return null;
      }
      console.log('Contract verified, code length:', code.length);
      
      // Check if analysis already exists
      console.log('Checking if analysis exists...');
      const exists = await contract.analysisExists(analysisId);
      console.log('Analysis exists:', exists);
      
      let tx;
      if (exists) {
        console.log('Updating existing analysis...');
        toast.info('Updating analysis on blockchain...', {
          description: 'Please confirm the transaction in MetaMask'
        });
        tx = await contract.updateAnalysis(
          analysisId,
          cryptoFunctions,
          totalFunctions
        );
      } else {
        console.log('Logging new analysis...');
        toast.info('Logging analysis to blockchain...', {
          description: 'Please confirm the transaction in MetaMask'
        });
        tx = await contract.logAnalysis(
          analysisId,
          filename,
          cryptoFunctions,
          totalFunctions
        );
      }
      
      console.log('Transaction sent:', tx.hash);
      toast.info('Transaction submitted, waiting for confirmation...', {
        description: `TX: ${tx.hash.slice(0, 10)}...`
      });
      
      console.log('Waiting for transaction to be mined...');
      const receipt = await tx.wait();
      console.log('Transaction mined in block:', receipt.blockNumber);
      console.log('Gas used:', receipt.gasUsed.toString());
      
      toast.success('Transaction confirmed on blockchain!', {
        description: `Block: ${receipt.blockNumber}`
      });
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('=== Blockchain logging error ===');
      console.error('Error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error reason:', error.reason);
      
      // Better error messages
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.code === 'INVALID_ARGUMENT') {
        toast.error('Invalid contract address or parameters. Please check settings.');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fees');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('contract')) {
        toast.error('Contract error. Please verify the contract is deployed correctly.');
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
