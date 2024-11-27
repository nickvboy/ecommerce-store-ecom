import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { products } from '../data/products';

function FilterSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between group p-0 hover:bg-transparent"
        >
          <span className="text-sm font-bold">{title}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`text-text-200 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path
              d="M2.5 4L6 7.5L9.5 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function Products() {
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 250]);
  const [filters, setFilters] = useState({
    inStock: false,
    gearType: [],
    clothingType: [],
    gender: {
      womens: false,
      mens: false,
      unisex: false
    },
    color: [],
    size: [],
    waistSize: []
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter options based on the headers
  const filterOptions = {
    gearType: [
      { id: 'cable-management', label: 'Cable Management', count: 45 },
      { id: 'screwdrivers', label: 'Screwdrivers', count: 12 },
      { id: 'desk-accessories', label: 'Desk Accessories', count: 23 },
      { id: 'audio', label: 'Audio Equipment', count: 8 }
    ],
    clothingType: [
      { id: 'tshirts', label: 'T-Shirts', count: 52 },
      { id: 'hoodies', label: 'Hoodies', count: 18 },
      { id: 'jackets', label: 'Jackets', count: 7 }
    ],
    color: [
      { id: 'black', label: 'Black', count: 84 },
      { id: 'white', label: 'White', count: 32 },
      { id: 'gray', label: 'Gray', count: 28 },
      { id: 'navy', label: 'Navy', count: 15 },
      { id: 'red', label: 'Red', count: 8 }
    ],
    size: [
      { id: 'xs', label: 'XS', count: 12 },
      { id: 's', label: 'S', count: 45 },
      { id: 'm', label: 'M', count: 52 },
      { id: 'l', label: 'L', count: 48 },
      { id: 'xl', label: 'XL', count: 32 },
      { id: '2xl', label: '2XL', count: 18 }
    ],
    waistSize: [
      { id: '28', label: '28"', count: 8 },
      { id: '30', label: '30"', count: 24 },
      { id: '32', label: '32"', count: 32 },
      { id: '34', label: '34"', count: 28 },
      { id: '36', label: '36"', count: 16 },
      { id: '38', label: '38"', count: 12 }
    ]
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: Array.isArray(prev[category])
        ? prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
        : value
    }));
  };

  return (
    <div className="bg-bg-100 min-h-screen text-text-100">
      <div className="flex flex-col lg:flex-row px-4 md:px-8 lg:px-12">
        {/* Filter Button for Mobile */}
        <button 
          className="lg:hidden w-full bg-bg-200 text-text-100 py-2 px-4 rounded-lg mb-4 flex items-center justify-between"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <span className="font-bold">Filters</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`}
          >
            <path
              d="M2.5 4L6 7.5L9.5 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Overlay for mobile */}
        {isMobileFiltersOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        )}

        {/* Filter Sidebar */}
        <aside className={`
          lg:w-64 lg:flex-shrink-0 lg:pt-8
          fixed lg:static left-0 top-0 h-full w-80
          bg-bg-100 p-4 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:transform-none
          z-50
        `}>
          <div className="sticky top-0">
            {/* Title and Remove All - Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">FILTER:</h2>
              <Button 
                variant="link" 
                className="text-text-200 hover:text-primary-100 p-0 h-auto"
              >
                Remove all
              </Button>
            </div>

            {/* Title and Remove All - Mobile */}
            <div className="lg:hidden flex flex-col mb-8">
              <h2 className="text-2xl font-bold mb-4">FILTER:</h2>
              <Button 
                variant="link" 
                className="text-text-200 hover:text-primary-100 p-0 h-auto self-end"
              >
                Remove all
              </Button>
            </div>

            <div className="space-y-4">
              <FilterSection title="AVAILABILITY (1)">
                <label className="flex items-center space-x-2">
                  <Checkbox 
                    checked={filters.inStock}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, inStock: checked }))
                    }
                    className="border-bg-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100"
                  />
                  <span className="text-text-200 text-sm">In stock (140)</span>
                </label>
              </FilterSection>

              <FilterSection title="PRICE" defaultOpen={true}>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-text-200 text-sm">Min</span>
                      <input 
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-16 bg-bg-200 text-text-100 text-sm border-none focus:ring-0 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-200 text-sm">Max</span>
                      <input 
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-16 bg-bg-200 text-text-100 text-sm border-none focus:ring-0 rounded"
                      />
                    </div>
                  </div>
                  <Slider
                    value={priceRange}
                    max={250}
                    min={0}
                    step={1}
                    onValueChange={setPriceRange}
                    className="[&_[role=slider]]:bg-text-100"
                  />
                </div>
              </FilterSection>

              {/* Gear Type */}
              <FilterSection title="GEAR TYPE">
                {filterOptions.gearType.map(option => (
                  <label key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={filters.gearType.includes(option.id)}
                      onCheckedChange={(checked) => handleFilterChange('gearType', option.id)}
                      className="border-bg-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100"
                    />
                    <span className="text-text-200 text-sm">{option.label} ({option.count})</span>
                  </label>
                ))}
              </FilterSection>

              {/* Clothing Type */}
              <FilterSection title="CLOTHING TYPE">
                {filterOptions.clothingType.map(option => (
                  <label key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={filters.clothingType.includes(option.id)}
                      onCheckedChange={(checked) => handleFilterChange('clothingType', option.id)}
                      className="border-bg-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100"
                    />
                    <span className="text-text-200 text-sm">{option.label} ({option.count})</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="GENDER" defaultOpen={true}>
                {['womens', 'mens', 'unisex'].map((gender) => (
                  <label key={gender} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={filters.gender[gender]}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({
                          ...prev,
                          gender: { ...prev.gender, [gender]: checked }
                        }))
                      }
                      className="border-bg-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100"
                    />
                    <span className="text-text-200 text-sm">
                      {gender.charAt(0).toUpperCase() + gender.slice(1)} ({gender === 'unisex' ? '84' : '6'})
                    </span>
                  </label>
                ))}
              </FilterSection>

              {/* Color */}
              <FilterSection title="COLOR">
                {filterOptions.color.map(option => (
                  <label key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={filters.color.includes(option.id)}
                      onCheckedChange={(checked) => handleFilterChange('color', option.id)}
                      className="border-bg-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100"
                    />
                    <span className="text-text-200 text-sm">{option.label} ({option.count})</span>
                  </label>
                ))}
              </FilterSection>

              {/* Size */}
              <FilterSection title="SIZE">
                {filterOptions.size.map(option => (
                  <label key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={filters.size.includes(option.id)}
                      onCheckedChange={(checked) => handleFilterChange('size', option.id)}
                      className="border-bg-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100"
                    />
                    <span className="text-text-200 text-sm">{option.label} ({option.count})</span>
                  </label>
                ))}
              </FilterSection>

              {/* Waist Size */}
              <FilterSection title="WAIST SIZE">
                {filterOptions.waistSize.map(option => (
                  <label key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={filters.waistSize.includes(option.id)}
                      onCheckedChange={(checked) => handleFilterChange('waistSize', option.id)}
                      className="border-bg-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100"
                    />
                    <span className="text-text-200 text-sm">{option.label} ({option.count})</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1 lg:pl-8 pt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-text-200">SORT BY:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="hidden md:block text-text-200">172 PRODUCTS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Products; 