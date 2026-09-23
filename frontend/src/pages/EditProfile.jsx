import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../services/userService';
import {
  User,
  Mail,
  Globe,
  GraduationCap,
  Sparkle,
  Camera,
  Upload,
  ChevronDown,
  Loader2,
  Pencil,
  Sparkles,
  Clock
} from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const { userData, updateUserData } = useUser();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    language: '',
    education: '',
    interest: '',
    dailyFreeTime: '',
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
      dailyFreeTime: userData.dailyFreeTime || '',
      profilePicture: userData.profilePicture || null,
    });
  }, [userData]);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) errs.email = 'Invalid email address';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      const file = files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
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
      console.log('Form State:', form);
      const updated = await updateUserProfile({
        fullName: form.fullName,
        email: form.email,
        language: form.language,
        education: form.education,
        interest: form.interest,
        dailyFreeTime: form.dailyFreeTime,
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
    <div className="max-w-4xl mx-auto py-8 px-4 font-poppins text-gray-800 dark:text-gray-100 pb-12">
      {/* Main Form Container Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm transition-colors">

        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-6 mb-8">
          <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900/50 text-pink-500 shrink-0">
            <Pencil className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Edit Profile
              </h1>
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Update your personal information and profile appearance
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Profile Picture Upload Area (Centered) ──────────────────────── */}
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-gradient-to-r from-pink-50/50 via-purple-50/30 to-pink-50/30 dark:from-gray-800/40 dark:via-purple-950/20 dark:to-gray-800/40 border border-pink-100/60 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Profile Picture
            </label>

            {/* Centered Circular Avatar Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer my-1"
              title="Click to choose a new photo"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md bg-white dark:bg-gray-800 flex items-center justify-center">
                {form.profilePicture ? (
                  <img
                    src={form.profilePicture}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {(form.fullName || 'U').charAt(0)}
                  </div>
                )}
              </div>

              <div className="absolute bottom-1 right-1 p-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md group-hover:scale-110 transition-transform border-2 border-white dark:border-gray-800">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
              Upload a new profile photo (JPG, PNG or supported format)
            </p>



            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              name="profilePicture"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </div>

          {/* ── Form Inputs 2-Column Grid ───────────────────────────────── */}
          <div className="space-y-6">

            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-pink-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-5 h-5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs font-medium mt-1.5">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-pink-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-5 h-5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium mt-1.5">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2: Language & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Language
                </label>
                <div className="relative flex items-center">
                  <Globe className="w-5 h-5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className="w-full h-12 pl-11 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="kannada">Kannada</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Education Level
                </label>
                <div className="relative flex items-center">
                  <GraduationCap className="w-5 h-5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    placeholder="e.g. Degree, Master's, High School"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Current Interest & Daily Free Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Current Interest
                </label>
                <div className="relative flex items-center">
                  <Sparkle className="w-5 h-5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <select
                    name="interest"
                    value={form.interest}
                    onChange={handleChange}
                    className="w-full h-12 pl-11 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Select an interest</option>
                    <option value="Digital Skills">Digital Skills</option>
                    <option value="Cooking">Cooking</option>
                    <option value="Arts & Crafts">Arts & Crafts</option>
                    <option value="Gardening">Gardening</option>
                    <option value="Sewing & Fashion">Sewing & Fashion</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Music & Instruments">Music & Instruments</option>
                    <option value="Skincare">Skincare</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Daily Free Time (for learning)
                </label>
                <div className="relative flex items-center">
                  <Clock className="w-5 h-5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <select
                    name="dailyFreeTime"
                    value={form.dailyFreeTime}
                    onChange={handleChange}
                    className="w-full h-12 pl-11 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Select daily free time</option>
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour">1 hour</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

          </div>

          {/* ── Action Buttons ─────────────────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard/profile')}
              className="w-full sm:w-auto px-7 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;
