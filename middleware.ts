import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const publicRoutes = ['/', '/login', '/signup', '/auth/callback', '/explore'];

  // ✅ Allow access to public routes
  if (publicRoutes.includes(path)) return res;

  // ✅ If no session and trying to access protected route, redirect to login
 
  // ✅ If session exists, allow request
  return res;
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
