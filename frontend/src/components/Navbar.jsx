import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    
    // Helper to perform smooth scrolling to target element
    const scrollToTarget = () => {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollToTarget, 150);
    } else {
      scrollToTarget();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pastel-lavender/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div onClick={() => handleNavClick('home')} className="flex items-center gap-2 cursor-pointer">
            <Layers className="h-8 w-8 text-pink-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent tracking-wide">
              SheSphere
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="text-gray-600 hover:text-pink-500 font-medium transition-colors cursor-pointer bg-transparent border-0"
              >
                Home
              </button>
              <button
  type="button"
  onClick={() => handleNavClick("about")}
  className="text-gray-600 hover:text-pink-500 font-medium transition-colors cursor-pointer bg-transparent border-0"
>
  About
</button>
              <button
                type="button"
                onClick={() => handleNavClick('contact')}
                className="text-gray-600 hover:text-pink-500 font-medium transition-colors cursor-pointer bg-transparent border-0"
              >
                Contact
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-pink-500 font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-pink-400 hover:bg-pink-500 text-white px-5 py-2 rounded-full font-medium shadow-sm transition-all hover:shadow-md">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-pink-500 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-pastel-lavender/50"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-md bg-transparent border-0"
              >
                Home
              </button>
              <button
  type="button"
  onClick={() => handleNavClick("about")}
  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-md bg-transparent border-0"
>
  About
</button>
              <button
                type="button"
                onClick={() => handleNavClick('contact')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-md bg-transparent border-0"
              >
                Contact
              </button>
              <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col space-y-2">
                <Link to="/login" className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-500 rounded-md hover:bg-pink-50">
                  Login
                </Link>
                <Link to="/signup" className="block w-full text-center bg-pink-400 text-white px-3 py-2 rounded-md font-medium shadow-sm hover:bg-pink-500">
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
