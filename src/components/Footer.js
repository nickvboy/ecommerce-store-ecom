import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-bg-200/50 to-bg-200 backdrop-blur-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-6 pb-6 border-b border-bg-300">
          {/* Logo and Newsletter */}
          <div className="md:col-span-2 pr-4">
            <Link to="/" className="inline-block mb-3">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="hover:scale-105 transition-transform"
              >
                <path d="M20 4L4 12L20 20L36 12L20 4Z" fill="currentColor" className="text-primary-200"/>
                <path d="M4 20L20 28L36 20" stroke="currentColor" className="text-primary-200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 28L20 36L36 28" stroke="currentColor" className="text-primary-200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              </svg>
            </Link>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Subscribe to our newsletter"
                className="flex-1 px-3 py-1.5 rounded-lg bg-bg-100/50 border border-bg-300 
                  text-text-100 placeholder-text-200 focus:outline-none focus:border-primary-100
                  transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary-100 text-white rounded-lg hover:bg-primary-200 
                  transition-colors text-sm font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-100 relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-8 after:h-0.5 after:bg-primary-100">
              Shop
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/products" className="text-text-200 hover:text-primary-100 transition-colors">All Products</Link></li>
              <li><Link to="/new-arrivals" className="text-text-200 hover:text-primary-100 transition-colors">New Arrivals</Link></li>
              <li><Link to="/bestsellers" className="text-text-200 hover:text-primary-100 transition-colors">Bestsellers</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-100 relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-8 after:h-0.5 after:bg-primary-100">
              Company
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/about" className="text-text-200 hover:text-primary-100 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-text-200 hover:text-primary-100 transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="text-text-200 hover:text-primary-100 transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-100 relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-8 after:h-0.5 after:bg-primary-100">
              Support
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/faq" className="text-text-200 hover:text-primary-100 transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="text-text-200 hover:text-primary-100 transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="text-text-200 hover:text-primary-100 transition-colors">Returns</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-text-200 pt-2">
          <p>&copy; {new Date().getFullYear()} GridgeGear. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary-100 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary-100 transition-colors">Terms</Link>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-100 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="hover:text-primary-100 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 