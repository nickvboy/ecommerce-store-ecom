import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check if we have a user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    // Create anonymous user if none exists
    const anonymousUser = {
      id: `anon_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Guest User',
      email: 'guest@example.com',
      isAnonymous: true
    };
    localStorage.setItem('user', JSON.stringify(anonymousUser));
    return anonymousUser;
  });

  // Add state for profile card
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const signOut = () => {
    const anonymousUser = {
      id: `anon_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Guest User',
      email: 'guest@example.com',
      isAnonymous: true
    };
    setUser(anonymousUser);
    localStorage.setItem('user', JSON.stringify(anonymousUser));
  };

  // Add methods to control profile card
  const openProfileCard = () => setIsProfileCardOpen(true);
  const closeProfileCard = () => setIsProfileCardOpen(false);
  const toggleProfileCard = () => setIsProfileCardOpen(prev => !prev);

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      signOut,
      isProfileCardOpen,
      openProfileCard,
      closeProfileCard,
      toggleProfileCard
    }}>
      {children}
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