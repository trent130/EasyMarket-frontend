import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { API_CONFIG } from '../app/services/api/config';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.TOKEN}`, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Authentication error:', errorData);
            return null;
          }

          const data = await response.json();

          if (data.access) {
            return {
              id: data.user_id,
              name: credentials.username,
              email: data.email,
              accessToken: data.access,
              refreshToken: data.refresh,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        };
      }

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}`, {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token.accessToken}`,
          },
        });

        if (response.ok) {
          return token;
        }

        const refreshResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({
            refresh: token.refreshToken,
          }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          return {
            ...token,
            accessToken: refreshData.access,
          };
        }

        throw new Error('Token refresh failed');
      } catch (error) {
        console.error('Token refresh error:', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: (token.user as { id?: string }).id,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        },
        error: token.error,
      };
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};