import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import ConnectWallet from './components/ConnectWallet'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import Checkout from './pages/Checkout'
import SellerDashboard from './pages/SellerDashboard'
import MyTickets from './pages/MyTickets'
import { useAccount } from 'wagmi'

function ProtectedRoute({ children }) {
  const { isConnected } = useAccount()
  
  if (!isConnected) {
    return (
      <div className="page empty-state">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 style={{ color: 'var(--text)', marginBottom: '0' }}>Ready to join the experience?</h2>
        <p style={{ maxWidth: '400px', margin: '0 auto .5rem' }}>
          Connect your wallet to securely purchase tickets, manage your events, and unlock all features.
        </p>
        <ConnectWallet />
      </div>
    )
  }
  
  return children
}

function Nav() {
  const { totalItems } = useCart()
  const { pathname } = useLocation()

  const links = [
    { to: '/',        label: 'Events' },
    { to: '/tickets', label: 'My Tickets' },
    { to: '/seller',  label: 'Seller' },
  ]

  return (
    <nav>
      <Link to="/" className="nav-logo">
        <div className="nav-logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
            <line x1="9" y1="7" x2="9" y2="17" strokeDasharray="2 2"/>
          </svg>
        </div>
        <span>TicketSeller</span>
      </Link>

      {links.map(({ to, label }) => (
        <Link key={to} to={to} className={`nav-link${pathname === to ? ' active' : ''}`}>
          {label}
        </Link>
      ))}

      <Link
        to="/checkout"
        className={`nav-link nav-cart${totalItems > 0 ? ' has-items' : ''}`}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        Cart
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </Link>

      <div className="nav-spacer" />
      <ConnectWallet />
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/basket" element={<Navigate to="/checkout" replace />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/seller" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
