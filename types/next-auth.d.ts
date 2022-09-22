// this file contains custom typings for the tokens and sessions used by NextAuth in this app
// the necessary definitions were created based on https://next-auth.js.org/tutorials/refresh-token-rotation
// see also: https://next-auth.js.org/getting-started/typescript#module-augmentation
import NextAuth, { DefaultSession, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {}
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    user: User;
    error?: string;
  }
}
