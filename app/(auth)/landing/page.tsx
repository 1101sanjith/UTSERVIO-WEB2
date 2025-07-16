'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Header } from '../../../components/sections/header/headersection';
import { Hero } from '../../../components/sections/HeroSection/herosection';
import About from '../../../components/sections/about/aboutsection';
import Contact from '../../../components/sections/contact/contactsection';
import Footer from '../../../components/sections/footer/footer';
import AuthForm from '../../../components/auth/AuthForm';

export default function LandingPage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirected, setRedirected] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    setHasMounted(true);

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      console.log('Fetched profile:', data, 'Error:', error);
      return { data, error };
    };

    const createProfileIfMissing = async (user: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email });

      if (error) {
        console.error('Insert error:', error.message);
      } else {
        console.log('Inserted new profile:', data);
      }
    };

    const handleSession = async (session: any) => {
      if (!session || redirected) return;

      const user = session.user;
      console.log('Checking profile for:', user.id);

      const { data: profile, error } = await fetchProfile(user.id);

      if (profile) {
        console.log('Profile found. Redirecting to /dashboard');
        setRedirected(true);
        await router.push('/dashboard');
      } else {
        console.log('No profile found. Creating one and redirecting to /profile-setup');
        await createProfileIfMissing(user);
        setRedirected(true);
        await router.push('/profile-setup');
      }
    };

    const checkSession = async () => {
      // Step 1: Try to get session immediately (rehydration might not be done yet)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log('Session found immediately');
        await handleSession(session);
        setLoading(false);
      } else {
        console.log('Waiting for Supabase to rehydrate session...');
        // Step 2: Fallback - listen for session rehydration from localStorage
        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            if (session) {
              await handleSession(session);
            }
            setLoading(false);
          },
        );

        // Clean up listener when component unmounts
        return () => {
          listener?.subscription?.unsubscribe();
        };
      }
    };

    checkSession();
  }, [redirected, router]);

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
      <section id="home">
        <Hero />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="contact">
        <Contact />
      </section>
      <Footer />
    </main>
  );
}
