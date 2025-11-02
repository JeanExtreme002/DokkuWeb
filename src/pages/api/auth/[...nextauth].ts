import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      return profile?.email?.endsWith('@ufba.br') ?? false;
    },
    async jwt({ token, account, trigger, session }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      if (trigger === 'update' && session?.accessToken) {
        token.accessToken = session.accessToken;
      }

      if (trigger === 'update' && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;

      if (session.user) {
        if (token.name) {
          session.user.name = token.name as string;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
      }

      return session;
    },
  },
};
export default NextAuth(authOptions);
