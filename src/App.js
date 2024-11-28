import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiStatusProvider } from './contexts/ApiStatusContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import OfflineBanner from './components/OfflineBanner';

function App() {
  return (
    <ApiStatusProvider>
      <Router>
        <div className="min-h-screen bg-bg-100 text-text-100">
          <OfflineBanner />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </Router>
    </ApiStatusProvider>
  );
}

export default App;
