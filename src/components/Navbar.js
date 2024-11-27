import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

function MobileMenu({ isOpen, onClose }) {
  return (
    <div 
      className={`fixed inset-0 bg-bg-100 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:hidden`}
      style={{ zIndex: 1000 }}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-xl font-bold text-primary-100">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 4L4 12L20 20L36 12L20 4Z"
                fill="#FF6600"
                className="animate-pulse"
              />
              <path
                d="M4 20L20 28L36 20"
                stroke="#FF6600"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 28L20 36L36 28"
                stroke="#FF6600"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </Link>
          <button onClick={onClose} className="text-text-100 hover:text-primary-100">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col space-y-6">
          <Link to="/" className="text-xl font-bold text-text-100 hover:text-primary-100">Home</Link>
          <Link to="/gear" className="text-xl font-bold text-text-100 hover:text-primary-100">Gear</Link>
          <Link to="/clothing" className="text-xl font-bold text-text-100 hover:text-primary-100">Clothing</Link>
          <Link to="/products" className="text-xl font-bold text-text-100 hover:text-primary-100">All Products</Link>
          <Link to="/bfcm" className="text-xl font-bold text-text-100 hover:text-primary-100">BFCM</Link>
        </nav>
        <div className="mt-auto">
          <div className="flex justify-around py-4 border-t border-bg-300">
            <button className="text-text-100 hover:text-primary-100">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <button className="text-text-100 hover:text-primary-100">
              <UserIcon className="h-6 w-6" />
            </button>
            <button className="text-text-100 hover:text-primary-100">
              <ShoppingCartIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-bg-100 text-text-100 sticky top-0 z-50">
      <div className="flex justify-between items-center h-20 px-6 md:px-10 lg:px-[88px]">
        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-text-100 hover:text-primary-100"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Bars3Icon className="h-8 w-8" />
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary-100">
          <svg
            width="48"
            height="48"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hover:scale-105 transition-transform hidden lg:block"
          >
            <path
              d="M20 4L4 12L20 20L36 12L20 4Z"
              fill="#FF6600"
              className="animate-pulse"
            />
            <path
              d="M4 20L20 28L36 20"
              stroke="#FF6600"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 28L20 36L36 28"
              stroke="#FF6600"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </svg>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lg:hidden"
          >
            <path
              d="M20 4L4 12L20 20L36 12L20 4Z"
              fill="#FF6600"
              className="animate-pulse"
            />
            <path
              d="M4 20L20 28L36 20"
              stroke="#FF6600"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 28L20 36L36 28"
              stroke="#FF6600"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </svg>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 space-x-16">
          <Link to="/" className="font-bold relative group text-base tracking-wide">
            <span className="hover:text-primary-100 transition-colors">Home</span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
          </Link>
          <Link to="/gear" className="font-bold relative group text-base tracking-wide">
            <span className="hover:text-primary-100 transition-colors">Gear</span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
          </Link>
          <Link to="/clothing" className="font-bold relative group text-base tracking-wide">
            <span className="hover:text-primary-100 transition-colors">Clothing</span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
          </Link>
          <Link to="/products" className="font-bold relative group text-base tracking-wide">
            <span className="hover:text-primary-100 transition-colors">All Products</span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
          </Link>
          <Link to="/bfcm" className="font-bold relative group text-base tracking-wide">
            <span className="hover:text-primary-100 transition-colors">BFCM</span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
          </Link>
        </div>
        
        {/* Icons */}
        <div className="flex items-center space-x-6 md:space-x-8">
          <button className="hidden md:block hover:text-primary-100 transition-colors">
            <MagnifyingGlassIcon className="h-7 w-7" />
          </button>
          <button className="hidden md:block hover:text-primary-100 transition-colors">
            <UserIcon className="h-7 w-7" />
          </button>
          <button className="hover:text-primary-100 transition-colors">
            <ShoppingCartIcon className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </nav>
  );
}

export default Navbar; 