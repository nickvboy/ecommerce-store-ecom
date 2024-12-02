import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiStatusProvider } from './contexts/ApiStatusContext';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import OfflineBanner from './components/OfflineBanner';
import Settings from './pages/Settings';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import { CartProvider } from './contexts/CartContext';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import UnderConstruction from './components/UnderConstruction';

function App() {
  return (
    <ApiStatusProvider>
      <UserProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-bg-100 text-text-100">
              <OfflineBanner />
              <Navbar />
              <div className="pt-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/gear" element={<Products category="gear" />} />
                  <Route path="/clothing" element={<Products category="clothing" />} />
                  <Route path="/about" element={<UnderConstruction />} />
                  <Route path="/about/tagline" element={<UnderConstruction />} />
                  <Route path="/about/story" element={<UnderConstruction />} />
                  <Route path="/about/factsheet" element={<UnderConstruction />} />
                  <Route path="/about/team" element={<UnderConstruction />} />
                  <Route path="/contact" element={<UnderConstruction />} />
                  <Route path="/privacy" element={<UnderConstruction />} />
                  <Route path="/terms" element={<UnderConstruction />} />
                  <Route path="/warranty" element={<UnderConstruction />} />
                  <Route path="/faq" element={<UnderConstruction />} />
                  <Route path="/shipping" element={<UnderConstruction />} />
                  <Route path="/returns" element={<UnderConstruction />} />
                  <Route path="/careers" element={<UnderConstruction />} />
                  <Route path="/new-arrivals" element={<UnderConstruction />} />
                  <Route path="/bestsellers" element={<UnderConstruction />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </UserProvider>
    </ApiStatusProvider>
  );
}

export default App;
