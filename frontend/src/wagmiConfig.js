import { createConfig, http } from 'wagmi'
import { sepolia, anvil } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [anvil, sepolia],
  connectors: [injected()],
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'),
  },
})
