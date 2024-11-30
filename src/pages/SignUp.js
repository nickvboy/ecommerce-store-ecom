import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingDots from '../components/LoadingDots';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = '/Supplementalassests/signup-bg.png';
    img.onload = () => {
      setImageLoaded(true);
      // Add a small delay before showing content for smooth transition
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          setShowContent(true);
        }, 100);
      }, 600);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-bg-100 flex relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/Supplementalassests/signup-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Loading Animation */}
      <div 
        className={`fixed inset-0 z-[9060] bg-bg-100 flex items-center justify-center transition-opacity duration-500 ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <LoadingDots text="Loading experience..." />
      </div>

      {/* Frosted Glass Effect Container */}
      <div className={`fixed left-0 w-[480px] z-[9999] h-screen overflow-y-auto scrollbar-hide transition-transform duration-500 ${
        showContent ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Solid background with gradient */}
        <div className="absolute inset-0 w-[480px]">
          <div className="w-full h-full bg-bg-100/90 relative">
            {/* Right-side gradient */}
            <div 
              className="absolute inset-y-0 left-full w-[480px]"
              style={{
                background: 'linear-gradient(90deg, rgba(26, 26, 26, 0.98) 0%, rgba(26, 26, 26, 0.2) 50%, transparent 100%)'
              }}
            />
            <div className="absolute inset-0 backdrop-blur-xl" />
          </div>
        </div>

        {/* Content with fade-in */}
        <div className={`relative z-[1000] p-12 pt-28 flex flex-col min-h-screen transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex-1">
            <Link 
              to="/" 
              className="inline-flex items-center text-text-200 hover:text-primary-100 mb-12"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <h1 className="text-3xl font-bold text-text-100 mb-3">Welcome!</h1>
            <p className="text-text-200 mb-8">
              Create an account to view awesome content and support your favorite creator today!
            </p>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-100 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-bg-200/50 border border-bg-300 text-text-100 
                    focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent
                    placeholder-text-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-100 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-bg-200/50 border border-bg-300 text-text-100 
                    focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent
                    placeholder-text-200 backdrop-blur-sm"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-100 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-bg-200/50 border border-bg-300 text-text-100 
                      focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent
                      placeholder-text-200 backdrop-blur-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-200 hover:text-text-100"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-text-200">
                By signing up, you confirm that you have read and agree to our{' '}
                <Link to="/terms" className="text-primary-100 hover:text-primary-200">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-100 hover:text-primary-200">
                  Privacy Policy
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-100 text-white py-3 rounded-lg font-medium
                  hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-primary-100 focus:ring-offset-bg-100"
              >
                Sign Up
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-text-200">
              Already a member?{' '}
              <Link to="/login" className="text-primary-100 hover:text-primary-200 font-medium">
                Log In
              </Link>
            </div>
          </div>

          <div className="pt-8 mt-auto border-t border-bg-300/30">
            <div className="flex items-center justify-between text-sm text-text-200">
              <Link to="/terms" className="hover:text-primary-100">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-primary-100">Privacy Policy</Link>
              <Link to="/support" className="hover:text-primary-100">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp; 