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
