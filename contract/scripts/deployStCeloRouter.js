const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy SimpleStCeloRouter on Celo Mainnet
 */

async function main() {
  console.log("🚀 Deploying SimpleStCeloRouter on Celo Mainnet...\n");

  // stCELO contract address on Celo Mainnet
  const STCELO_ADDRESS = "0xC668583dcbDc9ae6FA3CE46462758188adfdfC24";
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "CELO\n");

  console.log("Router Configuration:");
  console.log("  stCELO Contract:", STCELO_ADDRESS, "\n");

  // Deploy the router
  console.log("📝 Deploying SimpleStCeloRouter...");
  
  const SimpleStCeloRouter = await hre.ethers.getContractFactory("SimpleStCeloRouter");
  const router = await SimpleStCeloRouter.deploy(STCELO_ADDRESS);
  
  await router.waitForDeployment();
  
  const routerAddress = await router.getAddress();

  console.log("✅ Router deployed successfully!\n");
  console.log("═══════════════════════════════════════");
  console.log("📦 ROUTER ADDRESS:", routerAddress);
  console.log("═══════════════════════════════════════\n");
  
  console.log("🔗 View on Celoscan:");
  console.log(`https://celoscan.io/address/${routerAddress}\n`);

  console.log("📋 Next Steps:");
  console.log("1. Copy the router address above");
  console.log("2. Update frontend/lib/llmActions/stakeCelo.js");
  console.log("3. Test staking via chat: 'I want to stake 10 CELO'\n");

  // Save deployment info
  const deploymentInfo = {
    routerAddress: routerAddress,
    stCeloAddress: STCELO_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    network: "Celo Mainnet (42220)",
  };
  
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'stcelo-router.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to: ./deployments/stcelo-router.json\n");

  console.log("🔧 Contract Functions:");
  console.log("  - stake() payable: Send CELO, receive stCELO");
  console.log("  - unstake(uint256): Burn stCELO, receive CELO\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

