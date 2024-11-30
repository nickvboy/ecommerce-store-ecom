import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpBackground from '../components/SignUpBackground';
import { useUser } from '../contexts/UserContext';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

function SignUp() {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    address: ''
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
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Update user context with the new user data
      updateUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isAnonymous: false
      });

      // Store the token
      localStorage.setItem('token', data.token);

      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err.message);
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
          <h1 className="text-3xl font-bold text-text-100 mb-2">Welcome!</h1>
          <p className="text-text-200">
            Create an account to view awesome content and support your favorite creator today!
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-200 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-bg-300 bg-bg-100 text-text-100
                focus:outline-none focus:ring-2 focus:ring-primary-100/50"
              placeholder="Enter your full name"
              required
            />
          </div>

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
            <label htmlFor="username" className="block text-sm font-medium text-text-200 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-bg-300 bg-bg-100 text-text-100
                focus:outline-none focus:ring-2 focus:ring-primary-100/50"
              placeholder="Choose a username"
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
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-text-200 mb-1">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-bg-300 bg-bg-100 text-text-100
                focus:outline-none focus:ring-2 focus:ring-primary-100/50"
              placeholder="Enter your address"
              rows="3"
              required
            />
          </div>

          <div className="text-sm text-text-200">
            By signing up, you confirm that you have read and agree to our{' '}
            <a href="/terms" className="text-primary-100 hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-primary-100 hover:underline">Privacy Policy</a>.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-md bg-primary-100 hover:bg-primary-200 
              text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-text-200">
          Already a member?{' '}
          <a href="/login" className="text-primary-100 hover:underline">
            Log In
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

export default SignUp; 