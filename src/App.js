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

function App() {
  return (
    <ApiStatusProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-bg-100 text-text-100">
            <OfflineBanner />
            <Navbar />
            <div className="pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/signup" element={<SignUp />} />
              </Routes>
            </div>
          </div>
        </Router>
      </UserProvider>
    </ApiStatusProvider>
  );
}

export default App;
