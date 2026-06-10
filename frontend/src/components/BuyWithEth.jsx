import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { TICKET_ABI } from '../abi'

export default function BuyWithEth({ category, initialQuantity = 1, lockQuantity = false, onSuccess }) {
  const { isConnected } = useAccount()
  const [quantity, setQuantity] = useState(initialQuantity)

  const { data: price } = useReadContract({
    address: category.contract_address,
    abi: TICKET_ABI,
    functionName: 'price',
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess && onSuccess) onSuccess({ txHash: hash })
  }, [isSuccess])

  function handleBuy() {
    if (!price) return
    writeContract({
      address: category.contract_address,
      abi: TICKET_ABI,
      functionName: 'buy',
      args: [BigInt(quantity)],
      value: price * BigInt(quantity),
    })
  }

  if (!isConnected) {
    return (
      <div className="buy-box">
        <h4>Pay with ETH</h4>
        <p className="muted">Connect your wallet to continue.</p>
      </div>
    )
  }

  const totalEth = price
    ? (Number(price * BigInt(quantity)) / 1e18).toFixed(6)
    : '…'

  return (
    <div className="buy-box">
      <h4>Pay with ETH</h4>
      <div className="quantity-row">
        {lockQuantity ? (
          <span className="muted">Qty: <strong>{quantity}</strong></span>
        ) : (
          <>
            <label>Qty</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </>
        )}
        <span className="muted">{totalEth} ETH</span>
      </div>
      <button onClick={handleBuy} disabled={isPending || isConfirming || !price || isSuccess}>
        {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : isSuccess ? '✓ Paid' : 'Pay with ETH'}
      </button>
      {isSuccess && <p className="success">Minted! Tx: {hash.slice(0, 10)}…</p>}
      {error && <p className="error">{error.shortMessage || error.message}</p>}
    </div>
  )
}
