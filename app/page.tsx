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
  const [processingAuth, setProcessingAuth] = useState(false);

  const fetchProfileWithRetry = async (userId: string, retries = 3) => {
    let lastError = null;
    for (let i = 0; i < retries; i++) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (profile) return { profile, error: null };
        if (error) lastError = error;

        await new Promise((res) => setTimeout(res, 500 * (i + 1))); // Exponential backoff
      } catch (error) {
        lastError = error;
      }
    }
    return { profile: null, error: lastError };
  };

  const handleRedirect = async (session: any) => {
    console.log('Starting handleRedirect, redirected state:', redirected);
    if (redirected) {
      console.log('Already redirected, skipping');
      return;
    }

    try {
      const { profile, error } = await fetchProfileWithRetry(session.user.id);

      console.log('Fetched profile:', profile);
      console.log('Profile fetch error:', error);

      if (error) {
        console.error('Profile fetch failed after retries:', error);
        // Optionally show error to user
        return;
      }

      if (profile) {
        if (!redirected) {
          setRedirected(true);
          console.log('✅ Profile found, redirecting to dashboard');
          await router.push('/dashboard');
        }
      } else {
        // Auto-create profile if not found
        const { error: insertError } = await supabase.from('profiles').insert({
          id: session.user.id,
          email: session.user.email,
        });

        if (insertError) {
          throw insertError;
        }

        if (!redirected) {
          setRedirected(true);
          console.log('🆕 No profile found, created one, redirecting to setup');
          await router.push('/profile-setup');
        }
      }
    } catch (error) {
      console.error('Error in handleRedirect:', error);
      // Optionally show error to user
    }
  };

  useEffect(() => {
    setHasMounted(true);

    const checkSession = async () => {
      try {
        await router.ready; // Wait for router to be ready

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          console.log('Initial session found, checking profile...');
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

        if (processingAuth) {
          console.log('Auth change already being processed, skipping');
          return;
        }

        setProcessingAuth(true);
        try {
          if (
            session &&
            (event === 'SIGNED_IN' ||
              event === 'USER_UPDATED' ||
              event === 'TOKEN_REFRESHED')
          ) {
            console.log('User signed in, checking profile...');
            await handleRedirect(session);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          setProcessingAuth(false);
        }
      },
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [router, redirected, processingAuth]);

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
