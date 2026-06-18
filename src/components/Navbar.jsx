import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Navbar = ({ onBookClick, onLoginClick, onDashboardClick }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      setIsOpen(false); // Dismiss mobile navigation on scroll events
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Menu', href: '#menu' },
    { name: 'Banquet Hall', href: '#banquet' },
    { name: 'Private Dining', href: '#pdr' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Adjust for sticky nav height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md border-outline-variant/30 py-3 shadow-lg shadow-black/30' 
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-4 xl:gap-16">
          {/* Logo */}
          <a 
            href="#home" 
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center gap-2 sm:gap-3 font-headline font-bold text-primary tracking-wide transition-all duration-300 hover:brightness-110 active:scale-95"
          >
            <Logo className="w-14 h-14 min-[360px]:w-16 min-[360px]:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0" />
            <div className="flex flex-col text-left justify-center">
              <span className="text-primary font-headline font-bold text-[12px] min-[360px]:text-[14px] sm:text-lg md:text-xl tracking-wider leading-none uppercase whitespace-nowrap">
                THE BAGARA KITCHEN
              </span>
              <span className="text-secondary font-body text-[6px] min-[360px]:text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.18em] font-semibold mt-1 sm:mt-1.5 leading-none uppercase">
                RESTAURANT • BAR • BANQUET
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-on-surface-variant hover:text-primary font-medium text-[10px] lg:text-[12px] xl:text-sm tracking-wide transition-colors duration-300 relative group py-1 whitespace-nowrap"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            
            {/* Dashboard Redirect or Login trigger */}
            {user ? (
              <a
                href="#dashboard"
                onClick={(e) => { e.preventDefault(); setIsOpen(false); onDashboardClick(); }}
                className="text-primary hover:brightness-115 font-semibold text-[10px] lg:text-[12px] xl:text-sm tracking-wide transition-all relative group py-1 uppercase whitespace-nowrap"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              </a>
            ) : (
              <a
                href="#login"
                onClick={(e) => { e.preventDefault(); setIsOpen(false); onLoginClick(); }}
                className="text-on-surface-variant hover:text-primary font-medium text-[10px] lg:text-[12px] xl:text-sm tracking-wide transition-colors duration-300 relative group py-1 whitespace-nowrap"
              >
                Staff Portal
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            )}
            
            <button 
              onClick={onBookClick}
              className="bg-primary hover:bg-primary-container text-white hover:text-on-primary-container font-semibold px-3 py-1.5 lg:px-4 lg:py-2 xl:px-6 xl:py-2.5 text-[10px] lg:text-[12px] xl:text-sm rounded-lg flex items-center gap-1.5 lg:gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 duration-300 whitespace-nowrap"
            >
              <Calendar size={16} />
              Book Now
            </button>
          </div>

          {/* Mobile Hamburguer Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary focus:outline-none p-1 transition-transform duration-200 active:scale-90"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Blurred Glassmorphic Backdrop for Click-Outside Dismissals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-[60px] z-40 md:hidden bg-[#001c16]/98 backdrop-blur-lg border-b border-outline-variant/30 py-6 px-6 flex flex-col gap-5 shadow-2xl shadow-black/80"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-lg text-on-surface-variant hover:text-primary font-medium tracking-wide py-2 border-b border-outline-variant/10 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                {user ? (
                  <a
                    href="#dashboard"
                    onClick={(e) => { e.preventDefault(); setIsOpen(false); onDashboardClick(); }}
                    className="text-lg text-primary font-bold tracking-wide py-2 border-b border-outline-variant/10"
                  >
                    DASHBOARD CONTROL
                  </a>
                ) : (
                  <a
                    href="#login"
                    onClick={(e) => { e.preventDefault(); setIsOpen(false); onLoginClick(); }}
                    className="text-lg text-on-surface-variant hover:text-primary font-medium tracking-wide py-2 border-b border-outline-variant/10 transition-colors"
                  >
                    STAFF PORTAL
                  </a>
                )}
              </div>

              <button 
                onClick={() => {
                  setIsOpen(false);
                  onBookClick();
                }}
                className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
              >
                <Calendar size={18} />
                Book Now
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>


    </>
  );
};

export default Navbar;
