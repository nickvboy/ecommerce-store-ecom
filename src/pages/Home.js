import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [colorSlides, setColorSlides] = useState([]);

  // Array of vibrant colors to choose from
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-rose-500',
    'bg-emerald-500'
  ];

  // Generate random slides on component mount
  useEffect(() => {
    const shuffledColors = [...colors]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
    
    setColorSlides(shuffledColors);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === 5 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 5 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
        <div className="relative aspect-[21/9]">
          {colorSlides.map((color, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${color}
                ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {colorSlides.map((_, index) => (
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
      </div>
    </div>
  );
}

export default Home; 