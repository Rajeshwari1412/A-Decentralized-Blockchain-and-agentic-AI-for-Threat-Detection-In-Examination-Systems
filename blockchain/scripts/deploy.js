const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying ExamSentinel AI AuditLedger Smart Contract...");
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const AuditLedger = await hre.ethers.getContractFactory("AuditLedger");
  const auditLedger = await AuditLedger.deploy();
  await auditLedger.waitForDeployment();

  const contractAddress = await auditLedger.getAddress();
  console.log(">>> AuditLedger deployed successfully to:", contractAddress);

  // Export contract address and ABI to backend
  const backendAbiDir = path.join(__dirname, "../../backend/app/blockchain/contracts");
  if (!fs.existsSync(backendAbiDir)) {
    fs.mkdirSync(backendAbiDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("AuditLedger");
  fs.writeFileSync(
    path.join(backendAbiDir, "AuditLedgerABI.json"),
    JSON.stringify(contractArtifact.abi, null, 2)
  );

  const deploymentInfo = {
    address: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(backendAbiDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(">>> Exported ABI and deployment metadata to backend/app/blockchain/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
