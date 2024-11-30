import { Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';

function ProfileCard() {
  const navigate = useNavigate();
  const { user, signOut, isProfileCardOpen, closeProfileCard } = useUser();

  const handleSignOut = () => {
    signOut();
    closeProfileCard();
    // Add a small delay before navigation to allow the notification to show
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  if (!isProfileCardOpen) return null;

  return (
    <div className="absolute right-1/2 translate-x-1/2 top-[calc(100%+1rem)] w-64 rounded-lg bg-bg-100 border border-bg-300 shadow-xl z-50">
      {/* Profile Header */}
      <div className="p-4 border-b border-bg-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-bg-200 flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-text-200" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-text-100">{user.name}</h3>
            {user.email && (
              <p className="text-sm text-text-200">{user.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="p-2">
        <Link 
          to="/orders" 
          onClick={closeProfileCard}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-200 text-text-100 group"
        >
          <ShoppingBagIcon className="w-5 h-5 text-text-200 group-hover:text-primary-100" />
          <span>Orders</span>
        </Link>
        
        <Link 
          to="/wishlist" 
          onClick={closeProfileCard}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-200 text-text-100 group"
        >
          <HeartIcon className="w-5 h-5 text-text-200 group-hover:text-primary-100" />
          <span>Wishlist</span>
        </Link>
        
        <Link 
          to="/tracking" 
          onClick={closeProfileCard}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-200 text-text-100 group"
        >
          <ClipboardDocumentListIcon className="w-5 h-5 text-text-200 group-hover:text-primary-100" />
          <span>Track Orders</span>
        </Link>
      </div>

      {/* Settings & Login/Logout */}
      <div className="border-t border-bg-300 p-2">
        <Link 
          to="/settings" 
          onClick={closeProfileCard}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-200 text-text-100 group"
        >
          <Cog6ToothIcon className="w-5 h-5 text-text-200 group-hover:text-primary-100" />
          <span>Settings</span>
        </Link>
        
        {user.isGuest ? (
          <Link 
            to="/login"
            onClick={closeProfileCard}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-200 text-text-100 group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-text-200 group-hover:text-primary-100" />
            <span>Login</span>
          </Link>
        ) : (
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bg-200 text-text-100 group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-text-200 group-hover:text-primary-100" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileCard; 