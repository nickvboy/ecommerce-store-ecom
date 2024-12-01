import { Link } from 'react-router-dom';

function FactSheet() {
  const companyFacts = {
    overview: [
      { label: 'Founded', value: '2020' },
      { label: 'Headquarters', value: 'San Francisco, CA' },
      { label: 'Employees', value: '50+' },
      { label: 'Product Categories', value: '2 (Clothing & Gear)' },
      { label: 'Total Products', value: '27 Flagship Items' }
    ],
    products: [
      { label: 'Clothing Line', value: '9 Products' },
      { label: 'Gear Collection', value: '18 Products' },
      { label: 'Price Range', value: '$19.99 - $249.99' },
      { label: 'Best Seller', value: 'AdaptPack Modular Backpack' }
    ],
    technology: [
      { label: 'Tech Integration', value: '100% of Products' },
      { label: 'Smart Features', value: 'GPS, Solar, RFID Protection' },
      { label: 'Materials', value: 'Nano-fabric, Self-healing materials' },
      { label: 'Innovation Focus', value: 'Wearable Tech & Smart Gear' }
    ],
    sustainability: [
      { label: 'Eco-Friendly Materials', value: '75% of Products' },
      { label: 'Solar Integration', value: '30% of Product Line' },
      { label: 'Recycled Materials', value: '40% Usage Rate' },
      { label: 'Carbon Offset', value: '100% Operations' }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-text-200">
          <li><Link to="/about" className="hover:text-primary-100">About</Link></li>
          <li><span className="mx-2">/</span></li>
          <li>Fact Sheet</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-100 mb-4">
          GridgeGear Fact Sheet
        </h1>
        <p className="text-xl text-text-200 max-w-3xl mx-auto">
          Key facts and figures about our company, products, and impact
        </p>
      </div>

      {/* Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Company Overview */}
        <div className="bg-bg-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-text-100 mb-6">Company Overview</h2>
          <div className="space-y-4">
            {companyFacts.overview.map((fact, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-text-200">{fact.label}</span>
                <span className="font-medium text-text-100">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-bg-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-text-100 mb-6">Product Information</h2>
          <div className="space-y-4">
            {companyFacts.products.map((fact, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-text-200">{fact.label}</span>
                <span className="font-medium text-text-100">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Integration */}
        <div className="bg-bg-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-text-100 mb-6">Technology Integration</h2>
          <div className="space-y-4">
            {companyFacts.technology.map((fact, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-text-200">{fact.label}</span>
                <span className="font-medium text-text-100">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Metrics */}
        <div className="bg-bg-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-text-100 mb-6">Sustainability Metrics</h2>
          <div className="space-y-4">
            {companyFacts.sustainability.map((fact, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-text-200">{fact.label}</span>
                <span className="font-medium text-text-100">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-12 p-8 bg-bg-200 rounded-lg">
        <h2 className="text-2xl font-bold text-text-100 mb-6">Key Achievements</h2>
        <ul className="space-y-4 text-text-200">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Industry Innovation Award 2022 for Smart Gear Integration</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Featured in Top Tech Magazines for Revolutionary Product Design</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Achieved Carbon Neutral Operations in 2023</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Partnerships with Leading Tech Companies for Product Integration</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default FactSheet; 