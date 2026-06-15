// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {DecisionLog} from "../src/DecisionLog.sol";
import {AgentIdentity} from "../src/AgentIdentity.sol";
import {StrategyVault} from "../src/StrategyVault.sol";

/// @notice Deploy to Mantle. Run in Desktop with real RPC + key in env.
contract Deploy is Script {
    function run() external {
        address agent = vm.envAddress("AGENT_ADDRESS");
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(pk);

        DecisionLog log = new DecisionLog(agent);
        AgentIdentity id = new AgentIdentity(address(log));
        StrategyVault vault = new StrategyVault(agent, log, 100 ether, 2000, 1 ether);

        vm.stopBroadcast();
        // addresses printed to broadcast logs; record in docs/DEPLOYMENTS.md
    }
}
