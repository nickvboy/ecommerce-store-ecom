import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpBackground from '../components/SignUpBackground';
import { useUser } from '../contexts/UserContext';
import api from '../lib/api';

function Login() {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/users/login', formData);

      // Update user context with the logged in user data
      updateUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isGuest: false
      });

      // Store the token
      localStorage.setItem('token', data.token);

      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable scrolling when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full md:w-[480px] bg-bg-100/80 backdrop-blur-xl p-8 flex flex-col 
        justify-center relative z-10 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-100 mb-2">Welcome Back!</h1>
          <p className="text-text-200">
            Log in to your account to continue your journey.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-200 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-bg-300 bg-bg-100 text-text-100
                focus:outline-none focus:ring-2 focus:ring-primary-100/50"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-200 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-bg-300 bg-bg-100 text-text-100
                focus:outline-none focus:ring-2 focus:ring-primary-100/50"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-bg-300 text-primary-100 focus:ring-primary-100/50"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-text-200">
                Remember me
              </label>
            </div>
            <a href="/forgot-password" className="text-sm text-primary-100 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-md bg-primary-100 hover:bg-primary-200 
              text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-text-200">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary-100 hover:underline">
            Sign Up
          </a>
        </p>
      </div>

      {/* Right side - Background */}
      <div className="hidden md:block flex-1 relative">
        <SignUpBackground />
      </div>
    </div>
  );
}

export default Login; 