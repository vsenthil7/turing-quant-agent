// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {DecisionLog} from "../src/DecisionLog.sol";

contract DecisionLogTest is Test {
    DecisionLog decisionLog;
    address agent = address(0xA1);
    address stranger = address(0xB2);

    function setUp() public {
        decisionLog = new DecisionLog(agent);
    }

    function test_record_and_get() public {
        vm.prank(agent);
        uint256 id = decisionLog.record(keccak256("sig"), keccak256("why"), int8(1));
        assertEq(id, 0);
        DecisionLog.Entry memory e = decisionLog.get(0);
        assertEq(e.action, int8(1));
        assertEq(e.settled, false);
        assertEq(decisionLog.count(), 1);
    }

    function test_settle() public {
        vm.startPrank(agent);
        uint256 id = decisionLog.record(keccak256("s"), keccak256("r"), int8(0));
        decisionLog.settle(id, int256(42));
        vm.stopPrank();
        assertEq(decisionLog.get(id).pnl, int256(42));
        assertEq(decisionLog.get(id).settled, true);
    }

    // --- negative ---
    function test_revert_record_notAgent() public {
        vm.prank(stranger);
        vm.expectRevert(DecisionLog.NotAgent.selector);
        decisionLog.record(bytes32(0), bytes32(0), int8(1));
    }

    function test_revert_badAction_high() public {
        vm.prank(agent);
        vm.expectRevert(DecisionLog.BadAction.selector);
        decisionLog.record(bytes32(0), bytes32(0), int8(2));
    }

    function test_revert_badAction_low() public {
        vm.prank(agent);
        vm.expectRevert(DecisionLog.BadAction.selector);
        decisionLog.record(bytes32(0), bytes32(0), int8(-2));
    }

    function test_revert_settle_unknown() public {
        vm.prank(agent);
        vm.expectRevert(DecisionLog.UnknownEntry.selector);
        decisionLog.settle(99, 0);
    }

    function test_revert_settle_twice() public {
        vm.startPrank(agent);
        uint256 id = decisionLog.record(bytes32(0), bytes32(0), int8(0));
        decisionLog.settle(id, 1);
        vm.expectRevert(DecisionLog.AlreadySettled.selector);
        decisionLog.settle(id, 2);
        vm.stopPrank();
    }

    function test_revert_get_unknown() public {
        vm.expectRevert(DecisionLog.UnknownEntry.selector);
        decisionLog.get(0);
    }
}
