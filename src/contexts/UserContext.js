import { createContext, useContext, useState, useEffect } from 'react';
import Notification from '../components/Notification';

const UserContext = createContext();

const createGuestUser = () => ({
  id: `guest_${Math.random().toString(36).substr(2, 9)}`,
  firstName: 'Guest',
  lastName: 'User',
  email: null,
  role: 'guest',
  isGuest: true,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  permissions: {
    canCheckout: false,
    canViewOrders: false,
    canEditProfile: false
  }
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check if we have a user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // If the saved user is a guest, update their lastActive timestamp
      if (parsedUser.isGuest) {
        parsedUser.lastActive = new Date().toISOString();
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
      return parsedUser;
    }
    // Create guest user if none exists
    const guestUser = createGuestUser();
    localStorage.setItem('user', JSON.stringify(guestUser));
    return guestUser;
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // Store the previous authenticated user separately
  const [previousAuthUser, setPreviousAuthUser] = useState(() => {
    const saved = localStorage.getItem('previousAuthUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);

  // Update last active time for guest users
  useEffect(() => {
    if (user.isGuest) {
      const updateLastActive = () => {
        setUser(prev => ({
          ...prev,
          lastActive: new Date().toISOString()
        }));
      };

      const interval = setInterval(updateLastActive, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [user.isGuest]);

  const showTemporaryNotification = (message, type = 'success', duration = 3500) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, duration);
  };

  const updateUser = (userData) => {
    // If updating to an authenticated user, store the current guest user
    if (user.isGuest && !userData.isGuest) {
      localStorage.setItem('previousGuestUser', JSON.stringify(user));
    }
    
    const newUser = {
      ...userData,
      lastActive: new Date().toISOString()
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // If it's an authenticated user, also store as previous auth user
    if (!userData.isGuest) {
      setPreviousAuthUser(userData);
      localStorage.setItem('previousAuthUser', JSON.stringify(userData));
    }
  };

  const signOut = () => {
    // Create a new guest user
    const guestUser = createGuestUser();
    setUser(guestUser);
    localStorage.setItem('user', JSON.stringify(guestUser));
    showTemporaryNotification('Successfully signed out');
  };

  const requiresAuth = () => {
    return user.isGuest;
  };

  const openProfileCard = () => setIsProfileCardOpen(true);
  const closeProfileCard = () => setIsProfileCardOpen(false);
  const toggleProfileCard = () => setIsProfileCardOpen(prev => !prev);

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      signOut,
      requiresAuth,
      isProfileCardOpen,
      openProfileCard,
      closeProfileCard,
      toggleProfileCard,
      previousAuthUser,
      showTemporaryNotification
    }}>
      {children}
      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
        type={notificationType}
      />
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 