// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getToken } from "next-auth/jwt"

import { submitQuestion } from "@/leetcode/run"

import type { NextApiRequest, NextApiResponse } from "next"

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token = await getToken({ req })

    if (token) {
      const { csrf, lcSession } = token.lc as any
      const { questionSlug, questionId, lang, code } = req.body
      if (!questionSlug || !questionId || !lang || !code) {
        return res.status(200).json({ success: false, error: "Blank inputs!" })
      }

      const submission = await submitQuestion(
        csrf,
        lcSession,
        questionSlug,
        questionId,
        lang,
        code
      )
      if (submission) {
        return res.status(200).json({ success: true, data: submission })
      }
      return res
        .status(200)
        .json({
          success: false,
          error: "Something went wrong. Please try again",
        })
    }
    return res.status(401)
  }
  return res.status(405)
}
