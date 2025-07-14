'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../../components/auth/AuthForm'; // Adjust if necessary

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = useCallback(() => {
    console.log('Login successful');
    // Optionally redirect or show a toast
    router.push('/dashboard');
  }, []);

  const handleSignupClick = useCallback(() => {
    router.push('/signup');
  }, [router]);

  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <AuthForm
      initialStep="login"
      onLoginSuccess={handleLoginSuccess}
      onSignupClick={handleSignupClick}
      onBackClick={handleBackClick}
    />
  );
}
