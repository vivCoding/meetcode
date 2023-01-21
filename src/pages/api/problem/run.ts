// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getToken } from "next-auth/jwt"

import { testQuestion } from "@/leetcode/run"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token = await getToken({ req })

    if (token && token.lc) {
      const { csrf, lcSession } = token.lc
      const { questionSlug, questionId, lang, code, testCases } = req.body
      if (!questionSlug || !questionId || !lang || !code || !testCases) {
        return res.status(200).json({ success: false, error: "Blank inputs!" })
      }

      const testResult = await testQuestion(
        csrf,
        lcSession,
        questionSlug,
        questionId,
        lang,
        code,
        testCases
      )
      if (testResult) {
        return res.status(200).json({ success: true, data: testResult })
      }
      return res.status(200).json({
        success: false,
        error: "Something went wrong. Please try again",
      })
    }
    return res.status(401)
  }
  return res.status(405)
}
