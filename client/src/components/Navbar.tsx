import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

const Navbar = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload', path: '/upload' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Judge', path: '/judge' },
  ];
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      // Navbar background change on scroll
      setIsScrolled(window.scrollY > 20);
      
      // Calculate scroll progress for indicator
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(scrollPercent);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 ${isScrolled ? 'py-2 bg-legal-dark-alt shadow-md' : 'py-4 bg-transparent'}`}
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <motion.div 
                className="w-8 h-8 rounded-md bg-legal-gold flex items-center justify-center text-legal-dark font-bold"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-lg">HC</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-lg leading-tight text-legal-gold">Delhi HC</span>
                <span className="text-xs text-legal-text-secondary leading-tight">Virtual Judge</span>
              </div>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className="relative group">
                  <span className={`text-sm font-medium transition-colors ${location === item.path ? 'text-legal-gold' : 'text-legal-text hover:text-legal-gold'}`}>
                    {item.name}
                  </span>
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-legal-gold transition-all"
                    initial={{ width: location === item.path ? '100%' : '0%' }}
                    animate={{ width: location === item.path ? '100%' : '0%' }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.2 }}
                  />
                </a>
              </Link>
            ))}
          </nav>
          
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-legal-dark-alt hover:bg-legal-blue/20 transition-colors text-legal-text-secondary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <i className="ri-sun-line text-lg"></i>
              ) : (
                <i className="ri-moon-line text-lg"></i>
              )}
            </button>
            
            <Link href="/upload">
              <motion.a 
                className="px-4 py-1.5 bg-legal-gold text-legal-dark rounded-lg text-sm font-medium flex items-center"
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(255, 215, 0, 0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <i className="ri-upload-2-line mr-1"></i> Upload Case
              </motion.a>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={isMobileMenuOpen ? "open" : "closed"}
              className="w-6 flex flex-col space-y-1.5"
            >
              <motion.span
                variants={{
                  closed: { rotate: 0 },
                  open: { rotate: 45, y: 6, backgroundColor: "#FFD700" }
                }}
                className="block h-0.5 w-6 bg-legal-text"
              />
              <motion.span
                variants={{
                  closed: { opacity: 1 },
                  open: { opacity: 0 }
                }}
                className="block h-0.5 w-6 bg-legal-text"
              />
              <motion.span
                variants={{
                  closed: { rotate: 0 },
                  open: { rotate: -45, y: -8, backgroundColor: "#FFD700" }
                }}
                className="block h-0.5 w-6 bg-legal-text"
              />
            </motion.div>
          </button>
        </div>
        
        {/* Scroll Progress Indicator */}
        <motion.div 
          className="absolute bottom-0 left-0 h-0.5 bg-legal-gold"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed top-[58px] left-0 right-0 bg-legal-dark-alt z-40 border-t border-legal-blue/20 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto py-6 px-4">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <a 
                      className={`py-2 px-4 rounded-lg ${location === item.path ? 'bg-legal-blue/20 text-legal-gold' : 'text-legal-text'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
                <div className="flex justify-between items-center pt-4 border-t border-legal-blue/20 mt-2">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-2 text-legal-text-secondary"
                  >
                    {theme === 'dark' ? (
                      <>
                        <i className="ri-sun-line"></i>
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-moon-line"></i>
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                  
                  <Link href="/upload">
                    <a 
                      className="px-4 py-2 bg-legal-gold text-legal-dark rounded-lg text-sm font-medium flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="ri-upload-2-line mr-1"></i> Upload Case
                    </a>
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className={`${isScrolled ? 'h-16' : 'h-20'} transition-all duration-300`}></div>
    </>
  );
};

export default Navbar;