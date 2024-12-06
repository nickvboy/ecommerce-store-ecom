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
            className="xl:hidden text-text-100 hover:text-primary-100"
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
              className="hover:scale-105 transition-transform hidden xl:block"
            >
              <path
                d="M20 4L4 12L20 20L36 12L20 4Z"
                fill="currentColor"
                className="animate-pulse text-primary-200"
              />
              <path
                d="M4 20L20 28L36 20"
                stroke="currentColor"
                className="text-primary-200"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 28L20 36L36 28"
                stroke="currentColor"
                className="text-primary-200"
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
              className="xl:hidden"
            >
              <path
                d="M20 4L4 12L20 20L36 12L20 4Z"
                fill="currentColor"
                className="animate-pulse text-primary-200"
              />
              <path
                d="M4 20L20 28L36 20"
                stroke="currentColor"
                className="text-primary-200"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 28L20 36L36 28"
                stroke="currentColor"
                className="text-primary-200"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center justify-center flex-1 space-x-16">
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
            <div className="relative group">
              <Link to="/about" className="font-bold relative group text-base tracking-wide">
                <span className="hover:text-primary-100 transition-colors">About</span>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </Link>
              {/* About Submenu */}
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-bg-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link to="/about/tagline" className="block px-4 py-2 text-text-200 hover:text-primary-100 hover:bg-bg-200">
                    Our Tagline
                  </Link>
                  <Link to="/about/story" className="block px-4 py-2 text-text-200 hover:text-primary-100 hover:bg-bg-200">
                    Company Story
                  </Link>
                  <Link to="/about/factsheet" className="block px-4 py-2 text-text-200 hover:text-primary-100 hover:bg-bg-200">
                    Fact Sheet
                  </Link>
                  <Link to="/about/team" className="block px-4 py-2 text-text-200 hover:text-primary-100 hover:bg-bg-200">
                    Meet the Team
                  </Link>
                </div>
              </div>
            </div>
            <Link to="/contact" className="font-bold relative group text-base tracking-wide">
              <span className="hover:text-primary-100 transition-colors">Contact</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
            </Link>
            <Link to="/privacy" className="font-bold relative group text-base tracking-wide">
              <span className="hover:text-primary-100 transition-colors">Privacy</span>
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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 xl:hidden
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto z-60' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-bg-100 transform transition-transform duration-300 ease-in-out z-60
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <Link to="/" className="text-xl font-bold text-primary-100" onClick={() => setIsMobileMenuOpen(false)}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 4L4 12L20 20L36 12L20 4Z"
                    fill="currentColor"
                    className="animate-pulse text-primary-200"
                  />
                  <path
                    d="M4 20L20 28L36 20"
                    stroke="currentColor"
                    className="text-primary-200"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 28L20 36L36 28"
                    stroke="currentColor"
                    className="text-primary-200"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                </svg>
              </Link>
              <button
                className="text-text-100 hover:text-primary-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
            </div>

            <div className="space-y-6">
              <Link
                to="/"
                className="block font-bold text-lg hover:text-primary-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/gear"
                className="block font-bold text-lg hover:text-primary-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gear
              </Link>
              <Link
                to="/clothing"
                className="block font-bold text-lg hover:text-primary-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Clothing
              </Link>
              <Link
                to="/products"
                className="block font-bold text-lg hover:text-primary-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Products
              </Link>
              
              {/* About section with submenu */}
              <div className="space-y-2">
                <Link
                  to="/about"
                  className="block font-bold text-lg hover:text-primary-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <div className="pl-4 space-y-2">
                  <Link
                    to="/about/tagline"
                    className="block text-text-200 hover:text-primary-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Our Tagline
                  </Link>
                  <Link
                    to="/about/story"
                    className="block text-text-200 hover:text-primary-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Company Story
                  </Link>
                  <Link
                    to="/about/factsheet"
                    className="block text-text-200 hover:text-primary-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Fact Sheet
                  </Link>
                  <Link
                    to="/about/team"
                    className="block text-text-200 hover:text-primary-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Meet the Team
                  </Link>
                </div>
              </div>

              <Link
                to="/contact"
                className="block font-bold text-lg hover:text-primary-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/privacy"
                className="block font-bold text-lg hover:text-primary-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Privacy
              </Link>

              {/* Mobile Search Button */}
              <button
                className="flex items-center space-x-2 font-bold text-lg hover:text-primary-100 transition-colors w-full"
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
                <span>Search</span>
              </button>

              {/* Mobile Profile Button */}
              <button
                className="flex items-center space-x-2 font-bold text-lg hover:text-primary-100 transition-colors w-full"
                onClick={() => {
                  toggleProfileCard();
                  setIsMobileMenuOpen(false);
                }}
              >
                <UserIcon className="h-6 w-6" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add the SearchOverlay component */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Add CartOverlay */}
      <CartOverlay
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </nav>
  );
}

export default Navbar; 