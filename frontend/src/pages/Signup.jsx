import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Globe } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import heroIllustration from '../assets/hero_illustration.png';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const Signup = () => {
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { fetchProfile } = useUser();
  const { language, changeLanguage, t } = useLanguage();
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
        localStorage.setItem('token', response.data.token);
        await fetchProfile();
        setSuccessMessage(t('auth.signupSuccess'));
        
        setTimeout(() => {
          navigate('/profile-setup');
        }, 500);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const { message, field } = err.response.data;
        if (field && ['fullName', 'mobile', 'email', 'password', 'confirmPassword'].includes(field)) {
          setError(field, { type: 'server', message: message || t('common.error') });
        } else {
          setServerError(message || t('auth.regFailed'));
        }
      } else if (err.request) {
        setServerError(t('auth.networkError'));
      } else {
        setServerError(t('auth.serverError'));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pastel-pink/20 via-white to-pastel-lavender/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 font-poppins">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100 dark:border-gray-700 my-8 relative">
        
        {/* Left Side - Image/Branding */}
        <div className="w-full md:w-5/12 bg-pastel-pink/10 dark:bg-gray-900/60 flex-col items-center justify-center p-10 relative hidden md:flex border-r border-gray-100 dark:border-gray-700">
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
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{t('auth.joinCommunityTitle')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {t('auth.joinCommunityDesc')}
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 md:p-16 flex flex-col justify-center relative">
          
          {/* Language Switcher */}
          <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-pink-50/80 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-pink-100 dark:border-gray-700 text-sm">
            <Globe className="w-4 h-4 text-pink-500 shrink-0" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer text-gray-700 dark:text-gray-200"
            >
              <option value="en" className="dark:bg-gray-800 text-gray-900 dark:text-white">English</option>
              <option value="hi" className="dark:bg-gray-800 text-gray-900 dark:text-white">हिंदी</option>
              <option value="kn" className="dark:bg-gray-800 text-gray-900 dark:text-white">ಕನ್ನಡ</option>
            </select>
          </div>

          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <Link to="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">SheSphere</span>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.createAccount')}</h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-8">{t('auth.createAccountDesc')}</p>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-sm font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Input 
                label={t('auth.fullName')} 
                type="text" 
                placeholder={t('auth.fullNamePlaceholder')}
                {...register('fullName', { 
                  required: t('auth.fullNameRequired'),
                  minLength: { value: 2, message: t('auth.nameMinLength') }
                })}
                error={errors.fullName?.message}
              />

              <Input 
                label={t('auth.mobile')} 
                type="tel" 
                placeholder={t('auth.mobilePlaceholder')}
                {...register('mobile', { 
                  required: t('auth.mobileRequired'),
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: t('auth.invalidMobile')
                  }
                })}
                error={errors.mobile?.message}
              />
            </div>

            <Input 
              label={t('auth.email')} 
              type="email" 
              placeholder={t('auth.emailPlaceholder')}
              {...register('email', { 
                required: t('auth.emailRequired'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('auth.invalidEmail')
                }
              })}
              error={errors.email?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Input 
                label={t('auth.password')} 
                type="password" 
                placeholder="••••••••"
                {...register('password', { 
                  required: t('auth.passwordRequired'),
                  minLength: {
                    value: 8,
                    message: t('auth.passwordMinLength')
                  }
                })}
                error={errors.password?.message}
              />

              <Input 
                label={t('auth.confirmPass')} 
                type="password" 
                placeholder="••••••••"
                {...register('confirmPassword', { 
                  required: t('auth.confirmPasswordRequired'),
                  validate: value => value === password || t('auth.passwordsDoNotMatch')
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="py-3 text-lg">
                {t('auth.signUpBtn')}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-600 transition-colors">
              {t('auth.logInBtn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
