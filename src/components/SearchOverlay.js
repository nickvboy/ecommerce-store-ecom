import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function SearchOverlay({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const searchInputRef = useRef(null);

  // Fetch products once when overlay opens and products haven't been cached
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Only fetch if we haven't cached the products yet
        if (products === null) {
          const response = await fetch('http://localhost:5000/api/products');
          const data = await response.json();
          setProducts(data.products || []); // Store in component state as cache
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Set to empty array on error
      }
    };

    if (isOpen && products === null) {
      fetchProducts();
    }

    if (isOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchQuery('');
      setFilteredProducts([]);
    }
  }, [isOpen, products]);

  // Handle image preloading
  useEffect(() => {
    filteredProducts.forEach(product => {
      if (product.images?.[0]?.url) {
        const image = new Image();
        image.src = product.images[0].url;
        image.onload = () => {
          setLoadedImages(prev => [...prev, product.images[0].url]);
        };
      }
    });
  }, [filteredProducts]);

  // Filter products based on search query using cached data
  useEffect(() => {
    if (!searchQuery.trim() || !products) {
      setFilteredProducts([]);
      return;
    }

    const searchTerms = searchQuery.toLowerCase().split(' ');
    const filtered = products.filter(product => {
      const productName = product.name.toLowerCase();
      return searchTerms.every(term => productName.includes(term));
    });

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop with animated blur */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-all duration-300 ease-in-out
          ${isOpen ? 'backdrop-blur-md' : 'backdrop-blur-none'}`}
        onClick={onClose}
      />

      {/* Search Container with slide and fade animation */}
      <div className={`relative w-full max-w-4xl mx-auto px-4 transition-all duration-300 ease-in-out
        ${isOpen ? 'mt-8 opacity-100 translate-y-0' : 'mt-4 opacity-0 -translate-y-4'}`}>
        <div className="bg-bg-100 rounded-lg shadow-xl">
          {/* Search Input */}
          <div className="relative p-4 border-b border-bg-300">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-text-200" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg-200 border border-bg-300 rounded-lg 
                       text-text-100 placeholder-text-200 focus:outline-none 
                       focus:ring-2 focus:ring-primary-100"
            />
            <button 
              onClick={onClose}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-text-200 hover:text-primary-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[70vh] overflow-y-auto p-4">
            {/* Loading State */}
            {products === null && (
              <div className="text-center text-text-200 py-8">
                Loading products...
              </div>
            )}

            {/* No Results */}
            {products && searchQuery && filteredProducts.length === 0 && (
              <p className="text-center text-text-200 py-8">No products found</p>
            )}

            {/* Results Grid */}
            {filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-200 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-bg-300">
                      {loadedImages.includes(product.images[0]?.url) ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full animate-pulse bg-bg-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-text-100">{product.name}</h3>
                      <p className="text-text-200">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchOverlay; 