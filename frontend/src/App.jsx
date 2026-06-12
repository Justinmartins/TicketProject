import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import ConnectWallet from './components/ConnectWallet'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import Checkout from './pages/Checkout'
import SellerDashboard from './pages/SellerDashboard'
import MyTickets from './pages/MyTickets'

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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/seller" element={<SellerDashboard />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
