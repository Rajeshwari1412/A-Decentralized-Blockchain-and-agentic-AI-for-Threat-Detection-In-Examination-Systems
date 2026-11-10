// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditLedger
 * @dev Immutable Blockchain Audit Trail for ExamSentinel AI Security Events
 * Guarantees tamper-evident security event hashing and cryptographic audit trails.
 */
contract AuditLedger {
    address public owner;
    mapping(address => bool) public authorizedAnchorers;

    struct AuditRecord {
        string eventId;
        string eventType;
        string userId;
        string recordHash;     // SHA-256 hash of canonical event payload
        string metadataUri;    // Optional IPFS/Metadata reference
        uint256 timestamp;
        uint256 blockNumber;
        address anchoredBy;
        bool exists;
    }

    // Mapping from eventId => AuditRecord
    mapping(string => AuditRecord) private _records;
    
    // Ordered list of event IDs for enumeration
    string[] private _eventIds;

    event AuditEventAnchored(
        string indexed eventId,
        string eventType,
        string indexed userId,
        string recordHash,
        uint256 timestamp,
        address indexed anchoredBy
    );

    event AnchorerUpdated(address indexed anchorer, bool status);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "AuditLedger: Caller is not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedAnchorers[msg.sender],
            "AuditLedger: Caller is not authorized to anchor audit events"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedAnchorers[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function setAuthorizedAnchorer(address anchorer, bool status) external onlyOwner {
        require(anchorer != address(0), "Invalid address");
        authorizedAnchorers[anchorer] = status;
        emit AnchorerUpdated(anchorer, status);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        authorizedAnchorers[newOwner] = true;
    }

    /**
     * @notice Anchor a SHA-256 security event hash to the blockchain ledger
     */
    function recordAuditEvent(
        string calldata eventId,
        string calldata eventType,
        string calldata userId,
        string calldata recordHash,
        string calldata metadataUri
    ) external onlyAuthorized returns (bool) {
        require(bytes(eventId).length > 0, "Event ID cannot be empty");
        require(bytes(recordHash).length > 0, "Record Hash cannot be empty");
        require(!_records[eventId].exists, "Event ID already anchored on ledger");

        AuditRecord memory record = AuditRecord({
            eventId: eventId,
            eventType: eventType,
            userId: userId,
            recordHash: recordHash,
            metadataUri: metadataUri,
            timestamp: block.timestamp,
            blockNumber: block.number,
            anchoredBy: msg.sender,
            exists: true
        });

        _records[eventId] = record;
        _eventIds.push(eventId);

        emit AuditEventAnchored(
            eventId,
            eventType,
            userId,
            recordHash,
            block.timestamp,
            msg.sender
        );

        return true;
    }

    /**
     * @notice Cryptographically verify if a claimed hash matches the ledger record
     */
    function verifyEventHash(
        string calldata eventId,
        string calldata claimedHash
    ) external view returns (
        bool isValid,
        string memory storedHash,
        uint256 timestamp,
        uint256 blockNumber,
        address anchoredBy
    ) {
        AuditRecord memory record = _records[eventId];
        if (!record.exists) {
            return (false, "", 0, 0, address(0));
        }

        bool matchResult = (keccak256(bytes(record.recordHash)) == keccak256(bytes(claimedHash)));
        return (
            matchResult,
            record.recordHash,
            record.timestamp,
            record.blockNumber,
            record.anchoredBy
        );
    }

    /**
     * @notice Retrieve full audit record by Event ID
     */
    function getAuditEvent(string calldata eventId) external view returns (
        string memory id,
        string memory eventType,
        string memory userId,
        string memory recordHash,
        string memory metadataUri,
        uint256 timestamp,
        uint256 blockNumber,
        address anchoredBy,
        bool exists
    ) {
        AuditRecord memory r = _records[eventId];
        return (
            r.eventId,
            r.eventType,
            r.userId,
            r.recordHash,
            r.metadataUri,
            r.timestamp,
            r.blockNumber,
            r.anchoredBy,
            r.exists
        );
    }

    /**
     * @notice Get total number of anchored audit events
     */
    function getEventCount() external view returns (uint256) {
        return _eventIds.length;
    }

    /**
     * @notice Get event ID by index for pagination
     */
    function getEventIdByIndex(uint256 index) external view returns (string memory) {
        require(index < _eventIds.length, "Index out of bounds");
        return _eventIds[index];
    }
}
