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
      return { data, error };
    };

    const createProfileIfMissing = async (user: any) => {
      const { error } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email });
      if (error) console.error('Insert profile error:', error.message);
    };

    const handleSession = async (session: any) => {
      if (!session || redirected) return;

      const user = session.user;
      const { data: profile } = await fetchProfile(user.id);

      if (profile) {
        setRedirected(true);
        router.push('/dashboard');
      } else {
        await createProfileIfMissing(user);
        setRedirected(true);
        router.push('/profile-setup');
      }
    };

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log('Immediate session found');
        await handleSession(session);
        setLoading(false);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          if (
            session &&
            ['SIGNED_IN', 'INITIAL_SESSION', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)
          ) {
            await handleSession(session);
          }
          setLoading(false);
        }
      );

      return () => {
        listener?.subscription?.unsubscribe();
      };
    };

    const unsubscribePromise = checkSession();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
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
