import type { UserProfile } from "./leetcode/user"

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: ObjectId
    profile?: UserProfile
    lc?: { csrf: string; lcSession: string }
  }
}
