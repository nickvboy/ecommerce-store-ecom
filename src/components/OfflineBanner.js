import { useApiStatus } from '../contexts/ApiStatusContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

function OfflineBanner() {
  const { isConnected, checkApiConnection } = useApiStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleRetry = async () => {
    await checkApiConnection();
    // Refresh the page after checking connection
    window.location.reload();
  };

  if (isConnected || isDismissed) return null;

  return (
    <div className="bg-yellow-500 text-black px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>Unable to connect to server. Some features may be limited.</span>
          <button
            onClick={handleRetry}
            className="text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-yellow-600 rounded"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default OfflineBanner; 