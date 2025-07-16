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
  setHasMounted(true);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        console.log('User found:', user);
        localStorage.setItem('user', JSON.stringify(user));

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profile) {
          console.log('Redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.log('Redirecting to profile setup');
          router.push('/profile-setup');
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  checkUser();

  const { data: listener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        localStorage.setItem('user', JSON.stringify(session.user));

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          router.push('/dashboard');
        } else {
          router.push('/profile-setup');
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user');
      }
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, [router]);


  if (!hasMounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const handleExploreServices = () => {
    router.push('/explore');
  };

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
