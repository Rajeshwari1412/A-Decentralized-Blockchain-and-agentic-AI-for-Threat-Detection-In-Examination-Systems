const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ExamSentinel AuditLedger Smart Contract", function () {
  let auditLedger;
  let owner;
  let anchorer;
  let unauthorized;

  beforeEach(async function () {
    [owner, anchorer, unauthorized] = await ethers.getSigners();
    const AuditLedger = await ethers.getContractFactory("AuditLedger");
    auditLedger = await AuditLedger.deploy();
    await auditLedger.waitForDeployment();
  });

  it("Should set deployer as initial owner and authorized anchorer", async function () {
    expect(await auditLedger.owner()).to.equal(owner.address);
    expect(await auditLedger.authorizedAnchorers(owner.address)).to.equal(true);
  });

  it("Should allow owner to authorize a new anchorer", async function () {
    await auditLedger.setAuthorizedAnchorer(anchorer.address, true);
    expect(await auditLedger.authorizedAnchorers(anchorer.address)).to.equal(true);
  });

  it("Should record and verify an audit event hash accurately", async function () {
    const eventId = "EVT-2026-0001";
    const eventType = "QUESTION_PAPER_ACCESS";
    const userId = "USR-INVIG-042";
    const recordHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const metadataUri = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

    await auditLedger.recordAuditEvent(eventId, eventType, userId, recordHash, metadataUri);

    expect(await auditLedger.getEventCount()).to.equal(1);

    const [isValid, storedHash, timestamp, blockNum, anchoredBy] = await auditLedger.verifyEventHash(
      eventId,
      recordHash
    );

    expect(isValid).to.equal(true);
    expect(storedHash).to.equal(recordHash);
    expect(anchoredBy).to.equal(owner.address);
  });

  it("Should detect hash mismatch / tampering on verification", async function () {
    const eventId = "EVT-2026-0002";
    const eventType = "PRIVILEGED_EXPORT";
    const userId = "USR-ADMIN-007";
    const originalHash = "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e";
    const tamperedHash = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

    await auditLedger.recordAuditEvent(eventId, eventType, userId, originalHash, "");

    const [isValid, storedHash] = await auditLedger.verifyEventHash(eventId, tamperedHash);
    expect(isValid).to.equal(false);
    expect(storedHash).to.equal(originalHash);
  });

  it("Should revert if unauthorized user attempts to anchor event", async function () {
    await expect(
      auditLedger.connect(unauthorized).recordAuditEvent("EVT-X", "TYPE", "UID", "HASH", "")
    ).to.be.revertedWith("AuditLedger: Caller is not authorized to anchor audit events");
  });
});
