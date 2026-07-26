import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = ['Home', 'Features', 'About', 'Contact'];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pastel-lavender/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer">
            <Layers className="h-8 w-8 text-pink-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent tracking-wide">
              SheSphere
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-gray-600 hover:text-pink-500 font-medium transition-colors"
                >
                  {link}
                </a>
              ))}
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
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-md"
                >
                  {link}
                </a>
              ))}
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
