import { Link } from 'wouter';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Footer links
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Upload Case', path: '/upload' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Virtual Judge', path: '/judge' },
    { name: 'About', path: '/about' },
  ];
  
  // Court emblem SVG (simplified representation of scales of justice)
  const CourtEmblem = () => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
      <motion.path 
        d="M30 5 L30 15 M15 15 L45 15 M15 15 L10 40 M45 15 L50 40 M10 40 L50 40 M20 19 L20 38 M40 19 L40 38 M20 22 C20 19 13 19 13 22 C13 25 20 25 20 22 M40 22 C40 19 47 19 47 22 C47 25 40 25 40 22 M30 40 L30 55 M25 55 L35 55" 
        stroke="#FFD700" 
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.circle 
        cx="30" cy="18" r="3" 
        fill="#FFD700"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      />
    </svg>
  );
  
  return (
    <footer className="bg-legal-dark-alt border-t border-legal-blue/20 mt-auto">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start">
            <div className="flex flex-col items-center md:items-start">
              <CourtEmblem />
              <h3 className="text-xl font-playfair font-semibold text-legal-gold mb-3">Delhi High Court</h3>
              <p className="text-legal-text-secondary text-center md:text-left max-w-md">
                AI-powered virtual judge system for document analysis, case outcome prediction, and legal consultation.
              </p>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="col-span-1">
            <h4 className="text-lg font-playfair font-semibold text-legal-text mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <motion.a 
                      className="text-legal-text-secondary hover:text-legal-gold transition-colors inline-block"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact information */}
          <div className="col-span-1">
            <h4 className="text-lg font-playfair font-semibold text-legal-text mb-4">Contact</h4>
            <ul className="space-y-2 text-legal-text-secondary">
              <li className="flex items-center">
                <i className="ri-map-pin-line mr-2 text-legal-gold"></i>
                <span>New Delhi, India</span>
              </li>
              <li className="flex items-center">
                <i className="ri-mail-line mr-2 text-legal-gold"></i>
                <span>virtualjudge@delhihighcourt.in</span>
              </li>
              <li className="flex items-center">
                <i className="ri-phone-line mr-2 text-legal-gold"></i>
                <span>+91 11 2000 0000</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-legal-blue/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-legal-text-secondary text-sm mb-4 md:mb-0">
            © {currentYear} Delhi High Court. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <motion.div 
              className="px-3 py-1 bg-legal-blue/20 text-legal-blue-light text-xs rounded-full flex items-center"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(10, 36, 99, 0.3)' }}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Powered by AI
            </motion.div>
            <motion.div 
              className="px-3 py-1 bg-legal-gold/10 text-legal-gold text-xs rounded-full flex items-center"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 215, 0, 0.2)' }}
            >
              <i className="ri-brain-line mr-1"></i>
              NLP Driven
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;