'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { handleSignup } from './SignupFunction';
import toast from 'react-hot-toast';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  // Check for token in URL params
  useEffect(() => {
    const urlToken = searchParams?.get('token');
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    }
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`/api/admin/signup-link?token=${token}`);
      const result = await response.json();
      setTokenValid(result.success && result.valid);
      
      if (!result.success || !result.valid) {
        toast.error('Invalid or expired signup link');
      }
    } catch (error) {
      setTokenValid(false);
      toast.error('Error validating signup link');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we have a token but it's not valid, prevent submission
    if (token && tokenValid === false) {
      toast.error('Cannot signup with invalid link');
      return;
    }
    
    // Include token in form data if present
    const submitData = token ? { ...formData, token } : formData;
    const result = await handleSignup(submitData);
    setMessage(result.message);

    toast(result.message, { duration: 4000 });

    if (result.success) {
      router.push('/Login');
    }
  };
  
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center w-full max-w-sm py-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Signup</h2>
        
        {/* Token status indicator */}
        {token && (
          <div className={`mb-4 px-4 py-2 rounded-md text-sm ${
            tokenValid === true 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : tokenValid === false 
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {tokenValid === true && 'Valid signup link'}
            {tokenValid === false && 'Invalid or expired signup link'}
            {tokenValid === null && 'Validating signup link...'}
          </div>
        )}
        
        <div className="w-full px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block mb-2 text-lg font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-2 text-lg border border-gray-300 rounded-md"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-lg font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 text-lg border border-gray-300 rounded-md"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-lg font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 text-lg border border-gray-300 rounded-md"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-2 text-lg font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="number"
                id="phone"
                className="w-full p-2 text-lg border border-gray-300 rounded-md"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>            <button
              type="submit"
              disabled={token ? tokenValid === false : false}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Signup
            </button>
          </form>
          {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        </div>
      </div>
    </main>
  );
}