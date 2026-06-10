// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "lib/forge-std/src/Script.sol";
import {Skeloton} from "../src/Skeloton.sol";

contract Cat1 is Script {
    Skeloton public skeloton;

    function setUp() public {}

    function run() public {
        string memory name      = vm.envString("TICKET_NAME");
        string memory symbol    = vm.envString("TICKET_SYMBOL");
        uint256 maxSupply       = vm.envUint("TICKET_MAX_SUPPLY");
        string memory ticketURI = vm.envString("TICKET_URI");
        uint256 price           = vm.envUint("TICKET_PRICE_WEI");
        uint256 quantity        = vm.envUint("QUANTITY_REQUESTED");

        vm.startBroadcast();

        ticket = new Ticket(name, symbol, maxSupply, ticketURI, price);
        ticket.buy(quantity);

        vm.stopBroadcast();

        console.log("Ticket deployed at:", address(ticket));
        console.log("Name:      ", name);
        console.log("Symbol:    ", symbol);
        console.log("Max supply:", maxSupply);
        console.log("Price(wei):", price);
    }
}

contract Cat2 is Script {
    Skeloton public skeloton;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        skeloton = new Skeloton();

        vm.stopBroadcast();
    }
}

contract Cat3 is Script {
    Skeloton public skeloton;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        skeloton = new Skeloton();

        vm.stopBroadcast();
    }
}