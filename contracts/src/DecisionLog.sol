// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @title DecisionLog
/// @notice Append-only, on-chain record of AI agent decisions and outcomes.
///         This is the permanent benchmark referenced by the hackathon.
contract DecisionLog {
    struct Entry {
        uint64  timestamp;
        bytes32 signalHash;   // hash of input signals
        bytes32 rationaleHash;// hash of LLM rationale (full text off-chain)
        int8    action;       // -1 short, 0 hold, 1 long
        int256  pnl;          // realized pnl, set on settle (0 until settled)
        bool    settled;
    }

    address public immutable agent;       // authorized agent
    Entry[] private _entries;

    event DecisionRecorded(uint256 indexed id, bytes32 signalHash, int8 action);
    event DecisionSettled(uint256 indexed id, int256 pnl);

    error NotAgent();
    error BadAction();
    error UnknownEntry();
    error AlreadySettled();

    modifier onlyAgent() {
        if (msg.sender != agent) revert NotAgent();
        _;
    }

    constructor(address _agent) {
        require(_agent != address(0), "zero agent");
        agent = _agent;
    }

    function record(bytes32 signalHash, bytes32 rationaleHash, int8 action)
        external
        onlyAgent
        returns (uint256 id)
    {
        if (action < -1 || action > 1) revert BadAction();
        id = _entries.length;
        _entries.push(Entry({
            timestamp: uint64(block.timestamp),
            signalHash: signalHash,
            rationaleHash: rationaleHash,
            action: action,
            pnl: 0,
            settled: false
        }));
        emit DecisionRecorded(id, signalHash, action);
    }

    function settle(uint256 id, int256 pnl) external onlyAgent {
        if (id >= _entries.length) revert UnknownEntry();
        Entry storage e = _entries[id];
        if (e.settled) revert AlreadySettled();
        e.pnl = pnl;
        e.settled = true;
        emit DecisionSettled(id, pnl);
    }

    function get(uint256 id) external view returns (Entry memory) {
        if (id >= _entries.length) revert UnknownEntry();
        return _entries[id];
    }

    function count() external view returns (uint256) {
        return _entries.length;
    }
}
