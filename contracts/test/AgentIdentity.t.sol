// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {AgentIdentity} from "../src/AgentIdentity.sol";

contract AgentIdentityTest is Test {
    AgentIdentity id;
    address controller = address(0xC1);
    address agent = address(0xA1);
    address stranger = address(0xB2);

    function setUp() public {
        id = new AgentIdentity(controller); // this test contract is owner
    }

    function test_mint_and_bump() public {
        uint256 tokenId = id.mint(agent);
        assertEq(id.ownerOf(tokenId), agent);
        assertEq(id.tokenOf(agent), tokenId);
        vm.prank(controller);
        id.bumpReputation(agent, 10);
        assertEq(id.reputation(tokenId), 10);
    }

    // --- negative ---
    function test_revert_mint_notOwner() public {
        vm.prank(stranger);
        vm.expectRevert(AgentIdentity.NotOwner.selector);
        id.mint(agent);
    }

    function test_revert_mint_twice() public {
        id.mint(agent);
        vm.expectRevert(AgentIdentity.AlreadyMinted.selector);
        id.mint(agent);
    }

    function test_revert_bump_notController() public {
        id.mint(agent);
        vm.prank(stranger);
        vm.expectRevert(AgentIdentity.NotController.selector);
        id.bumpReputation(agent, 1);
    }

    function test_revert_bump_noToken() public {
        vm.prank(controller);
        vm.expectRevert(AgentIdentity.NoToken.selector);
        id.bumpReputation(agent, 1);
    }
}
