import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import ConnectWallet from './components/ConnectWallet'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import Basket from './pages/Basket'
import Checkout from './pages/Checkout'
import SellerDashboard from './pages/SellerDashboard'

function Nav() {
  const { totalItems } = useCart()
  return (
    <nav>
      <Link to="/">Events</Link>
      <Link to="/seller">Seller</Link>
      <Link to="/basket">
        Basket {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </Link>
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
          <Route path="/basket" element={<Basket />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/seller" element={<SellerDashboard />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
