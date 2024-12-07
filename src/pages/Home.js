import { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../lib/utils';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerImages, setBannerImages] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stories, setStories] = useState([]);

  useEffect(() => {
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

  // Get hourly rotating products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/products/filter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            limit: 10
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

        // This will ensure the same products are shown for the entire hour
        const now = new Date();
        const currentHour = `${now.toDateString()}-${now.getHours()}`;
        const seedValue = currentHour.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
    const interval = setInterval(fetchProducts, 60 * 60 * 1000);
    return () => clearInterval(interval);
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

  // Get random products for newsletter section
  useEffect(() => {
    const fetchNewsletterContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/filter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            limit: 20
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        if (!data.products?.length) return;

        // Use date as seed for consistent daily selection
        const today = new Date().toDateString();
        const seedValue = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let counter = seedValue;

        const seededRandom = () => {
          counter = (counter * 9301 + 49297) % 233280;
          return counter / 233280;
        };

        const storyContent = [
          { 
            title: "Survival Tech Spotlight", 
            tagline: "Next-gen gear for when it matters most",
            category: "Tech Innovation"
          },
          { 
            title: "Field-Tested Excellence", 
            tagline: "Real preppers, real challenges, real results",
            category: "Field Reports"
          },
          { 
            title: "Off-Grid Innovation", 
            tagline: "Tomorrow's survival tech, available today",
            category: "Product Research"
          }
        ];

        setStories(storyContent);

      } catch (error) {
        console.error('Error fetching newsletter content:', error);
      }
    };

    fetchNewsletterContent();
  }, []);

  return (
    <>
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
                Featured Products
              </span>
            </h2>
            <p className="mt-2 text-text-200">Handpicked favorites refreshed hourly</p>
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

        {/* Newsletter Section */}
        <div className="relative overflow-hidden rounded-2xl bg-bg-200">
          {/* Newsletter Content */}
          <div className="relative">
            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              {stories.map((story, index) => (
                <div 
                  key={index}
                  className="relative aspect-[16/9] group overflow-hidden rounded-lg bg-bg-300 shadow-lg 
                    hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1
                    cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-100/90 via-bg-100/50 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 transition-transform duration-500 group-hover:translate-y-0 translate-y-4">
                    <span className="text-sm font-medium text-primary-100 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {story.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-1 transform transition-transform duration-500 group-hover:-translate-y-1">
                      {story.title}
                    </h3>
                    <p className="text-text-200 transform transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
                      {story.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subscribe Form */}
            <div className="px-8 pb-8">
              <div className="max-w-2xl mx-auto">
                <form className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="relative flex-1">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-200" />
                    <input
                      type="email"
                      placeholder="Enter your email for exclusive updates"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-200/50 border border-bg-300 
                        text-text-100 placeholder-text-200 focus:outline-none focus:border-primary-100
                        backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary-100/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-lg font-semibold text-white
                      bg-gradient-to-r from-primary-100 to-primary-200 
                      hover:from-primary-200 hover:to-primary-100
                      transform transition-all duration-300 hover:scale-105
                      shadow-lg hover:shadow-xl"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home; 