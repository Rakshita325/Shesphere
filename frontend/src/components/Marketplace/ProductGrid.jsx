import React from 'react';
import ProductCard from './ProductCard';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ShoppingBag, RefreshCw } from 'lucide-react';

const ProductGrid = () => {
  const {
    products,
    selectedCategory,
    searchQuery,
    sortBy,
    setSearchQuery,
    setSelectedCategory
  } = useMarketplace();

  // Filter products based on search query and category
  let filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.sellerName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  // Sort products
  if (sortBy === 'Price Low → High') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'Price High → Low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else {
    // Newest default
    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-8 shadow-sm">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">No products found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          We couldn't find any handmade items matching "{searchQuery}" in category "{selectedCategory}".
        </p>
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">All Marketplace Products</h2>
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredProducts.length} items
        </span>
      </div>

      {/* Grid: 1 col mobile, 2 cols tablet, 3-4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
