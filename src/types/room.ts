import type { UserProfile } from "./leetcode/user"

export type MessageType = {
  user: UserProfile
  message: string
  timestamp: string
}

export type RoomSettings = {
  mode: string
  problemTags: string[]
  problemDifficulty: string
  problemListTag: string
  timeLimit: number
  contestTimeLimit: number
  showLeaderboard: boolean
  showSubmissionMessage: boolean
  isOpen: boolean
}

export type RoomModelType = {
  roomSettings: RoomSettings
  questionQueue: string[]
  memberList: string[]
  leaderboard: Record<string, number>
  admin: string
  usersInProgress: string[]
  currentQuestion?: string
}

export type RoomType = {
  roomSettings: RoomSettings
  questionQueue: string[]
  memberList: UserProfile[]
  leaderboard: { user: UserProfile; points: number }[]
  admin: string
  usersInProgress: string[]
  currentQuestion?: string
}
