import NextAuth, { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { login } from "@/leetcode/login"
import { getCurrentUser, getProfile } from "@/leetcode/user"

import type { NextAuthOptions } from "next-auth"

// https://next-auth.js.org/providers/credentials

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "LeetCode",
      credentials: {
        user: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("doing the authorize")
        if (req.method === "POST") {
          if (credentials) {
            const { user, password } = credentials
            const res = await login(user, password)
            if (res) {
              return { id: user, ...res, name: user }
            }
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // should update lc csrf and lcSession tokens too, but eh
      if (user) {
        token.lc = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          csrf: (user as any).csrf,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lcSession: (user as any).lcSession,
        }
      }
      if (token && token.lc) {
        const { csrf, lcSession } = token.lc
        token.profile = await getCurrentUser(csrf, lcSession)
      }
      // console.log(token)
      return token
    },
  },
}

// NOTE consider https://next-auth.js.org/configuration/options#usesecurecookies

export default NextAuth(authOptions)
