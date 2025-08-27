import React, { useEffect } from 'react';
import logo from '../assets/logo.png';
import { useForm } from 'react-hook-form';
import { useAdminLoginMutation } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [
    login,
    { isLoading, error, isSuccess, data }
  ] = useAdminLoginMutation();
  const navigate = useNavigate();
  // ✅ Fixed: Use useEffect to handle error toast only once
  useEffect(() => {
    if (error) {
      console.error("error", error);
      toast.error(error.data?.message || 'Login failed. Please try again.');
    }
  }, [error]);

  // ✅ Fixed: Handle success in useEffect as well
  useEffect(() => {
    if (isSuccess && data) {
      toast.success('Login successful!');
      localStorage.setItem('token', data.data?.token);
      navigate('/dashboard');
      reset();
    }
  }, [isSuccess, data, navigate, reset]);

  // Submit handler - simplified
  const onSubmit = async (formData) => {
    try {
      await login(formData).unwrap();
      // Success is handled in useEffect above
    } catch (err) {
      // Error is handled in useEffect above
      console.error("Login attempt failed:", err);
    }
  };

  return (
    <div className='h-[100vh] bg-[#D4F4F4] flex justify-center items-center p-[16px]'>
      <div className="bg-white max-w-[520px] w-full p-[20px] rounded-2xl">
        <form className="flex flex-col gap-[16px]" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <img className='max-w-[240px] block mx-auto mb-[20px]' src={logo} alt="Logo" />
            <h2 className='text-[24px] font-bold text-[#352AA4] text-center'>Admin Login</h2>
            <p className='text-[16px] text-center'>Enter your email & password to login</p>
          </div>

          {/* Email */}
          <div>
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px]'>Email</span>
              <input
                className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
                type="email"
                placeholder='Enter Email'
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' } })}
                autoComplete="username"
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
              )}
            </label>
          </div>

          {/* Password */}
          <div>
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px]'>Password</span>
              <input
                className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
                type="password"
                placeholder='Enter Password'
                {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Minimum 4 characters' } })}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
              )}
            </label>
          </div>

          {/* Error + Success */}
          {error && (
            <div className="text-red-500 text-center text-sm mt-2">
              {error.data?.message || 'Login failed. Please try again.'}
            </div>
          )}
          {isSuccess && (
            <div className="text-green-600 text-center text-sm mt-2">
              Login successful!
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            className={`btn-pri mt-[12px] ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
