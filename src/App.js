import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApiStatusProvider } from './contexts/ApiStatusContext';
import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Settings from './pages/Settings';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import AboutUs from './pages/about/AboutUs';
import Tagline from './pages/about/Tagline';
import Story from './pages/about/Story';
import FactSheet from './pages/about/FactSheet';
import Team from './pages/about/Team';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SiteDashboard from './pages/SiteDashboard';

function App() {
  return (
    <ApiStatusProvider>
      <UserProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-bg-100 text-text-100">
              <OfflineBanner />
              <Navbar />
              <Layout>
                <div className="pt-20">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/gear" element={<Navigate to="/products" replace />} />
                    <Route path="/clothing" element={<Navigate to="/products" replace />} />
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
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/admin-dashboard" element={<SiteDashboard />} />
                  </Routes>
                </div>
              </Layout>
            </div>
          </Router>
        </CartProvider>
      </UserProvider>
    </ApiStatusProvider>
  );
}

export default App;
