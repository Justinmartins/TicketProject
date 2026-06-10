import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="wallet-badge">
        <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
        <button className="btn-small" onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <button className="btn-small" onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  )
}
