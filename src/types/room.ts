import type { UserProfile } from "./leetcode/user"

export type MessageType = {
  user: UserProfile
  message: string
  timestamp: string
}
