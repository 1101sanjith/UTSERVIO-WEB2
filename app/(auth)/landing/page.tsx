'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Header } from '../../../components/sections/header/headersection';
import { Hero } from '../../../components/sections/HeroSection/herosection';
import About from '../../../components/sections/about/aboutsection';
import Contact from '../../../components/sections/contact/contactsection';
import Footer from '../../../components/sections/footer/footer';
import AuthForm from '../../../components/auth/AuthForm';

export default function LandingPage() {
  const session = useSession(); // auto from cookies
  const supabase = useSupabaseClient(); // to make API calls
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          router.push('/dashboard');
        } else {
          await supabase
            .from('profiles')
            .insert({ id: session.user.id, email: session.user.email });
          router.push('/profile-setup');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        router.push('/profile-setup');
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [session, supabase, router]);

  if (loading) {
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
