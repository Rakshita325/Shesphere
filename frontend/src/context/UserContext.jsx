import React, { createContext, useState, useContext } from 'react';
import { useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  useEffect(() => {
    const fetchProfile = async () => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const res = await axios.get(
                "http://localhost:8008/api/auth/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUserData(res.data.user);

        } catch (err) {
            console.log(err);
        }
    };

    fetchProfile();
}, []);
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
    <UserContext.Provider value={{ userData, updateUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
