import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="relative bg-bg-200 rounded-lg overflow-hidden">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <div className={`w-full h-full ${product.images[0]} transition-transform duration-300 group-hover:scale-105`} />
        </div>
        
        {/* Sale Badge */}
        {product.originalPrice && (
          <div className="absolute top-2 right-2">
            <span className="bg-white text-black px-2 py-1 rounded text-sm font-bold">
              SALE
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon 
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(product.rating) 
                    ? 'text-primary-100' 
                    : 'text-bg-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-text-200">
            {product.reviews?.length || 0} reviews
          </span>
        </div>

        <h3 className="font-bold text-text-100">{product.name}</h3>
        
        <div className="flex items-center space-x-2">
          {product.originalPrice && (
            <span className="text-sm text-text-200 line-through">
              ${product.originalPrice.toFixed(2)} USD
            </span>
          )}
          <span className="text-lg font-bold text-text-100">
            ${product.price.toFixed(2)} USD
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard; 