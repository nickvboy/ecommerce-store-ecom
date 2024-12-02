import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiStatusProvider } from './contexts/ApiStatusContext';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
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
import AboutUs from './pages/about/AboutUs';
import Tagline from './pages/about/Tagline';
import Story from './pages/about/Story';
import FactSheet from './pages/about/FactSheet';
import Team from './pages/about/Team';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';

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
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/about/tagline" element={<Tagline />} />
                  <Route path="/about/story" element={<Story />} />
                  <Route path="/about/factsheet" element={<FactSheet />} />
                  <Route path="/about/team" element={<Team />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                </Routes>
              </div>
            </div>
          </Router>
        </CartProvider>
      </UserProvider>
    </ApiStatusProvider>
  );
}

export default App;
