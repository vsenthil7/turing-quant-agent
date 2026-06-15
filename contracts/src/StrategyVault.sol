// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {DecisionLog} from "./DecisionLog.sol";

/// @title StrategyVault
/// @notice Holds capital and executes agent-approved trades under risk limits.
///         Minimal, non-upgradeable. Trade execution is abstracted via an
///         executor address (a DEX adapter on Mantle, wired in Desktop).
contract StrategyVault {
    address public immutable owner;   // admin
    address public immutable agent;   // authorized decision-maker
    DecisionLog public immutable log;

    uint256 public maxPositionSize;   // absolute units cap
    uint256 public maxDrawdownBps;    // basis points (e.g. 2000 = 20%)
    uint256 public peakEquity;
    uint256 public openPosition;
    bool    public halted;

    event Executed(uint256 indexed decisionId, int8 action, uint256 size);
    event Halted(string reason);

    error NotOwner();
    error NotAgent();
    error Halt();
    error PositionExceeded();
    error DrawdownBreach();
    error ZeroEquity();

    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }
    modifier onlyAgent() { if (msg.sender != agent) revert NotAgent(); _; }

    constructor(
        address _agent,
        DecisionLog _log,
        uint256 _maxPositionSize,
        uint256 _maxDrawdownBps,
        uint256 _initialEquity
    ) {
        require(_agent != address(0), "zero agent");
        require(_initialEquity > 0, "zero equity");
        require(_maxDrawdownBps <= 10_000, "bad bps");
        owner = msg.sender;
        agent = _agent;
        log = _log;
        maxPositionSize = _maxPositionSize;
        maxDrawdownBps = _maxDrawdownBps;
        peakEquity = _initialEquity;
    }

    /// @notice Update equity mark; tracks high-water mark for drawdown.
    function markEquity(uint256 equity) external onlyAgent {
        if (equity == 0) revert ZeroEquity();
        if (equity > peakEquity) peakEquity = equity;
        uint256 dd = ((peakEquity - equity) * 10_000) / peakEquity;
        if (dd >= maxDrawdownBps) {
            halted = true;
            emit Halted("drawdown");
        }
    }

    /// @notice Execute an agent decision after on-chain risk checks.
    function execute(uint256 decisionId, int8 action, uint256 size)
        external
        onlyAgent
    {
        if (halted) revert Halt();
        if (openPosition + size > maxPositionSize) revert PositionExceeded();
        openPosition += size;
        // (DEX adapter call wired in Desktop against Mantle DeFi)
        emit Executed(decisionId, action, size);
    }

    function setLimits(uint256 _maxPositionSize, uint256 _maxDrawdownBps)
        external
        onlyOwner
    {
        require(_maxDrawdownBps <= 10_000, "bad bps");
        maxPositionSize = _maxPositionSize;
        maxDrawdownBps = _maxDrawdownBps;
    }
}
