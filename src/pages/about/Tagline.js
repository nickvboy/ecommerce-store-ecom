import { Link } from 'react-router-dom';

function Tagline() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-text-200">
          <li><Link to="/about" className="hover:text-primary-100">About</Link></li>
          <li><span className="mx-2">/</span></li>
          <li>Tagline</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-100 mb-4">
          Our Tagline
        </h1>
        <p className="text-2xl font-medium text-primary-100 mb-8">
          "Prepared for Tomorrow, Styled for Today"
        </p>
      </div>

      {/* Content Sections */}
      <div className="prose prose-lg max-w-none">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-text-100 mb-6">The Meaning Behind Our Words</h2>
          <p className="text-text-200 mb-4">
            Our tagline encapsulates the dual nature of GridgeGear's mission: combining readiness with contemporary style. Each word has been carefully chosen to reflect our core values and promises to our customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 rounded-lg bg-bg-200">
            <h3 className="text-xl font-bold text-text-100 mb-4">"Prepared for Tomorrow"</h3>
            <ul className="list-disc list-inside text-text-200 space-y-2">
              <li>Future-focused design and technology integration</li>
              <li>Adaptable products for changing environments</li>
              <li>Durability that stands the test of time</li>
              <li>Innovation in everyday preparedness</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg bg-bg-200">
            <h3 className="text-xl font-bold text-text-100 mb-4">"Styled for Today"</h3>
            <ul className="list-disc list-inside text-text-200 space-y-2">
              <li>Contemporary aesthetic appeal</li>
              <li>Urban-ready designs</li>
              <li>Seamless integration with modern lifestyles</li>
              <li>Fashion-forward functionality</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-text-100 mb-6">Brand Promise</h2>
          <p className="text-text-200 mb-4">
            When you choose GridgeGear, you're not just buying a product – you're investing in a philosophy that believes preparedness doesn't have to compromise style. Our tagline is our daily reminder to innovate at the intersection of function and fashion.
          </p>
        </div>

        <div className="bg-bg-200 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-text-100 mb-6">Living Our Tagline</h2>
          <div className="space-y-4">
            <p className="text-text-200">
              Every product in our collection embodies this dual commitment:
            </p>
            <ul className="list-disc list-inside text-text-200 space-y-2">
              <li>Tech-integrated clothing that looks as good as it performs</li>
              <li>Gear that enhances daily life while preparing for uncertainties</li>
              <li>Designs that seamlessly transition from urban to outdoor environments</li>
              <li>Innovation that serves both practical needs and aesthetic preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tagline; 