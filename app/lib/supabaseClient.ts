'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createPagesBrowserClient({
  cookieOptions: {
    name: 'sb',
    path: '/',
    sameSite: 'Strict', // or 'None' if using HTTPS
    secure: true,       // always true in production
  },
});
