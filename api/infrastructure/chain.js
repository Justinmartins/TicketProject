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
  if (process.env.NODE_ENV === 'test' || !process.env.PRIVATE_KEY || !process.env.RPC_URL) {
    return {
      contract_address: null,
      tx_hash: null,
      deployed_at: null,
    };
  }
  try {
    const wallet = getWallet();
    const provider = wallet.provider;

    // Check balance before deployment
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    if (balance < ethers.parseEther('0.035')) {
      throw new Error(`Solde insuffisant sur ton wallet (${parseFloat(balanceEth).toFixed(4)} Sepolia ETH restant). Il faut environ 0.04 ETH pour déployer. Envoie des fonds à l'adresse : ${wallet.address}`);
    }

    const feeData = await provider.getFeeData();
    const factory = new ethers.ContractFactory(TICKET_ABI, TICKET_BYTECODE, wallet);

    // Limit gas estimation buffer to stay within the remaining 0.044 ETH wallet limit
    const contract = await factory.deploy(
      name, 
      symbol, 
      BigInt(maxSupply), 
      ticketURI, 
      BigInt(priceWei),
      {
        gasLimit: 2500000,
        maxFeePerGas: feeData.maxFeePerGas || undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      }
    );
    const receipt = await contract.deploymentTransaction().wait();
    return {
      contract_address: await contract.getAddress(),
      tx_hash: receipt.hash,
      deployed_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Auto-deployment failed. Error detail:", err.message || err);
    let errMsg = err.message || String(err);
    if (errMsg.includes('insufficient funds')) {
      const wallet = getWallet();
      const balance = await wallet.provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balance);
      errMsg = `Solde de gas insuffisant sur ton wallet (${parseFloat(balanceEth).toFixed(4)} Sepolia ETH restant). Envoie environ 0.05 Sepolia ETH à l'adresse : ${wallet.address}`;
    }
    throw new Error(errMsg);
  }
}

module.exports = { getTicketContract, deployTicketContract };
