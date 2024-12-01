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
            GridgeGear ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">2. Information We Collect</h2>
          <p className="mb-4">We collect several different types of information for various purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personal identification information (Name, email address, phone number, etc.)</li>
            <li>Payment information</li>
            <li>Shipping and billing addresses</li>
            <li>Technical data (IP address, browser type, device information)</li>
            <li>Usage data (how you use our website and products)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the collected data for various purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and deliver your orders</li>
            <li>To manage your account and provide customer support</li>
            <li>To send you marketing and promotional communications (with your consent)</li>
            <li>To improve our website and product offerings</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">4. Data Security</h2>
          <p>
            We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, accessed, altered, or disclosed in an unauthorized way. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">5. Your Rights</h2>
          <p className="mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access your personal data</li>
            <li>The right to correction of your personal data</li>
            <li>The right to erasure of your personal data</li>
            <li>The right to object to processing of your personal data</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">6. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">7. Third-Party Services</h2>
          <p>
            We may employ third-party companies and individuals to facilitate our service, provide service on our behalf, perform service-related services, or assist us in analyzing how our service is used. These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">8. Children's Privacy</h2>
          <p>
            Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date at the top of this Privacy Policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-100 mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-none space-y-2 mt-4">
            <li>By email: privacy@gridgegear.com</li>
            <li>By phone: +1 (415) 555-0123</li>
            <li>By mail: 123 Innovation Way, San Francisco, CA 94105, United States</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy; 