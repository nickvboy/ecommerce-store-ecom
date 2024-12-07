import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = {
  Company: [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Careers', path: '/careers' }
  ],
  Shop: [
    { name: 'All Products', path: '/products' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Bestsellers', path: '/bestsellers' }
  ],
  Support: [
    { name: 'FAQ', path: '/faq' },
    { name: 'Shipping', path: '/shipping' },
    { name: 'Returns', path: '/returns' }
  ],
  Legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Warranty', path: '/warranty' }
  ]
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

function Footer() {
  return (
    <motion.footer 
      className="bg-bg-200 mt-auto py-6 border-t border-bg-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={itemVariants} className="space-y-3">
              <h3 className="text-sm font-bold text-text-100">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <motion.li key={link.path} variants={itemVariants}>
                    <Link 
                      to={link.path} 
                      className="text-sm text-text-200 hover:text-primary-100 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-6 pt-4 border-t border-bg-300 text-center text-sm text-text-200"
          variants={itemVariants}
        >
          <p>&copy; {new Date().getFullYear()} Your Store Name. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer; 