// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @title AgentIdentity (ERC-8004-style agent identity)
/// @notice Minimal soulbound identity NFT for an AI agent, accruing reputation
///         from verified outcomes. NOTE: confirm exact ERC-8004 interface in
///         Desktop against the current spec; this is a faithful minimal impl.
contract AgentIdentity {
    string  public constant name   = "Agent Identity";
    string  public constant symbol = "AGENT";

    address public immutable owner;        // deployer/admin
    address public immutable controller;   // who may bump reputation (DecisionLog/agent)

    uint256 private _nextId = 1;
    mapping(uint256 => address) public ownerOf;     // tokenId -> agent address
    mapping(uint256 => uint256) public reputation;  // tokenId -> cumulative rep
    mapping(address => uint256) public tokenOf;     // agent -> tokenId (0 = none)

    event Minted(uint256 indexed tokenId, address indexed agent);
    event ReputationBumped(uint256 indexed tokenId, uint256 newReputation);

    error NotOwner();
    error NotController();
    error AlreadyMinted();
    error NoToken();

    constructor(address _controller) {
        require(_controller != address(0), "zero controller");
        owner = msg.sender;
        controller = _controller;
    }

    function mint(address agent) external returns (uint256 tokenId) {
        if (msg.sender != owner) revert NotOwner();
        if (tokenOf[agent] != 0) revert AlreadyMinted();
        tokenId = _nextId++;
        ownerOf[tokenId] = agent;
        tokenOf[agent] = tokenId;
        emit Minted(tokenId, agent);
    }

    function bumpReputation(address agent, uint256 amount) external {
        if (msg.sender != controller) revert NotController();
        uint256 tokenId = tokenOf[agent];
        if (tokenId == 0) revert NoToken();
        reputation[tokenId] += amount;
        emit ReputationBumped(tokenId, reputation[tokenId]);
    }
}
