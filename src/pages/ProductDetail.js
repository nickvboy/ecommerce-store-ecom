import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Button } from "../components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import ReviewSummary from '../components/ReviewSummary';

function ProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('stainless');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

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
    const thumbnailHeight = 80; // height of each thumbnail + gap
    const maxScroll = Math.max(0, (images.length * thumbnailHeight) - 320); // 320 is visible area height
    const newPosition = direction === 'up' 
      ? Math.max(0, scrollPosition - thumbnailHeight)
      : Math.min(maxScroll, scrollPosition + thumbnailHeight);
    setScrollPosition(newPosition);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-text-100 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link 
          to="/products" 
          className="inline-flex items-center text-text-200 hover:text-primary-100 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          BACK TO SHOP
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="relative flex gap-4">
            {/* Mobile Carousel */}
            <div className="md:hidden relative w-full">
              <div className="relative rounded-lg overflow-hidden">
                <div 
                  className={`w-full aspect-square ${images[currentImageIndex].color} rounded-lg`}
                />
                
                {/* Navigation Arrows */}
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {images.map((_, index) => (
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
                {/* Scroll Up Button */}
                <button 
                  onClick={() => handleScroll('up')}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-text-200 hover:text-primary-100"
                  disabled={scrollPosition === 0}
                >
                  <ChevronUpIcon className="h-6 w-6" />
                </button>

                {/* Thumbnails Container */}
                <div className="h-[400px] overflow-hidden relative">
                  <div 
                    className="absolute w-full transition-transform duration-300 py-2"
                    style={{ transform: `translateY(-${scrollPosition}px)` }}
                  >
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-full aspect-square mb-4 rounded-lg overflow-hidden 
                          ${currentImageIndex === index 
                            ? 'ring-2 ring-primary-100' 
                            : 'opacity-50 hover:opacity-75'}`}
                      >
                        <div className={`w-full h-full ${image.color} rounded-lg`} />
                      </button>
                    ))}
                    {/* Add extra padding at bottom for scrolling */}
                    <div className="h-20"></div>
                  </div>
                </div>

                {/* Scroll Down Button */}
                <button 
                  onClick={() => handleScroll('down')}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 text-text-200 hover:text-primary-100"
                  disabled={scrollPosition >= (images.length * 80) - 320}
                >
                  <ChevronDownIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Main Image */}
              <div className="flex-1 rounded-lg overflow-hidden">
                <div 
                  className={`w-full aspect-square ${images[currentImageIndex].color} rounded-lg`}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">SCRIBEDRIVER BOLT ACTION PEN</h1>
            
            {/* Reviews */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex relative">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon 
                    key={star}
                    className={`h-5 w-5 ${star <= 4 
                      ? 'fill-transparent' 
                      : 'text-bg-300'}`}
                    style={star <= 4 ? {
                      fill: 'url(#star-gradient)'
                    } : {}}
                  />
                ))}
                {/* Define the gradient */}
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff983f" /> {/* primary-200 */}
                      <stop offset="100%" stopColor="#f1690e" /> {/* primary-100 */}
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-text-200">730 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-text-200 line-through">$29.99 USD</span>
              <span className="text-2xl font-bold">$19.99 USD</span>
              <span className="bg-white text-black px-2 py-1 rounded text-sm font-bold">SALE</span>
            </div>

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
                <div className="flex items-center bg-[#1A1A1A] border border-text-100 rounded-lg overflow-hidden">
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
                className="px-12 bg-gradient-to-r from-primary-100 to-primary-200 
                  hover:from-primary-200 hover:to-primary-100 text-white py-2 rounded-lg
                  transform transition-all duration-200 ease-in-out
                  hover:scale-105 hover:shadow-lg hover:shadow-primary-100/50
                  active:scale-95 relative
                  after:absolute after:inset-0 after:rounded-lg
                  after:shadow-[0_0_15px_3px] after:shadow-primary-100/30
                  after:transition-opacity after:duration-200
                  after:opacity-0 hover:after:opacity-100"
              >
                ADD TO CART
              </Button>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-4">
              <Collapsible>
                <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-[#1A1A1A] border border-text-100 rounded-lg group">
                  <span className="font-bold">Description</span>
                  <span className="text-text-100 transition-transform duration-300 group-data-[state=open]:rotate-180">▼</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                  <div className="mt-0 p-4 bg-[#1A1A1A] border-x border-b border-text-100 rounded-b-lg">
                    <h3 className="font-bold mb-2">Materials</h3>
                    <ul className="list-disc pl-5 space-y-1 text-text-200">
                      <li>Body: 303 Stainless steel</li>
                      <li>Bolt: 303 stainless or Lead free brass</li>
                      <li>Pen Clip: Nickel plated spring steel</li>
                    </ul>
                    <h3 className="font-bold mt-4 mb-2">Ink refill:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-text-200">
                      <li>Schmidt EasyFlow 9000 medium, black</li>
                      <li>Compatible with "Parker G2" ISO 12757-1 refills</li>
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-[#1A1A1A] border border-text-100 rounded-lg group">
                  <span className="font-bold">Product Information</span>
                  <span className="text-text-100 transition-transform duration-300 group-data-[state=open]:rotate-180">▼</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                  <div className="mt-0 p-4 bg-[#1A1A1A] border-x border-b border-text-100 rounded-b-lg">
                    {/* Add product information content */}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add the ReviewSummary component after the collapsible sections */}
      <div className="mt-12 border-t border-bg-300">
        <ReviewSummary reviews={[
          // Temporary mock data - will be replaced with real data later
          { rating: 5, comment: "Great product!" },
          { rating: 5, comment: "Love it!" },
          { rating: 4, comment: "Pretty good" },
          { rating: 4, comment: "Nice quality" },
          { rating: 3, comment: "It's okay" },
          // ... add more mock reviews as needed
        ]} />
      </div>
    </div>
  );
}

export default ProductDetail; 