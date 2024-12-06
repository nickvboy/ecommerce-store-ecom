import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-100 mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-text-200 max-w-3xl mx-auto">
          Last updated: January 1, 2024
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-text-200">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">1. Introduction</h2>
          <p>
            GridgeGear ("we," "our," or "us") is committed to protecting your privacy while providing high-quality outdoor and technical gear. This privacy policy explains how we collect, use, and protect your data when you use our e-commerce platform and services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">2. Information We Collect</h2>
          <p className="mb-4">We collect the following types of information to provide and improve our services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account Information: Name, email address, and password for your GridgeGear account</li>
            <li>Shopping Information: Order history, wishlist items, and shopping cart contents</li>
            <li>Payment Details: Payment method information (processed securely through our payment providers)</li>
            <li>Shipping Information: Delivery addresses and contact details</li>
            <li>Communication Preferences: Your notification and promotional email preferences</li>
            <li>Technical Data: Browser type, device information, and IP address for website optimization</li>
            <li>Usage Data: Product browsing history, search queries, and interaction with our features</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">Your information helps us provide and improve our services in the following ways:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and fulfill your orders for GridgeGear products</li>
            <li>Manage your account and provide customer support</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide personalized product recommendations</li>
            <li>Send promotional emails about new products and sales (if you've opted in)</li>
            <li>Improve our website's user experience and product offerings</li>
            <li>Analyze shopping patterns and optimize our inventory</li>
            <li>Prevent fraudulent transactions and enhance security</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including secure HTTPS connections, encrypted password storage, and secure payment processing. We regularly update our security practices to maintain the safety of your information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">5. Your Privacy Controls</h2>
          <p className="mb-4">Through your GridgeGear account settings, you can:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Update your account information and preferences</li>
            <li>Manage your communication preferences</li>
            <li>View and download your order history</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of promotional emails</li>
            <li>Request a copy of your personal data</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">6. Cookies and Tracking</h2>
          <p>
            We use cookies to enhance your shopping experience, maintain your shopping cart, remember your preferences, and analyze site traffic. You can manage cookie preferences through your browser settings, though some features may not function without essential cookies.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">7. Third-Party Services</h2>
          <p>
            We work with trusted partners to provide specific services:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Payment processing (secure payment gateway providers)</li>
            <li>Shipping and delivery services</li>
            <li>Analytics tools to improve our website</li>
            <li>Customer support systems</li>
          </ul>
          <p className="mt-4">
            These partners are bound by strict confidentiality agreements and can only use your data to provide their specific services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">8. Data Retention</h2>
          <p>
            We retain your data for as long as necessary to provide our services and comply with legal obligations. Order history is kept for tax and warranty purposes, while account information is retained until you request deletion.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">9. Updates to Privacy Policy</h2>
          <p>
            We may update this policy to reflect changes in our practices or legal requirements. We'll notify you of significant changes through our website or email, and continue to protect your privacy in accordance with the latest version of this policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or your data:
          </p>
          <ul className="list-none space-y-2 mt-4">
            <li>Email: privacy@gridgegear.com</li>
            <li>Phone: +1 (415) 555-0123</li>
            <li>Address: 123 Innovation Way, San Francisco, CA 94105, United States</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy; 