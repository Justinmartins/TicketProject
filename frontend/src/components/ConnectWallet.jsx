import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="wallet-badge">
        <div className="wallet-dot" />
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button className="btn-small" onClick={() => disconnect()}
          style={{ borderRadius: '999px', fontSize: '0.73rem', padding: '0.18rem 0.65rem' }}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => connect({ connector: connectors[0] })}
      style={{ borderRadius: '999px', fontSize: '0.82rem', padding: '0.42rem 1.1rem' }}>
      Connect Wallet
    </button>
  )
}
