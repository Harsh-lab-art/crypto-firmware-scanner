# Firmware Analysis Logger Smart Contract

This directory contains the Solidity smart contract for logging firmware analysis data on the blockchain.

## Contract Overview

**FirmwareAnalysisLogger.sol** - A smart contract that stores firmware analysis results on-chain with:
- Indexed events for efficient querying
- Per-user analysis tracking
- Analysis ID-based lookups
- Update functionality for existing analyses

## Features

- ✅ Log firmware analysis results permanently on-chain
- ✅ Query analyses by user address or analysis ID
- ✅ Indexed events for efficient off-chain indexing
- ✅ Update existing analyses (owner-only)
- ✅ Gas-optimized storage patterns

## Deployment Options

### Option 1: Remix IDE (Easiest)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file: `FirmwareAnalysisLogger.sol`
3. Copy the contract code from `FirmwareAnalysisLogger.sol`
4. Select Solidity Compiler (0.8.20+)
5. Compile the contract
6. Go to "Deploy & Run Transactions"
7. Connect MetaMask
8. Select "Injected Provider - MetaMask"
9. Choose your network (Sepolia recommended for testing)
10. Click "Deploy"
11. Copy the deployed contract address

### Option 2: Hardhat

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat

# Create hardhat.config.js
cat > hardhat.config.js << EOF
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
EOF

# Deploy
npx hardhat run contracts/deploy.js --network sepolia
```

### Option 3: Foundry

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy
forge create --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  contracts/FirmwareAnalysisLogger.sol:FirmwareAnalysisLogger \
  --verify --etherscan-api-key $ETHERSCAN_API_KEY
```

## Testing Networks

### Sepolia Testnet (Recommended)
- **Chain ID:** 11155111
- **RPC URL:** https://sepolia.infura.io/v3/YOUR_KEY
- **Faucet:** https://sepoliafaucet.com/
- **Explorer:** https://sepolia.etherscan.io/

### Mumbai Testnet (Polygon)
- **Chain ID:** 80001
- **RPC URL:** https://rpc-mumbai.maticvigil.com/
- **Faucet:** https://faucet.polygon.technology/
- **Explorer:** https://mumbai.polygonscan.com/

### BSC Testnet
- **Chain ID:** 97
- **RPC URL:** https://data-seed-prebsc-1-s1.binance.org:8545/
- **Faucet:** https://testnet.binance.org/faucet-smart
- **Explorer:** https://testnet.bscscan.com/

## After Deployment

1. **Add contract address to your app:**
   - Create a `.env.local` file in your project root
   - Add: `VITE_CONTRACT_ADDRESS=0x_YOUR_CONTRACT_ADDRESS`

2. **Update the frontend:**
   - The app will automatically use the contract address from environment variables
   - Configure the contract address in the blockchain settings component

3. **Verify your contract (optional but recommended):**
   ```bash
   npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
   ```

## Contract Functions

### Write Functions (Require Gas)

- `logAnalysis(analysisId, filename, cryptoFunctions, totalFunctions)` - Log a new analysis
- `updateAnalysis(analysisId, cryptoFunctions, totalFunctions)` - Update existing analysis

### Read Functions (Free)

- `getAnalysisCount(user)` - Get number of analyses by a user
- `getAnalysis(user, index)` - Get specific analysis by index
- `getAnalysisById(analysisId)` - Get analysis by ID
- `getAllUserAnalyses(user)` - Get all analyses for a user
- `analysisExists(analysisId)` - Check if analysis exists
- `totalAnalyses()` - Get total number of analyses

## Events

- `AnalysisLogged(user, analysisId, filename, cryptoFunctions, totalFunctions, timestamp)` - Emitted when analysis is logged
- `AnalysisUpdated(user, analysisId, cryptoFunctions, totalFunctions, timestamp)` - Emitted when analysis is updated

## Gas Estimates

Approximate gas costs on Ethereum:
- Deploy contract: ~1,500,000 gas
- Log analysis: ~150,000 gas
- Update analysis: ~80,000 gas
- Read functions: Free (view functions)

## Security Considerations

- ✅ Only analysis owner can update their analyses
- ✅ Analysis IDs are unique and immutable
- ✅ All data is public on-chain
- ✅ No admin/owner privileges (fully decentralized)
- ⚠️ Gas costs apply for write operations
- ⚠️ Data cannot be deleted once on-chain

## Support

For issues or questions:
1. Check the blockchain explorer for transaction status
2. Verify you have enough gas tokens for transactions
3. Ensure you're connected to the correct network
4. Check MetaMask for any pending transactions
