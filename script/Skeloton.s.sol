// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "lib/forge-std/src/Script.sol";
import {Skeloton} from "../src/Skeloton.sol";

contract Cat1 is Script {
    Skeloton public skeloton;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        skeloton = new Skeloton();
        uint256 quantity = 

        vm.stopBroadcast();
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