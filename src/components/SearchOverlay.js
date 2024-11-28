import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

function SearchOverlay({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch all products once when overlay opens
  useEffect(() => {
    if (isOpen && !allProducts) {
      fetchAllProducts();
    }
  }, [isOpen]);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setAllProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Local search function
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query || query.length < 2 || !allProducts) {
      setSearchResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const results = allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 results

    setSearchResults(results);
  };

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full h-full flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-primary-100 transition-colors"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Search container */}
        <div className="w-full max-w-2xl mx-auto mt-20 px-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pl-12
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 
                       focus:ring-primary-100 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
          </div>

          {/* Results dropdown */}
          {(searchQuery.length >= 2) && (
            <div className="mt-2 bg-bg-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {!allProducts ? (
                <div className="p-4 text-center text-text-200">
                  <div className="animate-spin h-6 w-6 border-2 border-primary-100 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-2 hover:bg-bg-300 transition-colors"
                    >
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-bg-300 rounded flex items-center justify-center">
                          <MagnifyingGlassIcon className="h-6 w-6 text-text-200" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-text-100 font-medium">{product.name}</h3>
                        <p className="text-text-200 text-sm">${product.price?.toFixed(2) || '0.00'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-text-200">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchOverlay; 