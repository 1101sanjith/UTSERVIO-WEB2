// lib/supabaseClient.ts
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient({
  cookieOptions: {
    name: 'sb', // required by type
    // 7 days in seconds
    domain: '', // leave blank unless you have a custom domain
    path: '/',
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  },
});
