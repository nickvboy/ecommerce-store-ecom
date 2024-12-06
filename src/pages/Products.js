import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import PriceRangeSlider from '../components/PriceRangeSlider';
import { Checkbox } from "../components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useInView } from 'react-intersection-observer';
import { useApiStatus } from '../contexts/ApiStatusContext';
import { API_BASE_URL } from '../lib/utils';
import debounce from 'lodash/debounce';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';

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

  // Memoize the filtered products computation
  const memoizedProducts = useMemo(() => products, [products]);

  // Debounce the filter changes
  const debouncedFilterChange = useMemo(
    () =>
      debounce((newFilters) => {
        setFilters(newFilters);
        setPage(1);
      }, 300),
    []
  );

  const handlePriceRangeChange = (newRange) => {
    const newFilters = {
      ...filters,
      priceRange: {
        min: newRange[0],
        max: newRange[1]
      }
    };
    debouncedFilterChange(newFilters);
  };

  const handleCategoryChange = (categoryId) => {
    const newFilters = {
      ...filters,
      categories: filters.categories.includes(categoryId)
        ? filters.categories.filter(c => c !== categoryId)
        : [...filters.categories, categoryId]
    };
    debouncedFilterChange(newFilters);
  };

  const handleAttributeChange = (attributeName, value) => {
    const newFilters = {
      ...filters,
      attributes: {
        ...filters.attributes,
        [attributeName]: filters.attributes[attributeName]?.includes(value)
          ? filters.attributes[attributeName].filter(v => v !== value)
          : [...(filters.attributes[attributeName] || []), value]
      }
    };
    debouncedFilterChange(newFilters);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFilterChange.cancel();
    };
  }, [debouncedFilterChange]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setPage(1);
            fetchProducts();
          }}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              {/* Categories Filter */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <h2 className="text-lg font-semibold text-text-100">Categories</h2>
                  <ChevronDownIcon className="h-5 w-5 text-text-200 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-200 ease-in-out">
                  <div className="mt-4 space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {renderCategoryTree(categories)}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Price Range Filter */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <h2 className="text-lg font-semibold text-text-100">Price Range</h2>
                  <ChevronDownIcon className="h-5 w-5 text-text-200 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-200 ease-in-out">
                  <div className="mt-4">
                    <PriceRangeSlider
                      min={0}
                      max={500}
                      value={[filters.priceRange.min, filters.priceRange.max]}
                      onChange={handlePriceRangeChange}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Attribute Filters */}
              {Object.keys(availableAttributes).length > 0 && (
                Object.entries(availableAttributes).map(([name, values]) => (
                  <Collapsible key={name}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                      <h2 className="text-lg font-semibold capitalize text-text-100">{name}</h2>
                      <ChevronDownIcon className="h-5 w-5 text-text-200 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="transition-all duration-200 ease-in-out">
                      <div className="mt-4 space-y-2">
                        {values.map(({ value, count }) => (
                          <label key={value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <Checkbox
                              checked={filters.attributes[name]?.includes(value) || false}
                              onCheckedChange={() => handleAttributeChange(name, value)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className="text-sm text-text-200">{value}</span>
                            <span className="text-sm text-text-300">({count})</span>
                          </label>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading && page === 1 ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoizedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {loading && page > 1 && (
              <div className="flex justify-center items-center py-4">
                <LoadingSpinner />
              </div>
            )}

            {!loading && !hasMore && memoizedProducts.length > 0 && (
              <p className="text-center text-gray-500 mt-4">No more products to load</p>
            )}

            {!loading && memoizedProducts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found matching your criteria</p>
              </div>
            )}

            <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Products; 