'use client';
declare global {
  interface Window {
    phoneEmailListener?: (userObj: any) => void;
  }
}

import { useEffect, useRef } from 'react';
import { supabase } from '../../app/lib/supabaseClient';

export default function PhoneEmailSignIn({
  onVerified,
  setError,
}: {
  onVerified: (phone: string) => void;
  setError: (msg: string) => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://www.phone.email/sign_in_button_v1.js';
    script.async = true;
    buttonRef.current.innerHTML = '';
    buttonRef.current.appendChild(script);

    // Define listener function
    window.phoneEmailListener = async function (userObj: any) {
      try {
        const res = await fetch(userObj.user_json_url);
        const data = await res.json();
        const rawPhone = data.phone;
        const phone = rawPhone?.replace('+91', '').trim();

        if (!phone || !/^\d{10}$/.test(phone)) {
          setError('Invalid phone number received.');
          return;
        }

        const { data: existing, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', '+91' + phone);

        if (error) {
          setError('Failed to validate phone number.');
          return;
        }

        if (existing && existing.length > 0) {
          setError('This phone number is already registered.');
          return;
        }

        // ✅ Phone verified and unique
        onVerified(phone);
      } catch (err) {
        setError('Phone verification failed.');
      }
    };

    return () => {
      window.phoneEmailListener = null;
    };
  }, []);

  return (
    <div
      ref={buttonRef}
      className="pe_signin_button"
      data-client-id="15695407177920574360"
    />
  );
}
