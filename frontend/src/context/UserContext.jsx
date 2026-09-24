import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getUserProfile } from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    profilePicture: null,
    fullName: '',
    email: '',
    language: '',
    education: '',
    age: '',
    occupation: '',
    dailyFreeTime: '',
    interest: ''
  });

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const user = await getUserProfile();
      if (user) {
        setUserData(user);
        return user;
      }
    } catch (err) {
      console.error('Error fetching user profile in UserContext:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateUserData = (newData) => {
    setUserData((prev) => ({ ...prev, ...newData }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUserData({
      profilePicture: null,
      fullName: '',
      email: '',
      language: '',
      education: '',
      age: '',
      occupation: '',
      dailyFreeTime: '',
      interest: ''
    });
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, updateUserData, fetchProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
