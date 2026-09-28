import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, ShoppingBag, PackageCheck, Store, ShoppingCart } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useLanguage } from '../../context/LanguageContext';

const MarketplaceHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { purchases, myProducts } = useMarketplace();
  const { t } = useLanguage();

  const pendingPurchases = purchases.filter((o) => o.status === 'Pending').length;

  const tabs = [
    { label: t('marketplace.allProducts'), path: '/marketplace', icon: Store },
    { label: t('marketplace.myPurchases'), path: '/marketplace/my-purchases', icon: ShoppingCart },
    { label: t('marketplace.myProducts'), path: '/marketplace/my-products', icon: PackageCheck }
  ];

  const isActive = (path) => {
    if (path === '/marketplace') return location.pathname === '/marketplace';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-linear-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-6 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-32 -bottom-10 w-32 h-32 bg-pink-300/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md">
            <ShoppingBag className="w-3.5 h-3.5" /> {t('marketplace.title')}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{t('nav.marketplace')}</h1>
          <p className="mt-1 text-pink-100 text-sm max-w-xl leading-relaxed">
            {t('marketplace.subtext')}
          </p>
        </div>

        
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 flex gap-2 mt-5 flex-wrap">
        {tabs.map(({ label, path, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition duration-200 ${
              isActive(path)
                ? 'bg-white text-pink-700 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {label === 'My Purchases' && pendingPurchases > 0 && (
              <span className="w-5 h-5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
                {pendingPurchases}
              </span>
            )}
            {label === 'My Products' && myProducts.length > 0 && (
              <span className="w-5 h-5 bg-white/40 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {myProducts.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceHeader;
