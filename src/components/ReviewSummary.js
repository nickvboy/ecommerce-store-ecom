import { useState, useEffect, useCallback } from 'react';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ReviewCard from './ReviewCard';
import { API_BASE_URL } from '../lib/utils';

function ReviewSummary({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: Array(5).fill(0)
  });
  
  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
      
      // Calculate stats once when data is fetched
      const avgRating = data.reduce((acc, review) => acc + review.rating, 0) / data.length;
      const distribution = Array(5).fill(0);
      data.forEach(review => {
        distribution[review.rating - 1]++;
      });
      
      setStats({
        averageRating: avgRating,
        totalReviews: data.length,
        distribution
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filter reviews for display only
  const filteredReviews = reviews.filter(review =>
    review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate percentages using the original stats
  const percentages = stats.distribution.map(count => 
    (stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-text-100 text-center mb-8">
        Customer Reviews
      </h2>
      
      <div className="flex flex-row justify-between mb-8 flex-wrap gap-y-6">
        {/* Average Rating Display */}
        <div className="w-auto min-w-[200px] flex flex-col items-start">
          <div className="flex items-center gap-1.5 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.floor(stats.averageRating) ? (
                  <StarIconSolid className="h-7 w-7 md:h-7 md:w-7 text-primary-100" />
                ) : (
                  <StarIcon className="h-7 w-7 md:h-7 md:w-7 text-primary-100" />
                )}
              </span>
            ))}
          </div>
          <p className="text-text-200 text-lg mb-1">
            {stats.averageRating.toFixed(2)} out of 5
          </p>
          <p className="text-text-200 text-base">
            {stats.totalReviews} total reviews
          </p>
        </div>

        {/* Rating Distribution Bars */}
        <div className="w-auto min-w-[240px] max-w-[280px] flex-shrink-0">
          {[5, 4, 3, 2, 1].map((stars, index) => (
            <div key={stars} className="flex items-center gap-2 mb-2">
              <span className="text-sm text-text-200 w-16">{stars} stars</span>
              <div className="w-32 md:w-48 h-4 rounded-full bg-bg-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-100 to-primary-200"
                  style={{ width: `${percentages[5 - stars]}%` }}
                />
              </div>
              <span className="text-sm text-text-200 w-8 text-right">
                {stats.distribution[5 - stars]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search reviews"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-bg-200 border border-bg-300 rounded-lg 
                   text-text-100 placeholder-text-200 focus:outline-none 
                   focus:ring-2 focus:ring-primary-100"
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-200" />
      </div>

      {/* Review Cards */}
      <div className="mt-12 space-y-4">
        {loading ? (
          <p className="text-text-200">Loading reviews...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <ReviewCard key={review._id} review={review} />
          ))
        ) : (
          <p className="text-text-200">No reviews found matching your search.</p>
        )}
      </div>
    </div>
  );
}

export default ReviewSummary; 