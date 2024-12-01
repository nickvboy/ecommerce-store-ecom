import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  SwatchIcon,
  ArrowLeftIcon,
  CheckIcon,
  CreditCardIcon,
  MapPinIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

function SettingsSection({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-text-100 mb-4">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border border-bg-300 bg-bg-200 hover:border-primary-100 transition-colors">
      <div className="flex gap-4">
        <div className="mt-1">
          <Icon className="w-5 h-5 text-text-200" />
        </div>
        <div>
          <h3 className="text-text-100 font-medium">{title}</h3>
          <p className="text-sm text-text-200 mt-1">{description}</p>
        </div>
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );
}

function Settings() {
  const [notifications, setNotifications] = useState({
    orders: true,
    news: false,
    reminders: true
  });

  const [theme, setTheme] = useState('dark');

  return (
    <div className="min-h-screen bg-bg-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-text-200 hover:text-primary-100 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-text-100">Settings</h1>
        </div>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingRow
            icon={UserIcon}
            title="Personal Information"
            description="Update your name, email, and profile picture"
          >
            <button className="text-sm text-primary-100 hover:text-primary-200 font-medium">
              Edit
            </button>
          </SettingRow>

          <SettingRow
            icon={CreditCardIcon}
            title="Payment Methods"
            description="Manage your payment methods and billing information"
          >
            <button className="text-sm text-primary-100 hover:text-primary-200 font-medium">
              Manage
            </button>
          </SettingRow>

          <SettingRow
            icon={MapPinIcon}
            title="Shipping Addresses"
            description="Add or remove shipping addresses"
          >
            <button className="text-sm text-primary-100 hover:text-primary-200 font-medium">
              Edit
            </button>
          </SettingRow>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingRow
            icon={BellIcon}
            title="Order Updates"
            description="Get notified about your order status and delivery"
          >
            <button 
              onClick={() => setNotifications(prev => ({ ...prev, orders: !prev.orders }))}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                notifications.orders ? 'bg-primary-100' : 'bg-bg-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-text-100 transition-transform ${
                notifications.orders ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </SettingRow>

          <SettingRow
            icon={TruckIcon}
            title="Shipping Updates"
            description="Receive notifications about shipping and delivery"
          >
            <button 
              onClick={() => setNotifications(prev => ({ ...prev, shipping: !prev.shipping }))}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                notifications.shipping ? 'bg-primary-100' : 'bg-bg-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-text-100 transition-transform ${
                notifications.shipping ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </SettingRow>

          <SettingRow
            icon={BellIcon}
            title="Promotional Emails"
            description="Stay updated with sales, new products, and features"
          >
            <button 
              onClick={() => setNotifications(prev => ({ ...prev, news: !prev.news }))}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                notifications.news ? 'bg-primary-100' : 'bg-bg-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-text-100 transition-transform ${
                notifications.news ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </SettingRow>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection title="Security">
          <SettingRow
            icon={ShieldCheckIcon}
            title="Password"
            description="Change your password or enable two-factor authentication"
          >
            <button className="text-sm text-primary-100 hover:text-primary-200 font-medium">
              Update
            </button>
          </SettingRow>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingRow
            icon={GlobeAltIcon}
            title="Language"
            description="Choose your preferred language"
          >
            <select 
              className="bg-bg-100 border border-bg-300 rounded-md px-3 py-1.5 text-sm text-text-100 focus:border-primary-100 focus:ring-1 focus:ring-primary-100"
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </SettingRow>

          <SettingRow
            icon={SwatchIcon}
            title="Theme"
            description="Choose your preferred theme"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`w-8 h-8 rounded-full bg-bg-100 border-2 flex items-center justify-center
                  ${theme === 'dark' ? 'border-primary-100' : 'border-bg-300'}`}
              >
                {theme === 'dark' && <CheckIcon className="w-4 h-4 text-primary-100" />}
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`w-8 h-8 rounded-full bg-text-100 border-2 flex items-center justify-center
                  ${theme === 'light' ? 'border-primary-100' : 'border-bg-300'}`}
              >
                {theme === 'light' && <CheckIcon className="w-4 h-4 text-primary-100" />}
              </button>
            </div>
          </SettingRow>
        </SettingsSection>
      </div>
    </div>
  );
}

export default Settings; 