
import NextAuth from 'next-auth'

const handler = NextAuth({
  providers: [],
  pages: {
    signIn: '/teacher',
  },
})

export { handler as GET, handler as POST }
