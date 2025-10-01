const hre = require("hardhat");

async function main() {
  const FACTORY = "0x770D0d1Fb036483Ed4AbB6d53c1C88fb277D812F";
  const DEPLOYER = "0x147151a144fEb00E1e173469B5f90C3B78ae210c";
  
  console.log("🔍 Checking recent transactions for vault deployment...\n");
  
  // Get the latest block
  const latestBlock = await hre.ethers.provider.getBlockNumber();
  console.log("Latest block:", latestBlock);
  console.log("Deployment block:", 47451879, "\n");
  
  // Check transactions from the deployer around deployment block
  const startBlock = 47451879;
  const endBlock = 47451879 + 10;
  
  console.log(`Scanning blocks ${startBlock} to ${endBlock}...\n`);
  
  for (let blockNum = startBlock; blockNum <= Math.min(endBlock, latestBlock); blockNum++) {
    const block = await hre.ethers.provider.getBlock(blockNum, true);
    
    for (const txHash of block.transactions) {
      const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
      
      // Check if this tx is FROM deployer TO factory
      if (receipt.from.toLowerCase() === DEPLOYER.toLowerCase() && 
          receipt.to?.toLowerCase() === FACTORY.toLowerCase()) {
        
        console.log("Found deployment transaction:", txHash);
        
        // Parse all logs
        if (receipt.logs && receipt.logs.length > 0) {
          console.log("Logs found:", receipt.logs.length);
          
          for (let i = 0; i < receipt.logs.length; i++) {
            const log = receipt.logs[i];
            console.log(`\nLog ${i}:`);
            console.log("  Address:", log.address);
            console.log("  Topics:", log.topics.length);
            
            // The vault address might be the log.address itself
            if (log.address !== FACTORY && log.address !== "0x0000000000000000000000000000000000000000") {
              console.log("\n💡 Potential vault address:", log.address);
            }
          }
        }
        
        // Check status
        console.log("\nTransaction status:", receipt.status === 1 ? "Success" : "Failed");
      }
    }
  }
  
  console.log("\n💡 Tip: The vault address might be one of the log addresses shown above.");
  console.log("Or check Celoscan's 'Logs' tab on the transaction page.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

