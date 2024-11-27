import { StarIcon } from '@heroicons/react/24/solid';
import { UserIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { API_BASE_URL } from '../lib/utils';

function ReviewCard({ review }) {
  const [likes, setLikes] = useState(review.likes);
  const [dislikes, setDislikes] = useState(review.dislikes);

  const handleLike = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${review.product}/reviews/${review._id}/likes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
      if (!response.ok) throw new Error('Failed to like review');
      const updatedReview = await response.json();
      setLikes(updatedReview.likes);
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${review.product}/reviews/${review._id}/likes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dislike' })
      });
      if (!response.ok) throw new Error('Failed to dislike review');
      const updatedReview = await response.json();
      setDislikes(updatedReview.dislikes);
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };

  return (
    <div className="border border-bg-300 rounded-lg p-4">
      <div className="flex flex-col">
        {/* Top Row: Icon, Stars, Title, Date */}
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-bg-200 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-text-200" />
            </div>
            {/* Name and Location under profile */}
            <div className="mt-2">
              <p className="font-bold text-text-100 text-sm">{review.userName}</p>
              <p className="text-sm text-text-200">{review.location}</p>
            </div>
          </div>

          <div className="flex-grow ml-4">
            {/* Stars and Title */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon 
                  key={star}
                  className={`h-4 w-4 ${star <= review.rating ? 'text-primary-100' : 'text-bg-300'}`}
                />
              ))}
            </div>
            <h3 className="text-text-100">{review.title}</h3>

            {/* Review Text */}
            <p className="text-sm text-text-200 mt-2">
              {review.content}
            </p>
          </div>

          {/* Date */}
          <span className="text-sm text-text-200 ml-4">{new Date(review.date).toLocaleDateString()}</span>
        </div>

        {/* Like/Dislike Row */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={handleLike} className="flex items-center gap-1 text-text-200 hover:text-primary-100">
            <HandThumbUpIcon className="h-5 w-5" />
            <span className="text-sm">{likes}</span>
          </button>
          <button onClick={handleDislike} className="flex items-center gap-1 text-text-200 hover:text-primary-100">
            <HandThumbDownIcon className="h-5 w-5" />
            <span className="text-sm">{dislikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard; 