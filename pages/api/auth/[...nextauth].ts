import { NextApiHandler } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
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

const GOOGLE_AUTHORIZATION_URL =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    prompt: 'consent',
    access_type: 'offline',
    response_type: 'code',
  });

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      ...googleProviderIdAndSecret,
      authorization: {
        url: GOOGLE_AUTHORIZATION_URL,
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
    jwt: async ({ account, token, user }) => {
      // We want to make sure the token for the user is always up-to-date, so we follow the guide here: https://next-auth.js.org/tutorials/refresh-token-rotation
      // Furthermore, we need to extract the access token that is needed for requests to Google APIs in the name of the logged in user
      // in our case, this is currently only needed for fetching YouTube data using the https://www.googleapis.com/auth/youtube scope
      // There's different scenarios for when this callback may be called:

      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at! * 1000, // TODO: is expires_at really always defined? I think so, bc we only use GoogleProvider atm
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    // apparently, this fires after the jwt callback
    // so, anything we add to the token in the jwt callback will also be available to the input token here
    session: async ({ session, token }) => {
      session.user = token.user; // we set the user prop in the jwt callback already, so this should be safe
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT) {
  try {
    const url =
      'https://oauth2.googleapis.com/token?' +
      new URLSearchParams({
        client_id: googleProviderIdAndSecret.clientId,
        client_secret: googleProviderIdAndSecret.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('An error occurred while refreshing the token', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
