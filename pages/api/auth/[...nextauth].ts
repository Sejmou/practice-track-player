import { NextApiHandler } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);
export default authHandler;

const googleProviderIdAndSecret = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
};

if (!googleProviderIdAndSecret.clientId) {
  throw Error('Could not find Google Client ID in .env!');
}

if (!googleProviderIdAndSecret.clientSecret) {
  throw Error('Could not find Google Client secret in .env!');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      ...googleProviderIdAndSecret,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube',
        },
      }, // overriding (adding YouTube scope to) defaults (see https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/providers/google.ts)
    }),
  ],
  // session: {
  //   strategy: 'jwt',
  // },
  callbacks: {
    jwt: async ({ account, token }) => {
      // extract the access token that is needed for requests to Google APIs in the name of the logged in user
      // in our case, this is currently only needed for fetching YouTube data using the https://www.googleapis.com/auth/youtube scope
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // apparently, this fires after the jwt callback
    // so, anything we add to the token in the jwt callback will also be available to the input token here
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
