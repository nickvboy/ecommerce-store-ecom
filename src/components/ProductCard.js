import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';

function ProductCard({ product }) {
  const [loadedImages, setLoadedImages] = useState([]);

  useEffect(() => {
    // Preload images
    product.images.forEach(img => {
      const image = new Image();
      image.src = img.url;
      image.onload = () => {
        setLoadedImages(prev => [...prev, img.url]);
      };
    });
  }, [product.images]);

  return (
    <Link to={`/products/${product._id}`} className="group block transition-transform duration-300 hover:-translate-y-1">
      <div className="relative bg-bg-200 rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          {loadedImages.includes(product.images[0]?.url) ? (
            <img 
              src={product.images[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-bg-300 animate-pulse" />
          )}
        </div>
        
        {/* Sale Badge */}
        {product.originalPrice && (
          <div className="absolute top-2 right-2">
            <span className="bg-white text-black px-2 py-1 rounded text-sm font-bold">
              SALE
            </span>
          </div>
        )}

        {/* Stock Indicator */}
        <div className="absolute bottom-2 right-2">
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            product.stock === 0 
              ? 'bg-red-500 text-white' 
              : product.stock <= 5 
                ? 'bg-yellow-500 text-black'
                : 'bg-green-500 text-white'
          }`}>
            {product.stock === 0 
              ? 'Out of Stock' 
              : product.stock <= 5 
                ? `Only ${product.stock} left` 
                : 'In Stock'}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1.5 flex flex-col items-center text-center">
        <h3 className="font-bold text-lg text-text-100 px-2 group-hover:underline decoration-2 decoration-primary-100">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon 
              key={star}
              className={`h-5 w-5 ${
                star <= Math.floor(product.averageRating) 
                  ? 'text-primary-200' 
                  : 'text-bg-300'
              }`}
            />
          ))}
          <span className="text-sm text-text-200 ml-1">
            ({product.totalReviews} reviews)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {product.originalPrice && (
            <span className="text-sm text-text-200 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-bold text-text-100">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard; 