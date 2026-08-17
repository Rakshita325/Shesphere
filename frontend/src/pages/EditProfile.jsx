import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../services/userService';

const EditProfile = () => {
  const navigate = useNavigate();
  const { userData, updateUserData } = useUser();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    language: '',
    education: '',
    interest: '',
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      fullName: userData.fullName || '',
      email: userData.email || '',
      language: userData.language || '',
      education: userData.education || '',
      interest: userData.interest || '',
      profilePicture: userData.profilePicture || null,
    });
  }, [userData]);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      if (file) reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    setLoading(true);
    try {
      console.log("Form State:", form);
      const updated = await updateUserProfile({
        fullName: form.fullName,
        email: form.email,
        language: form.language,
        education: form.education,
        interest: form.interest,
        profilePicture: form.profilePicture,
      });
      updateUserData(updated);
      navigate('/dashboard/profile');
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded shadow mt-8 transition-colors">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Language</label>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="kannada">Kannada</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Education</label>
          <input
            type="text"
            name="education"
            value={form.education}
            onChange={handleChange}
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Current Interest</label>
          <input
            type="text"
            name="interest"
            value={form.interest}
            onChange={handleChange}
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
          <input 
            type="file" 
            name="profilePicture" 
            accept="image/*" 
            onChange={handleChange} 
            className="text-sm text-gray-600 dark:text-gray-300"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-pink-500 dark:bg-pink-600 text-white rounded hover:bg-pink-600 dark:hover:bg-pink-700 transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/profile')}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
