/* eslint-disable no-var */
import axios from "axios"

import { sleep } from "@/utils/misc"

import type { SubmitResult, TestResult } from "@/types/leetcode/runResult"

const MAX_RETRIES = 20

export async function testQuestion(
  csrf: string,
  lcSession: string,
  questionSlug: string,
  questionId: string,
  lang: string,
  code: string,
  testCases: string
): Promise<TestResult | undefined> {
  // add to lc queue
  const res = await axios.post(
    `https://leetcode.com/problems/${questionSlug}/interpret_solution/`,
    {
      lang,
      question_id: questionId,
      typed_code: code,
      data_input: testCases,
    },
    {
      headers: {
        Referer: `https://leetcode.com/problems/${questionSlug}/`,
        "x-csrftoken": csrf,
        Cookie: `csrftoken=${csrf}; LEETCODE_SESSION=${lcSession}`,
        "Accept-Encoding": "gzip,deflate,compress",
      },
    }
  )

  if (res.status !== 200) {
    console.error("lc bad testQuestion interpret", res.status)
    return undefined
  }
  const intrepretId: string = res.data.interpret_id

  // continuosly get test progress
  let retries = 0
  while (true) {
    var res2 = await axios.post(
      `https://leetcode.com/submissions/detail/${intrepretId}/check/`,
      undefined,
      {
        headers: {
          Referer: `https://leetcode.com/problems/${questionSlug}/`,
          "x-csrftoken": csrf,
          Cookie: `csrftoken=${csrf}; LEETCODE_SESSION=${lcSession}`,
          "Accept-Encoding": "gzip,deflate,compress",
        },
      }
    )

    if (res2.status !== 200) {
      console.error("lc bad testQuestion check", res.status)
      return undefined
    }

    console.log(res2.data.state, retries)

    // check if test progress is finished
    if ((res2.data.state ?? "") == "SUCCESS") {
      break
    }
    // avoid making too many requests at once, don't wanna get blacklisted lmao
    // it could be enough to just do without, where our delay would be request/response time
    await sleep(1000)
    retries++
    if (retries >= MAX_RETRIES) {
      console.log("reached max retries!")
      return undefined
    }
  }

  return res2.data
}

export async function submitQuestion(
  csrf: string,
  lcSession: string,
  questionSlug: string,
  questionId: string,
  lang: string,
  code: string
): Promise<SubmitResult | undefined> {
  console.log("starting the submitting")
  // add to lc queue
  try {
    var res = await axios.post(
      `https://leetcode.com/problems/${questionSlug}/submit/`,
      {
        lang,
        question_id: questionId,
        typed_code: code,
      },
      {
        headers: {
          Referer: `https://leetcode.com/problems/${questionSlug}/`,
          "x-csrftoken": csrf,
          Cookie: `csrftoken=${csrf}; LEETCODE_SESSION=${lcSession}`,
          "Accept-Encoding": "gzip,deflate,compress",
        },
      }
    )
  } catch (e) {
    console.log("bad run", e)
    return undefined
  }

  if (res.status !== 200) {
    console.error("lc bad submitQuestion interpret", res.status)
    return undefined
  }
  const submissionId: string = res.data.submission_id
  console.log("submissionId:", submissionId)

  // continuosly get test progress
  let retries = 0
  while (true) {
    var res2 = await axios.post(
      `https://leetcode.com/submissions/detail/${submissionId}/check/`,
      undefined,
      {
        headers: {
          Referer: `https://leetcode.com/problems/${questionSlug}/`,
          "x-csrftoken": csrf,
          Cookie: `csrftoken=${csrf}; LEETCODE_SESSION=${lcSession}`,
          "Accept-Encoding": "gzip,deflate,compress",
        },
      }
    )

    if (res2.status !== 200) {
      console.error("lc bad submitQuestion check", res.status)
      return undefined
    }

    console.log(res2.data.state, retries)

    // check if test progress is finished
    if ((res2.data.state ?? "") == "SUCCESS") {
      break
    }
    // avoid making too many requests at once, don't wanna get blacklisted lmao
    // it could be enough to just do without, where our delay would be request/response time
    await sleep(1000)
    retries++
    if (retries >= MAX_RETRIES) {
      console.log("reached max retries!")
      return undefined
    }
  }

  console.log("submission nice")
  return res2.data
}
