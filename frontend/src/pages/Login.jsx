import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import loginIllustration from '../assets/login_illustration.png';
import api from '../services/api';


const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      if (response.data && response.data.token) {
        // Store JWT token in LocalStorage
        localStorage.setItem('token', response.data.token);
        // Redirect to Dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const { message, field } = err.response.data;
        if (field && ['email', 'password'].includes(field)) {
          setError(field, { type: 'server', message: message || 'Invalid credentials' });
        } else {
          setServerError(message || 'Login failed. Please check your details.');
        }
      } else if (err.request) {
        setServerError('Network error. Unable to connect to backend server.');
      } else {
        setServerError('Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pastel-pink/20 via-white to-pastel-lavender/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 font-poppins">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Left Side - Image/Branding */}
        <div className="w-full md:w-1/2 bg-pastel-lavender/20 dark:bg-gray-900/60 flex-col items-center justify-center p-10 relative hidden md:flex">
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">
                SheSphere
              </span>
            </Link>
          </div>
          <div className="w-full max-w-sm mt-8">
            <img src={loginIllustration} alt="Login Illustration" className="w-full drop-shadow-lg rounded-2xl" />
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Welcome Back</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Continue your journey of learning, growing, and connecting with inspiring women.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <Link to="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">SheSphere</span>
            </Link>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Log in to your account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Enter your details below to continue.</p>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
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

            <div className="mb-6 relative">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={errors.password?.message}
              />
              <div className="absolute top-0 right-0">
                <a href="#" className="text-xs font-medium text-pink-500 hover:text-pink-600">
                  Forgot Password?
                </a>
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="mb-4">
              Log In
            </Button>

            

            
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-pink-500 hover:text-pink-600 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
