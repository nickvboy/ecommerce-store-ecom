function SizeSelector({ selectedSize, onSizeChange, availableSizes }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold mb-2">SELECT SIZE:</h3>
      <div className="grid grid-cols-6 gap-2 max-w-[360px]">
        {availableSizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`w-12 h-12 flex items-center justify-center border ${
              selectedSize === size
                ? 'border-primary-100 bg-bg-200 text-text-100'
                : 'border-bg-300 text-text-200 hover:border-text-100'
            } transition-colors text-sm`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SizeSelector; 