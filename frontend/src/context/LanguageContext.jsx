import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { getTranslation, normalizeLanguage, translations } from '../translations';
import { updateUserProfile } from '../services/userService';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { userData, updateUserData, userId } = useUser();

  // Initialize language from local storage or default 'en'
  const [language, setLanguageState] = useState(() => {
    const localLang = localStorage.getItem('shesphere_lang');
    return normalizeLanguage(localLang || 'en');
  });

  // Synchronize language when user profile changes (e.g. login/fetchProfile) or reset on logout
  useEffect(() => {
    if (userId && userData && userData.language) {
      const userNormLang = normalizeLanguage(userData.language);
      setLanguageState(userNormLang);
      localStorage.setItem('shesphere_lang', userNormLang);
    } else if (!userId) {
      const localLang = localStorage.getItem('shesphere_lang');
      if (localLang) {
        setLanguageState(normalizeLanguage(localLang));
      } else {
        setLanguageState('en');
      }
    }
  }, [userData?.language, userId]);

  const changeLanguage = async (newLang) => {
    const norm = normalizeLanguage(newLang);
    setLanguageState(norm);
    localStorage.setItem('shesphere_lang', norm);

    // Update in UserContext state immediately
    if (updateUserData) {
      updateUserData({ language: norm });
    }

    // Persist to backend database if user is logged in
    if (userId) {
      try {
        await updateUserProfile({ language: norm });
      } catch (err) {
        console.error('Failed to update language in backend profile:', err);
      }
    }
  };

  const t = (keyPath, params = {}) => {
    return getTranslation(language, keyPath, params);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        changeLanguage,
        t,
        normalizeLanguage,
        translations
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

