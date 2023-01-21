import { pickQuestion } from "@/leetcode/pick"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const questionSlug = req.query.questionSlug as string | undefined
    if (!questionSlug) {
      return res.status(404).json({ success: false, error: "Blank problem!" })
    }
    const question = await pickQuestion(questionSlug)
    if (!question) {
      return res
        .status(404)
        .json({ success: false, error: "problem not found!" })
    }
    return res.status(200).json({ success: true, data: question })
  }
  return res.status(405)
}
