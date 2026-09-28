import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getUserProfile } from '../services/userService';

const UserContext = createContext();

const initialUserData = {
  _id: null,
  profilePicture: null,
  fullName: '',
  email: '',
  language: '',
  education: '',
  age: '',
  occupation: '',
  dailyFreeTime: '',
  interest: '',
  streak: 0,
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(initialUserData);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserData(initialUserData);
      setLoadingUser(false);
      return null;
    }

    try {
      setLoadingUser(true);
      const user = await getUserProfile();
      if (user) {
        setUserData(user);
        setLoadingUser(false);
        return user;
      }
    } catch (err) {
      console.error('Error fetching user profile in UserContext:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        setUserData(initialUserData);
      }
    } finally {
      setLoadingUser(false);
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
    localStorage.removeItem('shesphere_lang');
    setUserData(initialUserData);
  };

  const currentUser = userData?._id ? userData : null;
  const userId = userData?._id || userData?.id || null;

  return (
    <UserContext.Provider
      value={{
        userData,
        currentUser,
        userId,
        setUserData,
        updateUserData,
        fetchProfile,
        logout,
        loadingUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

