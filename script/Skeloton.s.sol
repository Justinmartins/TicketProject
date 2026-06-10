// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "lib/forge-std/src/Script.sol";
import {console} from "lib/forge-std/src/console.sol";
import {Skeloton} from "../src/Skeloton.sol";

/**
 * Deployment script for ticket categories.
 * Each ticket category of an event is deployed as ONE separate smart contract.
 * Run this script once per category with different environment variables.
 *
 * Usage:
 *   forge script script/Skeloton.s.sol --rpc-url <RPC> --private-key <KEY> --broadcast
 *
 * Required environment variables:
 *   - TICKET_NAME: Category name (e.g., "VIP", "Standard")
 *   - TICKET_SYMBOL: Category symbol (e.g., "VIP2025")
 *   - TICKET_MAX_SUPPLY: Max tickets in this category
 *   - TICKET_URI: Metadata URI (ipfs://...)
 *   - TICKET_PRICE_WEI: Price per ticket in wei
 */

contract DeployTicketCategory is Script {
    Skeloton public ticketContract;

    function setUp() public {}

    function run() public {
        string memory name      = vm.envString("TICKET_NAME");
        string memory symbol    = vm.envString("TICKET_SYMBOL");
        uint256 maxSupply       = vm.envUint("TICKET_MAX_SUPPLY");
        string memory ticketURI = vm.envString("TICKET_URI");
        uint256 price           = vm.envUint("TICKET_PRICE_WEI");

        vm.startBroadcast();

        ticketContract = new Skeloton(name, symbol, maxSupply, ticketURI, price);

        vm.stopBroadcast();

        console.log("========================================");
        console.log("Ticket Category Deployed Successfully");
        console.log("========================================");
        console.log("Contract Address:", address(ticketContract));
        console.log("Name:             ", name);
        console.log("Symbol:           ", symbol);
        console.log("Max Supply:       ", maxSupply);
        console.log("Price (wei):      ", price);
        console.log("========================================");
    }
}
