export type TestResult = {
  status_code: number
  lang: string
  run_success: boolean
  status_runtime: string
  memory: number
  code_answer: string[]
  code_output: string[]
  std_output: string[]
  elapsed_time: number
  task_finish_time: number
  expected_status_code: number
  expected_lang: string
  expected_run_success: boolean
  expected_status_runtime: string
  expected_memory: number
  expected_code_answer: string[]
  expected_code_output: string[]
  expected_std_output: string[]
  expected_elapsed_time: number
  expected_task_finish_time: number
  correct_answer: boolean
  compare_result: string
  total_correct: number
  total_testcases: number
  status_memory: string
  pretty_lang: string
  submission_id: string
  // Accepted, Compile Error Time Limit Exceeded,
  status_msg: string
  // check state first!
  // PENDING, STARTED, SUCCESS
  state: string
  // applies to Compile Error (from status_msg)
  compile_error: string
  full_compile_error: string
}

export type SubmitResult = {
  status_code: number
  lang: string
  run_success: boolean
  status_runtime: string
  memory: number
  elapsed_time: number
  compare_result: string
  code_output: string
  std_output: string
  expected_output: string
  task_finish_time: number
  total_correct: number
  total_testcases: number
  runtime_percentile: number
  memory_percentile: number
  pretty_lang: string
  // Accepted, Compile Error, Wrong Answer, Time Limit Exceeded
  status_msg: string
  // check state first!
  // PENDING, STARTED, SUCCESS
  state: string
  // applies to Wrong Answer and TLE
  last_testcase: string
}
