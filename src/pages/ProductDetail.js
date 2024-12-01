import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import { Button } from "../components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import ReviewSummary from '../components/ReviewSummary';
import { API_BASE_URL } from '../lib/utils';
import SizeSelector from '../components/SizeSelector';
import AddToCartNotification from '../components/AddToCartNotification';
import { useCart } from '../contexts/CartContext';

function ProductDetail() {
  const { id: productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('stainless');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const { addToCart } = useCart();
  const [openSection, setOpenSection] = useState(null);

  const images = [
    { id: 1, color: 'bg-blue-500' },
    { id: 2, color: 'bg-red-500' },
    { id: 3, color: 'bg-green-500' },
    { id: 4, color: 'bg-yellow-500' },
    { id: 5, color: 'bg-purple-500' },
    { id: 6, color: 'bg-orange-500' },
  ];

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleScroll = (direction) => {
    const thumbnailHeight = 80;
    const maxScroll = Math.max(0, (images.length * thumbnailHeight) - 320);
    const newPosition = direction === 'up' 
      ? Math.max(0, scrollPosition - thumbnailHeight)
      : Math.min(maxScroll, scrollPosition + thumbnailHeight);
    setScrollPosition(newPosition);
  };

  // Define fetchProduct using useCallback before useEffect
  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]); // Now fetchProduct is a stable dependency

  // Add image preloading
  useEffect(() => {
    if (product?.images) {
      product.images.forEach(img => {
        const image = new Image();
        image.src = img.url;
        image.onload = () => {
          setLoadedImages(prev => [...prev, img.url]);
        };
      });
    }
  }, [product]);

  // Add reordering function
  const handleReorderImages = async (newOrder) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/images/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageOrders: newOrder })
      });
      
      if (!response.ok) throw new Error('Failed to reorder images');
      const updatedImages = await response.json();
      setProduct(prev => ({ ...prev, images: updatedImages }));
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };

  // Add function to handle adding to cart
  const handleAddToCart = () => {
    // Only add size to cart if product has sizes and one is selected
    const cartItem = {
      ...product,
      quantity,
      ...(product.sizes && product.sizes.length > 0 && selectedSize && { selectedSize })
    };
    addToCart(cartItem);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-bg-100 text-text-100 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link 
          to="/products" 
          className="inline-flex items-center text-text-200 hover:text-primary-100 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          BACK TO SHOP
        </Link>

        {product ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div className="relative flex gap-4">
              {/* Mobile Carousel */}
              <div className="md:hidden relative w-full">
                <div className="relative rounded-lg overflow-hidden">
                  {loadedImages.includes(product.images[currentImageIndex]?.url) ? (
                    <img 
                      src={product.images[currentImageIndex]?.url}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-bg-300 animate-pulse rounded-lg" />
                  )}
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  
                  <button 
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full 
                          ${currentImageIndex === index 
                            ? 'bg-white text-black' 
                            : 'bg-black/50 text-white hover:bg-black/70'} 
                          transition-colors`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex gap-4 w-full">
                {/* Thumbnails */}
                <div className="relative w-20">
                  {product.images.map((image, index) => (
                    <button
                      key={image._id}
                      onClick={() => setCurrentImageIndex(index)}
                      className="relative w-full aspect-square mb-2"
                    >
                      {loadedImages.includes(image.url) ? (
                        <img 
                          src={image.url}
                          alt={`Product thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-bg-300 animate-pulse rounded" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-1 rounded-lg overflow-hidden">
                  {loadedImages.includes(product.images[currentImageIndex]?.url) ? (
                    <img 
                      src={product.images[currentImageIndex]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-300 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Reviews */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex relative">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star}
                      className={`h-5 w-5 ${star <= Math.floor(product.reviewStats.averageRating) ? 'fill-transparent' : 'text-bg-300'}`}
                      style={star <= Math.floor(product.reviewStats.averageRating) ? {
                        fill: 'url(#star-gradient)'
                      } : {}}
                    />
                  ))}
                  {/* Define the gradient */}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className="primary-100" stopColor="var(--primary-100)" />
                        <stop offset="100%" className="primary-200" stopColor="var(--primary-200)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="text-text-200">{product.reviewStats.averageRating} out of 5</span>
                <span className="text-text-200">({product.reviewStats.totalReviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                {product.originalPrice && (
                  <span className="text-text-200 line-through">
                    ${product.originalPrice.toFixed(2)} USD
                  </span>
                )}
                <span className="text-2xl font-bold">
                  ${product.price.toFixed(2)} USD
                </span>
                {product.originalPrice && (
                  <span className="bg-white text-black px-2 py-1 rounded text-sm font-bold">SALE</span>
                )}
              </div>

              {/* Only render SizeSelector if product has sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <SizeSelector 
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  availableSizes={product.sizes}  // Pass available sizes from product
                />
              )}

              {/* Material Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-2">SELECT BOLT MATERIAL:</h3>
                <div className="flex space-x-3">
                  <button 
                    className={`w-12 h-12 rounded bg-bg-100 border-2 ${
                      selectedMaterial === 'stainless' 
                        ? 'border-primary-100' 
                        : 'border-text-100'
                    }`}
                    onClick={() => setSelectedMaterial('stainless')}
                  >
                    <span className="sr-only">Stainless</span>
                  </button>
                  <button 
                    className={`w-12 h-12 rounded bg-[#FFD700] border-2 ${
                      selectedMaterial === 'brass' 
                        ? 'border-primary-100' 
                        : 'border-text-100'
                    }`}
                    onClick={() => setSelectedMaterial('brass')}
                  >
                    <span className="sr-only">Brass</span>
                  </button>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-end justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-2 text-center">QUANTITY</span>
                  <div className="flex items-center bg-bg-100 border border-text-100 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 text-text-100 hover:text-primary-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-text-100 border-l border-r border-text-100">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 text-text-100 hover:text-primary-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  className="px-12 bg-gradient-to-r from-primary-100 to-primary-200 
                    hover:from-primary-200 hover:to-primary-100 text-white py-2 rounded-lg
                    transform transition-all duration-200 ease-in-out
                    hover:scale-105 hover:shadow-lg hover:shadow-primary-100/50
                    active:scale-95"
                >
                  ADD TO CART
                </Button>
              </div>

              

              {/* Description Section */}
              <div className="border border-text-100/10 rounded-lg mb-4 bg-bg-100">
                <button 
                  onClick={() => setOpenSection(openSection === 'description' ? null : 'description')}
                  className="flex justify-between items-center w-full p-4 text-left"
                >
                  <span className="font-semibold text-text-100">Description</span>
                  <ChevronDownIcon 
                    className={`h-5 w-5 transform transition-transform duration-200 text-text-100 ${
                      openSection === 'description' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSection === 'description' && (
                  <div className="p-4 border-t border-text-100/10">
                    <p className="text-text-200 whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Product Information Section */}
              <div className="border border-text-100/10 rounded-lg mb-4 bg-bg-100">
                <button 
                  onClick={() => setOpenSection(openSection === 'info' ? null : 'info')}
                  className="flex justify-between items-center w-full p-4 text-left"
                >
                  <span className="font-semibold text-text-100">Product Information</span>
                  <ChevronDownIcon 
                    className={`h-5 w-5 transform transition-transform duration-200 text-text-100 ${
                      openSection === 'info' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSection === 'info' && (
                  <div className="p-4 border-t border-text-100/10">
                    {/* Materials List */}
                    {product.specifications?.materials && product.specifications.materials.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-medium text-text-100 mb-2">Materials</h3>
                        <ul className="space-y-2">
                          {product.specifications.materials.map((material, index) => (
                            <li key={index} className="flex">
                              <span className="font-medium text-text-100 min-w-[120px]">{material.name}</span>
                              <span className="text-text-200">{material.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Basic Information */}
                    <div className="mb-4">
                      <h3 className="font-medium text-text-100 mb-2">Basic Information</h3>
                      <ul className="space-y-2">
                        <li className="flex">
                          <span className="font-medium text-text-100 min-w-[120px]">Category:</span>
                          <span className="text-text-200">{product.category}</span>
                        </li>
                        {product.sizes && product.sizes.length > 0 && (
                          <li className="flex">
                            <span className="font-medium text-text-100 min-w-[120px]">Available Sizes:</span>
                            <span className="text-text-200">{product.sizes.join(', ')}</span>
                          </li>
                        )}
                        <li className="flex">
                          <span className="font-medium text-text-100 min-w-[120px]">Stock:</span>
                          <span className="text-text-200">{product.stock} units</span>
                        </li>
                      </ul>
                    </div>

                    {/* Dimensions if available */}
                    {product.specifications?.dimensions && (
                      <div>
                        <h3 className="font-medium text-text-100 mb-2">Dimensions</h3>
                        <ul className="space-y-2">
                          {product.specifications.dimensions.length && (
                            <li className="flex">
                              <span className="font-medium text-text-100 min-w-[120px]">Length:</span>
                              <span className="text-text-200">{product.specifications.dimensions.length} mm</span>
                            </li>
                          )}
                          {product.specifications.dimensions.width && (
                            <li className="flex">
                              <span className="font-medium text-text-100 min-w-[120px]">Width:</span>
                              <span className="text-text-200">{product.specifications.dimensions.width} mm</span>
                            </li>
                          )}
                          {product.specifications.dimensions.height && (
                            <li className="flex">
                              <span className="font-medium text-text-100 min-w-[120px]">Height:</span>
                              <span className="text-text-200">{product.specifications.dimensions.height} mm</span>
                            </li>
                          )}
                          {product.specifications.dimensions.weight && (
                            <li className="flex">
                              <span className="font-medium text-text-100 min-w-[120px]">Weight:</span>
                              <span className="text-text-200">{product.specifications.dimensions.weight} g</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-text-200">Loading product details...</p>
        )}
      </div>
      
      {/* Add the ReviewSummary component after the collapsible sections */}
      {product && (
        <div className="mt-12 border-t border-bg-300">
          <ReviewSummary productId={product._id} />
        </div>
      )}

      {/* Add notification */}
      <AddToCartNotification 
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default ProductDetail; 