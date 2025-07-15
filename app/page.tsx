'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabaseClient';
import { Header } from '../components/sections/header/headersection';
import { Hero } from '../components/sections/HeroSection/herosection';
import About from '../components/sections/about/aboutsection';
import Contact from '../components/sections/contact/contactsection';
import Footer from '../components/sections/footer/footer';
import AuthForm from '../components/auth/AuthForm';

export default function LandingPage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let mounted = true;

  const checkUserProfile = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session fetch error:', sessionError);
      return;
    }

    if (session?.user) {
      console.log('Session found, checking profile...');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle(); // No error if profile doesn't exist

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      if (!mounted) return;

      if (profile) {
        router.replace('/dashboard');
      } else {
        router.replace('/profile-setup');
      }
    }
  };

  checkUserProfile();

  return () => {
    mounted = false;
  };
}, []);
  

  // Avoid rendering until client-side mount to prevent hydration issues.
  if (!hasMounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }



  return (
    <main className="w-full min-h-screen overflow-hidden relative">
      <Header />
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowAuth(false)}
            >
              ✕
            </button>
            <AuthForm initialStep={authStep} />
          </div>
        </div>
      )}
      <section id="home" className="w-full">
        <Hero />
      </section>
      <section id="about" className="w-full">
        <About />
      </section>
      <section id="contact" className="w-full">
        <Contact />
      </section>
      <Footer />
    </main>
  );
}
