import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

function UnderConstruction() {
  const location = useLocation();
  
  // Format the path to a readable page name
  const getPageName = () => {
    const path = location.pathname.substring(1); // Remove leading slash
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Convert kebab-case or snake_case to Title Case
    return lastPart
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        {/* Construction Animation */}
        <div className="mb-8 relative">
          <svg
            className="w-24 h-24 mx-auto text-primary-100 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <div className="h-1 w-16 bg-primary-100/50 mx-auto mt-4 rounded-full animate-pulse" />
        </div>

        <h1 className="text-3xl font-bold text-text-100 mb-4">
          {getPageName()} Page Under Construction
        </h1>
        
        <p className="text-text-200 mb-2">
          We're working hard to bring you something amazing. This page is currently under construction and will be available soon.
        </p>
        
        <p className="text-sm text-text-200 mb-8 italic">
          Check back in approximately 99,999 years (give or take a few centuries) 😉
        </p>

        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-100 text-white 
            hover:bg-primary-200 transition-colors gap-2 group"
        >
          <HomeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

export default UnderConstruction; 