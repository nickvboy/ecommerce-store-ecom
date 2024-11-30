import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import SearchOverlay from './SearchOverlay';
import ProfileCard from './ProfileCard';
import { useUser } from '../contexts/UserContext';
import CartOverlay from './CartOverlay';
import { useCart } from '../contexts/CartContext';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { toggleProfileCard, closeProfileCard } = useUser();
  const { cartItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check if current page is signup
  const isSignUpPage = location.pathname === '/signup';

  // Close profile card when navigating to signup page
  useEffect(() => {
    if (isSignUpPage) {
      closeProfileCard();
    }
  }, [isSignUpPage, closeProfileCard]);

  useEffect(() => {
    const controlNavbar = () => {
      // Skip scroll handling on signup page
      if (isSignUpPage) {
        setVisible(true);
        return;
      }

      if (window.scrollY > lastScrollY && window.scrollY > 50) { // Scrolling down
        setVisible(false);
      } else { // Scrolling up
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY, isSignUpPage]);

  return (
    <nav 
      className={`fixed w-full top-0 transform transition-transform duration-300 ease-in-out
        ${!visible && !isSignUpPage ? '-translate-y-full' : 'translate-y-0'}
        ${location.pathname === '/' && window.scrollY < 50 
          ? 'bg-transparent' 
          : 'bg-bg-100/80 backdrop-blur-xl'
        }
        ${isSignUpPage ? 'z-[40]' : 'z-[50]'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 px-6 md:px-10 lg:px-8">
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
            <button 
              className="hidden md:block hover:text-primary-100 transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              <MagnifyingGlassIcon className="h-7 w-7" />
            </button>
            <div className="relative profile-container">
              <button 
                className="hidden md:block hover:text-primary-100 transition-colors"
                onClick={toggleProfileCard}
              >
                <UserIcon className="h-7 w-7" />
              </button>
              <ProfileCard />
            </div>
            <button 
              className="hover:text-primary-100 transition-colors relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCartIcon className="h-7 w-7" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary-100 
                  flex items-center justify-center text-xs text-white font-medium">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add the SearchOverlay component */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Add CartOverlay */}
      <CartOverlay
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </nav>
  );
}

export default Navbar; 