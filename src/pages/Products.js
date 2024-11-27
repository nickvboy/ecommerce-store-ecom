import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import PriceRangeSlider from '../components/PriceRangeSlider';
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 500 },
    materials: [],
    ratings: []
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          page: 1,
          limit: 50
        }),
      });
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

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
          <div>
            <h3 className="text-lg font-bold mb-4">Price Range</h3>
            <PriceRangeSlider
              min={0}
              max={500}
              onChange={handlePriceRangeChange}
            />
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <div className="space-y-2">
              {["Pens", "Tools", "EDC Gear", "Accessories", "Bundles"].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products; 