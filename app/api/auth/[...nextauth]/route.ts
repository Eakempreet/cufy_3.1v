import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect logic will be handled by the frontend
      // Just return to the base URL and let the UI components handle routing
      if (url === baseUrl || url === `${baseUrl}/`) {
        return baseUrl
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
