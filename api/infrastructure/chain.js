const { ethers } = require('ethers');
const path = require('path');

const artifact = require(path.join(__dirname, '../../out/Skeloton.sol/Ticket.json'));
const { abi: TICKET_ABI, bytecode: { object: TICKET_BYTECODE } } = artifact;

const MINT_ABI = ['function mint(address to, uint256 quantity) external returns (uint256[])'];
const WITHDRAW_ABI = ['function withdraw() external'];

function getWallet() {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('PRIVATE_KEY is not defined in .env');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

function getTicketContract(contractAddress) {
  return new ethers.Contract(contractAddress, MINT_ABI, getWallet());
}

async function deployTicketContract({ name, symbol, maxSupply, ticketURI, priceWei }) {
  if (process.env.NODE_ENV === 'test') {
    return {
      contract_address: null,
      tx_hash: null,
      deployed_at: null,
    };
  }
  try {
    const wallet = getWallet();
    const factory = new ethers.ContractFactory(TICKET_ABI, TICKET_BYTECODE, wallet);
    const contract = await factory.deploy(name, symbol, BigInt(maxSupply), ticketURI, BigInt(priceWei));
    const receipt = await contract.deploymentTransaction().wait();
    return {
      contract_address: await contract.getAddress(),
      tx_hash: receipt.hash,
      deployed_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Auto-deployment failed. Falling back to manual contract linking. Error detail:", err.message || err);
    return {
      contract_address: null,
      tx_hash: null,
      deployed_at: null,
    };
  }
}

async function withdrawFromContract(contractAddress) {
  const wallet = getWallet();
  const contract = new ethers.Contract(contractAddress, WITHDRAW_ABI, wallet);
  const tx = await contract.withdraw();
  await tx.wait();
}

async function getContractBalance(contractAddress) {
  const provider = getWallet().provider;
  return provider.getBalance(contractAddress);
}

module.exports = { getTicketContract, deployTicketContract, withdrawFromContract, getContractBalance };
