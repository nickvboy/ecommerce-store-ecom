import { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerImages, setBannerImages] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const images = [];
    for (let i = 1; i <= 3; i++) {
      const imagePath = `/Supplementalassests/banner-images/banner${i}.png`;
      const img = new Image();
      img.src = imagePath;
      img.onload = () => {
        setLoadedImages(prev => [...prev, imagePath]);
        setBannerImages(prev => [...prev, imagePath].sort());
      };
    }
  }, []);

  // Get daily rotating products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('http://localhost:5000/api/products/filter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            limit: 10 // Fetch more than we need to have variety
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        
        if (!data.products || !Array.isArray(data.products)) {
          console.warn('No products found or invalid data format');
          return;
        }

        // This will ensure the same products are shown for the entire day
        const today = new Date().toDateString();
        const seedValue = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let counter = seedValue;

        // Create a seeded random number generator
        const seededRandom = () => {
          counter = (counter * 9301 + 49297) % 233280;
          return counter / 233280;
        };

        const shuffled = [...data.products].sort(() => seededRandom() - 0.5);
        const selectedProducts = shuffled.slice(0, 3);
        setBestSellers(selectedProducts);

      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Unable to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev === bannerImages.length - 1 ? 0 : prev + 1));
  }, [bannerImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  }, [bannerImages.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (bannerImages.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, bannerImages.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* Carousel Container */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>

        {/* Carousel Content */}
        <div className="relative aspect-[16/9]">
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500
                ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            >
              {loadedImages.includes(image) ? (
                <img 
                  src={image} 
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-bg-300 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        {bannerImages.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 
                  ${currentSlide === index 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/75'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bestsellers Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-100">
            <span className="bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
              Today's Bestsellers
            </span>
          </h2>
          <p className="mt-2 text-text-200">Handpicked favorites refreshed daily</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeleton
            [...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-bg-300 rounded-lg mb-3" />
                <div className="h-4 bg-bg-300 rounded w-3/4 mb-2" />
                <div className="h-4 bg-bg-300 rounded w-1/2" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-3 text-center text-red-500">
              {error}
            </div>
          ) : (
            bestSellers.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
              />
            ))
          )}
        </div>

        {/* View All Products Button */}
        <div className="flex justify-center mt-8">
          <Link 
            to="/products" 
            className="inline-block px-8 py-3 text-white font-semibold rounded-lg
              bg-gradient-to-r from-primary-100 to-primary-200 
              hover:from-primary-200 hover:to-primary-100
              transform transition-all duration-300 hover:scale-105
              shadow-lg hover:shadow-xl"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home; 