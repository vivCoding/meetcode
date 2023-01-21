export type Problem = {
  problem_tags: string[]
  problem_difficulty: string
  problem_list_tag: string
}

export type Settings = {
  mode: string
  problem: Problem
  number_of_questions: number
  time_limit: number
  time_limit_total: number
  leaderboard: boolean
  show_submission_message: boolean
  is_open: boolean
}

export type Room = {
  room_settings: Settings
  question_queue: string[]
  member_list: string[]
  leaderboard: { string: number }[]
  admin: string
  problem_complete_status: string
}
