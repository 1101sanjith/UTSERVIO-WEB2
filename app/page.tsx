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
  const [redirected, setRedirected] = useState(false);

  const fetchProfileWithRetry = async (userId: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (profile || error) {
        return { profile, error };
      }

      await new Promise((res) => setTimeout(res, 500)); // wait before retry
    }

    return { profile: null, error: null };
  };

  const handleRedirect = async (session: any) => {
    const { profile, error } = await fetchProfileWithRetry(session.user.id);

    console.log('Fetched profile:', profile);
    console.log('Profile fetch error:', error);

    if (profile) {
      if (!redirected) {
        setRedirected(true);
        console.log('✅ Profile found, redirecting to dashboard');
        router.push('/dashboard');
      }
    } else {
      // Auto-create profile if not found
      const insertRes = await supabase.from('profiles').insert({
        id: session.user.id,
        email: session.user.email,
      });

      console.log('Inserted profile:', insertRes);

      if (!redirected) {
        setRedirected(true);
        console.log('🆕 No profile found, created one, redirecting to setup');
        router.push('/profile-setup');
      }
    }
  };

  useEffect(() => {
    setHasMounted(true);

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          console.log('Session found, checking profile...');
          await handleRedirect(session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          'Auth state change on main page:',
          event,
          session?.user?.email,
        );

        if (
          session &&
          (event === 'SIGNED_IN' ||
            event === 'USER_UPDATED' ||
            event === 'TOKEN_REFRESHED')
        ) {
          console.log('User signed in, checking profile...');
          await handleRedirect(session);
        }
      },
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [router, redirected]);

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
