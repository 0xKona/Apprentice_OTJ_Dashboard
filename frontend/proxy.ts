import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { amplifyConfig } from './lib/amplify-config';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const { runWithAmplifyServerContext } = createServerRunner({
    config: amplifyConfig,
  });

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch {
        return false;
      }
    },
  });

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === '/signin' || pathname === '/signup';
  const isDashboard = pathname.startsWith('/dashboard');

  if (authenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!authenticated && isDashboard) {
    return NextResponse.redirect(
      new URL(`/signin?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
};
