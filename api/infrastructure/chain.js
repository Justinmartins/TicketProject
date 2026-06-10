const { ethers } = require('ethers');
const path = require('path');

const artifact = require(path.join(__dirname, '../../out/Skeloton.sol/Ticket.json'));
const { abi: TICKET_ABI, bytecode: { object: TICKET_BYTECODE } } = artifact;

const MINT_ABI = ['function mint(address to, uint256 quantity) external returns (uint256[])'];

function getWallet() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

function getTicketContract(contractAddress) {
  return new ethers.Contract(contractAddress, MINT_ABI, getWallet());
}

async function deployTicketContract({ name, symbol, maxSupply, ticketURI, priceWei }) {
  const wallet = getWallet();
  const factory = new ethers.ContractFactory(TICKET_ABI, TICKET_BYTECODE, wallet);
  const contract = await factory.deploy(name, symbol, BigInt(maxSupply), ticketURI, BigInt(priceWei));
  const receipt = await contract.deploymentTransaction().wait();
  return {
    contract_address: await contract.getAddress(),
    tx_hash: receipt.hash,
    deployed_at: new Date().toISOString(),
  };
}

module.exports = { getTicketContract, deployTicketContract };
