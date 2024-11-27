import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import PriceRangeSlider from '../components/PriceRangeSlider';
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useInView } from 'react-intersection-observer';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 500 },
    materials: [],
    ratings: []
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    delay: 100
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products/filter', {
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
      const data = await response.json();
      
      setProducts(prev => page === 1 ? data.products : [...prev, ...data.products]);
      setHasMore(data.products.length > 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  }, [filters, page]);

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

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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

          {/* Categories Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Categories</h3>
            <div className="space-y-2">
              {["Pens", "Tools", "EDC Gear", "Accessories", "Bundles"].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <span className="text-text-200">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Materials Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Materials</h3>
            <div className="space-y-2">
              {["Titanium", "Brass", "Copper", "Carbon Fiber", "Stainless Steel"].map((material) => (
                <label key={material} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.materials.includes(material)}
                    onCheckedChange={() => {
                      setFilters(prev => ({
                        ...prev,
                        materials: prev.materials.includes(material)
                          ? prev.materials.filter(m => m !== material)
                          : [...prev.materials, material]
                      }));
                    }}
                  />
                  <span className="text-text-200">{material}</span>
                </label>
              ))}
            </div>
          </div>
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