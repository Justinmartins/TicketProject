// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "lib/forge-std/src/Test.sol";
import {IERC721Receiver} from "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import {Ticket} from "../src/Skeloton.sol";

contract SkelotonTest is Test, IERC721Receiver {
    Ticket public ticket;

    function setUp() public {
        ticket = new Ticket(
            "VIP",
            "VIP2025",
            100,
            "ipfs://QmVIP",
            1 ether
        );
    }

    function test_BuyTicket() public {
        // Buyer achète 1 ticket avec 1 ETH
        uint256[] memory tokenIds = ticket.buy{value: 1 ether}(1);
        assertEq(tokenIds.length, 1);
    }

    function test_BuyIncorrectAmount() public {
        // Devrait échouer avec montant incorrect
        vm.expectRevert("Incorrect ETH amount");
        ticket.buy{value: 0.5 ether}(1);
    }

    function test_MintByOwner() public {
        // Seller minte des tickets gratuits
        uint256[] memory tokenIds = ticket.mint(address(this), 5);
        assertEq(tokenIds.length, 5);
    }

    // Required by IERC721Receiver to receive NFTs
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}