import { ethers } from "hardhat";

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
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "CELO\n");

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

  // Connect to VaultFactory
  const vaultFactory = await ethers.getContractAt(
    [
      "function deploy_new_vault(address asset, string memory name, string memory symbol, address role_manager, uint256 profit_max_unlock_time) external returns (address)"
    ],
    VAULT_FACTORY
  );

  console.log("📝 Deploying vault via VaultFactory...");
  
  try {
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
    
    // Get the NewVault event to find the deployed vault address
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = vaultFactory.interface.parseLog(log);
        return parsed?.name === "NewVault";
      } catch {
        return false;
      }
    });

    let vaultAddress;
    if (event) {
      const parsed = vaultFactory.interface.parseLog(event);
      vaultAddress = parsed?.args[0] || parsed?.args?.vault;
    }

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
    console.log("3. Add strategies to your vault (optional for now)");
    console.log("4. Set deposit limit: vault.set_deposit_limit(amount)");
    console.log("   Or set to unlimited: vault.set_deposit_limit(2**256-1)\n");

    // Save to a file for easy reference
    const fs = require('fs');
    const deploymentInfo = {
      vaultAddress: vaultAddress,
      wethAddress: WETH_ADDRESS,
      factoryAddress: VAULT_FACTORY,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      network: "Celo Mainnet (42220)",
    };
    
    fs.writeFileSync(
      './deployments/yearn-weth-vault.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to: ./deployments/yearn-weth-vault.json");

  } catch (error: any) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    
    if (error.message.includes("already deployed")) {
      console.log("\n💡 This vault configuration may already exist.");
      console.log("Try changing the name or symbol to deploy a new vault.");
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

