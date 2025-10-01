const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy SimpleStaking on Celo Mainnet
 * Your own controlled staking contract!
 */

async function main() {
  console.log("🚀 Deploying SimpleStaking on Celo Mainnet...\n");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "CELO\n");

  console.log("📝 Deploying SimpleStaking...");
  
  const SimpleStaking = await hre.ethers.getContractFactory("SimpleStaking");
  const staking = await SimpleStaking.deploy();
  
  await staking.waitForDeployment();
  
  const stakingAddress = await staking.getAddress();

  console.log("✅ SimpleStaking deployed successfully!\n");
  console.log("═══════════════════════════════════════");
  console.log("📦 STAKING CONTRACT:", stakingAddress);
  console.log("═══════════════════════════════════════\n");
  
  console.log("🔗 View on Celoscan:");
  console.log(`https://celoscan.io/address/${stakingAddress}\n`);

  console.log("📋 Contract Details:");
  console.log("  Token Name: Staked CELO");
  console.log("  Token Symbol: stCELO");
  console.log("  Ratio: 1:1 (1 CELO = 1 stCELO)");
  console.log("  Owner:", deployer.address, "\n");

  console.log("🔧 Functions:");
  console.log("  - stake() payable: Deposit CELO, receive stCELO");
  console.log("  - unstake(uint256): Burn stCELO, receive CELO");
  console.log("  - totalStaked(): View total CELO in contract\n");

  console.log("📝 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. I'll update the frontend automatically");
  console.log("3. Test: 'I want to stake 10 CELO'\n");

  // Save deployment info
  const deploymentInfo = {
    stakingAddress: stakingAddress,
    deployer: deployer.address,
    owner: deployer.address,
    timestamp: new Date().toISOString(),
    network: "Celo Mainnet (42220)",
  };
  
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'simple-staking.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to: ./deployments/simple-staking.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

