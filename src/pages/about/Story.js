import { Link } from 'react-router-dom';

function Story() {
  const milestones = [
    {
      year: '2020',
      title: 'The Spark',
      description: 'Founded during global uncertainty, GridgeGear began with a simple idea: merge technology with everyday preparedness gear.'
    },
    {
      year: '2021',
      title: 'First Collection',
      description: 'Launched our inaugural line of tech-integrated clothing, setting new standards in functional fashion.'
    },
    {
      year: '2022',
      title: 'Innovation Award',
      description: 'Received industry recognition for our innovative approach to everyday carry gear and smart clothing.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Expanded our reach to serve customers worldwide while maintaining our commitment to quality and innovation.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-text-200">
          <li><Link to="/about" className="hover:text-primary-100">About</Link></li>
          <li><span className="mx-2">/</span></li>
          <li>Company Story</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-100 mb-4">
          Our Story
        </h1>
        <p className="text-xl text-text-200 max-w-3xl mx-auto">
          From concept to reality: The journey of making preparedness stylish and accessible
        </p>
      </div>

      {/* Origin Story */}
      <div className="prose prose-lg max-w-none mb-16">
        <h2 className="text-3xl font-bold text-text-100 mb-6">The Beginning</h2>
        <p className="text-text-200 mb-4">
          GridgeGear was born from a simple observation: the growing need for everyday items that seamlessly blend preparedness with style. Our founders, experienced in both tech and outdoor gear industries, saw an opportunity to bridge this gap.
        </p>
        <p className="text-text-200 mb-4">
          What started as a small collection of tech-integrated backpacks has evolved into a comprehensive line of clothing and gear that serves both urban professionals and outdoor enthusiasts alike.
        </p>
      </div>

      {/* Timeline */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-text-100 mb-8">Our Journey</h2>
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-start gap-8">
              <div className="flex-shrink-0 w-24 pt-1">
                <span className="text-xl font-bold text-primary-100">{milestone.year}</span>
              </div>
              <div className="flex-grow">
                <div className="p-6 bg-bg-200 rounded-lg">
                  <h3 className="text-xl font-bold text-text-100 mb-2">{milestone.title}</h3>
                  <p className="text-text-200">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision & Future */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-bg-200 rounded-lg">
          <h2 className="text-2xl font-bold text-text-100 mb-4">Our Vision</h2>
          <p className="text-text-200">
            We envision a world where being prepared doesn't mean compromising on style or comfort. GridgeGear continues to push the boundaries of what's possible in everyday carry gear and technical clothing.
          </p>
        </div>

        <div className="p-8 bg-bg-200 rounded-lg">
          <h2 className="text-2xl font-bold text-text-100 mb-4">Looking Forward</h2>
          <p className="text-text-200">
            As we grow, our commitment to innovation remains unchanged. We're constantly developing new products that integrate emerging technologies while maintaining our core values of quality, functionality, and style.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Story; 