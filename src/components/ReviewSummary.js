import { useState, useEffect, useCallback } from 'react';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ReviewCard from './ReviewCard';
import { API_BASE_URL } from '../lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid';
import { Select } from "./ui/select";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(5);

  const itemsPerPageOptions = [
    { value: "5", label: "5 per page" },
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" }
  ];

  const handleReviewsPerPageChange = (value) => {
    setReviewsPerPage(Number(value));
    setCurrentPage(1);
  };

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
      
      // Calculate stats only if there are reviews
      if (data.length > 0) {
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
      }
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

  // Calculate pagination values
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 reviews-section">
      <h2 className="text-2xl font-bold text-text-100 text-center mb-8">
        Customer Reviews
      </h2>
      
      {loading ? (
        <div className="text-center text-text-200">Loading reviews...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : stats.totalReviews === 0 ? (
        <div className="text-center">
          <p className="text-lg text-text-200 mb-4">No reviews yet</p>
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} className="h-7 w-7 text-text-200" />
            ))}
          </div>
          <p className="text-text-200">Be the first to review this product!</p>
        </div>
      ) : (
        <>
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
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-text-200 w-16">{stars} stars</span>
                  <div className="w-32 md:w-48 h-4 rounded-full bg-bg-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-100 to-primary-200"
                      style={{ width: `${percentages[stars - 1]}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-200 w-8 text-right">
                    {stats.distribution[stars - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Only show search and pagination if there are reviews */}
          {stats.totalReviews > 0 && (
            <>
              {/* Search Bar and Reviews Per Page - Updated Layout */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-6 mb-8">
                <div className="relative flex-1 max-w-md">
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

                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-200">Show:</span>
                  <select
                    value={reviewsPerPage}
                    onChange={(e) => handleReviewsPerPageChange(e.target.value)}
                    className="bg-bg-200 border border-bg-300 rounded-lg px-3 py-1.5 text-sm
                             text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    {itemsPerPageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review Cards */}
              <div className="mt-8 space-y-4">
                {loading ? (
                  <p className="text-text-200">Loading reviews...</p>
                ) : error ? (
                  <p className="text-red-500">Error: {error}</p>
                ) : currentReviews.length > 0 ? (
                  <>
                    {currentReviews.map(review => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-col items-center gap-4 mt-8">
                        <div className="text-sm text-text-200">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredReviews.length)} of {filteredReviews.length} reviews
                        </div>
                        
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-bg-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Go to first page"
                          >
                            <ChevronDoubleLeftIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-bg-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Go to previous page"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          
                          <div className="flex items-center gap-2">
                            {[...Array(totalPages)].map((_, index) => {
                              const pageNumber = index + 1;
                              const isCurrentPage = pageNumber === currentPage;
                              const isNearCurrent = Math.abs(pageNumber - currentPage) <= 1;
                              const isEndPage = pageNumber === 1 || pageNumber === totalPages;
                              
                              if (isNearCurrent || isEndPage) {
                                return (
                                  <button
                                    key={pageNumber}
                                    onClick={() => goToPage(pageNumber)}
                                    className={`min-w-[2.5rem] h-10 rounded-lg transition-all
                                      ${isCurrentPage 
                                        ? 'bg-primary-100 text-white font-bold text-lg' 
                                        : 'hover:bg-bg-200 text-text-200'}`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              } else if (
                                (pageNumber === currentPage - 2 && currentPage > 3) ||
                                (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                              ) {
                                return <span key={pageNumber} className="text-text-200">...</span>;
                              }
                              return null;
                            })}
                          </div>

                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-bg-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Go to next page"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-bg-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Go to last page"
                          >
                            <ChevronDoubleRightIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-text-200">No reviews found matching your search.</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ReviewSummary; 