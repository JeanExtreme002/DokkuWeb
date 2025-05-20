import { signIn, signOut, useSession } from 'next-auth/react';

export function useIsLoggedIn(): boolean | undefined {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return undefined;
  }

  return !!(
    session &&
    session.user &&
    session.user.email &&
    session.user.email.endsWith('@ufba.br')
  );
}

export async function login(callbackUrl: string = '/') {
  signIn('google', { callbackUrl });
}

export async function logout(callbackUrl: string = '/login') {
  signOut({ callbackUrl });
}
