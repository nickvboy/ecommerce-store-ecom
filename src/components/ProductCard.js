import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const { originalPrice, price } = product;

  return (
    <Link to={`/products/${product.id}`} className="flex flex-col items-center group">
      <div className="relative w-full mb-3 transition-transform duration-200 ease-out group-hover:scale-[1.02]">
        <div className="rounded-xl overflow-hidden bg-bg-200">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full aspect-square object-cover"
          />
        </div>
        {product.bundle && (
          <div className="absolute bottom-4 right-4">
            <div className="bg-[#FFD700] text-black px-3 py-0.5 rounded-md font-bold text-sm">
              BUNDLE
            </div>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-text-100 text-center mb-1.5 group-hover:underline decoration-text-100 decoration-2">
        {product.name}
      </h3>
      <div className="flex items-center space-x-2">
        {originalPrice && (
          <span className="text-text-200 line-through text-sm">${originalPrice.toFixed(2)} USD</span>
        )}
        <span className="text-text-100 font-bold text-sm">${price.toFixed(2)} USD</span>
      </div>
    </Link>
  );
}

export default ProductCard; 