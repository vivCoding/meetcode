// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { searchQuestions } from "@/leetcode/search"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const query = req.query.query as string | undefined
    if (!query) {
      return res.status(200).json([])
    }
    const results = await searchQuestions(query)
    return res.status(200).json(results ?? [])
  }
  res.status(405)
}
