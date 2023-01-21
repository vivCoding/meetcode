import { getProfile } from "@/leetcode/user"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const username = req.query.username as string | undefined
    if (!username) {
      return res.status(404).json({ success: false })
    }
    const profile = await getProfile(username)
    if (!profile) {
      return res.status(404).json({ success: false })
    }
    return res.status(200).json({ success: true, data: profile })
  }
  res.status(405)
}
