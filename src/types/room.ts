import type { UserProfile } from "./leetcode/user"

export type MessageType = {
  user: UserProfile
  message: string
  timestamp: string
}

export type Problem = {
  problem_tags: string[]
  problem_difficulty: string
  problem_list_tag: string
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

export type Room = {
  roomSettings: RoomSettings
  questionQueue: string[]
  memberList: string[]
  leaderboard: { username: string; points: string }[]
  admin: string
  usersInProgress: string[]
}
