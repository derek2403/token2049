const hre = require("hardhat");

async function main() {
  const txHash = "0x65fa1396c9af99648d815361a49319b15027492807658e2cf7808d5f4e93668e";
  
  console.log("🔍 Fetching vault address from transaction...\n");
  
  const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
  
  console.log("Total logs:", receipt.logs.length, "\n");
  
  // Try different event signatures
  const possibleTopics = [
    hre.ethers.id("NewVault(address,address)"),
    hre.ethers.id("VaultDeployed(address,address)"),
    hre.ethers.id("NewVault(address)"),
  ];
  
  let vaultAddress;
  
  for (const log of receipt.logs) {
    console.log("Log address:", log.address);
    console.log("Topic[0]:", log.topics[0]);
    
    for (const topic of possibleTopics) {
      if (log.topics[0] === topic) {
        vaultAddress = hre.ethers.getAddress("0x" + log.topics[1].slice(26));
        console.log("✅ Found vault in event!\n");
        break;
      }
    }
    
    if (vaultAddress) break;
  }
  
  // If still not found, check contract creation
  if (!vaultAddress && receipt.contractAddress) {
    vaultAddress = receipt.contractAddress;
    console.log("✅ Found vault from contract creation!\n");
  }
  
  if (vaultAddress) {
    console.log("═══════════════════════════════════════");
    console.log("📦 VAULT ADDRESS:", vaultAddress);
    console.log("═══════════════════════════════════════\n");
    
    console.log("🔗 View on Celoscan:");
    console.log(`https://celoscan.io/address/${vaultAddress}\n`);
    
    // Update deployment file
    const fs = require('fs');
    const deploymentPath = './deployments/yearn-weth-vault.json';
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    deployment.vaultAddress = vaultAddress;
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    
    console.log("💾 Updated: ./deployments/yearn-weth-vault.json\n");
    
    console.log("📋 Next Steps:");
    console.log("1. I'll update the frontend automatically");
    console.log("2. You need to set deposit limit on your vault\n");
  } else {
    console.log("❌ Could not find vault address");
    console.log("Please check the Logs tab on Celoscan for the NewVault event");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

