import React from 'react';
import { Layers, Camera, MessageSquare, Share2, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-pastel-lavender/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold text-gray-900 tracking-wide">SheSphere</span>
            </div>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Empowering women through personalized learning, community support, and skill tracking.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-pink-500 transition-colors"><Camera className="h-5 w-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><MessageSquare className="h-5 w-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Share2 className="h-5 w-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Globe className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-pink-500 transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Mentorship</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-pink-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-pink-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} SheSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
