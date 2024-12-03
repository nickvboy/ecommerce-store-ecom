import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import PriceRangeSlider from '../components/PriceRangeSlider';
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useInView } from 'react-intersection-observer';
import { useApiStatus } from '../contexts/ApiStatusContext';
import { API_BASE_URL } from '../lib/utils';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 500 },
    attributes: {}
  });
  const [availableAttributes, setAvailableAttributes] = useState({});
  const { isConnected } = useApiStatus();
  const [error, setError] = useState(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    delay: 100
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isConnected) {
        setError('Unable to fetch products. Please check your connection.');
        setProducts([]);
        setHasMore(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/products/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          page,
          limit: 12
        }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(prev => page === 1 ? data.products : [...prev, ...data.products]);
      setHasMore(data.products.length > 0);
      
      // Update available attributes from the response
      if (data.attributeStats) {
        setAvailableAttributes(data.attributeStats);
      }
    } catch (error) {
      setError('Unable to load products. Please try again later.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, isConnected]);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [filters]);

  useEffect(() => {
    if (page === 1) {
      fetchProducts();
    }
  }, [fetchProducts, page]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage(prev => prev + 1);
      fetchProducts();
    }
  }, [inView, loading, hasMore, fetchProducts]);

  const handlePriceRangeChange = (newRange) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        min: newRange[0],
        max: newRange[1]
      }
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleAttributeChange = (attributeName, value) => {
    setFilters(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeName]: prev.attributes[attributeName]?.includes(value)
          ? prev.attributes[attributeName].filter(v => v !== value)
          : [...(prev.attributes[attributeName] || []), value]
      }
    }));
  };

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category._id}>
        <div className="flex items-center space-x-2 py-1" style={{ paddingLeft: `${level * 16}px` }}>
          <Checkbox
            checked={filters.categories.includes(category._id)}
            onCheckedChange={() => handleCategoryChange(category._id)}
          />
          <span className="text-text-200">{category.name}</span>
          {category.productCount && (
            <span className="text-text-300 text-sm">({category.productCount})</span>
          )}
        </div>
        {category.children && category.children.length > 0 && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <aside className="w-64 space-y-6">
          {/* Price Range Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Price Range</h3>
            <PriceRangeSlider
              min={0}
              max={500}
              onChange={handlePriceRangeChange}
            />
          </div>

          {/* Categories Filter - Always expanded */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Categories</h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
              {renderCategoryTree(categories)}
            </div>
          </div>

          {/* Dynamic Attribute Filters */}
          {Object.entries(availableAttributes).map(([attributeName, values]) => (
            <Collapsible key={attributeName}>
              <div className="space-y-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-bold capitalize">{attributeName}</h3>
                  <ChevronDownIcon className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2">
                    {values.map(({ value, count }) => (
                      <label key={value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={filters.attributes[attributeName]?.includes(value)}
                          onCheckedChange={() => handleAttributeChange(attributeName, value)}
                        />
                        <span className="text-text-200">{value}</span>
                        <span className="text-text-300 text-sm">({count})</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div ref={loadMoreRef} className="mt-8 text-center">
            {loading && (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-primary-100 animate-bounce" />
                <div className="w-4 h-4 rounded-full bg-primary-100 animate-bounce [animation-delay:-.3s]" />
                <div className="w-4 h-4 rounded-full bg-primary-100 animate-bounce [animation-delay:-.5s]" />
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-text-200">No more products to load</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products; 