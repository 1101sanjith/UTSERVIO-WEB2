// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';

export default function AuthCallback() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.push('/dashboard'); // or profile-setup
    }
  }, [session]);

  return <div className="h-screen flex items-center justify-center">Completing sign-in...</div>;
}
