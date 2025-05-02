import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-legal-dark py-12 px-4 border-t border-legal-gold/20">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-legal-gold rounded-lg flex items-center justify-center">
                <i className="ri-scales-3-fill text-legal-dark text-xl"></i>
              </div>
              <h1 className="text-xl font-playfair font-bold text-legal-gold">
                Delhi High Court <span className="text-legal-text">Virtual Judge</span>
              </h1>
            </Link>
            
            <p className="text-legal-text-secondary text-sm">
              AI-powered legal analysis and virtual judge consultation platform for the Delhi High Court.
            </p>
            
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                <i className="ri-linkedin-fill text-lg"></i>
              </a>
              <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                <i className="ri-twitter-x-fill text-lg"></i>
              </a>
              <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                <i className="ri-facebook-fill text-lg"></i>
              </a>
              <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                <i className="ri-instagram-fill text-lg"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Upload Case
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Case Analysis
                </Link>
              </li>
              <li>
                <Link href="/judge" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Virtual Judge
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Legal Guides
                </a>
              </li>
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Case Studies
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Disclaimer
                </a>
              </li>
              <li>
                <a href="#" className="text-legal-text-secondary hover:text-legal-gold transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-legal-blue/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-legal-text-secondary text-sm">
            &copy; {new Date().getFullYear()} Delhi High Court Virtual Judge. All rights reserved.
          </p>
          
          <p className="text-legal-text-secondary text-sm mt-4 md:mt-0">
            This is an AI assistant platform. Not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
