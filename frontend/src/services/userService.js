import React, { useEffect, useState } from 'react';
import api from './api';

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.user;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data.user;
};

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const response = await api.post('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getProfileStats = async () => {
  const response = await api.get('/profile/stats');
  return response.data;
};

