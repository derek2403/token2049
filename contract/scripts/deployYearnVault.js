const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy Yearn V3 WETH Vault on Celo Mainnet
 * Uses Yearn's VaultFactory v3.0.4
 */

async function main() {
  console.log("🚀 Deploying Yearn V3 WETH Vault on Celo Mainnet...\n");

  // Contract addresses on Celo Mainnet
  const VAULT_FACTORY = "0x770D0d1Fb036483Ed4AbB6d53c1C88fb277D812F"; // Yearn v3.0.4
  const WETH_ADDRESS = "0xD221812de1BD094f35587EE8E174B07B6167D9Af"; // WETH on Celo
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "CELO\n");

  // Vault parameters
  const asset = WETH_ADDRESS;
  const name = "My WETH Yield Vault";
  const symbol = "yvWETH";
  const roleManager = deployer.address; // You will be the role manager
  const profitMaxUnlockTime = 7 * 24 * 60 * 60; // 7 days (standard)

  console.log("Vault Configuration:");
  console.log("  Asset (WETH):", asset);
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Role Manager:", roleManager);
  console.log("  Profit Unlock Time:", profitMaxUnlockTime, "seconds (7 days)\n");

  // VaultFactory ABI
  const factoryAbi = [
    "function deploy_new_vault(address asset, string memory name, string memory symbol, address role_manager, uint256 profit_max_unlock_time) external returns (address)",
    "event NewVault(address indexed vault_address, address indexed asset)"
  ];

  // Connect to VaultFactory
  const vaultFactory = await hre.ethers.getContractAt(factoryAbi, VAULT_FACTORY);

  console.log("📝 Deploying vault via VaultFactory...");
  
  try {
    // Call the function to get the return value (vault address)
    const vaultAddress = await vaultFactory.deploy_new_vault.staticCall(
      asset,
      name,
      symbol,
      roleManager,
      profitMaxUnlockTime
    );
    
    console.log("✅ Vault will be deployed at:", vaultAddress, "\n");
    
    // Now actually send the transaction
    const tx = await vaultFactory.deploy_new_vault(
      asset,
      name,
      symbol,
      roleManager,
      profitMaxUnlockTime
    );

    console.log("Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...\n");

    const receipt = await tx.wait();
    
    console.log("✅ Vault deployed successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📦 VAULT ADDRESS:", vaultAddress);
    console.log("═══════════════════════════════════════\n");
    
    console.log("🔗 View on Celoscan:");
    console.log(`https://celoscan.io/address/${vaultAddress}\n`);

    console.log("📋 Next Steps:");
    console.log("1. Copy the vault address above");
    console.log("2. Update frontend/lib/llmActions/stakeEth.js:");
    console.log(`   WETH_VAULT_ADDRESS = "${vaultAddress}"`);
    console.log("3. Set deposit limit (connect to vault as role manager):");
    console.log(`   vault.set_deposit_limit(unlimited) or specific amount`);
    console.log("4. (Optional) Add strategies to your vault\n");

    // Save to a file for easy reference
    const deploymentInfo = {
      vaultAddress: vaultAddress,
      wethAddress: WETH_ADDRESS,
      factoryAddress: VAULT_FACTORY,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      network: "Celo Mainnet (42220)",
      transactionHash: tx.hash,
    };
    
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }
    
    fs.writeFileSync(
      path.join(deploymentsDir, 'yearn-weth-vault.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to: ./deployments/yearn-weth-vault.json\n");

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    
    if (error.message.includes("already")) {
      console.log("\n💡 This vault configuration may already exist.");
      console.log("Try changing the name or symbol to deploy a new vault.");
    }
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 You need CELO in your wallet for gas fees.");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

