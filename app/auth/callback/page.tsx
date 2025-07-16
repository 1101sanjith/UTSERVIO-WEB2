'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';

export default function AuthCallback() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session?.user) {
      // Optionally check profile here
      router.push('/dashboard');
    }
  }, [session]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p>Completing Google login...</p>
    </div>
  );
}
