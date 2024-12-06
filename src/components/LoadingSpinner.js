import React from 'react';

function LoadingSpinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin`}></div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}

LoadingSpinner.defaultProps = {
  size: 'medium'
};

export default LoadingSpinner; 