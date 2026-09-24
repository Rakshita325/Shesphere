import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Reset search query automatically whenever section/route changes
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    return {
      searchQuery: '',
      setSearchQuery: () => {},
      clearSearch: () => {},
    };
  }
  return context;
};
