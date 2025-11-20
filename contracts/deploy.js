/**
 * Deployment script for FirmwareAnalysisLogger smart contract
 * 
 * This script can be used with Hardhat or Remix IDE
 * 
 * DEPLOYMENT STEPS:
 * 
 * Option 1: Using Remix IDE (Recommended for beginners)
 * 1. Go to https://remix.ethereum.org/
 * 2. Create a new file and paste the FirmwareAnalysisLogger.sol contract
 * 3. Compile the contract (Solidity Compiler tab)
 * 4. Connect MetaMask to your desired network (Sepolia testnet recommended for testing)
 * 5. Deploy the contract (Deploy & Run Transactions tab)
 * 6. Copy the deployed contract address
 * 7. Add the contract address to your environment variables
 * 
 * Option 2: Using Hardhat
 * 1. Install Hardhat: npm install --save-dev hardhat
 * 2. Initialize Hardhat: npx hardhat
 * 3. Install dependencies: npm install --save-dev @nomicfoundation/hardhat-toolbox
 * 4. Configure hardhat.config.js with your network settings
 * 5. Run: npx hardhat run scripts/deploy.js --network sepolia
 * 
 * Option 3: Using Foundry
 * 1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash
 * 2. Run: foundryup
 * 3. Deploy: forge create --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> src/FirmwareAnalysisLogger.sol:FirmwareAnalysisLogger
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FirmwareAnalysisLogger contract...");

  // Get the contract factory
  const FirmwareAnalysisLogger = await ethers.getContractFactory("FirmwareAnalysisLogger");

  // Deploy the contract
  const logger = await FirmwareAnalysisLogger.deploy();

  await logger.waitForDeployment();

  const address = await logger.getAddress();

  console.log("✅ FirmwareAnalysisLogger deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Verify your contract on Etherscan (if on mainnet/testnet)");
  console.log("2. Add this contract address to your .env file:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("3. Update your frontend to use this contract address");
  console.log("\n🔍 View your contract on block explorer:");
  console.log(`   Etherscan: https://etherscan.io/address/${address}`);
  console.log(`   Sepolia: https://sepolia.etherscan.io/address/${address}`);

  // Optional: Verify contract on Etherscan
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await logger.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Error verifying contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
