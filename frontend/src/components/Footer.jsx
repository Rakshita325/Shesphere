import React from 'react';
import { Layers, Camera, MessageSquare, Share2, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer id="contact" className="bg-white dark:bg-gray-900 pt-16 pb-8 border-t border-pastel-lavender/50 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">SheSphere</span>
            </div>
            <p className="text-gray-500 dark:text-gray-450 mb-6 text-sm leading-relaxed">
              {t('landing.footerSlogan')}
            </p>
            <div className="flex space-x-4 text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-pink-500 transition-colors"><Camera className="h-5 w-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><MessageSquare className="h-5 w-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Share2 className="h-5 w-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Globe className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('landing.footerPlatform')}</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerCourses')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerCommunity')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerMentorship')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerPricing')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('landing.footerCompany')}</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerAboutUs')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerCareers')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerBlog')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerContact')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('landing.footerLegal')}</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerTerms')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerPrivacy')}</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">{t('landing.footerCookie')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t('landing.footerRights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
