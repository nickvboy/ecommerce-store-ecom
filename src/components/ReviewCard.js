import { StarIcon } from '@heroicons/react/24/solid';
import { UserIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';

function ReviewCard() {
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
              <p className="font-bold text-text-100 text-sm">John D.</p>
              <p className="text-sm text-text-200">Florida, US</p>
            </div>
          </div>

          <div className="flex-grow ml-4">
            {/* Stars and Title */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon 
                  key={star}
                  className="h-4 w-4 text-primary-100"
                />
              ))}
            </div>
            <h3 className="text-text-100">Great product!</h3>

            {/* Review Text */}
            <p className="text-sm text-text-200 mt-2">
              This pen exceeded my expectations. The build quality is outstanding and it writes smoothly.
            </p>
          </div>

          {/* Date */}
          <span className="text-sm text-text-200 ml-4">03/14/2024</span>
        </div>

        {/* Like/Dislike Row */}
        <div className="flex justify-end gap-2 mt-4">
          <button className="flex items-center gap-1 text-text-200 hover:text-primary-100">
            <HandThumbUpIcon className="h-5 w-5" />
            <span className="text-sm">12</span>
          </button>
          <button className="flex items-center gap-1 text-text-200 hover:text-primary-100">
            <HandThumbDownIcon className="h-5 w-5" />
            <span className="text-sm">1</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard; 