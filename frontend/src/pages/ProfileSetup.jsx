import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, Layers, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import { uploadProfilePicture } from '../services/userService';

const ProfileSetup = () => {
  const { userData, updateUserData } = useUser();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(userData.profilePicture || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      language: userData.language || '',
      education: userData.education || '',
      age: userData.age || '',
      occupation: userData.occupation || '',
      dailyFreeTime: userData.dailyFreeTime || ''
    }
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('\n================ [PROFILE PHOTO FRONTEND] ================');
      console.log('Selected file:', file.name, file.type, file.size, 'bytes');
      setSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setPreviewImage(localUrl);

      setUploadingImage(true);
      try {
        const uploadRes = await uploadProfilePicture(file);
        console.log('Upload response:', uploadRes);
        if (uploadRes && uploadRes.success && uploadRes.profilePicture) {
          console.log('Saved profilePicture:', uploadRes.profilePicture.startsWith('data:') ? `${uploadRes.profilePicture.substring(0, 50)}... [Base64]` : uploadRes.profilePicture);
          setPreviewImage(uploadRes.profilePicture);
          if (uploadRes.user) {
            updateUserData(uploadRes.user);
            console.log('Current user profilePicture:', uploadRes.user.profilePicture.startsWith('data:') ? `${uploadRes.user.profilePicture.substring(0, 50)}... [Base64]` : uploadRes.user.profilePicture);
          }
        }
      } catch (err) {
        console.error('❌ [PROFILE PHOTO FRONTEND] Image upload failed:', err);
      } finally {
        setUploadingImage(false);
        console.log('========================================================\n');
      }
    }
  };

  const onSubmit = async (data) => {
    let finalPicture = previewImage;

    if (selectedFile && previewImage && previewImage.startsWith('blob:')) {
      try {
        const uploadRes = await uploadProfilePicture(selectedFile);
        if (uploadRes && uploadRes.profilePicture) {
          finalPicture = uploadRes.profilePicture;
        }
      } catch (err) {
        console.error('Failed uploading photo during submit:', err);
      }
    }

    const fullData = { ...data, profilePicture: finalPicture };
    try {
      const response = await api.put('/auth/profile', fullData);
      if (response.data && response.data.user) {
        updateUserData(response.data.user);
      } else {
        updateUserData(fullData);
      }
      navigate('/interests');
    } catch (err) {
      console.error('Failed to update profile on server:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-pink/10 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col font-poppins pb-12 text-gray-900 dark:text-white transition-colors">
      <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm p-4 flex justify-center mb-8 sticky top-0 z-10 border-b border-pastel-lavender/50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Layers className="h-8 w-8 text-pink-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">
            SheSphere
          </span>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-pastel-lavender/30 dark:border-gray-700 p-8 sm:p-12 relative overflow-hidden">
          {/* Decorative background shape */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-pastel-lavender/20 blur-3xl pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Complete Your Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Tell us a bit about yourself so we can personalize your experience.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center justify-center mb-10">
              <div className="relative group cursor-pointer transition-transform hover:scale-105">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-pastel-pink/30 overflow-hidden bg-pastel-lavender/10 dark:bg-gray-700/50 flex items-center justify-center shadow-inner">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400 group-hover:text-pink-400 transition-colors" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Change Photo</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-450 mt-4 font-medium">Upload Profile Picture (Optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Select 
                label="Preferred Language"
                options={[
                  { value: 'english', label: 'English' },
                  { value: 'hindi', label: 'Hindi' },
                  { value: 'kannada', label: 'Kannada' }
                ]}
                {...register('language', { required: 'Language is required' })}
                error={errors.language?.message}
              />

              <Select 
                label="Highest Education"
                options={[
                  { value: 'high_school', label: 'High School' },
                  { value: 'bachelors', label: 'Bachelor\'s Degree' },
                  { value: 'masters', label: 'Master\'s Degree' },
                  { value: 'phd', label: 'Ph.D.' },
                  { value: 'other', label: 'Other' }
                ]}
                {...register('education', { required: 'Education is required' })}
                error={errors.education?.message}
              />

              <Input 
                label="Age" 
                type="number" 
                placeholder="e.g. 25"
                {...register('age', { 
                   required: 'Age is required',
                  min: { value: 13, message: 'You must be at least 13' },
                  max: { value: 120, message: 'Please enter a valid age' }
                })}
                error={errors.age?.message}
              />

              <Input 
                label="Occupation" 
                type="text" 
                placeholder="e.g. Software Engineer, Student"
                {...register('occupation', { required: 'Occupation is required' })}
                error={errors.occupation?.message}
              />
            </div>

            <div className="mt-4">
              <Select 
                label="Daily Free Time (for learning)"
                options={[
                  { value: '15 minutes', label: '15 minutes' },
                  { value: '30 minutes', label: '30 minutes' },
                  { value: '45 minutes', label: '45 minutes' },
                  { value: '1 hour', label: '1 hour' }
                ]}
                {...register('dailyFreeTime', { required: 'Please select your available time' })}
                error={errors.dailyFreeTime?.message}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-700 gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-6 py-3"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Signup
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto px-10 py-3 text-lg">
                Complete Setup
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
