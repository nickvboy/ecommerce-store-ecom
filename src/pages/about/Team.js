import { Link } from 'react-router-dom';

function Team() {
  const teamMembers = {
    leadership: [
      {
        name: 'Sarah Chen',
        role: 'CEO & Co-Founder',
        bio: 'Former tech executive with a passion for outdoor activities. Combines expertise in product development with a vision for innovative gear.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Marcus Rodriguez',
        role: 'CTO & Co-Founder',
        bio: 'Wearable tech pioneer with multiple patents. Leads our technology integration and smart feature development.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      }
    ],
    departments: [
      {
        name: 'Alex Kim',
        role: 'Head of Product Design',
        bio: 'Award-winning industrial designer specializing in functional aesthetics and sustainable materials.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Maya Patel',
        role: 'Innovation Director',
        bio: 'Former aerospace engineer bringing cutting-edge technology to everyday products.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'James Foster',
        role: 'Head of Sustainability',
        bio: 'Environmental scientist turned product developer, ensuring our gear meets both performance and ecological standards.',
        image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Lisa Wong',
        role: 'Creative Director',
        bio: 'Fashion industry veteran specializing in technical apparel and functional design.',
        image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-text-200">
          <li><Link to="/about" className="hover:text-primary-100">About</Link></li>
          <li><span className="mx-2">/</span></li>
          <li>Meet the Team</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-100 mb-4">
          Meet Our Team
        </h1>
        <p className="text-xl text-text-200 max-w-3xl mx-auto">
          The innovative minds behind GridgeGear's mission to revolutionize everyday carry
        </p>
      </div>

      {/* Leadership Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-text-100 mb-8">Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.leadership.map((member, index) => (
            <div key={index} className="bg-bg-200 rounded-lg overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-100 mb-1">{member.name}</h3>
                <p className="text-primary-100 font-medium mb-4">{member.role}</p>
                <p className="text-text-200">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Heads */}
      <div>
        <h2 className="text-3xl font-bold text-text-100 mb-8">Department Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.departments.map((member, index) => (
            <div key={index} className="bg-bg-200 rounded-lg overflow-hidden">
              <div className="aspect-w-1 aspect-h-1">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-text-100 mb-1">{member.name}</h3>
                <p className="text-primary-100 text-sm font-medium mb-2">{member.role}</p>
                <p className="text-text-200 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join the Team Section */}
      <div className="mt-16 text-center">
        <div className="bg-bg-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-text-100 mb-4">Join Our Team</h2>
          <p className="text-text-200 mb-6">
            We're always looking for talented individuals who share our passion for innovation and design.
          </p>
          <Link 
            to="/careers" 
            className="inline-block px-6 py-3 bg-primary-100 text-white font-semibold rounded-lg
              hover:bg-primary-200 transition-colors"
          >
            View Open Positions
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Team; 