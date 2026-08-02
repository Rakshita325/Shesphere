import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import heroIllustration from '../assets/hero_illustration.png';
import api from '../services/api';

const Signup = () => {
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const password = watch('password');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');
    try {
      const response = await api.post('/auth/signup', {
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });

      if (response.data && response.data.token) {
        // Store ONLY token in localStorage
        localStorage.setItem('token', response.data.token);
        setSuccessMessage('Account created successfully! Redirecting...');
        
        setTimeout(() => {
          navigate('/profile-setup');
        }, 500);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const { message, field } = err.response.data;
        if (field && ['fullName', 'mobile', 'email', 'password', 'confirmPassword'].includes(field)) {
          setError(field, { type: 'server', message: message || 'Validation error' });
        } else {
          setServerError(message || 'Registration failed. Please check your details.');
        }
      } else if (err.request) {
        setServerError('Network error. Unable to connect to backend server.');
      } else {
        setServerError('Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pastel-pink/20 via-white to-pastel-lavender/30 font-poppins">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100 my-8">
        
        {/* Left Side - Image/Branding */}
        <div className="w-full md:w-5/12 bg-pastel-pink/10 flex-col items-center justify-center p-10 relative hidden md:flex border-r border-gray-100">
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">
                SheSphere
              </span>
            </Link>
          </div>
          <div className="w-full max-w-sm mt-12">
            <img src={heroIllustration} alt="Women learning and growing" className="w-full drop-shadow-lg" />
          </div>
          <div className="mt-12 text-center max-w-xs">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Join the Community</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empower yourself through smart learning, connect with like-minded women, and track your progress daily.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <Link to="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold text-gray-900">SheSphere</span>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
          <p className="text-base text-gray-500 mb-8">Start your journey with SheSphere today.</p>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Input 
                label="Full Name" 
                type="text" 
                placeholder="Jane Doe"
                {...register('fullName', { 
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                error={errors.fullName?.message}
              />

              <Input 
                label="Mobile Number" 
                type="tel" 
                placeholder="+1 (555) 000-0000"
                {...register('mobile', { 
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                error={errors.mobile?.message}
              />
            </div>

            <Input 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                }
              })}
              error={errors.email?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                error={errors.password?.message}
              />

              <Input 
                label="Confirm Password" 
                type="password" 
                placeholder="••••••••"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="py-3 text-lg">
                Sign Up
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-600 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
