import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth'

const { handlers: { GET, POST } } = NextAuth(authConfig)

export { GET, POST }
