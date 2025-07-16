'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; // adjust path if needed
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

      console.log('Inserted new profile:', data, 'Error:', error);
    };

    const handleSession = async (session: any) => {
      if (!session || redirected) return;

      const user = session.user;
      console.log('User signed in, checking profile for user ID:', user.id);

      const { data: profile, error } = await fetchProfile(user.id);

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (profile) {
        console.log('Profile found, redirecting to dashboard...');
        setRedirected(true);
        try {
          await router.push('/dashboard');
        } catch (e) {
          console.warn('Router push failed, falling back to full reload');
          window.location.href = '/dashboard';
        }
      } else {
        console.log('No profile found, creating one...');
        await createProfileIfMissing(user);
        setRedirected(true);
        try {
          await router.push('/profile-setup');
        } catch (e) {
          console.warn('Router push failed, falling back to full reload');
          window.location.href = '/profile-setup';
        }
      }
    };

    const checkInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }

      if (session) {
        console.log('Initial session found');
        await handleSession(session);
      }
      setLoading(false);
    };

    checkInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change on main page:', event, session?.user?.email);
        if (
          session &&
          ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)
        ) {
          await handleSession(session);
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
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
