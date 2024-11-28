import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/utils';

const ApiStatusContext = createContext();

export function ApiStatusProvider({ children }) {
  const [apiStatus, setApiStatus] = useState({
    isConnected: true,
    lastChecked: null,
    isChecking: false
  });

  const checkApiConnection = async () => {
    if (apiStatus.isChecking) return;
    
    setApiStatus(prev => ({ ...prev, isChecking: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      setApiStatus({
        isConnected: response.ok,
        lastChecked: new Date(),
        isChecking: false
      });
    } catch (error) {
      setApiStatus({
        isConnected: false,
        lastChecked: new Date(),
        isChecking: false
      });
    }
  };

  // Check connection on mount and periodically
  useEffect(() => {
    checkApiConnection();
    const interval = setInterval(checkApiConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <ApiStatusContext.Provider value={{ ...apiStatus, checkApiConnection }}>
      {children}
    </ApiStatusContext.Provider>
  );
}

export const useApiStatus = () => useContext(ApiStatusContext); 