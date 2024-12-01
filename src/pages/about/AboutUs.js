import { Link } from 'react-router-dom';

function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-100 mb-4">
          About GridgeGear
        </h1>
        <p className="text-xl text-text-200 max-w-3xl mx-auto">
          Bridging the gap between preparedness and technology with premium gear for the modern adventurer.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Link 
          to="/about/tagline" 
          className="p-6 rounded-lg border border-bg-300 hover:border-primary-100 transition-colors"
        >
          <h2 className="text-xl font-bold text-text-100 mb-2">Our Tagline</h2>
          <p className="text-text-200">Discover what drives us forward</p>
        </Link>

        <Link 
          to="/about/story" 
          className="p-6 rounded-lg border border-bg-300 hover:border-primary-100 transition-colors"
        >
          <h2 className="text-xl font-bold text-text-100 mb-2">Company Story</h2>
          <p className="text-text-200">The journey that brought us here</p>
        </Link>

        <Link 
          to="/about/factsheet" 
          className="p-6 rounded-lg border border-bg-300 hover:border-primary-100 transition-colors"
        >
          <h2 className="text-xl font-bold text-text-100 mb-2">Fact Sheet</h2>
          <p className="text-text-200">Key information about GridgeGear</p>
        </Link>

        <Link 
          to="/about/team" 
          className="p-6 rounded-lg border border-bg-300 hover:border-primary-100 transition-colors"
        >
          <h2 className="text-xl font-bold text-text-100 mb-2">Meet the Team</h2>
          <p className="text-text-200">The faces behind GridgeGear</p>
        </Link>
      </div>

      {/* Overview Section */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-bold text-text-100 mb-6">Overview</h2>
        <p className="text-text-200 mb-4">
          GridgeGear bridges the gap between preparedness and technology, delivering a curated selection of premium clothing, gear, and graphic design products. With an emphasis on versatility and sleek utility, our products serve a dual purpose: functional readiness and contemporary style.
        </p>

        <h2 className="text-3xl font-bold text-text-100 mb-6 mt-12">Mission Statement</h2>
        <p className="text-text-200 mb-4">
          To empower individuals to stay prepared, stylish, and connected in any situation, GridgeGear delivers high-performance, tech-integrated products that support a lifestyle of readiness without sacrificing comfort or aesthetics.
        </p>

        <h2 className="text-3xl font-bold text-text-100 mb-6 mt-12">Product Strategy</h2>
        <p className="text-text-200 mb-4">
          GridgeGear keeps its product lineup concise, focusing on 27 flagship products that embody our ethos: innovation, resilience, and aesthetic appeal. Each product serves as a cornerstone in an ecosystem of preparedness, blending seamlessly into the urban or outdoor lifestyle.
        </p>
      </div>
    </div>
  );
}

export default AboutUs; 