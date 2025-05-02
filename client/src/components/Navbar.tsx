import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Determine if a link is active
  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload Case" },
    { href: "/analysis", label: "Analysis" },
    { href: "/judge", label: "Virtual Judge" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-legal-dark/90 border-b border-legal-gold/20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-legal-gold rounded-lg flex items-center justify-center">
            <i className="ri-scales-3-fill text-legal-dark text-xl"></i>
          </div>
          <h1 className="text-xl font-playfair font-bold text-legal-gold">
            Delhi High Court <span className="text-legal-text">Virtual Judge</span>
          </h1>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-legal-text hover:text-legal-gold transition-colors",
                isActive(link.href) && "text-legal-gold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <button
          className="md:hidden text-2xl"
          aria-label="Menu"
          onClick={toggleMobileMenu}
        >
          <i className="ri-menu-line"></i>
        </button>
      </div>
      
      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden bg-legal-dark-alt border-t border-legal-gold/20 p-4",
          !mobileMenuOpen && "hidden"
        )}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-legal-text hover:text-legal-gold transition-colors py-2",
                isActive(link.href) && "text-legal-gold"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
