import React, { useState, useEffect } from 'react';

function SignUpBackground() {
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/Supplementalassests/signup-bg.png';
    img.onload = () => {
      setImageLoaded(true);
      setIsLoading(false);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-bg-100 flex items-center justify-center z-20">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-100 animate-bounce" />
            <div className="w-3 h-3 rounded-full bg-primary-100 animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 rounded-full bg-primary-100 animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {/* Background Image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <img
          src="/Supplementalassests/signup-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/10 to-accent-100/10" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="grid grid-cols-3 gap-8 opacity-30">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary-100/30 to-accent-100/30 
            animate-[float_6s_ease-in-out_infinite] blur-sm" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-accent-100/30 to-primary-100/30 
            animate-[float_8s_ease-in-out_infinite_1s] blur-sm" />
          <div className="w-40 h-40 rounded-full bg-gradient-to-r from-primary-200/30 to-primary-100/30 
            animate-[float_7s_ease-in-out_infinite_0.5s] blur-sm" />
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}

export default SignUpBackground; 