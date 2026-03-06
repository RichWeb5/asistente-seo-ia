/**
 * Refreshes an expired Google OAuth access token using the refresh token.
 */
async function refreshAccessToken(token) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error.message);
    return { ...token, error: 'RefreshTokenError' };
  }
}

/**
 * NextAuth configuration options.
 */
export const authOptions = {
  // Custom OAuth provider — bypasses OIDC discovery (uses https.request,
  // which is not available in Cloudflare Workers via unenv).
  // Endpoints are defined explicitly so only fetch() is used.
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      authorization: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/webmasters.readonly',
          ].join(' '),
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://openidconnect.googleapis.com/v1/userinfo',
      issuer: 'https://accounts.google.com',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      idToken: true,
      checks: ['state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: store tokens from OAuth provider
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }

      // Token still valid (with 60s buffer)
      if (token.expiresAt && Date.now() / 1000 < token.expiresAt - 60) {
        return token;
      }

      // Token expired — attempt refresh
      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      return { ...token, error: 'NoRefreshToken' };
    },
    async session({ session, token }) {
      // accessToken only available server-side via getServerSession
      session.accessToken = token.accessToken;
      session.error = token.error;
      // Expose minimal user info only
      session.user = {
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image,
      };
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 15 * 60, // Refresh session every 15 min
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
