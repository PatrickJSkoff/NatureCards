import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const publicRoutes = ['/signin', '/auth/error', '/verify-email'];

  const isPublicRoute = publicRoutes.some((route) => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}; 