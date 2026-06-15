// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {StrategyVault} from "../src/StrategyVault.sol";
import {DecisionLog} from "../src/DecisionLog.sol";

contract StrategyVaultTest is Test {
    StrategyVault vault;
    DecisionLog log;
    address owner = address(this);
    address agent = address(0xA1);
    address stranger = address(0xB2);

    function setUp() public {
        log = new DecisionLog(agent);
        vault = new StrategyVault(agent, log, 100, 2000, 1000); // 20% dd, equity 1000
    }

    function test_execute_within_limits() public {
        vm.prank(agent);
        vault.execute(0, int8(1), 50);
        assertEq(vault.openPosition(), 50);
    }

    function test_markEquity_newPeak() public {
        vm.prank(agent);
        vault.markEquity(1200);
        assertEq(vault.peakEquity(), 1200);
        assertEq(vault.halted(), false);
    }

    function test_markEquity_triggers_halt() public {
        vm.prank(agent);
        vault.markEquity(800); // 20% drawdown -> halt
        assertEq(vault.halted(), true);
    }

    function test_setLimits() public {
        vault.setLimits(200, 3000);
        assertEq(vault.maxPositionSize(), 200);
        assertEq(vault.maxDrawdownBps(), 3000);
    }

    // --- negative ---
    function test_revert_execute_notAgent() public {
        vm.prank(stranger);
        vm.expectRevert(StrategyVault.NotAgent.selector);
        vault.execute(0, 1, 10);
    }

    function test_revert_execute_position_exceeded() public {
        vm.prank(agent);
        vm.expectRevert(StrategyVault.PositionExceeded.selector);
        vault.execute(0, 1, 101);
    }

    function test_revert_execute_when_halted() public {
        vm.startPrank(agent);
        vault.markEquity(800);
        vm.expectRevert(StrategyVault.Halt.selector);
        vault.execute(0, 1, 1);
        vm.stopPrank();
    }

    function test_revert_markEquity_zero() public {
        vm.prank(agent);
        vm.expectRevert(StrategyVault.ZeroEquity.selector);
        vault.markEquity(0);
    }

    function test_revert_markEquity_notAgent() public {
        vm.prank(stranger);
        vm.expectRevert(StrategyVault.NotAgent.selector);
        vault.markEquity(900);
    }

    function test_revert_setLimits_notOwner() public {
        vm.prank(stranger);
        vm.expectRevert(StrategyVault.NotOwner.selector);
        vault.setLimits(1, 1);
    }

    function test_revert_setLimits_badBps() public {
        vm.expectRevert("bad bps");
        vault.setLimits(1, 10001);
    }

    function test_revert_constructor_badBps() public {
        vm.expectRevert("bad bps");
        new StrategyVault(agent, log, 100, 10001, 1000);
    }

    function test_revert_constructor_zeroEquity() public {
        vm.expectRevert("zero equity");
        new StrategyVault(agent, log, 100, 2000, 0);
    }

    function test_revert_constructor_zeroAgent() public {
        vm.expectRevert("zero agent");
        new StrategyVault(address(0), log, 100, 2000, 1000);
    }
}
