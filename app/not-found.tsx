'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    if (hash === '#') {
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  }, [router]);

  return null; // or show spinner
}
