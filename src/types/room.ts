export type Problem = {
  problem_tags: string[]
  problem_difficulty: string
  problem_list_tag: string
}

export type Settings = {
  mode: string
  // problem: Problem
  problem_tags: string[]
  problem_difficulty: string
  problem_list_tag: string
  number_of_questions: number
  time_limit: number
  time_limit_total: number
  leaderboard: boolean
  show_submission_message: boolean
  is_open: boolean
}

export type Room = {
  room_settings?: Settings
  question_queue: string[]
  member_list: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leaderboard: any[]
  admin: string
  problem_complete_status: string
}
