import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import PriceRangeSlider from '../components/PriceRangeSlider';
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import { ChevronDownIcon } from '@heroicons/react/24/solid';

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
          {/* Price Range Filter */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-bg-200 rounded-lg group">
              <h3 className="text-lg font-bold">Price Range</h3>
              <ChevronDownIcon className="w-5 h-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <PriceRangeSlider
                min={0}
                max={500}
                onChange={handlePriceRangeChange}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Categories Filter */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-bg-200 rounded-lg group">
              <h3 className="text-lg font-bold">Categories</h3>
              <ChevronDownIcon className="w-5 h-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-2">
              {["Pens", "Tools", "EDC Gear", "Accessories", "Bundles"].map((category) => (
                <label key={category} className="flex items-center space-x-2 px-4">
                  <Checkbox
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <span className="text-text-200">{category}</span>
                </label>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Materials Filter */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-bg-200 rounded-lg group">
              <h3 className="text-lg font-bold">Materials</h3>
              <ChevronDownIcon className="w-5 h-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-2">
              {["Titanium", "Brass", "Copper", "Carbon Fiber", "Stainless Steel"].map((material) => (
                <label key={material} className="flex items-center space-x-2 px-4">
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
            </CollapsibleContent>
          </Collapsible>
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