// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "lib/forge-std/src/Test.sol";
import {IERC721Receiver} from "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import {Ticket} from "../src/Skeloton.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract SkelotonTest is Test, IERC721Receiver {
    Ticket public ticket;
    address public owner = address(this);
    address public buyer = address(0x1);
    address public seller = address(0x2);

    function setUp() public {
        ticket = new Ticket(
            "VIP",
            "VIP2025",
            100,
            "ipfs://QmVIP",
            1 ether
        );
    }

    function test_ConstructorState() public {
        assertEq(ticket.name(), "VIP");
        assertEq(ticket.symbol(), "VIP2025");
        assertEq(ticket.maxSupply(), 100);
        assertEq(ticket.ticketURI(), "ipfs://QmVIP");
        assertEq(ticket.price(), 1 ether);
        assertEq(ticket.owner(), owner);
    }

    function test_BuyTicket() public {
        // Buyer purchase 1 ticket with 1 ETH
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        uint256[] memory tokenIds = ticket.buy{value: 1 ether}(1);
        assertEq(tokenIds.length, 1);
        assertEq(tokenIds[0], 0);
        assertEq(ticket.balanceOf(buyer), 1);
        assertEq(ticket.ownerOf(0), buyer);
        assertEq(ticket.tokenURI(0), "ipfs://QmVIP");
        assertEq(address(ticket).balance, 1 ether);
    }

    function test_BuyMultipleTickets() public {
        vm.deal(buyer, 5 ether);
        vm.prank(buyer);
        uint256[] memory tokenIds = ticket.buy{value: 5 ether}(5);
        assertEq(tokenIds.length, 5);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(tokenIds[i], i);
            assertEq(ticket.ownerOf(i), buyer);
            assertEq(ticket.tokenURI(i), "ipfs://QmVIP");
        }
        assertEq(ticket.balanceOf(buyer), 5);
        assertEq(address(ticket).balance, 5 ether);
    }

    function test_BuyIncorrectAmount() public {
        // Should fail with incorrect amount
        vm.expectRevert("Incorrect ETH amount");
        ticket.buy{value: 0.5 ether}(1);
    }

    function test_BuyIncorrectAmountMultiple() public {
        vm.expectRevert("Incorrect ETH amount");
        ticket.buy{value: 4 ether}(5);
    }

    function test_BuyZeroQuantity() public {
        vm.expectRevert("Quantity must be positive");
        ticket.buy{value: 0}(0);
    }

    function test_BuyExceedingSupply() public {
        // Max supply is 100.
        // Let's buy 100 first.
        address largeBuyer = address(0x3);
        vm.deal(largeBuyer, 100 ether);
        vm.prank(largeBuyer);
        ticket.buy{value: 100 ether}(100);

        // Now attempt to buy 1 more
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert("Sold out");
        ticket.buy{value: 1 ether}(1);
    }

    function test_MintByOwner() public {
        // Seller mints free tickets (using owner account)
        uint256[] memory tokenIds = ticket.mint(seller, 5);
        assertEq(tokenIds.length, 5);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(tokenIds[i], i);
            assertEq(ticket.ownerOf(i), seller);
            assertEq(ticket.tokenURI(i), "ipfs://QmVIP");
        }
        assertEq(ticket.balanceOf(seller), 5);
    }

    function test_MintByNonOwnerReverts() public {
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, buyer)
        );
        ticket.mint(buyer, 1);
    }

    function test_MintZeroQuantity() public {
        vm.expectRevert("Quantity must be positive");
        ticket.mint(seller, 0);
    }

    function test_MintExceedingSupply() public {
        // Mint 100 tickets (max supply)
        ticket.mint(seller, 100);

        // Try to mint 1 more
        vm.expectRevert("Sold out");
        ticket.mint(seller, 1);
    }

    function test_WithdrawSuccess() public {
        // Buyer buys 2 tickets
        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        ticket.buy{value: 2 ether}(2);

        assertEq(address(ticket).balance, 2 ether);

        uint256 ownerBalanceBefore = owner.balance;

        // Owner withdraws
        ticket.withdraw();

        assertEq(address(ticket).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + 2 ether);
    }

    function test_WithdrawByNonOwnerReverts() public {
        // Buyer buys 2 tickets
        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        ticket.buy{value: 2 ether}(2);

        // Non-owner attempts to withdraw
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, buyer)
        );
        ticket.withdraw();
    }

    function test_TicketsOf() public {
        // Mint some tickets to seller and buyer
        ticket.mint(seller, 3); // 0, 1, 2
        
        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        ticket.buy{value: 2 ether}(2); // 3, 4

        uint256[] memory sellerTickets = ticket.ticketsOf(seller);
        assertEq(sellerTickets.length, 3);
        assertEq(sellerTickets[0], 0);
        assertEq(sellerTickets[1], 1);
        assertEq(sellerTickets[2], 2);

        uint256[] memory buyerTickets = ticket.ticketsOf(buyer);
        assertEq(buyerTickets.length, 2);
        assertEq(buyerTickets[0], 3);
        assertEq(buyerTickets[1], 4);
    }

    function test_TicketsOfEmpty() public {
        uint256[] memory tickets = ticket.ticketsOf(buyer);
        assertEq(tickets.length, 0);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}
}